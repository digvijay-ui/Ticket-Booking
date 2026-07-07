<template>
  <div class="space-y-6">
    <div>
      <p class="font-mono text-xs uppercase text-ticketGold">Seat counter</p>
      <h1 class="font-display text-6xl leading-none text-paperCream">SELECT YOUR SEATS</h1>
      <p class="max-w-2xl text-paperCream/70">
        {{ event ? `${event.title} · ${event.location}` : 'Choose available seats from the event map.' }}
      </p>
    </div>

    <div v-if="eventStore.loading || eventStore.seatsLoading" class="flex min-h-72 items-center justify-center rounded-md bg-deepPlum/70">
      <LoadingSpinner size="lg" />
    </div>

    <div v-else-if="eventStore.error" class="rounded-md border border-marqueeRed bg-marqueeRed/10 p-5 text-sm font-semibold text-paperCream">
      {{ eventStore.error }}
    </div>

    <section v-else class="grid gap-5 lg:grid-cols-[1fr_340px]">
      <TicketStubCard :title="event?.title || 'Seat Map'" :subtitle="event?.location || 'Select seats'" status="available" :show-barcode="false">
        <div class="space-y-5">
          <SeatLegend />
          <SeatGrid :seats="eventStore.seats" :selected-seat-ids="selectedSeatIds" @toggle-seat="toggleSeat" />
        </div>
      </TicketStubCard>

      <aside class="h-fit rounded-md border-2 border-stubCharcoal bg-paperCream p-5 text-stubCharcoal shadow-ticket">
        <p class="font-mono text-xs font-bold uppercase text-stubCharcoal/55">Selected seats</p>
        <p class="mt-1 font-display text-4xl leading-none">{{ selectedSeatsLabel || 'None' }}</p>

        <div class="my-5 border-t-2 border-dashed border-stubCharcoal/25" />

        <div class="space-y-2 font-mono text-sm">
          <div class="flex justify-between">
            <span>Count</span>
            <span>{{ selectedSeats.length }}</span>
          </div>
          <div class="flex justify-between text-marqueeRed">
            <span>Total</span>
            <span>{{ formatINR(totalAmountInPaise) }}</span>
          </div>
        </div>

        <p v-if="reserveError" class="mt-4 rounded-sm bg-marqueeRed/10 px-3 py-2 text-sm font-semibold text-marqueeRed">
          {{ reserveError }}
        </p>

        <AppButton class="mt-5 w-full" icon="mdi:ticket-confirmation" :loading="reserving" :disabled="!selectedSeatIds.length" @click="reserve">
          {{ reserving ? 'Please wait...' : 'Reserve Seats' }}
        </AppButton>
      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import AppButton from '@/components/common/AppButton.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import TicketStubCard from '@/components/common/TicketStubCard.vue';
import SeatGrid from '@/components/seats/SeatGrid.vue';
import SeatLegend from '@/components/seats/SeatLegend.vue';
import { useEventStore } from '@/modules/events/event.store';
import type { Seat } from '@/services/apiTypes';
import { getApiErrorMessage } from '@/utils/apiError';
import { formatINR } from '@/utils/money';
import { reserveSeats } from './booking.api';

const route = useRoute();
const router = useRouter();
const eventStore = useEventStore();
const selectedSeatIds = ref<string[]>([]);
const reserving = ref(false);
const reserveError = ref('');

const event = computed(() => eventStore.selectedEvent);
const selectedSeats = computed(() => eventStore.seats.filter((seat) => selectedSeatIds.value.includes(seat.id)));
const selectedSeatsLabel = computed(() => selectedSeats.value.map((seat) => seat.seatNumber).join(', '));
const totalAmountInPaise = computed(() => selectedSeats.value.reduce((total, seat) => total + seat.priceInPaise, 0));

function toggleSeat(seat: Seat) {
  reserveError.value = '';
  selectedSeatIds.value = selectedSeatIds.value.includes(seat.id)
    ? selectedSeatIds.value.filter((seatId) => seatId !== seat.id)
    : [...selectedSeatIds.value, seat.id];
}

async function reserve() {
  reserveError.value = '';

  if (!selectedSeatIds.value.length) {
    reserveError.value = 'Select at least one available seat';
    return;
  }

  reserving.value = true;

  try {
    const response = await reserveSeats({
      eventId: String(route.params.eventId),
      seatIds: selectedSeatIds.value,
    });
    const reservation = response.data.data.reservation;

    sessionStorage.setItem(
      `reservation:${reservation.id}`,
      JSON.stringify({
        reservation,
        event: event.value,
        seats: selectedSeats.value,
      }),
    );

    router.push(`/booking/checkout/${reservation.id}`);
  } catch (error) {
    reserveError.value = getApiErrorMessage(error);
    await eventStore.fetchEventSeats(String(route.params.eventId));
  } finally {
    reserving.value = false;
  }
}

onMounted(async () => {
  const eventId = String(route.params.eventId);
  await Promise.all([eventStore.fetchEventById(eventId), eventStore.fetchEventSeats(eventId)]);
});
</script>
