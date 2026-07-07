<template>
  <article class="relative overflow-hidden rounded-md bg-paperCream text-stubCharcoal shadow-ticket">
    <span class="absolute -left-4 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-inkNight" aria-hidden="true" />
    <span class="absolute -right-4 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-inkNight" aria-hidden="true" />

    <div class="grid gap-0 md:grid-cols-[1fr_150px]">
      <div class="receipt-lines p-5 sm:p-6">
        <div class="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p class="font-mono text-xs font-semibold uppercase text-marqueeRed">Admit One</p>
            <h3 class="font-display text-4xl leading-none text-stubCharcoal">{{ title }}</h3>
          </div>
          <AppBadge v-if="status" :variant="statusVariant" :label="status" />
        </div>

        <p v-if="subtitle" class="max-w-2xl text-sm font-semibold text-stubCharcoal/75">
          {{ subtitle }}
        </p>

        <div class="mt-5">
          <slot />
        </div>
      </div>

      <aside class="ticket-perforation flex min-h-28 flex-col justify-between gap-4 border-t-2 border-dashed border-stubCharcoal/30 p-5 md:border-l-2 md:border-t-0">
        <BarcodeStrip v-if="showBarcode" />
        <p class="font-mono text-xs font-semibold uppercase text-stubCharcoal/60">
          EVENTBOOKING
        </p>
      </aside>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import AppBadge from './AppBadge.vue';
import BarcodeStrip from './BarcodeStrip.vue';

const props = withDefaults(
  defineProps<{
    title: string;
    subtitle?: string;
    status?: string;
    showBarcode?: boolean;
  }>(),
  {
    subtitle: '',
    status: '',
    showBarcode: true,
  },
);

const statusVariant = computed(() => {
  const normalized = props.status.toLowerCase();

  if (['available', 'reserved', 'booked', 'paid', 'refunded', 'cancelled', 'draft', 'published', 'completed'].includes(normalized)) {
    return normalized as 'available' | 'reserved' | 'booked' | 'paid' | 'refunded' | 'cancelled' | 'draft' | 'published' | 'completed';
  }

  return 'draft';
});
</script>
