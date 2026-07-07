<template>
  <div class="flex flex-wrap gap-3" aria-label="Seat legend">
    <span v-for="item in items" :key="item.label" class="inline-flex items-center gap-2 font-mono text-xs uppercase text-paperCream">
      <span class="h-4 w-4 rounded-sm border-2" :class="item.class" aria-hidden="true" />
      {{ item.label }}
    </span>
  </div>
</template>

<script setup lang="ts">
const items = [
  { label: 'Available', class: 'border-electricTeal' },
  { label: 'Reserved', class: 'border-ticketGold border-dashed' },
  { label: 'Booked', class: 'border-marqueeRed bg-marqueeRed' },
  { label: 'Selected', class: 'border-ticketGold bg-paperCream' },
];
</script>
