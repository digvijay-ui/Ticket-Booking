<template>
  <div class="space-y-6 text-[#e3e0f6]">
    <div>
      <p class="font-mono text-xs font-bold uppercase text-electricTeal">Booking complete</p>
      <h1 class="font-display text-5xl leading-none sm:text-6xl">TICKET CONFIRMED</h1>
      <p class="max-w-2xl text-sm text-[#e3e0f6]/70">Your wallet payment was confirmed by the backend.</p>
    </div>

    <section class="relative overflow-hidden rounded-md border-2 border-stubCharcoal bg-paperCream text-stubCharcoal shadow-ticket">
      <div class="absolute right-6 top-8 z-10 rotate-12 border-4 border-marqueeRed px-4 py-2 font-display text-3xl leading-none text-marqueeRed opacity-80">
        CONFIRMED
      </div>

      <div class="grid lg:grid-cols-[1fr_220px]">
        <div class="p-6 sm:p-8">
          <div class="flex flex-wrap items-start gap-4">
            <Icon icon="mdi:check-decagram" class="h-12 w-12 text-electricTeal" aria-hidden="true" />
            <div>
              <p class="font-mono text-xs font-bold uppercase text-marqueeRed">Paid admission</p>
              <h2 class="font-display text-5xl leading-none">{{ eventTitle }}</h2>
              <p class="mt-1 text-sm italic text-stubCharcoal/65">Booking status: {{ bookingStatus }}</p>
            </div>
          </div>

          <div class="my-6 border-t-2 border-dashed border-stubCharcoal/25" />

          <div class="grid gap-3 sm:grid-cols-2">
            <div class="rounded-sm border border-stubCharcoal/15 p-3">
              <p class="font-mono text-[10px] font-bold uppercase text-stubCharcoal/50">Booking ID</p>
              <p class="mt-1 break-all font-mono text-xs font-bold">{{ bookingId }}</p>
            </div>
            <div class="rounded-sm border border-stubCharcoal/15 p-3">
              <p class="font-mono text-[10px] font-bold uppercase text-stubCharcoal/50">Reservation ID</p>
              <p class="mt-1 break-all font-mono text-xs font-bold">{{ reservationId }}</p>
            </div>
            <div class="rounded-sm border border-stubCharcoal/15 p-3">
              <p class="font-mono text-[10px] font-bold uppercase text-stubCharcoal/50">Seat IDs</p>
              <p class="mt-1 break-all font-mono text-xs font-bold">{{ seatIds }}</p>
            </div>
            <div class="rounded-sm border border-stubCharcoal/15 p-3">
              <p class="font-mono text-[10px] font-bold uppercase text-stubCharcoal/50">Seat numbers</p>
              <p class="mt-1 text-sm font-bold">{{ seatNumbers }}</p>
            </div>
            <div class="rounded-sm border border-stubCharcoal/15 p-3">
              <p class="font-mono text-[10px] font-bold uppercase text-stubCharcoal/50">Total amount paid</p>
              <p class="mt-1 font-display text-3xl leading-none text-marqueeRed">{{ amountPaid }}</p>
            </div>
            <div class="rounded-sm border border-stubCharcoal/15 p-3">
              <p class="font-mono text-[10px] font-bold uppercase text-stubCharcoal/50">Payment status</p>
              <p class="mt-1 font-display text-3xl leading-none text-electricTeal">{{ paymentStatus }}</p>
            </div>
            <div class="rounded-sm border border-stubCharcoal/15 p-3 sm:col-span-2">
              <p class="font-mono text-[10px] font-bold uppercase text-stubCharcoal/50">Wallet transaction ID</p>
              <p class="mt-1 break-all font-mono text-xs font-bold">{{ walletTransactionId }}</p>
            </div>
          </div>

          <p v-if="createdAt" class="mt-5 font-mono text-xs text-stubCharcoal/55">Issued {{ createdAt }}</p>

          <div class="mt-6 flex flex-wrap gap-3">
            <RouterLink to="/bookings" class="inline-flex">
              <AppButton variant="secondary" icon="mdi:format-list-bulleted">View My Bookings</AppButton>
            </RouterLink>
            <RouterLink to="/events" class="inline-flex">
              <AppButton icon="mdi:ticket-confirmation">Explore More Events</AppButton>
            </RouterLink>
          </div>
        </div>

        <aside class="relative border-t-2 border-dashed border-stubCharcoal/25 p-6 lg:border-l-2 lg:border-t-0">
          <span class="absolute -left-4 -top-4 hidden h-8 w-8 rounded-full bg-[#121221] lg:block" aria-hidden="true" />
          <span class="absolute -bottom-4 -left-4 hidden h-8 w-8 rounded-full bg-[#121221] lg:block" aria-hidden="true" />
          <p class="font-mono text-[10px] font-bold uppercase text-stubCharcoal/50">Box office proof</p>
          <div class="mt-4 lg:rotate-90 lg:origin-center">
            <BarcodeStrip />
          </div>
          <p class="mt-8 break-all font-mono text-[11px] font-bold text-stubCharcoal/60">{{ walletTransactionId }}</p>
        </aside>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';

import AppButton from '@/components/common/AppButton.vue';
import BarcodeStrip from '@/components/common/BarcodeStrip.vue';
import { formatDateTime } from '@/utils/date';
import { formatINR } from '@/utils/money';
import { useBookingStore } from './booking.store';

const route = useRoute();
const bookingStore = useBookingStore();

const bookingId = computed(() => String(route.params.bookingId));
const booking = computed(() => (bookingStore.booking?.id === bookingId.value ? bookingStore.booking : null));
const reservationData = computed(() => bookingStore.reservation);
const eventTitle = computed(() => booking.value?.event?.title || reservationData.value?.event?.title || 'Confirmed ticket');
const reservationId = computed(() => booking.value?.reservationId || reservationData.value?.reservation.id || 'Reservation confirmed');
const bookingStatus = computed(() => booking.value?.status || 'CONFIRMED');
const paymentStatus = computed(() => booking.value?.paymentStatus || 'PAID');
const amountPaid = computed(() => formatINR(booking.value?.totalAmountInPaise || reservationData.value?.reservation.totalAmountInPaise || 0));
const walletTransactionId = computed(() => booking.value?.walletTransactionId || 'Wallet transaction recorded');
const createdAt = computed(() => (booking.value?.createdAt ? formatDateTime(booking.value.createdAt) : ''));
const seatIds = computed(() => {
  const ids = booking.value?.seatIds || reservationData.value?.reservation.seatIds || [];
  return ids.length ? ids.join(', ') : 'Seats confirmed';
});
const seatNumbers = computed(() => {
  const numbers = booking.value?.seats?.map((seat) => seat.seatNumber) || reservationData.value?.seats.map((seat) => seat.seatNumber) || [];
  return numbers.length ? numbers.join(', ') : 'Confirmed seats';
});

onMounted(() => {
  if (!booking.value) {
    bookingStore.loadBooking(bookingId.value);
  }
});
</script>
