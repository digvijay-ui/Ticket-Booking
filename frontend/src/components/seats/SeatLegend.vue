<template>
  <div class="flex flex-wrap gap-x-5 gap-y-3" aria-label="Seat status legend">
    <span v-for="item in items" :key="item.label" :class="isAdminUi ? 'inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.08em] text-admin-secondary' : 'inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.12em] text-midnight-stone'">
      <span class="grid h-6 w-6 place-items-center rounded-md border" :class="item.class" aria-hidden="true">
        <Icon :icon="item.icon" class="h-3.5 w-3.5" />
      </span>
      {{ item.label }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { computed, inject } from 'vue';

const isAdminUi = inject('adminUi', false);
const items = computed(() => isAdminUi
  ? [
      { label: 'Available', icon: 'mdi:seat-outline', class: 'border-admin-black bg-white text-admin-text' },
      { label: 'Selected', icon: 'mdi:check-bold', class: 'border-admin-black bg-admin-black text-white' },
      { label: 'Reserved', icon: 'mdi:timer-sand', class: 'border-dashed border-admin-subtle bg-admin-hover text-admin-secondary' },
      { label: 'Booked', icon: 'mdi:close', class: 'border-admin-error/40 bg-admin-errorSoft text-admin-error' },
      { label: 'Temporarily unavailable', icon: 'mdi:alert-outline', class: 'border-double border-admin-border bg-admin-canvas text-admin-subtle' },
    ]
  : [
      { label: 'Available', icon: 'mdi:seat-outline', class: 'border-midnight-mint/65 bg-midnight-mint/[0.06] text-midnight-mint' },
      { label: 'Selected', icon: 'mdi:check-bold', class: 'border-midnight-mint bg-midnight-mint text-midnight-ink' },
      { label: 'Reserved', icon: 'mdi:timer-sand', class: 'border-dashed border-midnight-stone/50 bg-white/[0.03] text-midnight-stone' },
      { label: 'Booked', icon: 'mdi:close', class: 'border-midnight-ember/55 bg-midnight-ember/15 text-midnight-ember' },
      { label: 'Temporarily unavailable', icon: 'mdi:alert-outline', class: 'border-double border-midnight-ivory/30 bg-white/[0.07] text-midnight-ivory/60' },
    ],
);
</script>
