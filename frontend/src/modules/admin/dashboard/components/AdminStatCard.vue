<template>
  <article class="admin-stat-card admin-ticket-card initial-card-reveal flex min-h-36 flex-col p-4" :style="{ animationDelay: `${index * 45}ms` }">
    <div class="flex items-start justify-between gap-3">
      <p class="text-xs font-medium text-admin-secondary">{{ label }}</p>
      <span class="admin-stat-icon flex h-9 w-9 items-center justify-center rounded-md border border-admin-border bg-admin-canvas text-admin-text">
        <Icon :icon="icon" class="h-4 w-4" aria-hidden="true" />
      </span>
    </div>

    <p class="mt-2 truncate text-2xl font-bold tracking-[-0.035em] tabular-nums sm:text-3xl" :class="valueClass">{{ value }}</p>
    <p v-if="subtitle" class="mt-1 line-clamp-1 text-xs text-admin-secondary">{{ subtitle }}</p>
    <div class="mt-auto flex items-end justify-between gap-4 pt-3" aria-hidden="true">
      <div class="admin-barcode w-24 opacity-40" />
      <span v-if="graphic === 'seat'" class="admin-seat-mark"><i /><i /><i /></span>
      <span v-else-if="graphic === 'event'" class="admin-calendar-mark"><i /><i /></span>
      <span v-else class="admin-ticket-mark" />
    </div>
  </article>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';

withDefaults(
  defineProps<{
    label: string;
    value: string;
    icon: string;
    index?: number;
    valueClass?: string;
    subtitle?: string;
    graphic?: 'ticket' | 'seat' | 'event';
  }>(),
  {
    index: 0,
    valueClass: 'text-admin-text',
    subtitle: '',
    graphic: 'ticket',
  },
);
</script>
