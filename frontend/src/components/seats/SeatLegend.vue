<template>
  <div class="flex flex-wrap gap-3" aria-label="Seat legend">
    <span v-for="item in items" :key="item.label" class="inline-flex items-center gap-2 font-mono text-xs uppercase text-paperCream">
      <span class="h-4 w-4 rounded-sm border-2" :class="item.class" aria-hidden="true" />
      {{ item.label }}
      <span class="sr-only">{{ item.description }}</span>
    </span>
  </div>
</template>

<script setup lang="ts">
const items = [
  { label: 'Available', description: 'Electric teal outline seat can be selected', class: 'border-electricTeal' },
  { label: 'Reserved', description: 'Ticket gold dashed seat cannot be selected', class: 'border-ticketGold border-dashed' },
  { label: 'Booked', description: 'Marquee red filled seat cannot be selected', class: 'border-marqueeRed bg-marqueeRed' },
  { label: 'Selected', description: 'Ticket gold filled seat is selected', class: 'border-ticketGold bg-ticketGold' },
];
</script>
