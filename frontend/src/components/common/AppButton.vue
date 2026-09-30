<template>
  <button
    :type="type"
    :class="[baseClass, variantClass]"
    :disabled="disabled || loading"
    :aria-busy="loading || undefined"
  >
    <LoadingSpinner v-if="loading" size="sm" />
    <Icon v-else-if="icon" :icon="icon" class="h-5 w-5" aria-hidden="true" />
    <slot />
  </button>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { computed, inject } from 'vue';

import LoadingSpinner from './LoadingSpinner.vue';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'midnight';

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

const isAdminUi = inject('adminUi', false);
const baseClass = computed(() =>
  isAdminUi
    ? 'admin-focus inline-flex min-h-10 items-center justify-center gap-2 rounded-md border px-3.5 py-2 text-sm font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50'
    : 'focus-ticket inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border-2 px-4 py-2 font-mono text-sm font-bold uppercase transition duration-150 disabled:cursor-not-allowed disabled:opacity-60',
);

const variantClass = computed(() => {
  if (isAdminUi) {
    const adminClasses: Record<ButtonVariant, string> = {
      primary: 'border-admin-black bg-admin-black text-white hover:bg-admin-text',
      secondary: 'border-admin-border bg-white text-admin-text hover:bg-admin-hover',
      danger: 'border-admin-error/30 bg-admin-errorSoft text-admin-error hover:border-admin-error/50',
      ghost: 'border-transparent bg-transparent text-admin-secondary hover:bg-admin-hover hover:text-admin-text',
      midnight: 'border-admin-black bg-admin-black text-white hover:bg-admin-text',
    };
    return adminClasses[props.variant];
  }

  const classes: Record<ButtonVariant, string> = {
    primary: 'border-[#f97316] bg-[#f97316] text-inkNight hover:bg-paperCream hover:text-[#c2410c]',
    secondary: 'border-[#14b8a6] bg-[#14b8a6]/15 text-[#14b8a6] hover:bg-[#14b8a6] hover:text-inkNight',
    danger: 'border-marqueeRed bg-transparent text-marqueeRed hover:bg-marqueeRed hover:text-paperCream',
    ghost: 'border-paperCream/30 bg-transparent text-paperCream hover:border-[#14b8a6] hover:text-[#14b8a6]',
    midnight: 'border-midnight-ember bg-midnight-ember text-white hover:border-midnight-ivory hover:bg-midnight-ivory hover:text-midnight-ink',
  };

  return classes[props.variant];
});
</script>
