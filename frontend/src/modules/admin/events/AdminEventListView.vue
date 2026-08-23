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

    <div v-else-if="adminStore.events.length" class="grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-3">
      <article
        v-for="event in adminStore.events"
        :key="event.id"
        class="relative flex min-h-[320px] flex-col rounded-md border-2 border-stubCharcoal bg-paperCream p-4 text-stubCharcoal shadow-ticket"
      >
        <span class="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-inkNight" aria-hidden="true" />

        <div class="flex flex-wrap items-start justify-between gap-3">
          <p class="max-w-full truncate font-mono text-[10px] font-bold uppercase text-marqueeRed sm:max-w-[62%]">Event ID {{ event.id }}</p>
          <button
            type="button"
            class="focus-ticket rounded-sm bg-marqueeRed px-2.5 py-1 font-mono text-[10px] font-bold uppercase text-paperCream disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="event.status === 'CANCELLED' || adminStore.eventSaving"
            @click="cancelEvent(event)"
          >
            {{ cancellingEventId === event.id ? 'Cancelling...' : 'Cancel Event' }}
          </button>
        </div>

        <h2 class="admin-card-title mt-3 line-clamp-3 text-stubCharcoal">{{ event.title }}</h2>
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

          <div class="grid gap-2 sm:grid-cols-2">
            <RouterLink :to="`/admin/events/${event.id}/edit`" class="flex">
              <AppButton class="w-full min-h-10 px-3 py-1.5 text-xs" icon="mdi:pencil">Edit</AppButton>
            </RouterLink>
            <RouterLink :to="`/admin/events/${event.id}/seats`" class="flex">
              <AppButton class="w-full min-h-10 px-3 py-1.5 text-xs" variant="secondary" icon="mdi:seat">Seats</AppButton>
            </RouterLink>
            <AppButton
              class="w-full min-h-10 px-3 py-1.5 text-xs sm:col-span-2"
              type="button"
              variant="danger"
              icon="mdi:trash-can-outline"
              :disabled="adminStore.eventSaving"
              @click="openDeleteDialog(event)"
            >
              Delete
            </AppButton>
          </div>
        </div>
      </article>
    </div>

    <div v-else class="rounded-md border-2 border-stubCharcoal bg-paperCream p-8 text-center text-stubCharcoal shadow-ticket">
      <p class="font-display text-4xl leading-none">No events found.</p>
      <p class="mt-2 text-sm text-stubCharcoal/65">Create your first event to begin selling seats.</p>
    </div>

    <div
      v-if="eventToDelete"
      class="fixed inset-0 z-50 flex items-center justify-center bg-inkNight/75 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-event-title"
    >
      <section class="w-full max-w-lg rounded-md border-2 border-[#ef4444] bg-paperCream p-5 text-stubCharcoal shadow-ticket">
        <p class="font-mono text-xs font-bold uppercase text-[#dc2626]">Final call</p>
        <h2 id="delete-event-title" class="admin-card-title mt-2 text-stubCharcoal">Delete this event permanently?</h2>
        <p class="mt-3 text-sm font-semibold text-stubCharcoal/70">
          {{ eventToDelete.title }} will be permanently deleted with its seats, reservations, and bookings. This action cannot be undone.
        </p>
        <div class="mt-4 rounded-sm border border-stubCharcoal/15 bg-stubCharcoal/5 p-3 font-mono text-[11px] font-bold uppercase">
          <p class="truncate">Event ID {{ eventToDelete.id }}</p>
          <p class="mt-1 text-[#dc2626]">Permanent delete</p>
        </div>
        <div class="mt-5 grid gap-2 sm:grid-cols-2">
          <AppButton type="button" variant="secondary" icon="mdi:close" :disabled="adminStore.eventSaving" @click="closeDeleteDialog">
            Keep Event
          </AppButton>
          <AppButton type="button" variant="danger" icon="mdi:trash-can-outline" :loading="deletingEventId === eventToDelete.id" @click="deleteEvent">
            Delete Permanently
          </AppButton>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

import AppButton from '@/components/common/AppButton.vue';
import BarcodeStrip from '@/components/common/BarcodeStrip.vue';
import { useToastStore } from '@/modules/common/toast/toast.store';
import type { EventItem } from '@/services/apiTypes';
import { formatDateTime } from '@/utils/date';
import { formatINR } from '@/utils/money';
import { useAdminStore } from '../admin.store';

const adminStore = useAdminStore();
const toast = useToastStore();
const cancellingEventId = ref('');
const deletingEventId = ref('');
const eventToDelete = ref<EventItem | null>(null);

async function cancelEvent(event: EventItem) {
  if (event.status === 'CANCELLED') {
    return;
  }

  cancellingEventId.value = event.id;

  try {
    await adminStore.cancelEvent(event.id);
    toast.warning(`"${event.title}" was cancelled.`);
  } catch {
    toast.error(adminStore.eventsError || 'Could not cancel event.');
  } finally {
    cancellingEventId.value = '';
  }
}

function openDeleteDialog(event: EventItem) {
  eventToDelete.value = event;
}

function closeDeleteDialog() {
  if (!adminStore.eventSaving) {
    eventToDelete.value = null;
  }
}

async function deleteEvent() {
  if (!eventToDelete.value) {
    return;
  }

  const event = eventToDelete.value;
  deletingEventId.value = event.id;

  try {
    const result = await adminStore.deleteEvent(event.id);
    toast.success(`"${event.title}" was permanently deleted.`);
    if (result.deletedBookings > 0) {
      toast.info(`${result.deletedBookings} booking record${result.deletedBookings === 1 ? '' : 's'} removed with this event.`);
    }
    eventToDelete.value = null;
  } catch {
    toast.error(adminStore.eventsError || 'Could not delete event.');
  } finally {
    deletingEventId.value = '';
  }
}

onMounted(() => {
  adminStore.fetchEvents().catch(() => undefined);
});
</script>
