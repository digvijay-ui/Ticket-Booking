<template>
  <div class="space-y-6">
    <div>
      <p class="font-mono text-xs uppercase text-ticketGold">Public counter</p>
      <h1 class="font-display text-6xl leading-none text-paperCream">LIVE EVENTS</h1>
      <p class="max-w-2xl text-paperCream/70">Published events from the backend, styled as box-office ticket stubs.</p>
    </div>

    <div v-if="eventStore.loading" class="flex min-h-60 items-center justify-center rounded-md bg-deepPlum/70">
      <LoadingSpinner size="lg" />
    </div>

    <div v-else-if="eventStore.error" class="rounded-md border border-marqueeRed bg-marqueeRed/10 p-5 text-sm font-semibold text-paperCream">
      {{ eventStore.error }}
    </div>

    <div v-else-if="eventStore.events.length" class="grid gap-5 xl:grid-cols-2">
      <TicketStubCard
        v-for="event in eventStore.events"
        :key="event.id"
        :title="event.title"
        :subtitle="event.description"
        :status="event.status"
      >
        <div class="space-y-5">
          <div class="grid gap-3 sm:grid-cols-2">
            <div class="rounded-sm bg-stubCharcoal/5 p-3">
              <p class="font-mono text-xs uppercase text-stubCharcoal/55">Location</p>
              <p class="font-bold">{{ event.location }}</p>
            </div>
            <div class="rounded-sm bg-stubCharcoal/5 p-3">
              <p class="font-mono text-xs uppercase text-stubCharcoal/55">Price</p>
              <p class="font-bold text-marqueeRed">{{ formatINR(event.seatPriceInPaise) }}</p>
            </div>
            <div class="rounded-sm bg-stubCharcoal/5 p-3">
              <p class="font-mono text-xs uppercase text-stubCharcoal/55">Starts</p>
              <p class="font-bold">{{ formatDateTime(event.startDate) }}</p>
            </div>
            <div class="rounded-sm bg-stubCharcoal/5 p-3">
              <p class="font-mono text-xs uppercase text-stubCharcoal/55">Ends</p>
              <p class="font-bold">{{ formatDateTime(event.endDate) }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2 font-mono text-xs uppercase sm:grid-cols-4">
            <span class="rounded-sm bg-stubCharcoal/5 px-2 py-2">Total {{ event.totalSeats }}</span>
            <span class="rounded-sm bg-electricTeal/20 px-2 py-2 text-stubCharcoal">Available {{ event.availableSeats }}</span>
            <span class="rounded-sm bg-ticketGold/25 px-2 py-2">Reserved {{ event.reservedSeats }}</span>
            <span class="rounded-sm bg-marqueeRed/10 px-2 py-2 text-marqueeRed">Booked {{ event.bookedSeats }}</span>
          </div>

          <div class="flex flex-wrap gap-3">
            <RouterLink
              :to="`/events/${event.id}`"
              class="focus-ticket rounded-sm border-2 border-ticketGold bg-ticketGold px-4 py-2 text-sm font-bold uppercase text-stubCharcoal hover:bg-paperCream"
            >
              View Details
            </RouterLink>
            <RouterLink
              :to="`/events/${event.id}/seats`"
              class="focus-ticket rounded-sm border-2 border-marqueeRed bg-marqueeRed px-4 py-2 text-sm font-bold uppercase text-paperCream hover:bg-paperCream hover:text-marqueeRed"
            >
              Select Seats
            </RouterLink>
          </div>
        </div>
      </TicketStubCard>
    </div>

    <div v-else class="rounded-md border-2 border-paperCream/10 bg-deepPlum p-8 text-center">
      <p class="font-display text-4xl leading-none text-ticketGold">NO EVENTS</p>
      <p class="mt-2 text-sm text-paperCream/70">No published events are available yet.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import TicketStubCard from '@/components/common/TicketStubCard.vue';
import { formatDateTime } from '@/utils/date';
import { formatINR } from '@/utils/money';
import { useEventStore } from './event.store';

const eventStore = useEventStore();

onMounted(() => {
  eventStore.fetchEvents();
});
</script>
