<template>
  <span
    class="inline-flex items-center gap-1 rounded-sm border px-2.5 py-1 font-mono text-xs font-semibold uppercase tracking-normal"
    :class="variantClass"
  >
    <Icon :icon="iconName" class="h-3.5 w-3.5" aria-hidden="true" />
    <slot>{{ label }}</slot>
  </span>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { computed } from 'vue';

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

const variantClass = computed(() => {
  const classes: Record<BadgeVariant, string> = {
    available: 'border-electricTeal bg-electricTeal text-inkNight',
    reserved: 'border-ticketGold bg-ticketGold text-stubCharcoal',
    booked: 'border-marqueeRed bg-marqueeRed text-paperCream',
    paid: 'border-electricTeal bg-electricTeal text-inkNight',
    refunded: 'border-ticketGold bg-ticketGold text-stubCharcoal',
    cancelled: 'border-marqueeRed bg-marqueeRed text-paperCream',
    draft: 'border-stubCharcoal/40 bg-paperCream text-stubCharcoal',
    published: 'border-ticketGold bg-deepPlum text-ticketGold',
    completed: 'border-electricTeal bg-electricTeal/20 text-inkNight',
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
