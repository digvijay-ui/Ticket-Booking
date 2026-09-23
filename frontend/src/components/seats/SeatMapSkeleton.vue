<template>
  <section class="overflow-hidden rounded-[24px] border border-white/10 bg-midnight-surface" aria-label="Loading seats" aria-live="polite">
    <span class="sr-only">Loading seat map</span>
    <div class="flex items-center justify-between border-b border-white/10 p-6" aria-hidden="true"><div class="space-y-2"><div class="skeleton h-3 w-24 rounded" /><div class="skeleton h-6 w-40 rounded" /></div><div class="skeleton hidden h-7 w-96 rounded sm:block" /></div>
    <div class="space-y-8 p-6" aria-hidden="true">
      <div class="mx-auto space-y-2"><div class="skeleton mx-auto h-2 max-w-xl rounded-full" /><div class="skeleton mx-auto h-3 w-28 rounded" /></div>
      <div class="space-y-3 overflow-hidden">
        <div v-for="row in 5" :key="row" class="flex gap-3"><div class="skeleton h-12 w-9 shrink-0 rounded-lg" /><div v-for="seat in 8" :key="seat" class="skeleton h-14 w-14 shrink-0 rounded-xl" /></div>
      </div>
    </div>
  </section>
</template>
