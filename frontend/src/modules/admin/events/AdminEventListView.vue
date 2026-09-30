<template>
  <div class="space-y-6">
    <header class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="admin-kicker">Inventory</p>
        <h1 class="admin-page-title">Events</h1>
        <p class="admin-page-copy">Create, edit, publish, and manage event seat inventory.</p>
      </div>
      <RouterLink to="/admin/events/create">
        <AppButton icon="mdi:plus">Create event</AppButton>
      </RouterLink>
    </header>

    <form class="admin-panel-dark grid gap-3 sm:grid-cols-[minmax(0,1fr)_14rem]" @submit.prevent>
      <label>
        <span class="admin-field-label">Search events</span>
        <input v-model.trim="searchQuery" class="admin-filter-input" type="search" placeholder="Title, location, or event ID" />
      </label>
      <label>
        <span class="admin-field-label">Status</span>
        <select v-model="statusFilter" class="admin-filter-input">
          <option value="">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </label>
    </form>

    <div v-if="adminStore.eventsLoading" class="admin-card-dark p-6">
      <div class="h-3 w-32 animate-pulse rounded-sm bg-paperCream/15" />
      <div class="mt-4 h-10 w-64 animate-pulse rounded-sm bg-paperCream/20" />
      <div class="mt-6 h-24 animate-pulse rounded-sm bg-paperCream/10" />
    </div>

    <div v-else-if="adminStore.eventsError" class="admin-error-state" role="alert">
      <p class="text-sm font-medium">{{ adminStore.eventsError }}</p>
    </div>

    <template v-else-if="filteredEvents.length">
      <div class="admin-table-wrap hidden md:block">
        <table class="admin-table">
          <thead>
            <tr>
              <th scope="col">Event</th>
              <th scope="col">Schedule</th>
              <th scope="col">Price</th>
              <th scope="col">Status</th>
              <th scope="col">Seats</th>
              <th scope="col" class="w-16"><span class="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="event in pagedEvents" :key="event.id">
              <td>
                <p class="max-w-64 truncate font-semibold">{{ event.title }}</p>
                <p class="mt-0.5 max-w-64 truncate text-xs text-admin-secondary">{{ event.location }}</p>
              </td>
              <td>
                <p class="whitespace-nowrap text-xs">{{ formatDateTime(event.startDate) }}</p>
                <p class="mt-0.5 whitespace-nowrap text-xs text-admin-secondary">to {{ formatDateTime(event.endDate) }}</p>
              </td>
              <td class="whitespace-nowrap font-medium">{{ formatINR(event.seatPriceInPaise) }}</td>
              <td><AppBadge :variant="eventStatusVariant(event.status)" :label="event.status" /></td>
              <td>
                <p class="whitespace-nowrap font-medium">{{ event.bookedSeats }} / {{ event.totalSeats }}</p>
                <p class="mt-0.5 text-xs text-admin-secondary">{{ event.availableSeats }} available</p>
              </td>
              <td class="relative">
                <details class="group">
                  <summary class="admin-focus flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-md hover:bg-admin-hover" aria-label="Event actions">
                    <Icon icon="mdi:dots-horizontal" class="h-5 w-5" aria-hidden="true" />
                  </summary>
                  <div class="absolute right-4 z-20 mt-1 w-44 rounded-lg border border-admin-border bg-white p-1 shadow-lg">
                    <RouterLink :to="`/admin/events/${event.id}/edit`" class="admin-focus flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-admin-hover"><Icon icon="mdi:pencil-outline" class="h-4 w-4" />Edit</RouterLink>
                    <RouterLink :to="`/admin/events/${event.id}/seats`" class="admin-focus flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-admin-hover"><Icon icon="mdi:seat-outline" class="h-4 w-4" />Manage seats</RouterLink>
                    <button type="button" class="admin-focus flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-admin-hover disabled:opacity-50" :disabled="event.status === 'CANCELLED' || adminStore.eventSaving" @click="openCancelDialog(event)"><Icon icon="mdi:calendar-remove-outline" class="h-4 w-4" />Cancel</button>
                    <button type="button" class="admin-focus flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-admin-error hover:bg-admin-errorSoft disabled:opacity-50" :disabled="adminStore.eventSaving" @click="openDeleteDialog(event)"><Icon icon="mdi:trash-can-outline" class="h-4 w-4" />Delete</button>
                  </div>
                </details>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="grid grid-cols-1 gap-4 md:hidden">
        <article
          v-for="event in pagedEvents"
        :key="event.id"
        class="relative flex min-h-[320px] flex-col admin-card-dark"
      >
        <span class="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-admin-border bg-admin-canvas" aria-hidden="true" />

        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="text-[10px] font-semibold uppercase text-admin-secondary">Event ID</p>
            <IdCopy :id="event.id" label="Event ID" />
          </div>
          <button
            type="button"
            class="admin-focus rounded-md border border-admin-error/30 bg-admin-errorSoft px-2.5 py-1 text-[10px] font-bold uppercase text-admin-error disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="event.status === 'CANCELLED' || adminStore.eventSaving"
            @click="openCancelDialog(event)"
          >
            {{ cancellingEventId === event.id ? 'Cancelling...' : 'Cancel Event' }}
          </button>
        </div>

        <div class="mt-3 flex flex-wrap gap-2">
          <AppBadge :variant="eventStatusVariant(event.status)" :label="event.status" />
          <span v-if="event.totalSeats === 0" class="rounded-full border border-admin-warning/30 bg-admin-warningSoft px-2.5 py-1 text-xs font-semibold text-admin-warning">
            Needs seats
          </span>
        </div>

        <h2 class="mt-3 line-clamp-3 font-semibold text-admin-text">{{ event.title }}</h2>
        <p class="mt-1 truncate text-sm text-admin-secondary">{{ event.location }}</p>

        <div class="my-4 border-t border-dashed border-admin-border" />

        <div class="space-y-1.5 font-mono text-xs">
          <div class="flex justify-between gap-3">
            <span class="text-[10px] font-black uppercase text-paperCream/55">Starts</span>
            <span class="text-right font-black">{{ formatDateTime(event.startDate) }}</span>
          </div>
          <div class="mt-1.5 flex justify-between gap-3">
            <span class="text-[10px] font-black uppercase text-paperCream/55">Ends</span>
            <span class="text-right font-black">{{ formatDateTime(event.endDate) }}</span>
          </div>
          <div class="mt-1.5 flex justify-between gap-3">
            <span class="text-[10px] font-black uppercase text-paperCream/55">Price</span>
            <span class="font-black text-ticketGold">{{ formatINR(event.seatPriceInPaise) }}</span>
          </div>
        </div>

        <div class="mt-3 flex flex-wrap gap-1.5 font-mono text-[10px] font-bold uppercase">
          <span class="rounded-md bg-admin-successSoft px-2 py-1 text-admin-success">AVL {{ event.availableSeats }}</span>
          <span class="rounded-md bg-admin-warningSoft px-2 py-1 text-admin-warning">RSV {{ event.reservedSeats }}</span>
          <span class="rounded-md bg-admin-errorSoft px-2 py-1 text-admin-error">BKD {{ event.bookedSeats }}</span>
          <span class="rounded-md bg-admin-hover px-2 py-1 text-admin-secondary">TOT {{ event.totalSeats }}</span>
        </div>

        <div class="mt-auto pt-3">
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

      <div v-if="totalPages > 1" class="admin-pagination">
        <p class="text-xs text-admin-secondary">Page {{ safePage }} of {{ totalPages }} · {{ filteredEvents.length }} events</p>
        <div class="flex gap-2">
          <AppButton variant="ghost" icon="mdi:chevron-left" :disabled="safePage === 1" @click="currentPage -= 1">Previous</AppButton>
          <AppButton variant="ghost" icon="mdi:chevron-right" :disabled="safePage === totalPages" @click="currentPage += 1">Next</AppButton>
        </div>
      </div>
    </template>

    <div v-else class="admin-empty-state">
      <p class="text-lg font-bold text-admin-text">No events found</p>
      <p class="mt-1 text-sm text-admin-secondary">Create your first event to begin selling seats.</p>
    </div>

    <div v-if="eventToCancel" ref="cancelDialog" class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 px-4 py-6" tabindex="-1" role="dialog" aria-modal="true" aria-labelledby="cancel-event-title" @click.self="closeCancelDialog">
      <section class="w-full max-w-lg rounded-lg border border-admin-border bg-white p-5 text-admin-text shadow-xl">
        <p class="admin-kicker">Event cancellation</p>
        <h2 id="cancel-event-title" class="mt-2 text-xl font-bold">Cancel {{ eventToCancel.title }}?</h2>
        <p class="mt-3 text-sm leading-6 text-admin-secondary">The event will stop accepting bookings. Existing data is preserved; this does not permanently delete the event.</p>
        <div class="mt-5 grid gap-2 sm:grid-cols-2">
          <AppButton type="button" variant="ghost" :disabled="adminStore.eventSaving" @click="closeCancelDialog">Keep event</AppButton>
          <AppButton type="button" variant="danger" icon="mdi:calendar-remove" :loading="cancellingEventId === eventToCancel.id" @click="confirmCancelEvent">Cancel event</AppButton>
        </div>
      </section>
    </div>

    <div
      v-if="eventToDelete"
      ref="deleteDialog"
      class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 px-4 py-6"
      tabindex="-1"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-event-title"
      @click.self="closeDeleteDialog"
    >
      <section class="w-full max-w-lg rounded-lg border border-admin-error/30 bg-white p-5 text-admin-text shadow-xl">
        <p class="text-xs font-bold uppercase tracking-wider text-admin-error">Permanent action</p>
        <h2 id="delete-event-title" class="mt-2 text-xl font-bold">Delete this event permanently?</h2>
        <p class="mt-3 text-sm font-medium text-admin-secondary">
          {{ eventToDelete.title }} will be permanently deleted with its seats, reservations, and bookings. This action cannot be undone.
        </p>
        <div class="mt-4 rounded-md border border-admin-border bg-admin-canvas p-3 font-mono text-[11px] font-bold uppercase">
          <p class="flex min-w-0 items-center gap-2">Event ID <IdCopy :id="eventToDelete.id" label="Event ID" /></p>
          <p class="mt-1 text-admin-error">Permanent delete</p>
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
import { computed, onMounted, ref, watch } from 'vue';

import { Icon } from '@iconify/vue';

import AppBadge from '@/components/common/AppBadge.vue';
import AppButton from '@/components/common/AppButton.vue';
import IdCopy from '@/components/common/IdCopy.vue';
import { useDialogFocus } from '@/composables/useDialogFocus';
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
const eventToCancel = ref<EventItem | null>(null);
const cancelDialog = ref<HTMLElement | null>(null);
const deleteDialog = ref<HTMLElement | null>(null);
const searchQuery = ref('');
const statusFilter = ref('');
const currentPage = ref(1);
const PAGE_SIZE = 10;

const filteredEvents = computed(() => {
  const query = searchQuery.value.toLowerCase();
  return adminStore.events.filter((event) =>
    (!statusFilter.value || event.status === statusFilter.value) &&
    (!query || [event.title, event.location, event.id].some((value) => value.toLowerCase().includes(query))),
  );
});
const totalPages = computed(() => Math.max(1, Math.ceil(filteredEvents.value.length / PAGE_SIZE)));
const safePage = computed(() => Math.min(currentPage.value, totalPages.value));
const pagedEvents = computed(() => {
  const start = (safePage.value - 1) * PAGE_SIZE;
  return filteredEvents.value.slice(start, start + PAGE_SIZE);
});

watch([searchQuery, statusFilter], () => {
  currentPage.value = 1;
});

function eventStatusVariant(status: EventItem['status']) {
  if (status === 'PUBLISHED') return 'published';
  if (status === 'COMPLETED') return 'completed';
  if (status === 'CANCELLED') return 'cancelled';
  return 'draft';
}

function openCancelDialog(event: EventItem) {
  if (event.status !== 'CANCELLED') eventToCancel.value = event;
}

function closeCancelDialog() {
  if (!adminStore.eventSaving) eventToCancel.value = null;
}

async function confirmCancelEvent() {
  if (!eventToCancel.value) return;
  const event = eventToCancel.value;
  cancellingEventId.value = event.id;

  try {
    await adminStore.cancelEvent(event.id);
    await adminStore.fetchEvents();
    toast.warning(`"${event.title}" was cancelled.`);
    eventToCancel.value = null;
  } catch {
    toast.error('The event could not be cancelled. Please try again.');
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
    await adminStore.fetchEvents();
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

useDialogFocus(computed(() => Boolean(eventToCancel.value)), cancelDialog, closeCancelDialog);
useDialogFocus(computed(() => Boolean(eventToDelete.value)), deleteDialog, closeDeleteDialog);

onMounted(() => {
  adminStore.fetchEvents().catch(() => undefined);
});
</script>
