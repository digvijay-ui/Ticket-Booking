<template>
  <div class="event-detail min-h-screen overflow-x-clip bg-midnight-ink px-5 pb-20 pt-28 text-midnight-ivory sm:px-8 lg:px-12 lg:pb-28 lg:pt-32" :class="{ 'event-detail-ready': pageReady }">
    <div class="mx-auto max-w-[1440px]">
      <RouterLink to="/events" class="focus-midnight mb-6 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 px-4 text-sm font-bold text-midnight-stone transition hover:border-white/25 hover:text-midnight-ivory">
        <Icon icon="mdi:arrow-left" class="h-4 w-4" aria-hidden="true" />
        Back to events
      </RouterLink>

      <EventDetailsSkeleton v-if="eventStore.loading" />

      <EventEmptyState
        v-else-if="eventStore.detailError"
        icon="mdi:ticket-off-outline"
        :title="eventStore.detailErrorStatus === 404 ? 'That event has left the lineup.' : 'We lost the event details.'"
        :copy="eventStore.detailError"
        :action-label="eventStore.detailErrorStatus === 404 ? 'Browse events' : 'Try again'"
        @action="handleErrorAction"
      />

      <template v-else-if="event">
        <EventDetailsHero
          :event="event"
          :booking-unavailable="bookingUnavailable"
          :unavailable-reason="unavailableReason"
        />
        <div class="mt-6 space-y-6">
          <EventInformation :event="event" />
        </div>
      </template>

      <EventEmptyState
        v-else
        icon="mdi:calendar-question-outline"
        title="Event not found."
        copy="This event may have moved, ended, or is no longer part of the current lineup."
        action-label="Browse events"
        @action="router.push('/events')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { computed, nextTick, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import EventDetailsHero from '@/components/events/EventDetailsHero.vue';
import EventDetailsSkeleton from '@/components/events/EventDetailsSkeleton.vue';
import EventEmptyState from '@/components/events/EventEmptyState.vue';
import EventInformation from '@/components/events/EventInformation.vue';
import { useEventStore } from '../event.store';

const route = useRoute();
const router = useRouter();
const eventStore = useEventStore();
const pageReady = ref(false);
const event = computed(() => eventStore.selectedEvent);
const bookingUnavailable = computed(() => !event.value
  || event.value.status !== 'PUBLISHED'
  || event.value.availableSeats <= 0);
const unavailableReason = computed(() => {
  if (!event.value) return 'Booking is unavailable for this event.';
  if (event.value.status === 'CANCELLED') return 'This event has been cancelled, so seat selection and booking are closed.';
  if (event.value.status === 'COMPLETED') return 'This event has ended, so new bookings are no longer available.';
  if (event.value.status !== 'PUBLISHED') return 'This event is not currently open for booking.';
  if (event.value.availableSeats <= 0) return 'All seats are currently booked or held. Check back in case a temporary hold expires.';
  return '';
});

async function loadEvent() {
  pageReady.value = false;
  await eventStore.fetchEventById(String(route.params.eventId));
  await nextTick();
  window.requestAnimationFrame(() => { pageReady.value = true; });
}

function handleErrorAction() {
  if (eventStore.detailErrorStatus === 404) {
    router.push('/events');
    return;
  }
  loadEvent();
}

onMounted(loadEvent);
</script>
