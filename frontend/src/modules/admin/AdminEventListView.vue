<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="font-mono text-xs font-bold uppercase text-ticketGold">Inventory</p>
        <h1 class="font-display text-5xl leading-none text-paperCream">EVENT MANAGEMENT</h1>
        <p class="text-sm text-paperCream/70">Create, edit, cancel, and inspect event seat inventory.</p>
      </div>
      <RouterLink to="/admin/events/create">
        <AppButton variant="secondary" icon="mdi:plus">CREATE EVENT</AppButton>
      </RouterLink>
    </div>

    <div v-if="adminStore.eventsLoading" class="rounded-md border-2 border-stubCharcoal bg-paperCream p-6 text-stubCharcoal shadow-ticket">
      <div class="h-3 w-32 animate-pulse rounded-sm bg-stubCharcoal/15" />
      <div class="mt-4 h-10 w-64 animate-pulse rounded-sm bg-stubCharcoal/20" />
      <div class="mt-6 h-24 animate-pulse rounded-sm bg-stubCharcoal/10" />
    </div>

    <div v-else-if="adminStore.eventsError" class="rounded-md border border-marqueeRed bg-marqueeRed/10 p-4 text-sm font-semibold text-paperCream">
      {{ adminStore.eventsError }}
    </div>

    <div v-else-if="adminStore.events.length" class="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
      <article
        v-for="event in adminStore.events"
        :key="event.id"
        class="relative flex min-h-[280px] max-h-[340px] flex-col overflow-hidden rounded-md border-2 border-stubCharcoal bg-paperCream p-4 text-stubCharcoal shadow-ticket"
      >
        <span class="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-inkNight" aria-hidden="true" />

        <div class="flex items-start justify-between gap-3">
          <p class="max-w-[62%] truncate font-mono text-[10px] font-bold uppercase text-marqueeRed">Event ID {{ event.id }}</p>
          <button
            type="button"
            class="focus-ticket rounded-sm bg-marqueeRed px-2.5 py-1 font-mono text-[10px] font-bold uppercase text-paperCream disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="event.status === 'CANCELLED' || adminStore.eventSaving"
            @click="cancelEvent(event)"
          >
            {{ cancellingEventId === event.id ? 'Cancelling...' : 'Cancel Event' }}
          </button>
        </div>

        <h2 class="mt-3 line-clamp-2 font-display text-4xl uppercase leading-none">{{ event.title }}</h2>
        <p class="mt-1 truncate text-sm font-semibold text-stubCharcoal/65">{{ event.location }}</p>

        <div class="my-4 border-t-2 border-dashed border-stubCharcoal/25" />

        <div class="space-y-1.5 font-mono text-xs">
          <div class="flex justify-between gap-3">
            <span class="text-[10px] font-black uppercase text-stubCharcoal/55">Starts</span>
            <span class="text-right font-black">{{ formatDateTime(event.startDate) }}</span>
          </div>
          <div class="mt-1.5 flex justify-between gap-3">
            <span class="text-[10px] font-black uppercase text-stubCharcoal/55">Ends</span>
            <span class="text-right font-black">{{ formatDateTime(event.endDate) }}</span>
          </div>
          <div class="mt-1.5 flex justify-between gap-3">
            <span class="text-[10px] font-black uppercase text-stubCharcoal/55">Price</span>
            <span class="font-black text-marqueeRed">{{ formatINR(event.seatPriceInPaise) }}</span>
          </div>
        </div>

        <div class="mt-3 flex flex-wrap gap-1.5 font-mono text-[10px] font-bold uppercase">
          <span class="rounded-sm bg-electricTeal/20 px-2 py-1">AVL {{ event.availableSeats }}</span>
          <span class="rounded-sm bg-ticketGold/30 px-2 py-1">RSV {{ event.reservedSeats }}</span>
          <span class="rounded-sm bg-marqueeRed/15 px-2 py-1 text-marqueeRed">BKD {{ event.bookedSeats }}</span>
          <span class="rounded-sm bg-stubCharcoal/10 px-2 py-1">TOT {{ event.totalSeats }}</span>
        </div>

        <div class="mt-auto pt-3">
          <div class="mb-3 w-36 [&>div]:h-7">
            <BarcodeStrip />
          </div>

          <div class="grid grid-cols-2 gap-2">
            <RouterLink :to="`/admin/events/${event.id}/edit`" class="flex">
              <AppButton class="w-full min-h-10 px-3 py-1.5 text-xs" icon="mdi:pencil">Edit</AppButton>
            </RouterLink>
            <RouterLink :to="`/admin/events/${event.id}/seats`" class="flex">
              <AppButton class="w-full min-h-10 px-3 py-1.5 text-xs" variant="secondary" icon="mdi:seat">Seats</AppButton>
            </RouterLink>
          </div>
        </div>
      </article>
    </div>

    <div v-else class="rounded-md border-2 border-stubCharcoal bg-paperCream p-8 text-center text-stubCharcoal shadow-ticket">
      <p class="font-display text-4xl leading-none">No events found.</p>
      <p class="mt-2 text-sm text-stubCharcoal/65">Create your first event to begin selling seats.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

import AppButton from '@/components/common/AppButton.vue';
import BarcodeStrip from '@/components/common/BarcodeStrip.vue';
import type { EventItem } from '@/services/apiTypes';
import { formatDateTime } from '@/utils/date';
import { formatINR } from '@/utils/money';
import { useAdminStore } from './admin.store';

const adminStore = useAdminStore();
const cancellingEventId = ref('');

async function cancelEvent(event: EventItem) {
  if (event.status === 'CANCELLED') {
    return;
  }

  const confirmed = window.confirm(`Cancel "${event.title}"?`);

  if (!confirmed) {
    return;
  }

  cancellingEventId.value = event.id;

  try {
    await adminStore.cancelEvent(event.id);
  } finally {
    cancellingEventId.value = '';
  }
}

onMounted(() => {
  adminStore.fetchEvents().catch(() => undefined);
});
</script>
