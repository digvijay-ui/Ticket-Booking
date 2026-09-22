<template>
  <article class="event-card group relative flex h-full min-w-0 flex-col overflow-hidden rounded-[20px] border border-white/10 bg-midnight-surface">
    <RouterLink :to="`/events/${event.id}`" class="card-link focus-midnight absolute inset-0 z-10 rounded-[20px]" :aria-label="`View details for ${event.title}`"><span class="sr-only">View event details</span></RouterLink>

    <div class="poster relative aspect-[16/10] overflow-hidden" :class="posterClass" role="img" :aria-label="`Graphic poster for ${event.title}`">
      <div class="poster-grid absolute inset-0 opacity-25" aria-hidden="true" />
      <div class="absolute inset-0 bg-midnight-ink/25" aria-hidden="true" />
      <div class="absolute left-4 top-4 flex items-center gap-2">
        <span class="rounded-full border border-white/20 bg-midnight-ink/75 px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.15em] text-white">{{ category }}</span>
        <span class="rounded-full px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.15em]" :class="statusClass">{{ event.status }}</span>
      </div>
      <div class="absolute bottom-5 left-5 right-5">
        <p class="max-w-[85%] text-[clamp(1.7rem,3vw,2.35rem)] font-extrabold leading-[0.92] tracking-[-0.05em] text-white">{{ event.title }}</p>
      </div>
      <span class="card-arrow absolute bottom-5 right-5 grid h-10 w-10 translate-y-2 place-items-center rounded-full bg-midnight-ivory text-midnight-ink opacity-0 transition duration-200 group-hover:translate-y-0 group-hover:opacity-100" aria-hidden="true"><Icon icon="mdi:arrow-up-right" class="h-5 w-5" /></span>
    </div>

    <div class="flex flex-1 flex-col p-5">
      <div class="flex gap-4">
        <div class="w-14 shrink-0 border-r border-dashed border-white/15 pr-4 text-center">
          <p class="text-[10px] font-extrabold uppercase tracking-[0.16em] text-midnight-ember">{{ month }}</p>
          <p class="mt-1 text-2xl font-extrabold leading-none text-midnight-ivory">{{ day }}</p>
        </div>
        <div class="min-w-0 flex-1">
          <h2 class="line-clamp-2 min-h-[48px] text-[17px] font-extrabold leading-6 tracking-[-0.025em] text-midnight-ivory">{{ event.title }}</h2>
          <p class="mt-2 flex min-w-0 items-center gap-1.5 text-xs font-medium text-midnight-stone"><Icon icon="mdi:map-marker-outline" class="h-4 w-4 shrink-0" aria-hidden="true" /><span class="truncate">{{ event.location }}</span></p>
          <p class="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-midnight-stone"><Icon icon="mdi:clock-outline" class="h-4 w-4 shrink-0" aria-hidden="true" />{{ time }}</p>
        </div>
      </div>

      <div class="mt-5 border-t border-white/10 pt-4">
        <div class="flex items-end justify-between gap-3">
          <div class="min-w-0"><p class="text-[9px] font-extrabold uppercase tracking-[0.14em] text-midnight-stone">Starts at</p><p class="mt-1 truncate text-base font-extrabold text-midnight-ivory">{{ formatINR(event.seatPriceInPaise) }}</p></div>
          <p class="shrink-0 text-xs font-bold" :class="availabilityClass">{{ availabilityLabel }}</p>
        </div>
        <div class="mt-3 h-1 overflow-hidden rounded-full bg-white/10" aria-hidden="true"><span class="block h-full rounded-full bg-midnight-mint" :style="{ width: `${availabilityPercent}%` }" /></div>
      </div>

      <div class="relative z-20 mt-5 flex items-center justify-between gap-3 border-t border-dashed border-white/10 pt-4">
        <span class="inline-flex items-center gap-2 text-[9px] font-extrabold uppercase tracking-[0.15em] text-midnight-stone"><span class="mini-barcode h-5 w-10" aria-hidden="true" /> Admit one</span>
        <RouterLink :to="`/events/${event.id}/seats`" class="focus-midnight inline-flex min-h-10 items-center gap-1.5 rounded-full border border-white/15 px-4 text-xs font-extrabold text-midnight-ivory transition hover:border-midnight-mint/50 hover:text-midnight-mint">Select seats <Icon icon="mdi:arrow-right" class="h-3.5 w-3.5" aria-hidden="true" /></RouterLink>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { computed } from 'vue';

import type { EventItem } from '@/services/apiTypes';
import { formatINR } from '@/utils/money';

const props = defineProps<{ event: EventItem; index: number }>();
const eventDate = computed(() => new Date(props.event.startDate));
const month = computed(() => new Intl.DateTimeFormat('en-IN', { month: 'short' }).format(eventDate.value).toUpperCase());
const day = computed(() => new Intl.DateTimeFormat('en-IN', { day: '2-digit' }).format(eventDate.value));
const time = computed(() => new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit' }).format(eventDate.value));
const availabilityPercent = computed(() => props.event.totalSeats > 0 ? Math.max(0, Math.min(100, (props.event.availableSeats / props.event.totalSeats) * 100)) : 0);
const availabilityLabel = computed(() => {
  if (props.event.availableSeats === 0) return 'Sold out';
  if (availabilityPercent.value <= 20) return 'Selling fast';
  return `${props.event.availableSeats} left`;
});
const availabilityClass = computed(() => props.event.availableSeats === 0 || availabilityPercent.value <= 20 ? 'text-midnight-ember' : 'text-midnight-mint');
const statusClass = computed(() => props.event.status === 'PUBLISHED' ? 'bg-midnight-mint text-midnight-ink' : props.event.status === 'CANCELLED' ? 'bg-midnight-ember text-white' : 'bg-midnight-ivory text-midnight-ink');
const category = computed(() => {
  const text = `${props.event.title} ${props.event.description}`.toLowerCase();
  if (text.includes('comedy') || text.includes('laugh')) return 'Comedy';
  if (text.includes('music') || text.includes('concert') || text.includes('live')) return 'Music';
  if (text.includes('food') || text.includes('dining')) return 'Food';
  if (text.includes('theatre') || text.includes('play')) return 'Theatre';
  return 'Live event';
});
const posterClass = computed(() => ['bg-midnight-ember', 'bg-midnight-mint', 'bg-midnight-stone'][props.index % 3]);
</script>

<style scoped>
.event-card { transition: transform 220ms cubic-bezier(.2,.8,.2,1), border-color 220ms ease, box-shadow 220ms ease; }
.event-card:hover { transform: translateY(-4px); border-color: rgb(247 243 236 / .25); box-shadow: 0 22px 46px rgb(0 0 0 / .25); }
.poster { isolation: isolate; }
.poster::before { position: absolute; z-index: 1; top: 13%; right: 8%; width: 38%; aspect-ratio: 1; content: ''; border: 1px solid rgb(247 243 236 / .42); border-radius: 999px; transition: transform 320ms cubic-bezier(.2,.8,.2,1); }
.poster::after { position: absolute; bottom: -45%; left: -10%; width: 80%; aspect-ratio: 1; content: ''; border-radius: 999px; background: rgb(9 9 11 / .5); transition: transform 320ms cubic-bezier(.2,.8,.2,1); }
.poster > * { z-index: 2; }
.poster-grid { background-image: linear-gradient(rgb(247 243 236 / .18) 1px, transparent 1px), linear-gradient(90deg, rgb(247 243 236 / .18) 1px, transparent 1px); background-size: 30px 30px; transition: transform 320ms cubic-bezier(.2,.8,.2,1); }
.event-card:hover .poster-grid, .event-card:hover .poster::before, .event-card:hover .poster::after { transform: scale(1.035); }
.mini-barcode { background: repeating-linear-gradient(90deg, currentColor 0 1px, transparent 1px 3px, currentColor 3px 5px, transparent 5px 8px); }
.card-link:focus-visible { outline-offset: -4px; }
@media (prefers-reduced-motion: reduce) { .event-card, .card-arrow, .poster, .poster-grid, .poster::before, .poster::after { transition: none; } .event-card:hover, .event-card:hover .poster-grid, .event-card:hover .poster::before, .event-card:hover .poster::after { transform: none; } }
</style>
