<template>
  <div class="flex min-w-max items-center gap-3" role="group" :aria-label="`Row ${row}`">
    <span class="sticky left-0 z-10 grid h-10 w-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-midnight-ink text-xs font-extrabold text-midnight-stone shadow-[8px_0_12px_rgb(9_9_11_/_0.8)]" aria-hidden="true">{{ row }}</span>
    <div class="flex flex-nowrap gap-2.5">
      <SeatButton
        v-for="seat in seats"
        :key="seat.id"
        :seat="seat"
        :selected="selectedSeatIds.includes(seat.id)"
        :ui-status="temporarilyUnavailableSeatIds.includes(seat.id) ? 'TEMPORARILY_UNAVAILABLE' : seat.status"
        :event-unavailable="eventUnavailable"
        @toggle-seat="onToggle"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Seat } from '@/services/apiTypes';
import SeatButton from './SeatButton.vue';

defineProps<{
  row: string;
  seats: Seat[];
  selectedSeatIds: string[];
  temporarilyUnavailableSeatIds: string[];
  eventUnavailable: boolean;
}>();

const emit = defineEmits<{ 'toggle-seat': [seatId: string] }>();
function onToggle(seatId: string) {
  emit('toggle-seat', seatId);
}
</script>
