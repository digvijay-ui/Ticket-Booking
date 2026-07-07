<template>
  <div class="space-y-6 text-white">
    <div>
      <p class="text-sm font-semibold text-white/55">Reservation counter</p>
      <h1 class="text-4xl font-black sm:text-5xl">Select your seats</h1>
      <p class="max-w-2xl text-white/70">
        {{ event ? event.title : 'Choose available seats and reserve them for checkout.' }}
      </p>
    </div>

    <div v-if="loading" class="flex min-h-72 items-center justify-center rounded-2xl bg-white/[0.04]">
      <LoadingSpinner size="lg" />
    </div>

    <div v-else-if="error" class="rounded-xl border border-marqueeRed/50 bg-marqueeRed/10 p-5 text-sm font-semibold">
      {{ error }}
    </div>

    <section v-else class="grid gap-5 lg:grid-cols-[1fr_340px]">
      <div class="rounded-2xl bg-white/[0.04] p-5">
        <SeatGrid v-model="selectedSeatIds" :seats="seats" />
      </div>

      <aside class="h-fit rounded-2xl bg-white p-5 text-black">
        <p class="text-sm font-bold text-black/55">Selected seats</p>
        <p class="mt-1 text-2xl font-black">{{ selectedSeatsLabel || 'None yet' }}</p>
        <div class="my-5 h-px bg-black/10" />
        <div class="flex items-center justify-between text-sm font-bold">
          <span>Total</span>
          <span>{{ formatINR(totalAmountInPaise) }}</span>
        </div>
        <p v-if="reserveError" class="mt-4 rounded-sm bg-marqueeRed/10 px-3 py-2 text-sm font-semibold text-marqueeRed">
          {{ reserveError }}
        </p>
        <AppButton class="mt-5 w-full" icon="mdi:cart-check" :loading="reserving" :disabled="!selectedSeatIds.length" @click="reserve">
          {{ reserving ? 'Please wait...' : 'Reserve seats' }}
        </AppButton>
      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import AppButton from '@/components/common/AppButton.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import SeatGrid from '@/components/seats/SeatGrid.vue';
import type { EventItem, Seat } from '@/services/apiTypes';
import { getApiErrorMessage } from '@/utils/apiError';
import { formatINR } from '@/utils/money';
import { reserveSeats } from './booking.api';
import { getEvent, getEventSeats } from '@/modules/events/event.api';

const route = useRoute();
const router = useRouter();
const event = ref<EventItem | null>(null);
const seats = ref<Seat[]>([]);
const selectedSeatIds = ref<string[]>([]);
const loading = ref(true);
const reserving = ref(false);
const error = ref('');
const reserveError = ref('');

const selectedSeats = computed(() => seats.value.filter((seat) => selectedSeatIds.value.includes(seat.id)));
const selectedSeatsLabel = computed(() => selectedSeats.value.map((seat) => seat.seatNumber).join(', '));
const totalAmountInPaise = computed(() => selectedSeats.value.reduce((total, seat) => total + seat.priceInPaise, 0));

async function loadSeatSelection() {
  loading.value = true;
  error.value = '';

  try {
    const eventId = String(route.params.eventId);
    const [eventResponse, seatsResponse] = await Promise.all([getEvent(eventId), getEventSeats(eventId)]);
    event.value = eventResponse.data.data.event;
    seats.value = seatsResponse.data.data.seats;
  } catch (err) {
    error.value = getApiErrorMessage(err);
  } finally {
    loading.value = false;
  }
}

async function reserve() {
  reserveError.value = '';

  if (!selectedSeatIds.value.length) {
    reserveError.value = 'Select at least one available seat';
    return;
  }

  reserving.value = true;

  try {
    const response = await reserveSeats({
      eventId: String(route.params.eventId),
      seatIds: selectedSeatIds.value,
    });
    const reservation = response.data.data.reservation;

    sessionStorage.setItem(
      `reservation:${reservation.id}`,
      JSON.stringify({
        reservation,
        event: event.value,
        seats: selectedSeats.value,
      }),
    );

    router.push(`/booking/checkout/${reservation.id}`);
  } catch (err) {
    reserveError.value = getApiErrorMessage(err);
    await loadSeatSelection();
  } finally {
    reserving.value = false;
  }
}

onMounted(loadSeatSelection);
</script>
