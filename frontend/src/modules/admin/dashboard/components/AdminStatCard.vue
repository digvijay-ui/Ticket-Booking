<template>
  <article class="admin-ticket-card initial-card-reveal flex min-h-36 flex-col p-4" :style="{ animationDelay: `${index * 45}ms` }">
    <div class="flex items-start justify-between gap-3">
      <p class="text-xs font-medium text-admin-secondary">{{ label }}</p>
      <span class="flex h-8 w-8 items-center justify-center rounded-md bg-admin-hover text-admin-secondary">
        <Icon :icon="icon" class="h-4 w-4" aria-hidden="true" />
      </span>
    </div>

    <p class="mt-2 truncate text-2xl font-bold tracking-[-0.035em] text-admin-text tabular-nums sm:text-3xl">{{ value }}</p>
    <p v-if="subtitle" class="mt-1 line-clamp-1 text-xs text-admin-secondary">{{ subtitle }}</p>
    <div class="admin-barcode mt-auto w-24 pt-3 opacity-50" aria-hidden="true" />
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
  }>(),
  {
    index: 0,
    valueClass: 'text-midnight-ivory',
    subtitle: '',
  },
);
</script>
