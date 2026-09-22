<template>
  <div class="flex min-h-[330px] flex-col items-center justify-center rounded-[22px] border border-dashed border-white/15 bg-midnight-surface/60 px-6 py-12 text-center">
    <span class="grid h-14 w-14 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-midnight-mint"><Icon :icon="icon" class="h-7 w-7" aria-hidden="true" /></span>
    <h2 class="mt-5 text-2xl font-extrabold tracking-[-0.035em]">{{ title }}</h2>
    <p class="mt-2 max-w-md text-sm font-medium leading-6 text-midnight-stone">{{ copy }}</p>
    <button v-if="actionLabel" type="button" class="focus-midnight mt-6 min-h-11 rounded-full border border-white/15 px-5 text-sm font-bold transition hover:border-white/35" @click="$emit('action')">{{ actionLabel }}</button>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';

defineProps<{ icon: string; title: string; copy: string; actionLabel?: string }>();
defineEmits<{ action: [] }>();
</script>
