<template>
  <div class="fixed right-4 top-4 z-50 flex w-[min(360px,calc(100vw-2rem))] flex-col gap-3">
    <button
      v-for="toast in toastStore.toasts"
      :key="toast.id"
      type="button"
      class="focus-ticket rounded-sm border-2 bg-paperCream px-4 py-3 text-left text-sm font-semibold text-stubCharcoal shadow-ticket"
      :class="toastClass(toast.type)"
      @click="toastStore.dismiss(toast.id)"
    >
      <span class="block font-mono text-[10px] font-bold uppercase">{{ toast.type }}</span>
      <span class="mt-1 block">{{ toast.message }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useToastStore, type ToastType } from '@/modules/common/toast.store';

const toastStore = useToastStore();

function toastClass(type: ToastType) {
  const classes: Record<ToastType, string> = {
    success: 'border-electricTeal',
    error: 'border-marqueeRed',
    warning: 'border-ticketGold',
    info: 'border-stubCharcoal',
  };

  return classes[type];
}
</script>
