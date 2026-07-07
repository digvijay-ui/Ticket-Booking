<template>
  <RouterLink
    :to="`/events/${event.id}`"
    class="focus-ticket group block overflow-hidden rounded-xl border border-white/10 bg-[#171717] text-white shadow-lg transition hover:-translate-y-0.5 hover:border-white/25"
  >
    <div class="relative aspect-[16/10] overflow-hidden bg-[#242424]">
      <div class="absolute inset-0" :class="posterClass" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
      <div class="absolute left-3 top-3 rounded-full bg-black/75 px-3 py-1 text-xs font-bold">
        {{ category }}
      </div>
      <div class="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
        <div>
          <p class="text-xs font-semibold uppercase text-white/70">{{ dateLabel }}</p>
          <h3 class="line-clamp-2 text-xl font-bold leading-tight">{{ event.title }}</h3>
        </div>
        <Icon icon="mdi:arrow-right" class="h-6 w-6 shrink-0 text-white/80 transition group-hover:translate-x-1" aria-hidden="true" />
      </div>
    </div>

    <div class="space-y-3 p-4">
      <div class="flex items-start gap-2 text-sm text-white/70">
        <Icon icon="mdi:map-marker" class="mt-0.5 h-4 w-4 shrink-0 text-white/50" aria-hidden="true" />
        <span class="line-clamp-1">{{ event.location }}</span>
      </div>
      <div class="flex items-center justify-between gap-3">
        <span class="font-semibold">{{ formatINR(event.seatPriceInPaise) }} onwards</span>
        <span class="rounded-full bg-white px-3 py-1 text-xs font-bold text-black">Book tickets</span>
      </div>
    </div>
  </RouterLink>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { computed } from 'vue';

import type { EventItem } from '@/services/apiTypes';
import { formatDateTime } from '@/utils/date';
import { formatINR } from '@/utils/money';

const props = defineProps<{
  event: EventItem;
  index?: number;
}>();

const dateLabel = computed(() => formatDateTime(props.event.startDate));

const category = computed(() => {
  const text = `${props.event.title} ${props.event.description}`.toLowerCase();

  if (text.includes('comedy') || text.includes('laugh')) return 'Comedy';
  if (text.includes('music') || text.includes('concert') || text.includes('live')) return 'Music';
  if (text.includes('food') || text.includes('dining')) return 'Food';
  if (text.includes('theatre') || text.includes('play')) return 'Theatre';
  return 'Event';
});

const posterClass = computed(() => {
  const classes = [
    'bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.28),transparent_25%),linear-gradient(135deg,#6d28d9,#111827_50%,#e11d48)]',
    'bg-[radial-gradient(circle_at_80%_25%,rgba(255,255,255,0.25),transparent_22%),linear-gradient(135deg,#0891b2,#18181b_45%,#f97316)]',
    'bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.24),transparent_20%),linear-gradient(135deg,#be123c,#111827_45%,#ca8a04)]',
    'bg-[radial-gradient(circle_at_28%_28%,rgba(255,255,255,0.26),transparent_20%),linear-gradient(135deg,#0f766e,#18181b_45%,#7c2d12)]',
  ];

  return classes[props.index ? props.index % classes.length : 0];
});
</script>
