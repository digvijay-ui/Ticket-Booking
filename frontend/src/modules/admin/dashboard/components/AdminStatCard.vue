<template>
  <article class="relative flex min-h-36 flex-col justify-between overflow-hidden admin-card-dark">
    <span class="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-inkNight" aria-hidden="true" />
    <div>
      <p class="font-mono text-[9px] font-bold uppercase text-paperCream/50">{{ label }}</p>
      <p class="mt-1 truncate font-display text-[1.7rem] leading-none tabular-nums sm:text-3xl" :class="valueClass">{{ value }}</p>
      <p v-if="subtitle" class="mt-1 line-clamp-1 text-xs font-semibold text-paperCream/60">{{ subtitle }}</p>
    </div>

    <div v-if="deltaLabel" class="mt-3">
      <span class="inline-flex items-center rounded-sm border px-2 py-1 font-mono text-[10px] font-bold uppercase tabular-nums" :class="deltaClass">
        {{ deltaLabel }}
      </span>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    label: string;
    value: string;
    valueClass?: string;
    subtitle?: string;
    deltaLabel?: string;
    tone?: 'positive' | 'negative' | 'neutral';
  }>(),
  {
    valueClass: 'text-paperCream',
    subtitle: '',
    deltaLabel: '',
    tone: 'neutral',
  },
);

const deltaClass = computed(() => {
  if (props.tone === 'positive') {
    return 'border-[#14b8a6]/40 bg-[#14b8a6]/15 text-[#5eead4]';
  }

  if (props.tone === 'negative') {
    return 'border-[#ef4444]/40 bg-[#ef4444]/15 text-[#fb7185]';
  }

  return 'border-paperCream/20 bg-paperCream/5 text-paperCream/65';
});
</script>
