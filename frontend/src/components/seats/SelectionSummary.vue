<template>
  <aside class="hidden lg:block" aria-label="Booking summary">
    <div class="sticky top-24 rounded-[24px] border border-white/10 bg-midnight-surface p-6 shadow-[0_22px_50px_rgb(0_0_0_/_0.25)]">
      <SummaryContent />
    </div>
  </aside>

  <div class="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-midnight-surface/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-14px_40px_rgb(0_0_0_/_0.35)] backdrop-blur lg:hidden">
    <div class="mx-auto flex max-w-2xl items-center gap-3">
      <button type="button" class="focus-midnight min-w-0 flex-1 rounded-lg text-left" :aria-expanded="mobileOpen" aria-controls="mobile-booking-summary" @click="mobileOpen = !mobileOpen">
        <p class="truncate text-[10px] font-extrabold uppercase tracking-[0.14em] text-midnight-stone">{{ selectedSeatsLabel || 'No seats selected' }}</p>
        <p class="mt-0.5 text-lg font-extrabold text-midnight-ivory">{{ formatINR(totalAmountInPaise) }} <span class="text-xs text-midnight-stone">· {{ selectedSeats.length }} {{ selectedSeats.length === 1 ? 'seat' : 'seats' }}</span></p>
      </button>
      <AppButton variant="midnight" :loading="reserving" :disabled="reserveDisabled" class="shrink-0 rounded-full px-5" @click="$emit('reserve')">
        {{ reserving ? 'Holding…' : 'Reserve' }}
      </AppButton>
      <button type="button" class="focus-midnight grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/15 text-midnight-ivory" :aria-label="mobileOpen ? 'Close booking summary' : 'Open booking summary'" @click="mobileOpen = !mobileOpen">
        <Icon :icon="mobileOpen ? 'mdi:chevron-down' : 'mdi:chevron-up'" class="h-5 w-5" aria-hidden="true" />
      </button>
    </div>

    <Transition name="summary-panel">
      <div v-if="mobileOpen" id="mobile-booking-summary" class="mx-auto max-h-[65vh] max-w-2xl overflow-y-auto pt-5">
        <SummaryContent />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { computed, defineComponent, h, ref } from 'vue';

import AppButton from '@/components/common/AppButton.vue';
import type { Seat } from '@/services/apiTypes';
import { formatINR } from '@/utils/money';

const props = defineProps<{
  eventName: string;
  selectedSeats: Seat[];
  totalAmountInPaise: number;
  reserving: boolean;
  reserveDisabled: boolean;
  feedbackMessage?: string;
  unavailableReason?: string;
}>();

const emit = defineEmits<{
  reserve: [];
  reset: [];
}>();

const mobileOpen = ref(false);
const selectedSeatsLabel = computed(() => props.selectedSeats.map((seat) => seat.seatNumber).join(', '));
const priceLabel = computed(() => {
  const uniquePrices = [...new Set(props.selectedSeats.map((seat) => seat.priceInPaise))];
  if (!uniquePrices.length) return formatINR(0);
  return uniquePrices.length === 1 ? formatINR(uniquePrices[0]) : 'Varies by seat';
});

const SummaryContent = defineComponent({
  setup() {
    return () => h('div', { class: 'text-midnight-ivory' }, [
      h('div', { class: 'flex items-start justify-between gap-4' }, [
        h('div', { class: 'min-w-0' }, [
          h('p', { class: 'text-[9px] font-extrabold uppercase tracking-[0.17em] text-midnight-mint' }, 'Booking summary'),
          h('h2', { class: 'mt-2 truncate text-xl font-extrabold tracking-[-0.03em]' }, props.eventName),
        ]),
        props.selectedSeats.length
          ? h('button', {
            type: 'button',
            class: 'focus-midnight shrink-0 text-xs font-bold text-midnight-stone underline decoration-dashed underline-offset-4 hover:text-midnight-ivory',
            onClick: () => emit('reset'),
          }, 'Reset')
          : null,
      ]),
      h('div', { class: 'my-5 border-t border-dashed border-white/15' }),
      h('div', { class: 'min-h-16' }, [
        h('p', { class: 'text-[9px] font-extrabold uppercase tracking-[0.16em] text-midnight-stone' }, 'Selected seats'),
        props.selectedSeats.length
          ? h('div', { class: 'mt-3 flex flex-wrap gap-2' }, props.selectedSeats.map((seat) =>
            h('span', { class: 'rounded-lg border border-midnight-mint/35 bg-midnight-mint/10 px-2.5 py-1 text-xs font-extrabold text-midnight-mint' }, seat.seatNumber)))
          : h('p', { class: 'mt-2 text-sm font-semibold text-midnight-stone' }, 'Choose an available seat from the map.'),
      ]),
      h('dl', { class: 'mt-5 space-y-3 border-t border-white/10 pt-5 text-sm' }, [
        h('div', { class: 'flex justify-between gap-4' }, [h('dt', { class: 'text-midnight-stone' }, 'Number of seats'), h('dd', { class: 'font-extrabold' }, String(props.selectedSeats.length))]),
        h('div', { class: 'flex justify-between gap-4' }, [h('dt', { class: 'text-midnight-stone' }, 'Price per seat'), h('dd', { class: 'text-right font-extrabold' }, priceLabel.value)]),
        h('div', { class: 'flex justify-between gap-4' }, [h('dt', { class: 'text-midnight-stone' }, 'Reservation duration'), h('dd', { class: 'font-extrabold' }, '5 minutes')]),
        h('div', { class: 'flex items-end justify-between gap-4 border-t border-white/10 pt-4' }, [h('dt', { class: 'font-bold' }, 'Total'), h('dd', { class: 'text-3xl font-black tracking-[-0.04em]' }, formatINR(props.totalAmountInPaise))]),
      ]),
      props.unavailableReason
        ? h('p', { class: 'mt-4 flex gap-2 rounded-xl border border-midnight-ember/35 bg-midnight-ember/10 p-3 text-xs font-semibold leading-5', role: 'status' }, [
          h(Icon, { icon: 'mdi:alert-circle-outline', class: 'mt-0.5 h-4 w-4 shrink-0 text-midnight-ember', 'aria-hidden': 'true' }),
          props.unavailableReason,
        ])
        : null,
      props.feedbackMessage
        ? h('p', { class: 'mt-4 rounded-xl border border-midnight-ember/35 bg-midnight-ember/10 p-3 text-xs font-semibold leading-5', role: 'alert' }, props.feedbackMessage)
        : null,
      h(AppButton, {
        class: 'mt-5 w-full rounded-full',
        variant: 'midnight',
        loading: props.reserving,
        disabled: props.reserveDisabled,
        onClick: () => emit('reserve'),
      }, () => props.reserving ? 'Reserving seats…' : 'Reserve Seats'),
      h('p', { class: 'mt-3 text-center text-[10px] font-semibold leading-4 text-midnight-stone' }, 'Seats are held only after the reservation is confirmed. Your five-minute timer starts from the server confirmation time.'),
    ]);
  },
});
</script>

<style scoped>
.summary-panel-enter-active, .summary-panel-leave-active { transition: opacity 180ms ease, transform 180ms ease; }
.summary-panel-enter-from, .summary-panel-leave-to { opacity: 0; transform: translateY(10px); }
@media (prefers-reduced-motion: reduce) { .summary-panel-enter-active, .summary-panel-leave-active { transition: none; } }
</style>
