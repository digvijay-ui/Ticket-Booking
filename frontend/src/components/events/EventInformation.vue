<template>
  <section class="event-detail-enter event-detail-delay-2 grid gap-px overflow-hidden rounded-[22px] border border-white/10 bg-white/10 sm:grid-cols-2 xl:grid-cols-4" aria-labelledby="event-information-heading">
    <h2 id="event-information-heading" class="sr-only">Event information</h2>
    <article v-for="item in information" :key="item.label" class="min-w-0 bg-midnight-surface p-5 sm:p-6">
      <div class="flex items-center gap-2 text-midnight-mint">
        <Icon :icon="item.icon" class="h-5 w-5" aria-hidden="true" />
        <p class="text-[10px] font-extrabold uppercase tracking-[0.16em]">{{ item.label }}</p>
      </div>
      <p class="mt-4 break-words text-base font-extrabold leading-6 text-midnight-ivory">{{ item.primary }}</p>
      <p class="mt-1 text-sm font-medium leading-5 text-midnight-stone">{{ item.secondary }}</p>
    </article>
  </section>

  <section class="event-detail-enter event-detail-delay-3 grid gap-6 rounded-[22px] border border-white/10 bg-midnight-surface p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center" aria-labelledby="availability-heading">
    <div>
      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="text-[10px] font-extrabold uppercase tracking-[0.17em] text-midnight-mint">House capacity</p>
          <h2 id="availability-heading" class="mt-2 text-2xl font-extrabold tracking-[-0.035em] text-midnight-ivory">Seat availability</h2>
        </div>
        <p class="text-right text-sm font-bold text-midnight-ivory">{{ event.availableSeats }} of {{ event.totalSeats }} open</p>
      </div>
      <div class="mt-5 h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-label="Seats available" :aria-valuenow="event.availableSeats" aria-valuemin="0" :aria-valuemax="event.totalSeats">
        <span class="block h-full rounded-full bg-midnight-mint transition-[width] duration-500" :style="{ width: `${availabilityPercent}%` }" />
      </div>
      <div class="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-midnight-stone">
        <span><strong class="text-midnight-ivory">{{ event.availableSeats }}</strong> available</span>
        <span><strong class="text-midnight-ivory">{{ event.reservedSeats }}</strong> on hold</span>
        <span><strong class="text-midnight-ivory">{{ event.bookedSeats }}</strong> booked</span>
      </div>
    </div>
    <div class="flex items-center gap-3 border-t border-dashed border-white/15 pt-5 lg:min-w-52 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
      <span class="admission-barcode h-10 w-16 shrink-0 text-midnight-stone" aria-hidden="true" />
      <div>
        <p class="text-[9px] font-extrabold uppercase tracking-[0.18em] text-midnight-stone">Admission</p>
        <p class="mt-1 text-sm font-extrabold text-midnight-ivory">Digital ticket</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { computed } from 'vue';

import type { EventItem } from '@/services/apiTypes';
import { formatDateTime } from '@/utils/date';
import { formatINR } from '@/utils/money';

const props = defineProps<{ event: EventItem }>();
const availabilityPercent = computed(() => props.event.totalSeats > 0
  ? Math.max(0, Math.min(100, (props.event.availableSeats / props.event.totalSeats) * 100))
  : 0);
const information = computed(() => [
  {
    label: 'Date & time',
    icon: 'mdi:calendar-clock-outline',
    primary: formatDateTime(props.event.startDate),
    secondary: `Ends ${formatDateTime(props.event.endDate)}`,
  },
  {
    label: 'Venue & location',
    icon: 'mdi:map-marker-outline',
    primary: props.event.location,
    secondary: 'Venue details are shown on your ticket',
  },
  {
    label: 'Starting price',
    icon: 'mdi:ticket-percent-outline',
    primary: formatINR(props.event.seatPriceInPaise),
    secondary: 'Final total depends on selected seats',
  },
  {
    label: 'Event status',
    icon: props.event.status === 'PUBLISHED' ? 'mdi:broadcast' : 'mdi:information-outline',
    primary: props.event.status,
    secondary: props.event.status === 'PUBLISHED' ? 'Booking is currently open' : 'Booking is not currently open',
  },
]);
</script>

<style scoped>
.admission-barcode { background: repeating-linear-gradient(90deg, currentColor 0 1px, transparent 1px 3px, currentColor 3px 6px, transparent 6px 9px); }
</style>
