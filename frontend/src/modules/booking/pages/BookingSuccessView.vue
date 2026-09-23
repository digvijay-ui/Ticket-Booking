<template>
  <div class="success-page min-h-screen bg-midnight-ink px-5 pb-24 pt-28 text-midnight-ivory sm:px-8 lg:px-12 lg:pt-32">
    <div class="mx-auto max-w-[1120px]">
      <div v-if="bookingStore.bookingLoading && !booking" class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]" aria-label="Loading confirmed ticket"><div class="skeleton h-[560px] rounded-[28px]" /><div class="skeleton h-[560px] rounded-[28px]" /></div>

      <section v-else-if="!booking" class="rounded-[26px] border border-dashed border-white/15 bg-midnight-surface px-6 py-14 text-center"><Icon icon="mdi:ticket-off-outline" class="mx-auto h-10 w-10 text-midnight-ember" aria-hidden="true" /><h1 class="mt-4 text-2xl font-black">Ticket unavailable.</h1><p class="mt-2 text-sm text-midnight-stone">{{ bookingStore.bookingsError || 'We could not find this confirmed booking.' }}</p><div class="mt-6 flex flex-wrap justify-center gap-3"><button type="button" class="focus-midnight min-h-11 rounded-full border border-white/15 px-5 text-sm font-extrabold" @click="loadBooking">Try again</button><RouterLink to="/bookings" class="focus-midnight grid min-h-11 place-items-center rounded-full bg-midnight-ember px-5 text-sm font-extrabold text-white">View my bookings</RouterLink></div></section>

      <template v-else>
        <header class="ticket-reveal text-center"><span class="mx-auto grid h-14 w-14 place-items-center rounded-full border border-midnight-mint/40 bg-midnight-mint/10 text-midnight-mint"><Icon icon="mdi:check-bold" class="h-7 w-7" aria-hidden="true" /></span><p class="mt-5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-midnight-mint">Booking confirmed</p><h1 class="mt-3 text-4xl font-black tracking-[-0.055em] sm:text-6xl">You’re on the list.</h1><p class="mt-3 text-sm font-medium text-midnight-stone">Payment is confirmed and your digital ticket is ready.</p></header>

        <article class="ticket-reveal ticket-delay mt-9 overflow-hidden rounded-[28px] bg-midnight-ivory text-midnight-ink shadow-[0_28px_70px_rgb(0_0_0_/_0.32)]">
          <div class="grid lg:grid-cols-[minmax(0,1fr)_250px]">
            <div class="p-6 sm:p-9">
              <div class="flex flex-wrap items-start justify-between gap-5"><div><p class="text-[9px] font-extrabold uppercase tracking-[0.18em] text-midnight-ember">Paid admission</p><h2 class="mt-3 max-w-2xl text-4xl font-black leading-[0.95] tracking-[-0.055em] sm:text-5xl">{{ eventTitle }}</h2></div><span class="ticket-stamp rotate-[-5deg] border-2 border-midnight-ember px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-midnight-ember">{{ booking.status }}</span></div>
              <div class="my-7 border-t border-dashed border-midnight-ink/20" />
              <div class="grid gap-5 sm:grid-cols-2">
                <div><p class="ticket-label">Date & time</p><p class="ticket-value">{{ eventDate }}</p></div>
                <div><p class="ticket-label">Venue</p><p class="ticket-value">{{ eventVenue }}</p></div>
                <div><p class="ticket-label">Seats</p><p class="ticket-value">{{ seatNumbers }}</p></div>
                <div><p class="ticket-label">Amount paid</p><p class="ticket-value">{{ formatINR(booking.totalAmountInPaise) }}</p></div>
              </div>
              <div class="mt-7 border-t border-dashed border-midnight-ink/20 pt-6"><p class="ticket-label">Booking ID</p><p class="mt-2 break-all font-mono text-xs font-bold">{{ booking.id }}</p></div>
            </div>
            <aside class="ticket-perf relative flex flex-col justify-between border-t border-dashed border-midnight-ink/25 p-6 lg:border-l lg:border-t-0">
              <div><p class="ticket-label">Booking status</p><p class="mt-2 text-xl font-black">{{ booking.status }}</p><p class="mt-6 ticket-label">Payment</p><p class="mt-2 text-xl font-black">{{ booking.paymentStatus }}</p></div>
              <div><span class="ticket-barcode mt-10 block h-16 w-full text-midnight-ink" aria-hidden="true" /><p class="mt-3 break-all text-center font-mono text-[9px] font-bold">{{ booking.walletTransactionId || booking.id }}</p></div>
            </aside>
          </div>
        </article>

        <div class="ticket-reveal ticket-delay-2 mt-7 flex flex-col justify-center gap-3 sm:flex-row"><RouterLink to="/bookings" class="inline-flex"><AppButton variant="midnight" class="w-full rounded-full" icon="mdi:ticket-confirmation-outline">View My Bookings</AppButton></RouterLink><RouterLink to="/events" class="focus-midnight inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 px-5 text-sm font-extrabold hover:border-midnight-mint/50">Explore More Events</RouterLink></div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import AppButton from '@/components/common/AppButton.vue';
import { formatDateTime } from '@/utils/date';
import { formatINR } from '@/utils/money';
import { useBookingStore } from '../booking.store';

const route = useRoute(); const bookingStore = useBookingStore();
const bookingId = computed(() => String(route.params.bookingId));
const booking = computed(() => bookingStore.booking?.id === bookingId.value ? bookingStore.booking : null);
const reservationData = computed(() => bookingStore.reservation);
const eventTitle = computed(() => booking.value?.event?.title || reservationData.value?.event?.title || 'Confirmed event');
const eventDate = computed(() => {
  const date = booking.value?.event?.startDate || reservationData.value?.event?.startDate;
  return date ? formatDateTime(date) : 'See event details';
});
const eventVenue = computed(() => booking.value?.event?.location || reservationData.value?.event?.location || 'See event details');
const seatNumbers = computed(() => {
  const seats = booking.value?.seats?.map((seat) => seat.seatNumber) || reservationData.value?.seats.map((seat) => seat.seatNumber) || [];
  return seats.length ? seats.join(', ') : 'Confirmed seats';
});

async function loadBooking() {
  bookingStore.loadBooking(bookingId.value);
  await bookingStore.fetchBookingById(bookingId.value);
}
onMounted(loadBooking);
</script>

<style scoped>
.ticket-label{@apply text-[9px] font-extrabold uppercase tracking-[0.16em] text-midnight-ink/55}.ticket-value{@apply mt-2 text-base font-black}.ticket-perf::before,.ticket-perf::after{position:absolute;left:-13px;width:26px;height:26px;content:'';border-radius:999px;background:var(--midnight-ink)}.ticket-perf::before{top:-13px}.ticket-perf::after{bottom:-13px}.ticket-barcode{background:repeating-linear-gradient(90deg,currentColor 0 2px,transparent 2px 5px,currentColor 5px 9px,transparent 9px 12px)}.ticket-reveal{animation:ticket-reveal 420ms cubic-bezier(.2,.8,.2,1) both}.ticket-delay{animation-delay:90ms}.ticket-delay-2{animation-delay:160ms}.ticket-stamp{animation:ticket-stamp 300ms cubic-bezier(.2,.8,.2,1) 260ms both}@keyframes ticket-reveal{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}@keyframes ticket-stamp{from{opacity:0;transform:rotate(-5deg) scale(1.12)}to{opacity:1;transform:rotate(-5deg) scale(1)}}@media(max-width:1023px){.ticket-perf::before,.ticket-perf::after{top:-13px;left:auto}.ticket-perf::before{left:-13px}.ticket-perf::after{right:-13px;bottom:auto}}@media(prefers-reduced-motion:reduce){.ticket-reveal,.ticket-stamp{animation:none}}
</style>
