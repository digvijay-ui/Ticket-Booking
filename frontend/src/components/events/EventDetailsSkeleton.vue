<template>
  <div class="space-y-6" aria-label="Loading event details" aria-live="polite">
    <span class="sr-only">Loading event details</span>
    <div class="grid overflow-hidden rounded-[28px] border border-white/10 bg-midnight-surface lg:grid-cols-[0.78fr_1.22fr]" aria-hidden="true">
      <div class="skeleton min-h-[360px] lg:min-h-[590px]" />
      <div class="flex min-h-[430px] flex-col justify-between p-7 sm:p-10">
        <div class="skeleton h-8 w-32 rounded-full" />
        <div class="space-y-4"><div class="skeleton h-4 w-28 rounded" /><div class="skeleton h-16 w-4/5 rounded-lg" /><div class="skeleton h-5 w-full max-w-xl rounded" /><div class="skeleton h-5 w-3/4 rounded" /></div>
        <div class="flex justify-between border-t border-white/10 pt-7"><div class="skeleton h-12 w-32 rounded" /><div class="skeleton h-12 w-36 rounded-full" /></div>
      </div>
    </div>
    <div class="grid gap-px overflow-hidden rounded-[22px] border border-white/10 bg-white/10 sm:grid-cols-2 xl:grid-cols-4" aria-hidden="true">
      <div v-for="index in 4" :key="index" class="space-y-4 bg-midnight-surface p-6"><div class="skeleton h-4 w-24 rounded" /><div class="skeleton h-6 w-4/5 rounded" /><div class="skeleton h-4 w-2/3 rounded" /></div>
    </div>
  </div>
</template>
