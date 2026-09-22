<template>
  <label class="search-field flex min-h-[58px] flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-midnight-surface px-4 transition focus-within:border-midnight-mint/60 sm:px-5">
    <Icon icon="mdi:magnify" class="h-5 w-5 shrink-0 text-midnight-mint" aria-hidden="true" />
    <span class="sr-only">Search events by title, venue, or location</span>
    <input
      :value="modelValue"
      type="search"
      class="min-w-0 flex-1 bg-transparent text-sm font-semibold text-midnight-ivory outline-none placeholder:font-medium placeholder:text-midnight-stone/70"
      placeholder="Search title, venue, or location"
      autocomplete="off"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <span class="hidden rounded-md border border-white/10 px-2 py-1 text-[10px] font-bold text-midnight-stone sm:inline">SEARCH</span>
  </label>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';

defineProps<{ modelValue: string }>();
defineEmits<{ 'update:modelValue': [value: string] }>();
</script>
