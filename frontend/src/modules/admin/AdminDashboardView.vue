<template>
  <div class="space-y-6">
    <div>
      <p class="font-mono text-xs uppercase text-ticketGold">Admin desk</p>
      <h1 class="font-display text-5xl leading-none text-paperCream">DASHBOARD</h1>
      <p class="text-sm text-paperCream/70">Operational snapshot placeholders for events, bookings, and wallet flow.</p>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <TicketStubCard v-for="stat in stats" :key="stat.label" :title="stat.value" :subtitle="stat.label" :status="stat.status" />
    </div>
  </div>
</template>

<script setup lang="ts">
import TicketStubCard from '@/components/common/TicketStubCard.vue';

const stats = [
  { label: 'Published events', value: '12', status: 'published' },
  { label: 'Open reservations', value: '34', status: 'reserved' },
  { label: 'Paid bookings', value: '128', status: 'paid' },
];
</script>
