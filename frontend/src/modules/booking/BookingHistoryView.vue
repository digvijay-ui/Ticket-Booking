<template>
  <div class="space-y-6 text-[#e3e0f6]">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="font-mono text-xs font-bold uppercase text-ticketGold">Your drawer</p>
        <h1 class="font-display text-5xl leading-none sm:text-6xl">MY BOOKINGS</h1>
        <p class="max-w-2xl text-sm text-[#e3e0f6]/70">Your confirmed tickets, payment status, and seat details.</p>
      </div>
      <div class="flex flex-wrap gap-3">
        <RouterLink to="/events" class="inline-flex">
          <AppButton icon="mdi:ticket-confirmation">Explore More Events</AppButton>
        </RouterLink>
        <RouterLink to="/wallet" class="inline-flex">
          <AppButton variant="secondary" icon="mdi:wallet-outline">Wallet Ledger</AppButton>
        </RouterLink>
      </div>
    </div>

    <div v-if="bookingStore.bookingsLoading" class="flex min-h-72 items-center justify-center rounded-md bg-deepPlum/70">
      <LoadingSpinner size="lg" />
    </div>

    <div v-else-if="bookingStore.bookingsError" class="rounded-md border border-marqueeRed bg-marqueeRed/10 p-5 text-sm font-semibold text-paperCream">
      {{ bookingStore.bookingsError }}
    </div>

    <div v-else-if="bookings.length" class="space-y-5">
      <article
        v-for="booking in bookings"
        :key="booking.id"
        class="relative overflow-hidden rounded-md border-2 border-stubCharcoal bg-paperCream text-stubCharcoal shadow-ticket"
      >
        <div
          class="absolute right-8 top-7 z-10 rotate-12 border-4 px-4 py-1 font-display text-2xl leading-none opacity-80"
          :class="stampClass(booking)"
        >
          {{ stampLabel(booking) }}
        </div>

        <div class="grid lg:grid-cols-[1fr_240px]">
          <div class="p-6">
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p class="font-mono text-[10px] font-bold uppercase text-marqueeRed">Booking ID</p>
                <p class="mt-1 break-all font-mono text-xs font-bold text-stubCharcoal/60">{{ booking.id }}</p>
              </div>
              <p class="font-mono text-xs font-bold text-stubCharcoal/55">{{ createdDate(booking) }}</p>
            </div>

            <div class="mt-6">
              <h2 class="font-display text-5xl leading-none">{{ eventTitle(booking) }}</h2>
              <p class="mt-2 text-sm italic text-stubCharcoal/65">{{ eventLocation(booking) }}</p>
              <p class="mt-3 font-mono text-xs font-bold uppercase text-stubCharcoal/55">{{ eventDate(booking) }}</p>
            </div>

            <div class="my-6 border-t-2 border-dashed border-stubCharcoal/25" />

            <div class="grid gap-3 sm:grid-cols-2">
              <div class="rounded-sm border border-stubCharcoal/15 p-3">
                <p class="font-mono text-[10px] font-bold uppercase text-stubCharcoal/50">Seat numbers</p>
                <p class="mt-1 text-sm font-bold">{{ seatNumbers(booking) }}</p>
              </div>
              <div class="rounded-sm border border-stubCharcoal/15 p-3">
                <p class="font-mono text-[10px] font-bold uppercase text-stubCharcoal/50">Wallet transaction ID</p>
                <p class="mt-1 break-all font-mono text-xs font-bold">{{ booking.walletTransactionId || 'Not available' }}</p>
              </div>
              <div class="rounded-sm border border-stubCharcoal/15 p-3">
                <p class="font-mono text-[10px] font-bold uppercase text-stubCharcoal/50">Booking status</p>
                <p class="mt-1 font-display text-3xl leading-none">{{ booking.status }}</p>
              </div>
              <div class="rounded-sm border border-stubCharcoal/15 p-3">
                <p class="font-mono text-[10px] font-bold uppercase text-stubCharcoal/50">Payment status</p>
                <p class="mt-1 font-display text-3xl leading-none">{{ booking.paymentStatus }}</p>
              </div>
            </div>
          </div>

          <aside class="relative border-t-2 border-dashed border-stubCharcoal/25 p-6 lg:border-l-2 lg:border-t-0">
            <span class="absolute -left-4 -top-4 hidden h-8 w-8 rounded-full bg-[#121221] lg:block" aria-hidden="true" />
            <span class="absolute -bottom-4 -left-4 hidden h-8 w-8 rounded-full bg-[#121221] lg:block" aria-hidden="true" />

            <p class="font-mono text-[10px] font-bold uppercase text-stubCharcoal/50">Total amount</p>
            <p class="mt-1 font-mono text-3xl font-black text-marqueeRed">{{ formatINR(booking.totalAmountInPaise) }}</p>

            <div class="mt-5 inline-flex rounded-sm border-2 px-3 py-1 font-mono text-xs font-black uppercase" :class="badgeClass(booking)">
              {{ stampLabel(booking) }}
            </div>

            <p class="mt-5 font-mono text-[10px] font-bold uppercase text-stubCharcoal/50">Payment</p>
            <p class="font-mono text-sm font-bold">{{ booking.paymentStatus }}</p>

            <div class="mt-6">
              <BarcodeStrip />
            </div>
          </aside>
        </div>
      </article>
    </div>

    <div v-else class="rounded-md border-2 border-stubCharcoal bg-paperCream p-8 text-center text-stubCharcoal shadow-ticket">
      <Icon icon="mdi:ticket-outline" class="mx-auto h-12 w-12 text-marqueeRed" aria-hidden="true" />
      <p class="mt-3 font-display text-4xl leading-none">No bookings yet.</p>
      <p class="mt-2 text-sm text-stubCharcoal/65">Reserve your first seat now.</p>
      <RouterLink to="/events" class="mt-5 inline-flex">
        <AppButton icon="mdi:ticket-confirmation">Explore More Events</AppButton>
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { computed, onMounted } from 'vue';

import AppButton from '@/components/common/AppButton.vue';
import BarcodeStrip from '@/components/common/BarcodeStrip.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import type { Booking } from '@/services/apiTypes';
import { formatDateTime } from '@/utils/date';
import { formatINR } from '@/utils/money';
import { useBookingStore } from './booking.store';

interface BookingEvent {
  id: string;
  title: string;
  location?: string;
  startDate?: string;
}

interface BookingSeat {
  id: string;
  seatNumber: string;
  row?: string;
}

type BookingHistoryItem = Omit<Booking, 'eventId' | 'seatIds'> & {
  eventId?: string | BookingEvent;
  seatIds?: string[] | BookingSeat[];
};

const bookingStore = useBookingStore();
const bookings = computed(() => bookingStore.bookings as BookingHistoryItem[]);

function populatedEvent(booking: BookingHistoryItem) {
  return typeof booking.eventId === 'object' && booking.eventId ? booking.eventId : null;
}

function eventTitle(booking: BookingHistoryItem) {
  return populatedEvent(booking)?.title || booking.event?.title || 'Booked event';
}

function eventLocation(booking: BookingHistoryItem) {
  return populatedEvent(booking)?.location || 'Venue to be announced';
}

function eventDate(booking: BookingHistoryItem) {
  const startDate = populatedEvent(booking)?.startDate;
  return startDate ? formatDateTime(startDate) : 'Event date pending';
}

function seatNumbers(booking: BookingHistoryItem) {
  if (booking.seats?.length) {
    return booking.seats.map((seat) => seat.seatNumber).join(', ');
  }

  if (booking.seatIds?.length && typeof booking.seatIds[0] === 'object') {
    return (booking.seatIds as BookingSeat[]).map((seat) => seat.seatNumber).join(', ');
  }

  if (booking.seatIds?.length) {
    return (booking.seatIds as string[]).join(', ');
  }

  return 'Seats reserved';
}

function createdDate(booking: BookingHistoryItem) {
  return booking.createdAt ? formatDateTime(booking.createdAt) : 'Date pending';
}

function stampLabel(booking: BookingHistoryItem) {
  if (booking.paymentStatus === 'REFUNDED') {
    return 'REFUNDED';
  }

  if (booking.status === 'CANCELLED') {
    return 'CANCELLED';
  }

  return booking.status;
}

function stampClass(booking: BookingHistoryItem) {
  if (booking.paymentStatus === 'REFUNDED') {
    return 'border-ticketGold text-ticketGold';
  }

  if (booking.status === 'CANCELLED') {
    return 'border-marqueeRed text-marqueeRed';
  }

  return 'border-electricTeal text-electricTeal';
}

function badgeClass(booking: BookingHistoryItem) {
  if (booking.paymentStatus === 'REFUNDED') {
    return 'border-ticketGold bg-ticketGold/30 text-stubCharcoal';
  }

  if (booking.status === 'CANCELLED') {
    return 'border-marqueeRed bg-marqueeRed/10 text-marqueeRed';
  }

  return 'border-electricTeal bg-electricTeal/15 text-stubCharcoal';
}

onMounted(() => {
  bookingStore.fetchMyBookings().catch(() => undefined);
});
</script>
