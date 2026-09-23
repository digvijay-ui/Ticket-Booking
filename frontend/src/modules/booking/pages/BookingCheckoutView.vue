<template>
  <div class="checkout-page min-h-screen overflow-x-clip bg-midnight-ink px-5 pb-24 pt-28 text-midnight-ivory sm:px-8 lg:px-12 lg:pt-32">
    <div class="mx-auto max-w-[1280px]">
      <header class="border-b border-white/10 pb-7"><p class="text-[10px] font-extrabold uppercase tracking-[0.18em] text-midnight-mint">Final confirmation</p><h1 class="mt-3 text-4xl font-black tracking-[-0.055em] sm:text-6xl">Your seats are on hold.</h1><p class="mt-3 max-w-2xl text-sm font-medium leading-6 text-midnight-stone">Review the ticket and confirm once. Your wallet is debited only after the server confirms the booking.</p></header>

      <div v-if="pageLoading" class="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]" aria-label="Loading reservation"><div class="skeleton h-[520px] rounded-[26px]" /><div class="skeleton h-96 rounded-[26px]" /></div>

      <section v-else-if="!reservationData" class="mt-7 rounded-[26px] border border-dashed border-white/15 bg-midnight-surface px-6 py-14 text-center"><Icon icon="mdi:ticket-off-outline" class="mx-auto h-10 w-10 text-midnight-ember" aria-hidden="true" /><h2 class="mt-4 text-2xl font-black">Reservation not found.</h2><p class="mt-2 text-sm text-midnight-stone">Return to the event and select seats again.</p><RouterLink to="/events" class="mt-6 inline-flex"><AppButton variant="midnight" class="rounded-full">Explore events</AppButton></RouterLink></section>

      <section v-else class="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <article class="overflow-hidden rounded-[26px] border border-white/10 bg-midnight-surface">
          <div class="grid gap-px bg-white/10 sm:grid-cols-[minmax(0,1fr)_190px]">
            <div class="bg-midnight-surface p-6 sm:p-8"><div class="flex flex-wrap items-start justify-between gap-4"><div><p class="text-[9px] font-extrabold uppercase tracking-[0.18em] text-midnight-mint">Reserved admission</p><h2 class="mt-3 text-3xl font-black tracking-[-0.045em] sm:text-4xl">{{ eventTitle }}</h2><p class="mt-3 flex items-center gap-2 text-sm font-semibold text-midnight-stone"><Icon icon="mdi:map-marker-outline" class="h-4 w-4 text-midnight-mint" aria-hidden="true" />{{ eventLocation }}</p><p class="mt-2 flex items-center gap-2 text-sm font-semibold text-midnight-stone"><Icon icon="mdi:calendar-clock-outline" class="h-4 w-4 text-midnight-mint" aria-hidden="true" />{{ eventDate }}</p></div></div></div>
            <div class="bg-midnight-surface p-6 text-center"><p class="text-[9px] font-extrabold uppercase tracking-[0.17em] text-midnight-stone">Time remaining</p><p class="mt-3 text-4xl font-black tabular-nums text-midnight-ember"><ReservationTimer :expires-at="reservationData.reservation.expiresAt" @tick="remainingSeconds = $event" @expired="handleReservationExpired" /></p><p class="mt-2 text-xs font-semibold leading-5 text-midnight-stone">Seats are held until this timer ends.</p></div>
          </div>

          <div class="p-6 sm:p-8">
            <div class="grid gap-5 sm:grid-cols-2">
              <div><p class="text-[9px] font-extrabold uppercase tracking-[0.16em] text-midnight-stone">Selected seats</p><div class="mt-3 flex flex-wrap gap-2"><span v-for="seat in reservationData.seats" :key="seat.id" class="rounded-lg border border-midnight-mint/35 bg-midnight-mint/10 px-3 py-1.5 text-sm font-extrabold text-midnight-mint">{{ seat.seatNumber }}</span></div><p class="mt-3 text-xs font-semibold text-midnight-stone">{{ reservationData.seats.length }} {{ reservationData.seats.length === 1 ? 'seat' : 'seats' }} reserved</p></div>
              <div><p class="text-[9px] font-extrabold uppercase tracking-[0.16em] text-midnight-stone">Price breakdown</p><dl class="mt-3 space-y-2 text-sm"><div v-for="line in priceBreakdown" :key="line.priceInPaise" class="flex justify-between gap-3"><dt class="text-midnight-stone">{{ line.count }} × {{ formatINR(line.priceInPaise) }}</dt><dd class="font-extrabold">{{ formatINR(line.count * line.priceInPaise) }}</dd></div></dl></div>
            </div>
            <div class="mt-7 flex items-center justify-between border-t border-dashed border-white/15 pt-6"><div><p class="text-[9px] font-extrabold uppercase tracking-[0.16em] text-midnight-stone">Reservation ID</p><p class="mt-1 break-all text-xs font-bold text-midnight-ivory">{{ reservationId }}</p></div><span class="ticket-barcode h-9 w-24 text-midnight-stone" aria-hidden="true" /></div>
          </div>
        </article>

        <aside class="h-fit rounded-[26px] border border-white/10 bg-midnight-surface p-6 lg:sticky lg:top-24">
          <p class="text-[9px] font-extrabold uppercase tracking-[0.17em] text-midnight-mint">Wallet payment</p><div class="mt-5 flex items-center justify-between gap-4"><span class="text-sm text-midnight-stone">Current balance</span><strong>{{ formatINR(walletStore.walletBalanceInPaise) }}</strong></div><div class="mt-3 flex items-center justify-between gap-4"><span class="text-sm text-midnight-stone">Total payable</span><strong class="text-2xl">{{ formatINR(totalAmountInPaise) }}</strong></div>
          <div v-if="hasInsufficientBalance" class="mt-5 rounded-2xl border border-midnight-ember/35 bg-midnight-ember/10 p-4"><p class="font-extrabold">Add {{ formatINR(shortageInPaise) }} to continue.</p><p class="mt-1 text-xs font-semibold leading-5 text-midnight-stone">Your reservation stays active while you top up this wallet.</p></div>
          <div v-else class="mt-5 flex items-start gap-2 rounded-2xl border border-midnight-mint/30 bg-midnight-mint/10 p-4 text-sm font-semibold"><Icon icon="mdi:check-circle-outline" class="mt-0.5 h-5 w-5 shrink-0 text-midnight-mint" aria-hidden="true" />Your wallet covers this booking.</div>
          <p v-if="isExpired" class="mt-5 rounded-2xl border border-midnight-ember/35 bg-midnight-ember/10 p-4 text-sm font-bold" role="alert">This reservation expired. No payment was taken.</p>
          <p v-if="bookingStore.error" class="mt-5 rounded-2xl border border-midnight-ember/35 bg-midnight-ember/10 p-4 text-sm font-bold leading-6" role="alert">{{ bookingStore.error }}</p>
          <AppButton variant="midnight" class="mt-6 w-full rounded-full" icon="mdi:lock-check-outline" :loading="bookingStore.confirming" :disabled="confirmDisabled" @click="confirmBooking">{{ bookingStore.confirming ? 'Confirming securely…' : 'Confirm Booking' }}</AppButton>
          <button v-if="hasInsufficientBalance && !isExpired" type="button" class="focus-midnight mt-3 min-h-11 w-full rounded-full border border-midnight-mint/40 text-sm font-extrabold text-midnight-mint hover:bg-midnight-mint/10" @click="topUpOpen = true">Add money without leaving</button>
          <RouterLink v-if="isExpired || bookingStore.confirmationFailure === 'conflict'" :to="`/events/${reservationData.reservation.eventId}/seats`" class="focus-midnight mt-4 flex min-h-11 items-center justify-center rounded-full border border-white/15 text-sm font-extrabold">Select seats again</RouterLink>
          <p class="mt-4 text-center text-[10px] font-semibold leading-4 text-midnight-stone">One stable confirmation key is reused for this reservation. Double clicks cannot create a second booking.</p>
        </aside>
      </section>

      <p v-if="topUpSuccess" class="mt-5 rounded-2xl border border-midnight-mint/35 bg-midnight-mint/10 p-4 text-sm font-bold" role="status">{{ topUpSuccess }}</p>
      <AddMoneyPanel :open="topUpOpen" :adding="walletStore.addingMoney" :error="walletStore.error" :suggested-amount-in-paise="shortageInPaise" @close="topUpOpen = false" @add="addMoney" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppButton from '@/components/common/AppButton.vue';
import ReservationTimer from '@/components/seats/ReservationTimer.vue';
import AddMoneyPanel from '@/components/wallet/AddMoneyPanel.vue';
import { useEventStore } from '@/modules/events/event.store';
import { useWalletStore } from '@/modules/wallet/wallet.store';
import { formatDateTime } from '@/utils/date';
import { formatINR } from '@/utils/money';
import { useBookingStore } from '../booking.store';

const route = useRoute(); const router = useRouter(); const bookingStore = useBookingStore(); const walletStore = useWalletStore(); const eventStore = useEventStore();
const remainingSeconds = ref(0); const pageLoading = ref(true); const topUpOpen = ref(false); const topUpSuccess = ref('');
const reservationId = computed(() => String(route.params.reservationId));
const reservationData = computed(() => bookingStore.reservation);
const eventTitle = computed(() => reservationData.value?.event?.title || 'Reserved event');
const eventLocation = computed(() => reservationData.value?.event?.location || 'Venue details unavailable');
const eventDate = computed(() => reservationData.value?.event?.startDate ? formatDateTime(reservationData.value.event.startDate) : 'Date details unavailable');
const totalAmountInPaise = computed(() => reservationData.value?.reservation.totalAmountInPaise ?? 0);
const isExpired = computed(() => Boolean(reservationData.value) && (remainingSeconds.value <= 0 || reservationData.value?.reservation.status === 'EXPIRED'));
const shortageInPaise = computed(() => Math.max(0, totalAmountInPaise.value - walletStore.walletBalanceInPaise));
const hasInsufficientBalance = computed(() => shortageInPaise.value > 0);
const confirmDisabled = computed(() => !reservationData.value || isExpired.value || hasInsufficientBalance.value || bookingStore.confirming);
const priceBreakdown = computed(() => {
  const groups = new Map<number, number>();
  for (const seat of reservationData.value?.seats ?? []) groups.set(seat.priceInPaise, (groups.get(seat.priceInPaise) ?? 0) + 1);
  return [...groups.entries()].map(([priceInPaise, count]) => ({ priceInPaise, count }));
});

async function handleReservationExpired() {
  remainingSeconds.value = 0; bookingStore.markReservationExpired(reservationId.value);
  const eventId = reservationData.value?.reservation.eventId;
  if (eventId) await eventStore.fetchEventSeats(eventId);
}
async function addMoney(amountInPaise: number) {
  topUpSuccess.value = '';
  try {
    const result = await walletStore.addMoney(amountInPaise);
    if (!result) return;
    topUpOpen.value = false;
    topUpSuccess.value = `${formatINR(amountInPaise)} added. Your reservation and selected seats are unchanged.`;
  } catch { /* Safe error stays in the panel. */ }
}
async function confirmBooking() {
  if (confirmDisabled.value) return;
  try {
    const booking = await bookingStore.confirmBooking(reservationId.value);
    if (!booking) return;
    await Promise.allSettled([
      walletStore.fetchWallet(),
      bookingStore.fetchMyBookings(),
      eventStore.fetchEventSeats(reservationData.value?.reservation.eventId ?? ''),
    ]);
    await router.replace(`/booking/success/${booking.id}`);
  } catch {
    if (bookingStore.confirmationFailure === 'insufficient') await walletStore.fetchBalance().catch(() => undefined);
  }
}
onMounted(async () => {
  bookingStore.loadReservation(reservationId.value);
  try { await walletStore.fetchBalance(); } catch { /* Safe message is shown in the payment summary. */ }
  finally { pageLoading.value = false; }
});
</script>

<style scoped>
.ticket-barcode{background:repeating-linear-gradient(90deg,currentColor 0 2px,transparent 2px 5px,currentColor 5px 8px,transparent 8px 12px)}
</style>
