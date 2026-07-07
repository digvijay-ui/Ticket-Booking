<template>
  <div class="space-y-6 text-[#e3e0f6]">
    <div>
      <p class="font-mono text-xs font-bold uppercase text-ticketGold">Payment window</p>
      <h1 class="font-display text-5xl leading-none sm:text-6xl">RESERVATION CHECKOUT</h1>
      <p class="max-w-2xl text-sm text-[#e3e0f6]/70">
        Pay from wallet only after the backend confirms the reservation. Your wallet is debited by the server.
      </p>
    </div>

    <section v-if="walletStore.loading" class="flex min-h-72 items-center justify-center rounded-md bg-deepPlum/70">
      <LoadingSpinner size="lg" />
    </section>

    <section v-else-if="!reservationData" class="rounded-md border-2 border-ticketGold bg-paperCream p-6 text-stubCharcoal shadow-ticket">
      <p class="font-mono text-xs font-bold uppercase text-marqueeRed">Reservation missing</p>
      <h2 class="mt-2 font-display text-4xl leading-none">Reservation details not found.</h2>
      <p class="mt-2 text-sm text-stubCharcoal/70">Please select seats again.</p>
      <RouterLink to="/events" class="mt-5 inline-flex">
        <AppButton variant="secondary" icon="mdi:arrow-left">Back to Events</AppButton>
      </RouterLink>
    </section>

    <section v-else class="grid gap-5 lg:grid-cols-[1fr_360px]">
      <div class="relative overflow-hidden rounded-md border-2 border-stubCharcoal bg-paperCream p-6 text-stubCharcoal shadow-ticket">
        <div class="absolute left-0 top-0 h-full w-2 bg-marqueeRed" aria-hidden="true" />
        <div class="flex flex-wrap items-start justify-between gap-4 pl-2">
          <div>
            <p class="font-mono text-xs font-bold uppercase text-marqueeRed">Hold ticket</p>
            <h2 class="mt-1 font-display text-5xl leading-none">{{ eventTitle }}</h2>
            <p class="mt-2 max-w-2xl text-sm italic text-stubCharcoal/65">{{ eventLocation }}</p>
          </div>
          <div class="rounded-sm border-2 border-ticketGold px-3 py-2 text-center">
            <p class="font-mono text-[10px] font-bold uppercase text-stubCharcoal/55">Countdown</p>
            <p class="font-mono text-2xl font-black text-marqueeRed">{{ countdownLabel }}</p>
          </div>
        </div>

        <div class="my-6 border-t-2 border-dashed border-stubCharcoal/25" />

        <div class="grid gap-3 pl-2 sm:grid-cols-2">
          <div class="rounded-sm border border-stubCharcoal/15 p-3">
            <p class="font-mono text-[10px] font-bold uppercase text-stubCharcoal/50">Reservation ID</p>
            <p class="mt-1 break-all font-mono text-xs font-bold">{{ reservationId }}</p>
          </div>
          <div class="rounded-sm border border-stubCharcoal/15 p-3">
            <p class="font-mono text-[10px] font-bold uppercase text-stubCharcoal/50">Reservation status</p>
            <p class="mt-1 font-display text-2xl leading-none">{{ reservationData.reservation.status }}</p>
          </div>
          <div class="rounded-sm border border-stubCharcoal/15 p-3">
            <p class="font-mono text-[10px] font-bold uppercase text-stubCharcoal/50">Selected seats</p>
            <p class="mt-1 font-semibold">{{ selectedSeatNumbers }}</p>
            <p class="mt-1 break-all font-mono text-[11px] text-stubCharcoal/45">{{ selectedSeatIds }}</p>
          </div>
          <div class="rounded-sm border border-stubCharcoal/15 p-3">
            <p class="font-mono text-[10px] font-bold uppercase text-stubCharcoal/50">Expires at</p>
            <p class="mt-1 text-sm font-bold">{{ expiresLabel }}</p>
          </div>
        </div>

        <div class="mt-6 pl-2">
          <BarcodeStrip />
        </div>
      </div>

      <aside class="h-fit rounded-md border-2 border-stubCharcoal bg-paperCream p-5 text-stubCharcoal shadow-ticket">
        <p class="font-mono text-xs font-bold uppercase text-stubCharcoal/55">Amount payable</p>
        <p class="mt-1 font-display text-5xl leading-none text-marqueeRed">{{ formatINR(totalAmountInPaise) }}</p>

        <div class="my-5 border-t-2 border-dashed border-stubCharcoal/25" />

        <div class="space-y-3 font-mono text-sm">
          <div class="flex justify-between gap-4">
            <span>Wallet balance</span>
            <span class="font-bold text-electricTeal">{{ formatINR(walletStore.walletBalanceInPaise) }}</span>
          </div>
          <div class="flex justify-between gap-4">
            <span>Payment method</span>
            <span class="font-bold">WALLET</span>
          </div>
        </div>

        <p v-if="isExpired" class="mt-4 rounded-sm bg-marqueeRed/10 px-3 py-2 text-sm font-semibold text-marqueeRed">
          Reservation expired
        </p>
        <p v-else-if="hasInsufficientBalance" class="mt-4 rounded-sm bg-ticketGold/25 px-3 py-2 text-sm font-semibold text-stubCharcoal">
          Insufficient wallet balance
        </p>
        <p v-if="paymentError" class="mt-4 rounded-sm bg-marqueeRed/10 px-3 py-2 text-sm font-semibold text-marqueeRed">
          {{ paymentError }}
        </p>

        <AppButton
          class="mt-5 w-full"
          icon="mdi:wallet-check"
          :loading="bookingStore.confirming"
          :disabled="isPayDisabled"
          @click="payFromWallet"
        >
          {{ bookingStore.confirming ? 'Processing payment...' : 'Pay From Wallet' }}
        </AppButton>

        <RouterLink v-if="hasInsufficientBalance" to="/wallet" class="mt-3 flex">
          <AppButton class="w-full" variant="secondary" icon="mdi:plus-circle">Add Money</AppButton>
        </RouterLink>
        <RouterLink v-if="isExpired" to="/events" class="mt-3 flex">
          <AppButton class="w-full" variant="ghost" icon="mdi:arrow-left">Back to Events</AppButton>
        </RouterLink>
      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import AppButton from '@/components/common/AppButton.vue';
import BarcodeStrip from '@/components/common/BarcodeStrip.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import { useWalletStore } from '@/modules/wallet/wallet.store';
import { getApiErrorMessage } from '@/utils/apiError';
import { formatDateTime } from '@/utils/date';
import { formatINR } from '@/utils/money';
import { useBookingStore } from './booking.store';

const route = useRoute();
const router = useRouter();
const bookingStore = useBookingStore();
const walletStore = useWalletStore();
const remainingSeconds = ref(0);
const paymentError = ref('');
let countdownTimer: number | undefined;

const reservationId = computed(() => String(route.params.reservationId));
const reservationData = computed(() => bookingStore.reservation);
const eventTitle = computed(() => reservationData.value?.event?.title || 'Reservation hold');
const eventLocation = computed(() => reservationData.value?.event?.location || 'Box office checkout');
const selectedSeatNumbers = computed(() => {
  const seatNumbers = reservationData.value?.seats.map((seat) => seat.seatNumber).filter(Boolean);
  return seatNumbers?.length ? seatNumbers.join(', ') : 'Reserved seats';
});
const selectedSeatIds = computed(() => reservationData.value?.reservation.seatIds.join(', ') || 'No seat IDs');
const totalAmountInPaise = computed(() => reservationData.value?.reservation.totalAmountInPaise || 0);
const expiresLabel = computed(() =>
  reservationData.value?.reservation.expiresAt ? formatDateTime(reservationData.value.reservation.expiresAt) : 'Soon',
);
const isExpired = computed(() => Boolean(reservationData.value) && remainingSeconds.value <= 0);
const hasInsufficientBalance = computed(
  () => Boolean(reservationData.value) && walletStore.walletBalanceInPaise < totalAmountInPaise.value,
);
const isPayDisabled = computed(
  () => !reservationData.value || isExpired.value || hasInsufficientBalance.value || bookingStore.confirming,
);
const countdownLabel = computed(() => formatCountdown(remainingSeconds.value));

function formatCountdown(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(seconds).padStart(2, '0');

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${paddedMinutes}:${paddedSeconds}`;
  }

  return `${paddedMinutes}:${paddedSeconds}`;
}

function updateCountdown() {
  const expiresAt = reservationData.value?.reservation.expiresAt;

  if (!expiresAt) {
    remainingSeconds.value = 0;
    return;
  }

  const seconds = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000);
  remainingSeconds.value = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
}

async function payFromWallet() {
  paymentError.value = '';

  if (isPayDisabled.value) {
    return;
  }

  try {
    const booking = await bookingStore.confirmBooking(reservationId.value);
    await walletStore.fetchBalance();
    router.push(`/booking/success/${booking.id}`);
  } catch (error) {
    paymentError.value = bookingStore.error || getApiErrorMessage(error);
  }
}

onMounted(async () => {
  bookingStore.loadReservation(reservationId.value);
  updateCountdown();
  countdownTimer = window.setInterval(updateCountdown, 1000);

  try {
    walletStore.loading = true;
    await walletStore.fetchBalance();
  } catch {
    paymentError.value = walletStore.error || 'Something went wrong';
  } finally {
    walletStore.loading = false;
  }
});

onUnmounted(() => {
  if (countdownTimer) {
    window.clearInterval(countdownTimer);
  }
});
</script>
