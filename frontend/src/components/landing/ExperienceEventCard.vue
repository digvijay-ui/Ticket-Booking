<template>
  <RouterLink
    :to="`/events/${event.id}`"
    class="experience-event-card focus-midnight group relative flex h-full min-h-[370px] min-w-0 flex-col justify-between overflow-hidden rounded-[20px] border border-white/10 bg-midnight-surface p-5 text-white sm:p-6"
    :class="featured ? 'lg:min-h-[512px] lg:p-8' : 'lg:min-h-[248px]'"
    :aria-label="`View event: ${event.title}`"
  >
    <img v-if="event.imageUrl && !imageFailed" :src="event.imageUrl" :alt="''" class="experience-event-image absolute inset-0 h-full w-full object-cover" loading="lazy" @error="imageFailed = true" />
    <div v-else class="experience-event-fallback absolute inset-0" aria-hidden="true"><span class="experience-fallback-mark">{{ event.title.charAt(0).toUpperCase() }}</span></div>
    <div class="experience-event-shade absolute inset-0" aria-hidden="true" />

    <div class="relative z-10 flex items-start justify-between gap-3">
      <div class="experience-date-block flex h-[58px] w-[58px] shrink-0 flex-col items-center justify-center border border-white/40 bg-midnight-ink/75 leading-none">
        <span class="text-[10px] font-extrabold uppercase tracking-[0.12em] text-midnight-ivory">{{ month }}</span>
        <span class="mt-1 text-2xl font-black">{{ day }}</span>
      </div>
      <span class="rounded-full border border-white/25 bg-midnight-ink/75 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em]">{{ availabilityLabel }}</span>
    </div>

    <div class="relative z-10 min-w-0">
      <h3 class="line-clamp-3 break-words font-black leading-[1.04] tracking-[-0.045em]" :class="featured ? 'text-[clamp(2rem,3.5vw,3.8rem)]' : 'text-[clamp(1.5rem,2vw,2rem)]'">{{ event.title }}</h3>
      <div class="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-midnight-ivory sm:text-sm">
        <span class="inline-flex items-center gap-1.5"><Icon icon="mdi:calendar-clock-outline" class="h-4 w-4 shrink-0" aria-hidden="true" />{{ dateTime }}</span>
        <span class="inline-flex min-w-0 items-center gap-1.5"><Icon icon="mdi:map-marker-outline" class="h-4 w-4 shrink-0" aria-hidden="true" /><span class="line-clamp-1 break-all">{{ event.location }}</span></span>
      </div>
      <div class="mt-5 flex items-end justify-between gap-3 border-t border-dashed border-white/35 pt-4">
        <span class="min-w-0"><span class="block text-[10px] font-bold uppercase tracking-[0.14em] text-midnight-ivory">Starts at</span><strong class="mt-1 block text-lg font-extrabold">{{ formatINR(event.seatPriceInPaise) }}</strong></span>
        <span class="experience-view-action inline-flex shrink-0 items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.04em] text-white sm:text-sm">View Event <Icon icon="mdi:arrow-up-right" class="experience-action-arrow h-4 w-4 text-midnight-ember" aria-hidden="true" /></span>
      </div>
    </div>
  </RouterLink>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { computed, ref } from 'vue';

import type { EventItem } from '@/services/apiTypes';
import { formatINR } from '@/utils/money';

const props = defineProps<{ event: EventItem; featured?: boolean }>();
const imageFailed = ref(false);
const date = computed(() => new Date(props.event.startDate));
const month = computed(() => new Intl.DateTimeFormat('en-IN', { month: 'short' }).format(date.value).toUpperCase());
const day = computed(() => new Intl.DateTimeFormat('en-IN', { day: '2-digit' }).format(date.value));
const dateTime = computed(() => new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(date.value));
const availabilityLabel = computed(() => {
  if (props.event.availableSeats <= 0) return 'Sold out';
  if (props.event.totalSeats > 0 && props.event.availableSeats / props.event.totalSeats <= 0.2) return 'Selling Fast';
  return `${props.event.availableSeats} seats available`;
});
</script>

<style scoped>
.experience-event-card { isolation: isolate; transition: transform 220ms cubic-bezier(.2,.8,.2,1), border-color 220ms ease; }
.experience-event-card:hover { transform: translateY(-3px); border-color: rgb(247 243 236 / .3); }
.experience-event-image { transition: transform 420ms cubic-bezier(.2,.8,.2,1); }
.experience-event-card:hover .experience-event-image { transform: scale(1.035); }
.experience-event-shade { background: linear-gradient(180deg, rgb(9 9 11 / .42) 0%, rgb(9 9 11 / .22) 30%, rgb(9 9 11 / .78) 70%, rgb(9 9 11 / .96) 100%); }
.experience-event-fallback { background: var(--midnight-surface); }
.experience-event-fallback::before { position: absolute; inset: 16px; border: 1px solid rgb(247 243 236 / .14); content: ''; }
.experience-fallback-mark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -55%); font-size: clamp(10rem, 25vw, 24rem); font-weight: 900; line-height: 1; color: rgb(247 243 236 / .08); }
.experience-date-block { clip-path: polygon(0 0, 100% 0, 100% 80%, 80% 100%, 0 100%); }
.experience-action-arrow { transition: transform 180ms cubic-bezier(.2,.8,.2,1); }
.experience-event-card:hover .experience-action-arrow { transform: translate(3px, -3px); }
@media (prefers-reduced-motion: reduce) { .experience-event-card, .experience-event-image, .experience-action-arrow { transition: none; } .experience-event-card:hover, .experience-event-card:hover .experience-event-image, .experience-event-card:hover .experience-action-arrow { transform: none; } }
</style>
