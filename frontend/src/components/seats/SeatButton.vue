<template>
  <button
    type="button"
    class="focus-ticket relative flex h-14 min-w-14 flex-col items-center justify-center overflow-hidden rounded-sm border-2 px-2 font-mono text-xs font-bold uppercase transition"
    :class="seatClass"
    :disabled="seat.status !== 'AVAILABLE'"
    :aria-pressed="selected"
    :aria-label="`${seat.seatNumber}, ${statusLabel}${selected ? ', selected' : ''}`"
    @click="$emit('toggle-seat', seat.id)"
  >
    <span>{{ seat.seatNumber }}</span>
    <span v-if="seat.status === 'AVAILABLE' && !selected" class="mt-0.5 text-[10px] normal-case opacity-70">
      {{ formatINR(seat.priceInPaise) }}
    </span>
    <span
      v-if="seat.status === 'BOOKED'"
      class="absolute left-1/2 top-1/2 w-16 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-paperCream px-1 text-[9px] text-marqueeRed"
    >
      Booked
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import type { Seat } from '@/services/apiTypes';
import { formatINR } from '@/utils/money';

const props = withDefaults(
  defineProps<{
    seat: Seat;
    selected?: boolean;
  }>(),
  {
    selected: false,
  },
);

defineEmits<{
  'toggle-seat': [seatId: string];
}>();

const statusLabel = computed(() => {
  const labels: Record<Seat['status'], string> = {
    AVAILABLE: 'available',
    RESERVED: 'reserved',
    BOOKED: 'booked',
  };

  return labels[props.seat.status];
});

const seatClass = computed(() => {
  if (props.selected) {
    return 'border-ticketGold bg-ticketGold text-stubCharcoal shadow-[0_0_0_3px_rgba(255,201,74,0.35)]';
  }

  const classes: Record<Seat['status'], string> = {
    AVAILABLE: 'border-electricTeal bg-transparent text-electricTeal hover:bg-electricTeal hover:text-inkNight',
    RESERVED: 'cursor-not-allowed border-dashed border-ticketGold bg-transparent text-ticketGold opacity-85',
    BOOKED: 'cursor-not-allowed border-marqueeRed bg-marqueeRed text-paperCream opacity-85',
  };

  return classes[props.seat.status];
});
</script>
