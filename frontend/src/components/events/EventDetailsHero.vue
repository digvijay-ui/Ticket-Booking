<template>
  <article class="event-detail-enter event-detail-delay-1 overflow-hidden rounded-[28px] border border-white/10 bg-midnight-surface">
    <div class="grid lg:grid-cols-[minmax(320px,0.78fr)_minmax(0,1.22fr)]">
      <div
        class="event-poster relative min-h-[330px] overflow-hidden bg-midnight-ember sm:min-h-[420px] lg:min-h-[590px]"
        role="img"
        :aria-label="`Event artwork for ${event.title}`"
      >
        <img v-if="event.imageUrl && !imageFailed" :src="event.imageUrl" alt="" class="absolute inset-0 h-full w-full object-cover" @error="imageFailed = true" />
        <div class="poster-grid absolute inset-0 opacity-25" aria-hidden="true" />
        <div class="absolute inset-0 bg-midnight-ink/20" aria-hidden="true" />
        <div class="absolute inset-x-6 top-6 flex items-center justify-between gap-4">
          <span class="rounded-full border border-white/25 bg-midnight-ink/75 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-white">Live admission</span>
          <span class="text-right text-[9px] font-bold uppercase tracking-[0.18em] text-white/70">EB / {{ shortId }}</span>
        </div>
        <div class="absolute bottom-7 left-6 right-6 sm:bottom-9 sm:left-9 sm:right-9">
          <p class="text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/75">{{ category }}</p>
          <p class="mt-3 max-w-lg text-[clamp(2.6rem,7vw,5.8rem)] font-black leading-[0.88] tracking-[-0.07em] text-white">
            {{ event.title }}
          </p>
          <div class="mt-6 h-8 w-36 barcode-light" aria-hidden="true" />
        </div>
      </div>

      <div class="relative flex flex-col p-6 sm:p-9 lg:p-12">
        <span class="absolute -left-3 top-1/2 hidden h-6 w-6 -translate-y-1/2 rounded-full bg-midnight-ink lg:block" aria-hidden="true" />
        <div class="flex flex-wrap items-center gap-3">
          <span class="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.15em]" :class="statusClass">
            <Icon :icon="statusIcon" class="h-3.5 w-3.5" aria-hidden="true" />
            {{ event.status }}
          </span>
          <span class="text-xs font-bold" :class="event.availableSeats > 0 ? 'text-midnight-mint' : 'text-midnight-ember'">
            {{ availabilityLabel }}
          </span>
        </div>

        <div class="mt-8 lg:mt-auto">
          <p class="text-[10px] font-extrabold uppercase tracking-[0.19em] text-midnight-mint">One night. Your seat.</p>
          <h1 class="mt-4 max-w-3xl text-[clamp(3rem,6vw,6.6rem)] font-black leading-[0.88] tracking-[-0.065em] text-midnight-ivory">{{ event.title }}</h1>
          <p class="mt-6 max-w-2xl text-base font-medium leading-7 text-midnight-stone sm:text-lg">{{ event.description }}</p>
        </div>

        <div class="mt-9 border-t border-dashed border-white/15 pt-7 lg:mt-auto">
          <div class="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p class="text-[10px] font-extrabold uppercase tracking-[0.17em] text-midnight-stone">Tickets from</p>
              <p class="mt-1 text-3xl font-extrabold tracking-[-0.04em] text-midnight-ivory">{{ formatINR(event.seatPriceInPaise) }}</p>
            </div>
            <RouterLink
              v-if="!bookingUnavailable"
              :to="`/events/${event.id}/seats`"
              class="focus-midnight inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-midnight-ember px-6 text-sm font-extrabold text-white transition hover:brightness-110"
            >
              Select Seats
              <Icon icon="mdi:arrow-right" class="h-4 w-4" aria-hidden="true" />
            </RouterLink>
            <button v-else type="button" class="inline-flex min-h-12 cursor-not-allowed items-center justify-center gap-2 rounded-full border border-white/15 px-6 text-sm font-extrabold text-midnight-stone" disabled>
              <Icon icon="mdi:ticket-off-outline" class="h-4 w-4" aria-hidden="true" />
              Seat selection unavailable
            </button>
          </div>
          <p v-if="bookingUnavailable" class="mt-4 flex items-start gap-2 rounded-xl border border-midnight-ember/35 bg-midnight-ember/10 p-3 text-sm font-semibold leading-6 text-midnight-ivory" role="status">
            <Icon icon="mdi:alert-circle-outline" class="mt-0.5 h-5 w-5 shrink-0 text-midnight-ember" aria-hidden="true" />
            {{ unavailableReason }}
          </p>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { computed, ref } from 'vue';

import type { EventItem } from '@/services/apiTypes';
import { formatINR } from '@/utils/money';

const imageFailed = ref(false);

const props = defineProps<{
  event: EventItem;
  bookingUnavailable: boolean;
  unavailableReason: string;
}>();

const shortId = computed(() => props.event.id.slice(-6).toUpperCase());
const availabilityLabel = computed(() => {
  if (props.event.availableSeats <= 0) return 'No seats currently available';
  if (props.event.availableSeats <= Math.max(4, Math.ceil(props.event.totalSeats * 0.2))) {
    return `Only ${props.event.availableSeats} seats left`;
  }
  return `${props.event.availableSeats} seats available`;
});
const statusClass = computed(() => {
  if (props.event.status === 'PUBLISHED') return 'border-midnight-mint/50 bg-midnight-mint/10 text-midnight-mint';
  if (props.event.status === 'CANCELLED') return 'border-midnight-ember/50 bg-midnight-ember/10 text-midnight-ember';
  return 'border-white/20 bg-white/[0.04] text-midnight-ivory';
});
const statusIcon = computed(() => props.event.status === 'PUBLISHED'
  ? 'mdi:check-circle-outline'
  : props.event.status === 'CANCELLED'
    ? 'mdi:close-octagon-outline'
    : 'mdi:information-outline');
const category = computed(() => {
  const text = `${props.event.title} ${props.event.description}`.toLowerCase();
  if (text.includes('comedy') || text.includes('laugh')) return 'Comedy';
  if (text.includes('music') || text.includes('concert') || text.includes('live')) return 'Music';
  if (text.includes('food') || text.includes('dining')) return 'Food';
  if (text.includes('theatre') || text.includes('play')) return 'Theatre';
  return 'Live event';
});
</script>

<style scoped>
.event-poster { isolation: isolate; }
.event-poster::before { position: absolute; right: 8%; top: 13%; width: 45%; aspect-ratio: 1; content: ''; border: 1px solid rgb(255 255 255 / .42); border-radius: 999px; }
.event-poster::after { position: absolute; bottom: -28%; left: -12%; width: 82%; aspect-ratio: 1; content: ''; border-radius: 999px; background: rgb(9 9 11 / .44); }
.event-poster > * { z-index: 1; }
.poster-grid { background-image: linear-gradient(rgb(255 255 255 / .16) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / .16) 1px, transparent 1px); background-size: 34px 34px; }
.barcode-light { background: repeating-linear-gradient(90deg, rgb(255 255 255 / .85) 0 2px, transparent 2px 5px, rgb(255 255 255 / .85) 5px 7px, transparent 7px 11px); }
</style>
