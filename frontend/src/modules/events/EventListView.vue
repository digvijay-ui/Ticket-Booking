<template>
  <div class="space-y-6">
    <section class="relative overflow-hidden rounded-md border border-paperCream/10 bg-deepPlum/55 px-5 py-8 sm:px-7 lg:min-h-[320px] lg:py-10">
      <div class="max-w-2xl">
        <p class="font-mono text-xs font-bold uppercase text-ticketGold">EST. 2024 • THE ARCHIVE</p>
        <h1 class="mt-3 font-display text-6xl leading-none text-paperCream sm:text-7xl">LIVE EVENTS</h1>
        <p class="mt-3 max-w-xl text-sm text-paperCream/70">Published events from the backend, styled as box-office ticket stubs.</p>
        <div class="mt-6 flex flex-wrap gap-3">
          <a href="#current-listings" class="focus-ticket inline-flex rounded-sm border-2 border-marqueeRed bg-marqueeRed px-4 py-2 text-sm font-bold uppercase text-paperCream hover:bg-paperCream hover:text-marqueeRed">
            EXPLORE NOW
          </a>
          <a href="#current-listings" class="focus-ticket inline-flex rounded-sm border-2 border-ticketGold bg-transparent px-4 py-2 text-sm font-bold uppercase text-ticketGold hover:bg-ticketGold hover:text-stubCharcoal">
            VIEW ARCHIVE
          </a>
        </div>
      </div>
    </section>

    <div id="current-listings" class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p class="font-mono text-xs font-bold uppercase text-ticketGold">Current listings</p>
        <h2 class="font-display text-4xl leading-none text-paperCream">NOW SELLING</h2>
      </div>
      <p class="font-mono text-xs uppercase text-paperCream/55">Filter by: All Genres Cinematic Musical</p>
    </div>

    <div v-if="eventStore.loading" class="rounded-md border-2 border-stubCharcoal bg-paperCream p-8 text-center text-stubCharcoal shadow-ticket">
      <LoadingSpinner size="lg" />
      <p class="mt-3 font-mono text-xs font-bold uppercase text-stubCharcoal/55">Loading events</p>
    </div>

    <div v-else-if="eventStore.error" class="rounded-md border-2 border-stubCharcoal bg-paperCream p-5 text-sm font-semibold text-marqueeRed shadow-ticket">
      {{ eventStore.error }}
    </div>

    <div v-else-if="eventStore.events.length" class="grid grid-cols-1 gap-5 xl:grid-cols-2">
      <article
        v-for="event in eventStore.events"
        :key="event.id"
        class="relative overflow-hidden rounded-md border-2 border-stubCharcoal bg-paperCream text-stubCharcoal shadow-ticket"
      >
        <span class="absolute -right-4 top-1/2 hidden h-8 w-8 -translate-y-1/2 rounded-full bg-inkNight lg:block" aria-hidden="true" />
        <div class="grid min-h-[240px] lg:grid-cols-[1fr_178px]">
          <div class="flex flex-col p-5">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <AppBadge :variant="statusVariant(event.status)" :label="event.status" />
              <p class="font-mono text-[10px] font-bold uppercase text-stubCharcoal/45">Ref {{ event.id.slice(-8).toUpperCase() }}</p>
            </div>

            <h3 class="mt-4 line-clamp-2 font-display text-4xl uppercase leading-none">{{ event.title }}</h3>
            <p class="mt-2 line-clamp-2 text-sm italic text-stubCharcoal/65">{{ event.description }}</p>

            <div class="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <p class="font-mono text-[10px] font-bold uppercase text-stubCharcoal/45">Location</p>
                <p class="truncate text-sm font-bold">{{ event.location }}</p>
              </div>
              <div>
                <p class="font-mono text-[10px] font-bold uppercase text-stubCharcoal/45">Starts</p>
                <p class="font-mono text-xs font-bold">{{ formatDateTime(event.startDate) }}</p>
              </div>
            </div>

            <div class="mt-auto pt-4">
              <div class="flex flex-wrap gap-2 font-mono uppercase">
                <span class="inline-flex h-10 min-w-[66px] flex-col justify-center rounded-sm border border-stubCharcoal/15 px-2">
                  <span class="text-[8px] font-bold text-stubCharcoal/45">Total</span>
                  <span class="text-xs font-black">{{ event.totalSeats }}</span>
                </span>
                <span class="inline-flex h-10 min-w-[78px] flex-col justify-center rounded-sm border border-electricTeal/50 bg-electricTeal/15 px-2">
                  <span class="text-[8px] font-bold text-stubCharcoal/45">Available</span>
                  <span class="text-xs font-black">{{ event.availableSeats }}</span>
                </span>
                <span class="inline-flex h-10 min-w-[72px] flex-col justify-center rounded-sm border border-ticketGold/60 bg-ticketGold/20 px-2">
                  <span class="text-[8px] font-bold text-stubCharcoal/45">Reserved</span>
                  <span class="text-xs font-black">{{ event.reservedSeats }}</span>
                </span>
                <span class="inline-flex h-10 min-w-[66px] flex-col justify-center rounded-sm border border-marqueeRed/40 bg-marqueeRed/10 px-2 text-marqueeRed">
                  <span class="text-[8px] font-bold text-marqueeRed/70">Booked</span>
                  <span class="text-xs font-black">{{ event.bookedSeats }}</span>
                </span>
              </div>
            </div>
          </div>

          <aside class="relative flex flex-col justify-between gap-4 border-t-2 border-dashed border-stubCharcoal/25 p-5 lg:border-l-2 lg:border-t-0">
            <span class="absolute -left-4 -top-4 hidden h-8 w-8 rounded-full bg-inkNight lg:block" aria-hidden="true" />
            <span class="absolute -bottom-4 -left-4 hidden h-8 w-8 rounded-full bg-inkNight lg:block" aria-hidden="true" />
            <div>
              <p class="font-mono text-[10px] font-bold uppercase text-stubCharcoal/45">Pass price</p>
              <p class="mt-1 font-display text-4xl leading-none text-marqueeRed">{{ formatINR(event.seatPriceInPaise) }}</p>
            </div>

            <div class="max-w-32 [&>div]:h-8">
              <BarcodeStrip />
            </div>

            <div class="grid gap-2">
              <RouterLink :to="`/events/${event.id}`" class="flex">
                <AppButton class="w-full min-h-10 px-3 py-1.5 text-xs" variant="secondary" icon="mdi:ticket-outline">View Details</AppButton>
              </RouterLink>
              <RouterLink :to="`/events/${event.id}/seats`" class="flex">
                <AppButton class="w-full min-h-10 px-3 py-1.5 text-xs" icon="mdi:seat">Select Seats</AppButton>
              </RouterLink>
            </div>
          </aside>
        </div>
      </article>
    </div>

    <div v-else class="rounded-md border-2 border-stubCharcoal bg-paperCream p-8 text-center text-stubCharcoal shadow-ticket">
      <p class="font-display text-4xl leading-none text-marqueeRed">NO EVENTS</p>
      <p class="mt-2 text-sm text-stubCharcoal/65">No published events are available yet.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

import AppBadge from '@/components/common/AppBadge.vue';
import AppButton from '@/components/common/AppButton.vue';
import BarcodeStrip from '@/components/common/BarcodeStrip.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import type { EventItem } from '@/services/apiTypes';
import { formatDateTime } from '@/utils/date';
import { formatINR } from '@/utils/money';
import { useEventStore } from './event.store';

type BadgeVariant = 'available' | 'reserved' | 'booked' | 'paid' | 'refunded' | 'cancelled' | 'draft' | 'published' | 'completed';

const eventStore = useEventStore();

function statusVariant(status: EventItem['status']): BadgeVariant {
  return status.toLowerCase() as BadgeVariant;
}

onMounted(() => {
  eventStore.fetchEvents();
});
</script>
