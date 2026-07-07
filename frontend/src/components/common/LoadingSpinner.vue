<template>
  <span
    class="inline-block animate-spin rounded-full border-2 border-current border-r-transparent"
    :class="sizeClass"
    aria-hidden="true"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    size?: 'sm' | 'md' | 'lg';
  }>(),
  {
    size: 'md',
  },
);

const sizeClass = computed(() => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-7 w-7',
  };

  return sizes[props.size];
});
</script>
