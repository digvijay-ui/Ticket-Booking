<template>
  <div class="space-y-6">
    <div v-if="eventStore.loading" class="flex min-h-80 items-center justify-center rounded-md bg-deepPlum/70">
      <LoadingSpinner size="lg" />
    </div>

    <div v-else-if="eventStore.error" class="rounded-md border border-marqueeRed bg-marqueeRed/10 p-5 text-sm font-semibold text-paperCream">
      {{ eventStore.error }}
    </div>

    <template v-else-if="event">
      <div>
        <p class="font-mono text-xs uppercase text-ticketGold">Event details</p>
        <h1 class="font-display text-6xl leading-none text-paperCream">{{ event.title }}</h1>
        <p class="mt-2 max-w-3xl text-paperCream/70">{{ event.description }}</p>
      </div>

      <TicketStubCard :title="event.title" :subtitle="event.description" :status="event.status">
        <div class="space-y-5">
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div class="rounded-sm border border-stubCharcoal/15 bg-stubCharcoal/5 p-4">
              <p class="font-mono text-xs uppercase text-stubCharcoal/55">Location</p>
              <p class="mt-1 font-bold">{{ event.location }}</p>
            </div>
            <div class="rounded-sm border border-stubCharcoal/15 bg-stubCharcoal/5 p-4">
              <p class="font-mono text-xs uppercase text-stubCharcoal/55">Starts</p>
              <p class="mt-1 font-bold">{{ formatDateTime(event.startDate) }}</p>
            </div>
            <div class="rounded-sm border border-stubCharcoal/15 bg-stubCharcoal/5 p-4">
              <p class="font-mono text-xs uppercase text-stubCharcoal/55">Ends</p>
              <p class="mt-1 font-bold">{{ formatDateTime(event.endDate) }}</p>
            </div>
            <div class="rounded-sm border border-stubCharcoal/15 bg-stubCharcoal/5 p-4">
              <p class="font-mono text-xs uppercase text-stubCharcoal/55">Price</p>
              <p class="mt-1 font-bold text-marqueeRed">{{ formatINR(event.seatPriceInPaise) }}</p>
            </div>
          </div>

          <div class="grid gap-3 sm:grid-cols-4">
            <div class="rounded-sm border border-stubCharcoal/15 p-3">
              <p class="font-mono text-xs uppercase text-stubCharcoal/55">Total</p>
              <p class="font-display text-3xl leading-none">{{ event.totalSeats }}</p>
            </div>
            <div class="rounded-sm border border-electricTeal p-3">
              <p class="font-mono text-xs uppercase text-stubCharcoal/55">Available</p>
              <p class="font-display text-3xl leading-none text-electricTeal">{{ event.availableSeats }}</p>
            </div>
            <div class="rounded-sm border border-ticketGold p-3">
              <p class="font-mono text-xs uppercase text-stubCharcoal/55">Reserved</p>
              <p class="font-display text-3xl leading-none text-ticketGold">{{ event.reservedSeats }}</p>
            </div>
            <div class="rounded-sm border border-marqueeRed p-3">
              <p class="font-mono text-xs uppercase text-stubCharcoal/55">Booked</p>
              <p class="font-display text-3xl leading-none text-marqueeRed">{{ event.bookedSeats }}</p>
            </div>
          </div>

          <RouterLink :to="`/events/${event.id}/seats`" class="focus-ticket inline-flex rounded-sm border-2 border-marqueeRed bg-marqueeRed px-4 py-2 text-sm font-bold uppercase text-paperCream hover:bg-paperCream hover:text-marqueeRed">
            Select Seats
          </RouterLink>
        </div>
      </TicketStubCard>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';

import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import TicketStubCard from '@/components/common/TicketStubCard.vue';
import { formatDateTime } from '@/utils/date';
import { formatINR } from '@/utils/money';
import { useEventStore } from './event.store';

const route = useRoute();
const eventStore = useEventStore();
const event = computed(() => eventStore.selectedEvent);

onMounted(() => {
  eventStore.fetchEventById(String(route.params.eventId));
});
</script>
