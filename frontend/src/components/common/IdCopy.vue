<template>
  <span class="inline-flex min-w-0 items-center gap-1.5">
    <span class="truncate font-mono tabular-nums" :title="id">{{ displayId }}</span>
    <button
      type="button"
      class="focus-ticket inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border border-paperCream/15 text-paperCream/65 transition hover:border-[#14b8a6] hover:text-[#14b8a6]"
      :aria-label="`Copy ${label}`"
      @click="copy"
    >
      <Icon :icon="copied ? 'mdi:check' : 'mdi:content-copy'" class="h-3.5 w-3.5" aria-hidden="true" />
    </button>
  </span>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { computed, ref } from 'vue';

const props = withDefaults(
  defineProps<{
    id?: string;
    label?: string;
  }>(),
  {
    id: '',
    label: 'ID',
  },
);

const copied = ref(false);

const displayId = computed(() => {
  if (!props.id) {
    return 'Not available';
  }

  if (props.id.length <= 14) {
    return props.id;
  }

  return `${props.id.slice(0, 6)}...${props.id.slice(-4)}`;
});

async function copy() {
  if (!props.id) {
    return;
  }

  try {
    await navigator.clipboard.writeText(props.id);
    copied.value = true;
    window.setTimeout(() => {
      copied.value = false;
    }, 1200);
  } catch {
    copied.value = false;
  }
}
</script>
