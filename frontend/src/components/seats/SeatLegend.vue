<template>
  <div class="flex flex-wrap gap-x-5 gap-y-3" aria-label="Seat status legend">
    <span v-for="item in items" :key="item.label" class="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.12em] text-midnight-stone">
      <span class="grid h-6 w-6 place-items-center rounded-md border" :class="item.class" aria-hidden="true">
        <Icon :icon="item.icon" class="h-3.5 w-3.5" />
      </span>
      {{ item.label }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';

const items = [
  { label: 'Available', icon: 'mdi:seat-outline', class: 'border-midnight-mint/65 bg-midnight-mint/[0.06] text-midnight-mint' },
  { label: 'Selected', icon: 'mdi:check-bold', class: 'border-midnight-mint bg-midnight-mint text-midnight-ink' },
  { label: 'Reserved', icon: 'mdi:timer-sand', class: 'border-dashed border-midnight-stone/50 bg-white/[0.03] text-midnight-stone' },
  { label: 'Booked', icon: 'mdi:close', class: 'border-midnight-ember/55 bg-midnight-ember/15 text-midnight-ember' },
  { label: 'Temporarily unavailable', icon: 'mdi:alert-outline', class: 'border-double border-midnight-ivory/30 bg-white/[0.07] text-midnight-ivory/60' },
];
</script>
