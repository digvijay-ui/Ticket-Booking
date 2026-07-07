<template>
  <button
    :type="type"
    class="focus-ticket inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border-2 px-4 py-2 font-mono text-sm font-bold uppercase transition duration-150 disabled:cursor-not-allowed disabled:opacity-60"
    :class="variantClass"
    :disabled="disabled || loading"
  >
    <LoadingSpinner v-if="loading" size="sm" />
    <Icon v-else-if="icon" :icon="icon" class="h-5 w-5" aria-hidden="true" />
    <slot />
  </button>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { computed } from 'vue';

import LoadingSpinner from './LoadingSpinner.vue';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariant;
    loading?: boolean;
    disabled?: boolean;
    icon?: string;
    type?: 'button' | 'submit' | 'reset';
  }>(),
  {
    variant: 'primary',
    loading: false,
    disabled: false,
    icon: undefined,
    type: 'button',
  },
);

const variantClass = computed(() => {
  const classes: Record<ButtonVariant, string> = {
    primary: 'border-marqueeRed bg-marqueeRed text-paperCream hover:bg-paperCream hover:text-marqueeRed',
    secondary: 'border-ticketGold bg-ticketGold text-stubCharcoal hover:bg-paperCream',
    danger: 'border-marqueeRed bg-transparent text-marqueeRed hover:bg-marqueeRed hover:text-paperCream',
    ghost: 'border-paperCream/30 bg-transparent text-paperCream hover:border-ticketGold hover:text-ticketGold',
  };

  return classes[props.variant];
});
</script>
