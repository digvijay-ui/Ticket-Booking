<template>
  <div class="space-y-4">
    <div class="rounded-md border-2 border-paperCream/20 bg-deepPlum/70 p-4">
      <div class="mb-5 rounded-sm border border-ticketGold/60 py-2 text-center font-mono text-xs uppercase text-ticketGold">
        Stage / Screen
      </div>

      <div v-if="groupedRows.length" class="space-y-4">
        <div v-for="row in groupedRows" :key="row.row" class="flex items-center gap-3">
          <span class="w-6 shrink-0 font-mono text-xs font-bold uppercase text-ticketGold">{{ row.row }}</span>
          <div class="flex flex-wrap gap-2">
            <SeatButton
              v-for="seat in row.seats"
              :key="seat.id"
              :seat="seat"
              :selected="props.selectedSeatIds.includes(seat.id)"
              @toggle-seat="toggleSeat"
            />
          </div>
        </div>
      </div>

      <div v-else class="rounded-sm border border-paperCream/15 p-6 text-center text-sm text-paperCream/65">
        No seats have been created for this event yet.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import type { Seat } from '@/services/apiTypes';

import SeatButton from './SeatButton.vue';

const props = defineProps<{
  seats: Seat[];
  selectedSeatIds: string[];
}>();

const emit = defineEmits<{
  'toggle-seat': [seat: Seat];
}>();

const groupedRows = computed(() => {
  const rows = props.seats.reduce<Record<string, Seat[]>>((acc, seat) => {
    acc[seat.row] = acc[seat.row] || [];
    acc[seat.row].push(seat);
    return acc;
  }, {});

  return Object.entries(rows)
    .sort(([firstRow], [secondRow]) => firstRow.localeCompare(secondRow, undefined, { numeric: true }))
    .map(([row, seats]) => ({
      row,
      seats: seats.sort((firstSeat, secondSeat) =>
        firstSeat.seatNumber.localeCompare(secondSeat.seatNumber, undefined, { numeric: true }),
      ),
    }));
});

function toggleSeat(seatId: string) {
  const seat = props.seats.find((candidate) => candidate.id === seatId);

  if (!seat || seat.status !== 'AVAILABLE') {
    return;
  }

  emit('toggle-seat', seat);
}
</script>
