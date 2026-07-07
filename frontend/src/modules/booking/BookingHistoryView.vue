<template>
  <div class="space-y-6 text-white">
    <div>
      <p class="text-sm font-semibold text-white/55">Your drawer</p>
      <h1 class="text-4xl font-black sm:text-5xl">My bookings</h1>
      <p class="max-w-2xl text-white/70">Bookings fetched from the backend.</p>
    </div>

    <div v-if="loading" class="flex min-h-56 items-center justify-center rounded-2xl bg-white/[0.04]">
      <LoadingSpinner size="lg" />
    </div>

    <div v-else-if="error" class="rounded-xl border border-marqueeRed/50 bg-marqueeRed/10 p-5 text-sm font-semibold">
      {{ error }}
    </div>

    <div v-else-if="bookings.length" class="space-y-3">
      <article v-for="booking in bookings" :key="booking.id" class="rounded-2xl bg-white p-5 text-black">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="text-xs font-bold uppercase text-black/45">{{ formatDateTime(booking.createdAt) }}</p>
            <h2 class="mt-1 text-xl font-black">{{ booking.event?.title || booking.eventId || 'Booked event' }}</h2>
            <p class="mt-1 text-sm text-black/60">{{ booking.seats?.map((seat) => seat.seatNumber).join(', ') || 'Seats reserved' }}</p>
          </div>
          <div class="text-right">
            <p class="font-black">{{ formatINR(booking.totalAmountInPaise) }}</p>
            <AppBadge class="mt-2" :variant="booking.paymentStatus === 'PAID' ? 'paid' : 'refunded'" :label="booking.status" />
          </div>
        </div>
      </article>
    </div>

    <div v-else class="rounded-2xl bg-white/[0.04] p-8 text-center">
      <Icon icon="mdi:ticket-outline" class="mx-auto h-10 w-10 text-white/45" aria-hidden="true" />
      <p class="mt-3 font-bold">No bookings yet.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { onMounted, ref } from 'vue';

import AppBadge from '@/components/common/AppBadge.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import type { Booking } from '@/services/apiTypes';
import { getApiErrorMessage } from '@/utils/apiError';
import { formatDateTime } from '@/utils/date';
import { formatINR } from '@/utils/money';
import { getMyBookings } from './booking.api';

const bookings = ref<Booking[]>([]);
const loading = ref(true);
const error = ref('');

async function loadBookings() {
  loading.value = true;
  error.value = '';

  try {
    const response = await getMyBookings();
    bookings.value = response.data.data.bookings;
  } catch (err) {
    error.value = getApiErrorMessage(err);
  } finally {
    loading.value = false;
  }
}

onMounted(loadBookings);
</script>
