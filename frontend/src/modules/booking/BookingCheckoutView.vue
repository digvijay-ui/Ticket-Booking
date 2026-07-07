<template>
  <div class="space-y-6 text-white">
    <div>
      <p class="text-sm font-semibold text-white/55">Payment window</p>
      <h1 class="text-4xl font-black sm:text-5xl">Reservation checkout</h1>
      <p class="max-w-2xl text-white/70">Confirm your reservation using wallet balance.</p>
    </div>

    <section class="grid gap-5 lg:grid-cols-[1fr_360px]">
      <div class="rounded-2xl bg-white/[0.04] p-5">
        <h2 class="text-2xl font-black">{{ storedData?.event?.title || 'Reservation hold' }}</h2>
        <p class="mt-2 text-sm text-white/60">Reservation ID: {{ route.params.reservationId }}</p>

        <div class="mt-5 grid gap-3 sm:grid-cols-2">
          <div class="rounded-xl bg-black/25 p-4">
            <p class="text-xs font-bold uppercase text-white/45">Seats</p>
            <p class="mt-1 font-semibold">{{ seatsLabel }}</p>
          </div>
          <div class="rounded-xl bg-black/25 p-4">
            <p class="text-xs font-bold uppercase text-white/45">Expires</p>
            <p class="mt-1 font-semibold">{{ expiresLabel }}</p>
          </div>
        </div>
      </div>

      <aside class="h-fit rounded-2xl bg-white p-5 text-black">
        <p class="text-sm font-bold text-black/55">Amount payable</p>
        <p class="mt-1 text-3xl font-black">{{ formatINR(totalAmountInPaise) }}</p>
        <p v-if="error" class="mt-4 rounded-sm bg-marqueeRed/10 px-3 py-2 text-sm font-semibold text-marqueeRed">
          {{ error }}
        </p>
        <AppButton class="mt-5 w-full" icon="mdi:ticket-percent" :loading="confirming" @click="confirm">
          {{ confirming ? 'Please wait...' : 'Confirm booking' }}
        </AppButton>
      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import AppButton from '@/components/common/AppButton.vue';
import type { EventItem, Reservation, Seat } from '@/services/apiTypes';
import { getApiErrorMessage } from '@/utils/apiError';
import { formatDateTime } from '@/utils/date';
import { createIdempotencyKey } from '@/utils/idempotency';
import { formatINR } from '@/utils/money';
import { confirmBooking } from './booking.api';

const route = useRoute();
const router = useRouter();
const confirming = ref(false);
const error = ref('');

interface StoredReservationData {
  reservation: Reservation;
  event: EventItem | null;
  seats: Seat[];
}

const storedData = computed<StoredReservationData | null>(() => {
  const raw = sessionStorage.getItem(`reservation:${route.params.reservationId}`);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredReservationData;
  } catch {
    return null;
  }
});

const seatsLabel = computed(() => storedData.value?.seats.map((seat) => seat.seatNumber).join(', ') || 'Reserved seats');
const totalAmountInPaise = computed(() => storedData.value?.reservation.totalAmountInPaise || 0);
const expiresLabel = computed(() => (storedData.value?.reservation.expiresAt ? formatDateTime(storedData.value.reservation.expiresAt) : 'Soon'));

async function confirm() {
  error.value = '';
  confirming.value = true;

  try {
    const response = await confirmBooking({
      reservationId: String(route.params.reservationId),
      idempotencyKey: createIdempotencyKey('confirm-booking'),
    });
    const booking = response.data.data.booking;
    sessionStorage.removeItem(`reservation:${route.params.reservationId}`);
    router.push(`/booking/success/${booking.id}`);
  } catch (err) {
    error.value = getApiErrorMessage(err);
  } finally {
    confirming.value = false;
  }
}
</script>
