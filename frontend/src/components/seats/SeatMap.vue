<template>
  <section class="seat-map overflow-hidden rounded-[24px] border border-white/10 bg-midnight-surface" aria-labelledby="seat-map-heading">
    <div class="border-b border-white/10 bg-midnight-surface px-5 py-4 sm:px-6">
      <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p class="text-[9px] font-extrabold uppercase tracking-[0.17em] text-midnight-mint">Interactive seating</p>
          <h2 id="seat-map-heading" class="mt-1 text-xl font-extrabold tracking-[-0.025em] text-midnight-ivory">Choose your seats</h2>
        </div>
        <SeatLegend />
      </div>
    </div>

    <div class="p-4 sm:p-6">
      <div class="mx-auto mb-10 max-w-2xl text-center" aria-label="Stage or screen is at the front">
        <div class="stage-line h-8 border-t-2 border-midnight-mint/70" aria-hidden="true" />
        <p class="-mt-4 text-[9px] font-extrabold uppercase tracking-[0.24em] text-midnight-stone">Stage / Screen</p>
        <p class="mt-1 text-[10px] font-semibold text-midnight-stone/70">All seats face this direction</p>
      </div>

      <div v-if="groupedRows.length" class="seat-scroll overflow-x-auto overscroll-x-contain pb-4" tabindex="0" aria-label="Seat map. Scroll horizontally to view more seats when needed.">
        <div class="mx-auto w-max min-w-full space-y-3 px-1">
          <SeatRow
            v-for="row in groupedRows"
            :key="row.row"
            :row="row.row"
            :seats="row.seats"
            :selected-seat-ids="selectedSeatIds"
            :temporarily-unavailable-seat-ids="temporarilyUnavailableSeatIds"
            :event-unavailable="eventUnavailable"
            @toggle-seat="toggleSeat"
          />
        </div>
      </div>

      <div v-else class="rounded-2xl border border-dashed border-white/15 px-6 py-14 text-center">
        <Icon icon="mdi:seat-outline" class="mx-auto h-8 w-8 text-midnight-stone" aria-hidden="true" />
        <h3 class="mt-4 text-xl font-extrabold text-midnight-ivory">No seats configured</h3>
        <p class="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-midnight-stone">The venue has not released a seat map for this event yet. Please check back later.</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { computed } from 'vue';

import type { Seat } from '@/services/apiTypes';
import SeatLegend from './SeatLegend.vue';
import SeatRow from './SeatRow.vue';

const props = withDefaults(defineProps<{
  seats: Seat[];
  selectedSeatIds: string[];
  temporarilyUnavailableSeatIds?: string[];
  eventUnavailable?: boolean;
}>(), {
  temporarilyUnavailableSeatIds: () => [],
  eventUnavailable: false,
});

const emit = defineEmits<{ 'toggle-seat': [seat: Seat] }>();
const groupedRows = computed(() => {
  const rows = props.seats.reduce<Record<string, Seat[]>>((result, seat) => {
    (result[seat.row] ??= []).push(seat);
    return result;
  }, {});

  return Object.entries(rows)
    .sort(([first], [second]) => first.localeCompare(second, undefined, { numeric: true }))
    .map(([row, seats]) => ({
      row,
      seats: [...seats].sort((first, second) => first.seatNumber.localeCompare(second.seatNumber, undefined, { numeric: true })),
    }));
});

function toggleSeat(seatId: string) {
  const seat = props.seats.find((candidate) => candidate.id === seatId);
  if (!seat || seat.status !== 'AVAILABLE' || props.eventUnavailable) return;
  emit('toggle-seat', seat);
}
</script>

<style scoped>
.seat-map { animation: seat-map-in 420ms cubic-bezier(.2,.8,.2,1) both; }
.stage-line { border-radius: 50% 50% 0 0 / 100% 100% 0 0; box-shadow: 0 -6px 18px rgb(120 220 202 / .08); }
.seat-scroll { scrollbar-color: rgb(120 220 202 / .45) rgb(255 255 255 / .06); scrollbar-width: thin; }
@keyframes seat-map-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
@media (prefers-reduced-motion: reduce) { .seat-map { animation: none; } }
</style>
