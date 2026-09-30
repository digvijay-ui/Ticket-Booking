<template>
  <div class="space-y-6">
    <header>
      <p class="admin-kicker">Operations</p>
      <h1 class="admin-page-title">Bookings</h1>
      <p class="admin-page-copy">Review confirmed tickets, payments, cancellations, and refunds.</p>
    </header>

    <form class="admin-panel-dark" @submit.prevent="loadBookings(1)">
      <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label class="block">
          <span class="booking-filter-label">Booking or user search</span>
          <input v-model.trim="filters.search" class="booking-filter-input" type="search" placeholder="Booking ID, name, or email" />
        </label>

        <label class="block">
          <span class="booking-filter-label">Status</span>
          <select v-model="filters.status" class="booking-filter-input">
            <option value="">All</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </label>

        <label class="block">
          <span class="booking-filter-label">Event</span>
          <input v-model.trim="filters.eventQuery" class="booking-filter-input" list="booking-event-options" placeholder="Search event name" />
          <datalist id="booking-event-options">
            <option v-for="event in eventOptions" :key="event.id" :value="event.label" />
          </datalist>
        </label>

        <label class="block">
          <span class="booking-filter-label">User</span>
          <input v-model.trim="filters.userQuery" class="booking-filter-input" list="booking-user-options" placeholder="Search name or email" />
          <datalist id="booking-user-options">
            <option v-for="user in userOptions" :key="user.id" :value="user.label" />
          </datalist>
        </label>
      </div>

      <div class="mt-4 flex flex-wrap gap-3">
        <AppButton type="submit" icon="mdi:filter" :loading="adminStore.bookingsLoading">Apply Filters</AppButton>
        <AppButton type="button" variant="secondary" icon="mdi:restore" @click="resetFilters">Reset</AppButton>
      </div>
    </form>

    <div v-if="adminStore.bookingsLoading" class="admin-panel-dark flex min-h-56 items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>

    <div v-else-if="adminStore.bookingsError" class="admin-error-state" role="alert">
      <p class="text-sm font-medium">{{ adminStore.bookingsError }}</p>
    </div>

    <template v-else-if="bookings.length">
      <div class="admin-table-wrap hidden lg:block">
        <table class="admin-table">
          <thead>
            <tr>
              <th scope="col">Booking</th>
              <th scope="col">User</th>
              <th scope="col">Event / seats</th>
              <th scope="col">Amount</th>
              <th scope="col">Status</th>
              <th scope="col">Booked</th>
              <th scope="col"><span class="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="booking in bookings" :key="getBookingId(booking)">
              <td><IdCopy :id="getBookingId(booking)" label="Booking ID" /></td>
              <td><p class="max-w-48 truncate text-sm">{{ userLabel(booking) }}</p></td>
              <td>
                <p class="max-w-56 truncate font-medium">{{ eventLabel(booking) }}</p>
                <p class="mt-0.5 max-w-56 truncate text-xs text-admin-secondary">{{ seatsLabel(booking) }}</p>
              </td>
              <td class="whitespace-nowrap font-medium">{{ formatINR(booking.totalAmountInPaise) }}</td>
              <td><AppBadge :variant="bookingStatusVariant(booking)" :label="bookingStatusLabel(booking)" /></td>
              <td class="whitespace-nowrap text-xs text-admin-secondary">{{ formatDateTime(booking.createdAt) }}</td>
              <td>
                <div class="flex justify-end gap-1">
                  <button type="button" class="admin-focus flex h-9 w-9 items-center justify-center rounded-md text-admin-error hover:bg-admin-errorSoft disabled:opacity-35" :disabled="!canActOnBooking(booking) || Boolean(adminStore.actionLoadingId)" :aria-label="`Cancel booking ${getBookingId(booking)}`" title="Cancel booking" @click="openActionDialog(booking, 'cancel')"><Icon icon="mdi:ticket-remove-outline" class="h-4 w-4" /></button>
                  <button type="button" class="admin-focus flex h-9 w-9 items-center justify-center rounded-md text-admin-info hover:bg-admin-infoSoft disabled:opacity-35" :disabled="!canActOnBooking(booking) || Boolean(adminStore.actionLoadingId)" :aria-label="`Refund booking ${getBookingId(booking)}`" title="Refund booking" @click="openActionDialog(booking, 'refund')"><Icon icon="mdi:cash-refund" class="h-4 w-4" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="grid grid-cols-1 gap-4 lg:hidden">
        <article
          v-for="booking in bookings"
        :key="getBookingId(booking)"
        class="relative flex min-h-[280px] flex-col overflow-hidden admin-card-dark"
      >
        <span class="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-inkNight" aria-hidden="true" />

        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="font-mono text-[10px] font-bold uppercase text-ticketGold/75">Booking ID</p>
            <IdCopy :id="getBookingId(booking)" label="Booking ID" />
          </div>
          <AppBadge :variant="bookingStatusVariant(booking)" :label="bookingStatusLabel(booking)" />
        </div>

        <h2 class="admin-card-title mt-3 line-clamp-2">{{ eventLabel(booking) }}</h2>
        <p class="mt-1 truncate text-sm font-semibold text-paperCream/65">{{ userLabel(booking) }}</p>

        <div class="my-4 border-t-2 border-dashed border-paperCream/20" />

        <div class="space-y-1.5 font-mono text-xs">
          <div class="flex justify-between gap-3">
            <span class="booking-row-label">Seats</span>
            <span class="max-w-40 truncate text-right font-black">{{ seatsLabel(booking) }}</span>
          </div>
          <div class="flex justify-between gap-3">
            <span class="booking-row-label">Amount</span>
            <span class="font-black text-ticketGold">{{ formatINR(booking.totalAmountInPaise) }}</span>
          </div>
          <div class="flex justify-between gap-3">
            <span class="booking-row-label">Payment</span>
            <AppBadge :variant="paymentStatusVariant(booking)" :label="booking.paymentStatus" />
          </div>
          <div class="flex justify-between gap-3">
            <span class="booking-row-label">Created</span>
            <span class="text-right font-black">{{ formatDateTime(booking.createdAt) }}</span>
          </div>
        </div>

        <p class="mt-3 flex min-w-0 items-center gap-2 font-mono text-[10px] font-bold uppercase text-paperCream/45">
          Wallet <IdCopy :id="booking.walletTransactionId || ''" label="Wallet transaction ID" />
        </p>

        <div class="mt-auto grid grid-cols-2 gap-2 pt-4">
          <AppButton
            type="button"
            variant="danger"
            icon="mdi:ticket-remove-outline"
            :disabled="!canActOnBooking(booking) || Boolean(adminStore.actionLoadingId)"
            @click="openActionDialog(booking, 'cancel')"
          >
            Cancel
          </AppButton>
          <AppButton
            type="button"
            variant="secondary"
            icon="mdi:cash-refund"
            :disabled="!canActOnBooking(booking) || Boolean(adminStore.actionLoadingId)"
            @click="openActionDialog(booking, 'refund')"
          >
            Refund
          </AppButton>
        </div>
        </article>
      </div>
    </template>

    <div v-if="actionBooking" ref="actionDialog" class="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-black/50 px-4 py-6" tabindex="-1" role="dialog" aria-modal="true" aria-labelledby="booking-action-title" @click.self="closeActionDialog">
      <section class="w-full max-w-lg rounded-lg border border-admin-border bg-white p-5 text-admin-text shadow-xl">
        <p class="admin-kicker">{{ actionKind === 'cancel' ? 'Cancellation' : 'Refund' }}</p>
        <h2 id="booking-action-title" class="mt-2 text-xl font-extrabold">
          {{ actionKind === 'cancel' ? 'Cancel and refund this booking?' : 'Refund this booking?' }}
        </h2>
        <p class="mt-3 text-sm leading-6 text-admin-secondary">
          <template v-if="actionKind === 'cancel'">
            The full amount of {{ formatINR(actionBooking.totalAmountInPaise) }} will return to the user wallet and booked seats will become available.
          </template>
          <template v-else>
            The full amount of {{ formatINR(actionBooking.totalAmountInPaise) }} will return to the user wallet. The booking will be marked refunded.
          </template>
        </p>
        <div class="mt-4 rounded-md border border-admin-border bg-admin-canvas p-3 text-xs">
          <p class="font-bold text-admin-text">{{ eventLabel(actionBooking) }}</p>
          <p class="mt-1 font-mono text-admin-secondary">{{ getBookingId(actionBooking) }}</p>
        </div>
        <div class="mt-5 grid gap-2 sm:grid-cols-2">
          <AppButton type="button" variant="ghost" icon="mdi:close" :disabled="Boolean(adminStore.actionLoadingId)" @click="closeActionDialog">Keep booking</AppButton>
          <AppButton type="button" :variant="actionKind === 'cancel' ? 'danger' : 'secondary'" :icon="actionKind === 'cancel' ? 'mdi:ticket-remove-outline' : 'mdi:cash-refund'" :loading="adminStore.actionLoadingId === getBookingId(actionBooking)" @click="confirmAction">
            {{ actionKind === 'cancel' ? 'Cancel and refund' : 'Confirm refund' }}
          </AppButton>
        </div>
      </section>
    </div>

    <div v-if="!adminStore.bookingsLoading && adminStore.bookingsPagination.totalItems > adminStore.bookingsPagination.limit" class="admin-pagination">
      <p class="text-xs font-medium text-admin-secondary">
        Page {{ adminStore.bookingsPagination.page }} of {{ adminStore.bookingsPagination.totalPages }} · {{ adminStore.bookingsPagination.totalItems }} bookings
      </p>
      <div class="flex gap-2">
        <AppButton type="button" variant="ghost" icon="mdi:chevron-left" :disabled="!adminStore.bookingsPagination.hasPreviousPage" @click="loadBookings(adminStore.bookingsPagination.page - 1)">
          Previous
        </AppButton>
        <AppButton type="button" variant="ghost" icon="mdi:chevron-right" :disabled="!adminStore.bookingsPagination.hasNextPage" @click="loadBookings(adminStore.bookingsPagination.page + 1)">
          Next
        </AppButton>
      </div>
    </div>

    <div v-else-if="!bookings.length && !adminStore.bookingsError" class="admin-empty-state">
      <p class="text-lg font-bold text-admin-text">No bookings found</p>
      <p class="mt-1 text-sm text-admin-secondary">Bookings will appear here after users confirm tickets.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { computed, onMounted, reactive, ref } from 'vue';

import AppBadge from '@/components/common/AppBadge.vue';
import AppButton from '@/components/common/AppButton.vue';
import IdCopy from '@/components/common/IdCopy.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import { useDialogFocus } from '@/composables/useDialogFocus';
import { useToastStore } from '@/modules/common/toast/toast.store';
import type { Booking, EventItem, Seat, User } from '@/services/apiTypes';
import { formatDateTime } from '@/utils/date';
import { formatINR } from '@/utils/money';
import { useAdminStore } from '../admin.store';

type BadgeVariant = 'available' | 'reserved' | 'booked' | 'paid' | 'refunded' | 'cancelled' | 'draft' | 'published' | 'completed';
type AdminBooking = Omit<Booking, 'userId' | 'event' | 'seats'> & {
  _id?: string;
  userId?: string | Pick<User, 'id' | 'name' | 'email' | 'role'>;
  event?: Pick<EventItem, 'id' | 'title' | 'location' | 'startDate' | 'endDate' | 'status'> | string;
  seats?: Array<Pick<Seat, 'id' | 'seatNumber' | 'row' | 'status'> | string>;
};

const adminStore = useAdminStore();
const toast = useToastStore();
const filters = reactive({
  search: '',
  status: '',
  eventQuery: '',
  userQuery: '',
});
const rawBookings = computed(() => adminStore.bookings as AdminBooking[]);
const bookings = computed(() => {
  const query = filters.search.toLowerCase();
  if (!query) return rawBookings.value;
  return rawBookings.value.filter((booking) =>
    [getBookingId(booking), userLabel(booking), eventLabel(booking)].some((value) => value.toLowerCase().includes(query)),
  );
});
const actionBooking = ref<AdminBooking | null>(null);
const actionKind = ref<'cancel' | 'refund'>('cancel');
const actionDialog = ref<HTMLElement | null>(null);
const PAGE_SIZE = 24;

const eventOptions = computed(() =>
  adminStore.events.map((event) => ({
    id: event.id,
    label: `${event.title} (${shortId(event.id)})`,
  })),
);

const userOptions = computed(() => {
  const users = new Map<string, { id: string; label: string }>();

  rawBookings.value.forEach((booking) => {
    if (booking.userId && typeof booking.userId === 'object') {
      users.set(booking.userId.id, {
        id: booking.userId.id,
        label: `${booking.userId.name} (${booking.userId.email})`,
      });
    }
  });

  return Array.from(users.values()).sort((first, second) => first.label.localeCompare(second.label));
});

function getBookingId(booking: AdminBooking) {
  return booking.id || booking._id || '';
}

function currentFilters() {
  return {
    status: filters.status,
    eventId: resolveOptionId(filters.eventQuery, eventOptions.value),
    userId: resolveOptionId(filters.userQuery, userOptions.value),
    limit: PAGE_SIZE,
  };
}

function bookingStatusVariant(booking: AdminBooking): BadgeVariant {
  if (booking.paymentStatus === 'REFUNDED') return 'refunded';
  if (booking.status === 'CANCELLED') return 'cancelled';
  if (booking.status === 'REFUNDED') return 'refunded';
  return 'paid';
}

function bookingStatusLabel(booking: AdminBooking) {
  if (booking.paymentStatus === 'REFUNDED' || booking.status === 'REFUNDED') return 'REFUNDED';
  return booking.status;
}

function paymentStatusVariant(booking: AdminBooking): BadgeVariant {
  return booking.paymentStatus === 'REFUNDED' ? 'refunded' : 'paid';
}

function userLabel(booking: AdminBooking) {
  if (booking.userId && typeof booking.userId === 'object') {
    return `${booking.userId.name} (${booking.userId.email})`;
  }

  return booking.userId || 'User';
}

function eventLabel(booking: AdminBooking) {
  if (booking.event && typeof booking.event === 'object') {
    return booking.event.title;
  }

  return typeof booking.event === 'string' ? booking.event : booking.eventId || 'Booked event';
}

function seatsLabel(booking: AdminBooking) {
  if (!booking.seats?.length) {
    return 'Seats unavailable';
  }

  return booking.seats.map((seat) => (typeof seat === 'string' ? seat : seat.seatNumber)).join(', ');
}

async function loadBookings(page = adminStore.bookingsPagination.page) {
  await adminStore.fetchBookings({
    ...currentFilters(),
    page,
  }).catch(() => undefined);
}

function resetFilters() {
  filters.search = '';
  filters.status = '';
  filters.eventQuery = '';
  filters.userQuery = '';
  void loadBookings(1);
}

function canActOnBooking(booking: AdminBooking) {
  return booking.status === 'CONFIRMED' && booking.paymentStatus === 'PAID';
}

function openActionDialog(booking: AdminBooking, kind: 'cancel' | 'refund') {
  if (!canActOnBooking(booking)) return;
  actionBooking.value = booking;
  actionKind.value = kind;
}

function closeActionDialog() {
  if (!adminStore.actionLoadingId) actionBooking.value = null;
}

async function confirmAction() {
  if (!actionBooking.value || !canActOnBooking(actionBooking.value)) return;
  const bookingId = getBookingId(actionBooking.value);

  try {
    if (actionKind.value === 'cancel') {
      await adminStore.cancelBooking(bookingId, { ...currentFilters(), page: adminStore.bookingsPagination.page });
      toast.success('Booking cancelled and the user wallet was refunded.');
    } else {
      await adminStore.refundBooking(bookingId, { ...currentFilters(), page: adminStore.bookingsPagination.page });
      toast.success('Booking refunded successfully.');
    }
    actionBooking.value = null;
    await Promise.all([
      adminStore.fetchTransactions({ limit: 24 }),
      adminStore.fetchAnalyticsData(),
    ]);
  } catch {
    toast.error('The booking action could not be completed. Please try again.');
  }
}

function shortId(id: string) {
  if (id.length <= 14) return id;
  return `${id.slice(0, 6)}...${id.slice(-4)}`;
}

function resolveOptionId(query: string, options: Array<{ id: string; label: string }>) {
  if (!query) return '';
  const exactMatch = options.find((option) => option.label === query || option.id === query);
  if (exactMatch) return exactMatch.id;
  return /^[a-f\d]{24}$/i.test(query) ? query : '';
}

useDialogFocus(computed(() => Boolean(actionBooking.value)), actionDialog, closeActionDialog);

onMounted(() => {
  adminStore.fetchEvents().catch(() => undefined);
  loadBookings(1);
});
</script>

<style scoped>
.booking-filter-label,
.booking-row-label {
  @apply mb-1 block text-[11px] font-semibold text-admin-secondary;
}

.booking-row-label {
  @apply text-admin-subtle;
}

.booking-filter-input {
  @apply w-full rounded-md border border-admin-border bg-white px-3 py-2.5 text-sm text-admin-text placeholder:text-admin-subtle transition-colors;
}

.booking-filter-input:focus-visible {
  @apply border-admin-black outline-none ring-2 ring-admin-black/10;
}
</style>
