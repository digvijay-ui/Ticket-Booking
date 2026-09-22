<template>
  <TransitionGroup v-if="filters.length" name="filter-chip" tag="div" class="flex flex-wrap items-center gap-2" aria-label="Active filters">
    <button v-for="filter in filters" :key="filter.key" type="button" class="focus-midnight inline-flex min-h-9 items-center gap-2 rounded-full border border-midnight-mint/25 bg-midnight-mint/10 px-3 text-xs font-bold text-midnight-mint transition hover:border-midnight-mint/60" :aria-label="`Remove ${filter.label} filter`" @click="$emit('remove', filter.key)">
      {{ filter.label }} <Icon icon="mdi:close" class="h-3.5 w-3.5" aria-hidden="true" />
    </button>
    <button key="clear" type="button" class="focus-midnight ml-1 min-h-9 px-2 text-xs font-bold text-midnight-stone underline decoration-white/20 underline-offset-4 transition hover:text-midnight-ivory" @click="$emit('clear')">Clear all</button>
  </TransitionGroup>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';

import type { ActiveEventFilter, FilterKey } from '@/modules/events/useEventDiscovery';

defineProps<{ filters: ActiveEventFilter[] }>();
defineEmits<{ remove: [key: FilterKey]; clear: [] }>();
</script>
