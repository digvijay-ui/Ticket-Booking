<template>
  <RouterLink :to="`/events/${event.id}`" class="focus-midnight event-card group flex h-full flex-col overflow-hidden rounded-[20px] border border-white/10 bg-midnight-surface">
    <div class="event-poster relative aspect-[4/3] overflow-hidden" :class="posterTone">
      <div class="poster-grid absolute inset-0 opacity-30" aria-hidden="true" />
      <div class="absolute left-5 top-5 flex items-center gap-2 rounded-full bg-midnight-ink/75 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-sm">
        <span class="h-1.5 w-1.5 rounded-full bg-midnight-mint" />{{ category }}
      </div>
      <p class="absolute bottom-4 left-5 right-5 line-clamp-2 text-[clamp(1.7rem,3vw,2.4rem)] font-black leading-[0.9] tracking-[-0.055em] text-white">{{ event.title }}</p>
      <span class="absolute bottom-5 right-5 grid h-10 w-10 translate-y-2 place-items-center rounded-full bg-midnight-ivory text-midnight-ink opacity-0 transition duration-200 group-hover:translate-y-0 group-hover:opacity-100" aria-hidden="true"><Icon icon="mdi:arrow-up-right" class="h-5 w-5" /></span>
    </div>

    <div class="flex flex-1 flex-col p-5">
      <div class="flex gap-4">
        <div class="w-12 shrink-0 border-r border-white/10 pr-4 text-center">
          <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-midnight-ember">{{ month }}</p>
          <p class="mt-1 text-2xl font-black leading-none text-midnight-ivory">{{ day }}</p>
        </div>
        <div class="min-w-0">
          <h3 class="line-clamp-2 text-lg font-bold leading-snug tracking-[-0.025em] text-midnight-ivory">{{ event.title }}</h3>
          <p class="mt-1 flex items-center gap-1.5 truncate text-xs text-midnight-stone"><Icon icon="mdi:map-marker-outline" class="h-4 w-4 shrink-0" aria-hidden="true" />{{ event.location }}</p>
        </div>
      </div>

      <div class="mt-5 border-t border-white/10 pt-4">
        <div class="flex items-end justify-between gap-3">
          <div><p class="text-[10px] font-bold uppercase tracking-[0.13em] text-midnight-stone">Starts at</p><p class="mt-1 font-bold text-midnight-ivory">{{ formatINR(event.seatPriceInPaise) }}</p></div>
          <p class="text-xs font-semibold" :class="availabilityClass">{{ availabilityLabel }}</p>
        </div>
        <div class="mt-3 h-1 overflow-hidden rounded-full bg-white/10" aria-hidden="true"><span class="block h-full rounded-full bg-midnight-mint" :style="{ width: `${availabilityPercent}%` }" /></div>
      </div>
    </div>
  </RouterLink>
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
const availabilityPercent = computed(() => props.event.totalSeats > 0 ? Math.max(0, Math.min(100, (props.event.availableSeats / props.event.totalSeats) * 100)) : 0);
const availabilityLabel = computed(() => {
  if (props.event.availableSeats === 0) return 'Sold out';
  if (availabilityPercent.value <= 20) return 'Selling fast';
  return `${props.event.availableSeats} seats left`;
});
const availabilityClass = computed(() => props.event.availableSeats === 0 || availabilityPercent.value <= 20 ? 'text-midnight-ember' : 'text-midnight-mint');
const category = computed(() => {
  const text = `${props.event.title} ${props.event.description}`.toLowerCase();
  if (text.includes('comedy') || text.includes('laugh')) return 'Comedy';
  if (text.includes('music') || text.includes('concert') || text.includes('live')) return 'Music';
  if (text.includes('food') || text.includes('dining')) return 'Food';
  if (text.includes('theatre') || text.includes('play')) return 'Theatre';
  return 'Live event';
});
const posterTone = computed(() => ['poster-ember', 'poster-mint', 'poster-violet'][props.index % 3]);
</script>

<style scoped>
.event-card { transition: transform 220ms cubic-bezier(.2,.8,.2,1), border-color 220ms ease, box-shadow 220ms ease; }
.event-card:hover { transform: translateY(-5px); border-color: rgb(247 243 236 / .22); box-shadow: 0 22px 46px rgb(0 0 0 / .28); }
.poster-ember { background: #a83c28; }
.poster-mint { background: #1d6258; }
.poster-violet { background: #534061; }
.event-poster::before { position: absolute; inset: 10% 8% auto auto; width: 42%; aspect-ratio: 1; content: ''; border: 1px solid rgb(247 243 236 / .34); border-radius: 999px; }
.event-poster::after { position: absolute; inset: auto auto -20% -8%; width: 68%; aspect-ratio: 1; content: ''; border-radius: 999px; background: rgb(9 9 11 / .3); }
.poster-grid { background-image: linear-gradient(rgb(247 243 236 / .18) 1px, transparent 1px), linear-gradient(90deg, rgb(247 243 236 / .18) 1px, transparent 1px); background-size: 32px 32px; }
@media (prefers-reduced-motion: reduce) { .event-card, .event-card * { transition: none; } .event-card:hover { transform: none; } }
</style>
