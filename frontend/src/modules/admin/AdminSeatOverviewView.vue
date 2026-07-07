<template>
  <div class="space-y-6">
    <div>
      <p class="font-mono text-xs uppercase text-ticketGold">Seat map admin</p>
      <h1 class="font-display text-5xl leading-none text-paperCream">SEAT OVERVIEW</h1>
      <p class="text-sm text-paperCream/70">Backend seat map preview for event {{ route.params.eventId }}.</p>
    </div>

    <div v-if="loading" class="flex min-h-56 items-center justify-center rounded-md bg-deepPlum">
      <LoadingSpinner size="lg" />
    </div>
    <div v-else-if="error" class="rounded-md border border-marqueeRed bg-marqueeRed/10 p-4 text-sm font-semibold text-paperCream">
      {{ error }}
    </div>
    <TicketStubCard v-else title="Seat Inventory" subtitle="Read-only admin seat status view." status="available" :show-barcode="false">
      <SeatGrid :seats="seats" :selected-seat-ids="selectedSeatIds" @toggle-seat="toggleSeat" />
    </TicketStubCard>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import TicketStubCard from '@/components/common/TicketStubCard.vue';
import SeatGrid from '@/components/seats/SeatGrid.vue';
import type { Seat } from '@/services/apiTypes';
import { getApiErrorMessage } from '@/utils/apiError';
import { getAdminEventSeats } from './admin.api';

const route = useRoute();
const seats = ref<Seat[]>([]);
const selectedSeatIds = ref<string[]>([]);
const loading = ref(true);
const error = ref('');

function toggleSeat(seat: Seat) {
  selectedSeatIds.value = selectedSeatIds.value.includes(seat.id)
    ? selectedSeatIds.value.filter((seatId) => seatId !== seat.id)
    : [...selectedSeatIds.value, seat.id];
}

async function loadSeats() {
  loading.value = true;
  error.value = '';

  try {
    const response = await getAdminEventSeats(String(route.params.eventId));
    seats.value = response.data.data.seats;
  } catch (err) {
    error.value = getApiErrorMessage(err);
  } finally {
    loading.value = false;
  }
}

onMounted(loadSeats);
</script>
