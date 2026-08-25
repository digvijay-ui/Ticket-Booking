<template>
  <div class="space-y-6">
    <div>
      <p class="font-mono text-xs font-bold uppercase text-ticketGold">Operations</p>
      <h1 class="font-display text-5xl leading-none text-paperCream">BOOKING CONTROL</h1>
      <p class="text-sm text-paperCream/70">Review confirmed tickets, wallet payments, cancellations, and refunds.</p>
    </div>

    <form class="rounded-md border-2 border-ticketGold/35 bg-deepPlum p-4" @submit.prevent="loadBookings(1)">
      <div class="grid gap-3 md:grid-cols-3">
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

    <div v-if="adminStore.bookingsLoading" class="flex min-h-56 items-center justify-center rounded-md bg-deepPlum">
      <LoadingSpinner size="lg" />
    </div>

    <div v-else-if="adminStore.bookingsError" class="rounded-md border border-marqueeRed bg-marqueeRed/10 p-4 text-sm font-semibold text-paperCream">
      {{ adminStore.bookingsError }}
    </div>

    <div v-else-if="bookings.length" class="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
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

        <div class="mt-auto pt-3">
          <p class="rounded-sm bg-paperCream/10 p-2 text-center font-mono text-xs font-bold uppercase text-paperCream/55">
            View only
          </p>
        </div>
      </article>
    </div>

    <div v-if="!adminStore.bookingsLoading && adminStore.bookingsPagination.totalItems > adminStore.bookingsPagination.limit" class="flex flex-wrap items-center justify-between gap-3 rounded-md border border-paperCream/10 bg-deepPlum px-4 py-3">
      <p class="font-mono text-xs font-bold uppercase text-paperCream/60">
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

    <div v-else-if="!bookings.length && !adminStore.bookingsError" class="admin-card-dark p-8 text-center">
      <p class="font-display text-4xl leading-none">No bookings found.</p>
      <p class="mt-2 text-sm text-paperCream/65">Bookings will appear here after users confirm tickets.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue';

import AppBadge from '@/components/common/AppBadge.vue';
import AppButton from '@/components/common/AppButton.vue';
import IdCopy from '@/components/common/IdCopy.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
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
const filters = reactive({
  status: '',
  eventQuery: '',
  userQuery: '',
});
const bookings = computed(() => adminStore.bookings as AdminBooking[]);
const PAGE_SIZE = 24;

const eventOptions = computed(() =>
  adminStore.events.map((event) => ({
    id: event.id,
    label: `${event.title} (${shortId(event.id)})`,
  })),
);

const userOptions = computed(() => {
  const users = new Map<string, { id: string; label: string }>();

  bookings.value.forEach((booking) => {
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
  });
}

function resetFilters() {
  filters.status = '';
  filters.eventQuery = '';
  filters.userQuery = '';
  loadBookings(1);
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

onMounted(() => {
  adminStore.fetchEvents().catch(() => undefined);
  loadBookings(1);
});
</script>

<style scoped>
.booking-filter-label,
.booking-row-label {
  @apply mb-1 block font-mono text-[10px] font-bold uppercase text-paperCream/60;
}

.booking-row-label {
  @apply text-paperCream/45;
}

.booking-filter-input {
  @apply admin-filter-input;
}
</style>
