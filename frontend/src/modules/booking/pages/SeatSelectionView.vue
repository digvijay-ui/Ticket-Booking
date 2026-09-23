<template>
  <div class="seat-selection min-h-screen overflow-x-clip bg-midnight-ink px-5 pb-36 pt-28 text-midnight-ivory sm:px-8 lg:px-12 lg:pb-24 lg:pt-32">
    <div class="mx-auto max-w-[1440px]">
      <RouterLink :to="`/events/${eventId}`" class="focus-midnight inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 px-4 text-sm font-bold text-midnight-stone transition hover:border-white/25 hover:text-midnight-ivory">
        <Icon icon="mdi:arrow-left" class="h-4 w-4" aria-hidden="true" />
        Back to event
      </RouterLink>

      <header class="mt-7 border-b border-white/10 pb-7">
        <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p class="text-[10px] font-extrabold uppercase tracking-[0.18em] text-midnight-mint">Seat selection</p>
            <h1 class="mt-3 max-w-4xl text-[clamp(2.7rem,6vw,5.8rem)] font-black leading-[0.9] tracking-[-0.06em] text-midnight-ivory">{{ event?.title || 'Choose your view' }}</h1>
          </div>
          <div v-if="event" class="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-midnight-stone">
            <span class="inline-flex items-center gap-2"><Icon icon="mdi:calendar-clock-outline" class="h-4 w-4 text-midnight-mint" aria-hidden="true" />{{ formatDateTime(event.startDate) }}</span>
            <span class="inline-flex items-center gap-2"><Icon icon="mdi:map-marker-outline" class="h-4 w-4 text-midnight-mint" aria-hidden="true" />{{ event.location }}</span>
          </div>
        </div>
      </header>

      <div v-if="eventStore.loading" class="mt-7">
        <SeatMapSkeleton />
      </div>

      <EventEmptyState
        v-else-if="eventStore.detailError || !event"
        class="mt-7"
        icon="mdi:ticket-off-outline"
        title="This event is not available."
        :copy="eventStore.detailError || 'We could not find the event you are looking for.'"
        action-label="Browse events"
        @action="router.push('/events')"
      />

      <div v-else class="mt-7 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div class="min-w-0">
          <div v-if="eventUnavailable" class="mb-5 flex items-start gap-3 rounded-2xl border border-midnight-ember/35 bg-midnight-ember/10 p-4" role="status">
            <Icon icon="mdi:alert-octagon-outline" class="mt-0.5 h-5 w-5 shrink-0 text-midnight-ember" aria-hidden="true" />
            <div>
              <p class="font-extrabold text-midnight-ivory">Seat selection is unavailable</p>
              <p class="mt-1 text-sm font-medium leading-6 text-midnight-stone">{{ unavailableReason }}</p>
            </div>
          </div>

          <SeatMapSkeleton v-if="eventStore.seatsLoading" />

          <EventEmptyState
            v-else-if="eventStore.seatsError"
            icon="mdi:seat-outline"
            title="The seat map didn’t load."
            copy="We couldn’t refresh live seat availability. Try again before choosing seats."
            action-label="Retry seat map"
            @action="loadSeats"
          />

          <SeatMap
            v-else
            :seats="eventStore.seats"
            :selected-seat-ids="selectedSeatIds"
            :temporarily-unavailable-seat-ids="temporarilyUnavailableSeatIds"
            :event-unavailable="eventUnavailable"
            @toggle-seat="toggleSeat"
          />
        </div>

        <SelectionSummary
          :event-name="event.title"
          :selected-seats="selectedSeats"
          :total-amount-in-paise="totalAmountInPaise"
          :reserving="bookingStore.reserving"
          :reserve-disabled="reserveDisabled"
          :feedback-message="feedbackMessage"
          :unavailable-reason="eventUnavailable ? unavailableReason : ''"
          @reserve="reserve"
          @reset="resetSelection"
        />
      </div>

      <p class="sr-only" aria-live="polite">{{ selectionAnnouncement }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import EventEmptyState from '@/components/events/EventEmptyState.vue';
import SeatMap from '@/components/seats/SeatMap.vue';
import SeatMapSkeleton from '@/components/seats/SeatMapSkeleton.vue';
import SelectionSummary from '@/components/seats/SelectionSummary.vue';
import { useEventStore } from '@/modules/events/event.store';
import type { Seat } from '@/services/apiTypes';
import { formatDateTime } from '@/utils/date';
import { useBookingStore } from '../booking.store';

const route = useRoute();
const router = useRouter();
const eventStore = useEventStore();
const bookingStore = useBookingStore();
const selectedSeatIds = ref<string[]>([]);
const temporarilyUnavailableSeatIds = ref<string[]>([]);
const feedbackMessage = ref('');
const selectionAnnouncement = ref('');

const eventId = computed(() => String(route.params.eventId));
const event = computed(() => eventStore.selectedEvent);
const selectedSeats = computed(() => eventStore.seats.filter((seat) => selectedSeatIds.value.includes(seat.id)));
const totalAmountInPaise = computed(() => selectedSeats.value.reduce((total, seat) => total + seat.priceInPaise, 0));
const eventUnavailable = computed(() => !event.value || event.value.status !== 'PUBLISHED' || event.value.availableSeats <= 0);
const unavailableReason = computed(() => {
  if (!event.value) return 'This event cannot be booked right now.';
  if (event.value.status === 'CANCELLED') return 'The event has been cancelled. Existing tickets will be handled separately.';
  if (event.value.status === 'COMPLETED') return 'The event has already ended.';
  if (event.value.status !== 'PUBLISHED') return 'The event is not currently open for booking.';
  if (event.value.availableSeats <= 0) return 'There are no available seats right now. A held seat may return if its reservation expires.';
  return '';
});
const hasInvalidSelection = computed(() => selectedSeatIds.value.some((seatId) => {
  const seat = eventStore.seats.find((candidate) => candidate.id === seatId);
  return !seat || seat.status !== 'AVAILABLE';
}));
const reserveDisabled = computed(() => (
  !selectedSeatIds.value.length
  || eventUnavailable.value
  || hasInvalidSelection.value
  || bookingStore.reserving
  || eventStore.seatsLoading
));

function toggleSeat(seat: Seat) {
  feedbackMessage.value = '';
  temporarilyUnavailableSeatIds.value = temporarilyUnavailableSeatIds.value.filter((seatId) => seatId !== seat.id);

  if (selectedSeatIds.value.includes(seat.id)) {
    selectedSeatIds.value = selectedSeatIds.value.filter((seatId) => seatId !== seat.id);
    selectionAnnouncement.value = `Seat ${seat.seatNumber} removed. ${selectedSeatIds.value.length} seats selected.`;
    return;
  }

  selectedSeatIds.value = [...selectedSeatIds.value, seat.id];
  selectionAnnouncement.value = `Seat ${seat.seatNumber} selected. ${selectedSeatIds.value.length} seats selected.`;
}

function resetSelection() {
  selectedSeatIds.value = [];
  temporarilyUnavailableSeatIds.value = [];
  feedbackMessage.value = '';
  selectionAnnouncement.value = 'Seat selection cleared.';
}

async function loadSeats() {
  await eventStore.fetchEventSeats(eventId.value);
}

async function reserve() {
  if (reserveDisabled.value) return;

  feedbackMessage.value = '';
  const attemptedSeats = [...selectedSeats.value];

  try {
    const reservation = await bookingStore.reserveSeats(eventId.value, attemptedSeats, event.value);
    if (!reservation) return;
    selectionAnnouncement.value = 'Seats reserved. Your five-minute hold has started.';
    await router.push(`/booking/checkout/${reservation.id}`);
  } catch {
    await loadSeats();

    const unavailableSeats = attemptedSeats.filter((attemptedSeat) => {
      const refreshedSeat = eventStore.seats.find((seat) => seat.id === attemptedSeat.id);
      return !refreshedSeat || refreshedSeat.status !== 'AVAILABLE';
    });
    const unavailableIds = new Set(unavailableSeats.map((seat) => seat.id));
    temporarilyUnavailableSeatIds.value = unavailableSeats
      .filter((attemptedSeat) => eventStore.seats.find((seat) => seat.id === attemptedSeat.id)?.status === 'RESERVED')
      .map((seat) => seat.id);
    selectedSeatIds.value = selectedSeatIds.value.filter((seatId) => !unavailableIds.has(seatId));

    if (unavailableSeats.length) {
      const labels = unavailableSeats.map((seat) => seat.seatNumber).join(', ');
      feedbackMessage.value = `${labels} ${unavailableSeats.length === 1 ? 'is' : 'are'} no longer available. The map is refreshed and your other valid selections are still selected.`;
    } else {
      feedbackMessage.value = bookingStore.reservationError;
    }
    selectionAnnouncement.value = feedbackMessage.value;
  }
}

onMounted(async () => {
  await Promise.all([
    eventStore.fetchEventById(eventId.value),
    eventStore.fetchEventSeats(eventId.value),
  ]);
});
</script>
