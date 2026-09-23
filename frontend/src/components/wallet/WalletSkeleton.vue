<template>
  <div class="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]" aria-label="Loading wallet" aria-live="polite">
    <span class="sr-only">Loading wallet</span>
    <div class="skeleton h-72 rounded-[26px]" aria-hidden="true" />
    <div class="space-y-3 rounded-[26px] border border-white/10 bg-midnight-surface p-5" aria-hidden="true">
      <div class="skeleton h-8 w-48 rounded" />
      <div v-for="item in 4" :key="item" class="skeleton h-24 rounded-2xl" />
    </div>
  </div>
</template>
