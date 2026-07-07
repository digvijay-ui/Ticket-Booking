<template>
  <div class="space-y-4">
    <SeatLegend />
    <div class="rounded-md border-2 border-paperCream/20 bg-deepPlum/70 p-4">
      <div class="mb-5 rounded-sm border border-ticketGold/60 py-2 text-center font-mono text-xs uppercase text-ticketGold">
        Stage / Screen
      </div>
      <div v-if="props.seats.length" class="grid grid-cols-5 gap-3 sm:grid-cols-8">
        <SeatButton
          v-for="seat in props.seats"
          :key="seat.id"
          :seat-id="seat.id"
          :seat-number="seat.seatNumber"
          :status="seat.status"
          :selected="props.modelValue.includes(seat.id)"
          @toggle="toggleSeat(seat.id, seat.status)"
        />
      </div>
      <div v-else class="rounded-sm border border-paperCream/15 p-6 text-center text-sm text-paperCream/65">
        No seats have been created for this event yet.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Seat } from '@/services/apiTypes';

import SeatButton from './SeatButton.vue';
import SeatLegend from './SeatLegend.vue';

type SeatStatus = 'AVAILABLE' | 'RESERVED' | 'BOOKED';

const props = defineProps<{
  seats: Seat[];
  modelValue: string[];
}>();

const emit = defineEmits<{
  'update:modelValue': [seatIds: string[]];
}>();

function toggleSeat(seatId: string, status: SeatStatus) {
  if (status !== 'AVAILABLE') {
    return;
  }

  emit(
    'update:modelValue',
    props.modelValue.includes(seatId) ? props.modelValue.filter((seat) => seat !== seatId) : [...props.modelValue, seatId],
  );
}
</script>
