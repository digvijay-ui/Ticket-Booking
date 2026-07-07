<template>
  <div class="space-y-6">
    <div>
      <p class="font-mono text-xs font-bold uppercase text-ticketGold">Operations</p>
      <h1 class="font-display text-5xl leading-none text-paperCream">BOOKING CONTROL</h1>
      <p class="text-sm text-paperCream/70">Review confirmed tickets, wallet payments, cancellations, and refunds.</p>
    </div>

    <form class="rounded-md border-2 border-ticketGold/35 bg-deepPlum p-4" @submit.prevent="loadBookings">
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
          <span class="booking-filter-label">Event ID</span>
          <input v-model.trim="filters.eventId" class="booking-filter-input" placeholder="event id" />
        </label>

        <label class="block">
          <span class="booking-filter-label">User ID</span>
          <input v-model.trim="filters.userId" class="booking-filter-input" placeholder="user id" />
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
        class="relative flex min-h-[280px] max-h-[340px] flex-col overflow-hidden rounded-md border-2 border-stubCharcoal bg-paperCream p-4 text-stubCharcoal shadow-ticket"
      >
        <span class="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-inkNight" aria-hidden="true" />

        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="font-mono text-[10px] font-bold uppercase text-marqueeRed">Booking ID</p>
            <p class="truncate font-mono text-[11px] font-bold text-stubCharcoal/60">{{ getBookingId(booking) }}</p>
          </div>
          <AppBadge :variant="bookingStatusVariant(booking)" :label="booking.status" />
        </div>

        <h2 class="mt-3 line-clamp-2 font-display text-4xl uppercase leading-none">{{ eventLabel(booking) }}</h2>
        <p class="mt-1 truncate text-sm font-semibold text-stubCharcoal/65">{{ userLabel(booking) }}</p>

        <div class="my-4 border-t-2 border-dashed border-stubCharcoal/25" />

        <div class="space-y-1.5 font-mono text-xs">
          <div class="flex justify-between gap-3">
            <span class="booking-row-label">Seats</span>
            <span class="max-w-40 truncate text-right font-black">{{ seatsLabel(booking) }}</span>
          </div>
          <div class="flex justify-between gap-3">
            <span class="booking-row-label">Amount</span>
            <span class="font-black text-marqueeRed">{{ formatINR(booking.totalAmountInPaise) }}</span>
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

        <div class="mt-3 grid grid-cols-3 gap-1.5 font-mono text-[10px] font-bold uppercase">
          <span class="rounded-sm bg-stubCharcoal/10 px-2 py-1">{{ booking.status }}</span>
          <span class="rounded-sm bg-ticketGold/25 px-2 py-1">{{ booking.paymentStatus }}</span>
          <span class="rounded-sm bg-marqueeRed/10 px-2 py-1 text-marqueeRed">{{ formatINR(booking.totalAmountInPaise) }}</span>
        </div>

        <p class="mt-3 truncate font-mono text-[10px] font-bold uppercase text-stubCharcoal/45">
          Wallet {{ booking.walletTransactionId || 'Not available' }}
        </p>

        <div class="mt-auto pt-3">
          <div class="mb-3 w-36 [&>div]:h-7">
            <BarcodeStrip />
          </div>

          <p class="rounded-sm bg-stubCharcoal/10 p-2 text-center font-mono text-xs font-bold uppercase text-stubCharcoal/55">
            View only
          </p>
        </div>
      </article>
    </div>

    <div v-else class="rounded-md border-2 border-stubCharcoal bg-paperCream p-8 text-center text-stubCharcoal shadow-ticket">
      <p class="font-display text-4xl leading-none">No bookings found.</p>
      <p class="mt-2 text-sm text-stubCharcoal/65">Bookings will appear here after users confirm tickets.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue';

import AppBadge from '@/components/common/AppBadge.vue';
import AppButton from '@/components/common/AppButton.vue';
import BarcodeStrip from '@/components/common/BarcodeStrip.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import type { Booking, EventItem, Seat, User } from '@/services/apiTypes';
import { formatDateTime } from '@/utils/date';
import { formatINR } from '@/utils/money';
import { useAdminStore } from './admin.store';

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
  eventId: '',
  userId: '',
});
const bookings = computed(() => adminStore.bookings as AdminBooking[]);

function getBookingId(booking: AdminBooking) {
  return booking.id || booking._id || '';
}

function currentFilters() {
  return {
    status: filters.status,
    eventId: filters.eventId,
    userId: filters.userId,
  };
}

function bookingStatusVariant(booking: AdminBooking): BadgeVariant {
  if (booking.status === 'CANCELLED') return 'cancelled';
  if (booking.status === 'REFUNDED') return 'refunded';
  return 'paid';
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

async function loadBookings() {
  await adminStore.fetchBookings(currentFilters());
}

function resetFilters() {
  filters.status = '';
  filters.eventId = '';
  filters.userId = '';
  loadBookings();
}

onMounted(loadBookings);
</script>

<style scoped>
.booking-filter-label,
.booking-row-label {
  @apply mb-1 block font-mono text-[10px] font-bold uppercase text-paperCream/60;
}

.booking-row-label {
  @apply text-stubCharcoal/45;
}

.booking-filter-input {
  @apply focus-ticket w-full rounded-sm border-2 border-paperCream/25 bg-paperCream px-3 py-2.5 text-stubCharcoal placeholder:text-stubCharcoal/45;
}
</style>
