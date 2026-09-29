<template>
  <span
    :class="[baseClass, variantClass]"
  >
    <Icon :icon="iconName" class="h-3.5 w-3.5" aria-hidden="true" />
    <slot>{{ label }}</slot>
  </span>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { computed, inject } from 'vue';

type BadgeVariant =
  | 'available'
  | 'reserved'
  | 'booked'
  | 'paid'
  | 'refunded'
  | 'cancelled'
  | 'draft'
  | 'published'
  | 'completed';

const props = withDefaults(
  defineProps<{
    variant?: BadgeVariant;
    label?: string;
  }>(),
  {
    variant: 'draft',
    label: undefined,
  },
);

const isAdminUi = inject('adminUi', false);
const baseClass = computed(() =>
  isAdminUi
    ? 'inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-semibold'
    : 'inline-flex items-center gap-1 rounded-sm border px-2.5 py-1 font-mono text-xs font-semibold uppercase tracking-normal',
);

const variantClass = computed(() => {
  if (isAdminUi) {
    const adminClasses: Record<BadgeVariant, string> = {
      available: 'border-admin-success/25 bg-admin-successSoft text-admin-success',
      reserved: 'border-admin-warning/25 bg-admin-warningSoft text-admin-warning',
      booked: 'border-admin-error/25 bg-admin-errorSoft text-admin-error',
      paid: 'border-admin-success/25 bg-admin-successSoft text-admin-success',
      refunded: 'border-admin-info/25 bg-admin-infoSoft text-admin-info',
      cancelled: 'border-admin-error/25 bg-admin-errorSoft text-admin-error',
      draft: 'border-admin-border bg-admin-hover text-admin-secondary',
      published: 'border-admin-success/25 bg-admin-successSoft text-admin-success',
      completed: 'border-admin-border bg-admin-hover text-admin-secondary',
    };
    return adminClasses[props.variant];
  }

  const classes: Record<BadgeVariant, string> = {
    available: 'border-[#14b8a6] bg-[#14b8a6]/20 text-[#0f766e]',
    reserved: 'border-stubCharcoal/35 bg-stubCharcoal/10 text-stubCharcoal',
    booked: 'border-[#ef4444] bg-[#ef4444] text-paperCream',
    paid: 'border-[#14b8a6] bg-[#14b8a6] text-inkNight',
    refunded: 'border-[#ef4444] bg-[#ef4444]/15 text-[#dc2626]',
    cancelled: 'border-[#ef4444] bg-[#ef4444] text-paperCream',
    draft: 'border-stubCharcoal/40 bg-paperCream text-stubCharcoal',
    published: 'border-[#14b8a6] bg-deepPlum text-[#14b8a6]',
    completed: 'border-[#14b8a6] bg-[#14b8a6]/20 text-[#0f766e]',
  };

  return classes[props.variant];
});

const iconName = computed(() => {
  const icons: Record<BadgeVariant, string> = {
    available: 'mdi:seat-outline',
    reserved: 'mdi:timer-sand',
    booked: 'mdi:ticket-confirmation',
    paid: 'mdi:check-decagram',
    refunded: 'mdi:cash-refund',
    cancelled: 'mdi:close-octagon',
    draft: 'mdi:pencil-box-outline',
    published: 'mdi:bullhorn-variant',
    completed: 'mdi:check-circle-outline',
  };

  return icons[props.variant];
});
</script>
