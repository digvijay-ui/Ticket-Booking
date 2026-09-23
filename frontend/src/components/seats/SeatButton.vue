<template>
  <button
    type="button"
    class="seat-button focus-midnight group relative flex h-14 min-w-14 flex-col items-center justify-center rounded-xl border px-2 text-xs font-extrabold transition duration-150 sm:h-[60px] sm:min-w-[60px]"
    :class="seatClass"
    :aria-disabled="disabled"
    :aria-pressed="canSelect ? selected : undefined"
    :aria-label="accessibleLabel"
    @click="handleToggle"
  >
    <Icon :icon="stateIcon" class="mb-0.5 h-3.5 w-3.5" aria-hidden="true" />
    <span>{{ seat.seatNumber }}</span>
    <span v-if="uiStatus === 'AVAILABLE' && !selected" class="mt-0.5 text-[9px] font-bold opacity-75">
      {{ compactPrice }}
    </span>
    <span v-else class="mt-0.5 text-[8px] font-extrabold uppercase tracking-[0.08em]">
      {{ selected ? 'Selected' : visibleStatus }}
    </span>
  </button>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { computed } from 'vue';

import type { Seat } from '@/services/apiTypes';
import { formatINR } from '@/utils/money';
import { seatStatusLabel, type SeatUiStatus } from './seatUi';

const props = withDefaults(
  defineProps<{
    seat: Seat;
    selected?: boolean;
    uiStatus?: SeatUiStatus;
    eventUnavailable?: boolean;
  }>(),
  {
    selected: false,
    uiStatus: undefined,
    eventUnavailable: false,
  },
);

const emit = defineEmits<{
  'toggle-seat': [seatId: string];
}>();

const resolvedStatus = computed<SeatUiStatus>(() => props.uiStatus ?? props.seat.status);
const uiStatus = computed(() => resolvedStatus.value);
const canSelect = computed(() => resolvedStatus.value === 'AVAILABLE' && !props.eventUnavailable);
const disabled = computed(() => !canSelect.value);
const compactPrice = computed(() => formatINR(props.seat.priceInPaise).replace(/\.00$/, ''));
const visibleStatus = computed(() => {
  if (resolvedStatus.value === 'TEMPORARILY_UNAVAILABLE') return 'Just taken';
  return seatStatusLabel(resolvedStatus.value);
});
const accessibleLabel = computed(() => {
  const state = props.selected ? 'selected' : seatStatusLabel(resolvedStatus.value);
  const unavailableSuffix = props.eventUnavailable && resolvedStatus.value === 'AVAILABLE'
    ? ', event booking unavailable'
    : '';
  return `Seat ${props.seat.seatNumber}, ${state}, ${formatINR(props.seat.priceInPaise)}${unavailableSuffix}`;
});
function handleToggle() {
  if (!disabled.value) emit('toggle-seat', props.seat.id);
}

const stateIcon = computed(() => {
  if (props.selected) return 'mdi:check-bold';
  const icons: Record<SeatUiStatus, string> = {
    AVAILABLE: 'mdi:seat-outline',
    RESERVED: 'mdi:timer-sand',
    BOOKED: 'mdi:close',
    TEMPORARILY_UNAVAILABLE: 'mdi:alert-outline',
  };
  return icons[resolvedStatus.value];
});
const seatClass = computed(() => {
  if (props.selected) {
    return 'is-selected border-midnight-mint bg-midnight-mint text-midnight-ink shadow-[0_0_0_3px_rgb(120_220_202_/_0.14)]';
  }

  const classes: Record<SeatUiStatus, string> = {
    AVAILABLE: 'border-midnight-mint/65 bg-midnight-mint/[0.06] text-midnight-mint hover:border-midnight-mint hover:bg-midnight-mint hover:text-midnight-ink',
    RESERVED: 'cursor-not-allowed border-dashed border-midnight-stone/50 bg-white/[0.03] text-midnight-stone',
    BOOKED: 'cursor-not-allowed border-midnight-ember/55 bg-midnight-ember/15 text-midnight-ember',
    TEMPORARILY_UNAVAILABLE: 'cursor-not-allowed border-double border-midnight-ivory/30 bg-white/[0.07] text-midnight-ivory/60',
  };

  return classes[resolvedStatus.value];
});
</script>

<style scoped>
.seat-button:active:not([aria-disabled="true"]) { transform: scale(.94); }
.seat-button.is-selected { animation: seat-select 180ms cubic-bezier(.2,.8,.2,1); }
@keyframes seat-select { 50% { transform: scale(.92); } }
@media (prefers-reduced-motion: reduce) {
  .seat-button { transition: none; }
  .seat-button:active:not([aria-disabled="true"]) { transform: none; }
  .seat-button.is-selected { animation: none; }
}
</style>
