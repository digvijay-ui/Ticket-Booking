<template>
  <button
    type="button"
    class="focus-ticket relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-sm border-2 font-mono text-xs font-bold uppercase transition"
    :class="seatClass"
    :disabled="status !== 'AVAILABLE'"
    :aria-pressed="selected"
    :aria-label="`${seatNumber}, ${statusLabel}${selected ? ', selected' : ''}`"
    @click="$emit('toggle')"
  >
    <span>{{ seatNumber }}</span>
    <span
      v-if="status === 'BOOKED'"
      class="absolute left-1/2 top-1/2 w-16 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-paperCream px-1 text-[9px] text-marqueeRed"
    >
      Booked
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type SeatStatus = 'AVAILABLE' | 'RESERVED' | 'BOOKED';

const props = withDefaults(
  defineProps<{
    seatId?: string;
    seatNumber: string;
    status: SeatStatus;
    selected?: boolean;
  }>(),
  {
    seatId: undefined,
    selected: false,
  },
);

defineEmits<{
  toggle: [];
}>();

const statusLabel = computed(() => {
  const labels: Record<SeatStatus, string> = {
    AVAILABLE: 'available',
    RESERVED: 'reserved',
    BOOKED: 'booked',
  };

  return labels[props.status];
});

const seatClass = computed(() => {
  if (props.selected) {
    return 'border-ticketGold bg-paperCream text-stubCharcoal shadow-[0_0_0_3px_rgba(255,201,74,0.35)]';
  }

  const classes: Record<SeatStatus, string> = {
    AVAILABLE: 'border-electricTeal bg-transparent text-electricTeal hover:bg-electricTeal hover:text-inkNight',
    RESERVED: 'cursor-not-allowed border-dashed border-ticketGold bg-transparent text-ticketGold opacity-85',
    BOOKED: 'cursor-not-allowed border-marqueeRed bg-marqueeRed text-paperCream opacity-85',
  };

  return classes[props.status];
});
</script>
