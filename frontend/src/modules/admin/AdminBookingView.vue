<template>
  <div class="space-y-6">
    <div>
      <p class="font-mono text-xs uppercase text-ticketGold">Operations</p>
      <h1 class="font-display text-5xl leading-none text-paperCream">BOOKINGS</h1>
      <p class="text-sm text-paperCream/70">Booking review and refund controls will live here.</p>
    </div>

    <div v-if="loading" class="flex min-h-56 items-center justify-center rounded-md bg-deepPlum">
      <LoadingSpinner size="lg" />
    </div>
    <div v-else-if="error" class="rounded-md border border-marqueeRed bg-marqueeRed/10 p-4 text-sm font-semibold text-paperCream">
      {{ error }}
    </div>
    <div v-else-if="bookings.length" class="space-y-3">
      <article v-for="booking in bookings" :key="booking.id" class="rounded-md bg-paperCream p-5 text-stubCharcoal">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="font-mono text-xs uppercase text-stubCharcoal/50">{{ formatDateTime(booking.createdAt) }}</p>
            <h2 class="mt-1 text-xl font-black">{{ booking.event?.title || booking.eventId || booking.id }}</h2>
            <p class="mt-1 text-sm text-stubCharcoal/65">{{ booking.seats?.map((seat) => seat.seatNumber).join(', ') || 'Seats unavailable' }}</p>
          </div>
          <div class="text-right">
            <p class="font-black">{{ formatINR(booking.totalAmountInPaise) }}</p>
            <AppBadge class="mt-2" :variant="booking.paymentStatus === 'PAID' ? 'paid' : 'refunded'" :label="booking.status" />
          </div>
        </div>
      </article>
    </div>
    <div v-else class="rounded-md bg-deepPlum p-8 text-center text-paperCream/70">
      No bookings yet.
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

import AppBadge from '@/components/common/AppBadge.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import type { Booking } from '@/services/apiTypes';
import { getApiErrorMessage } from '@/utils/apiError';
import { formatDateTime } from '@/utils/date';
import { formatINR } from '@/utils/money';
import { getAdminBookings } from './admin.api';

const bookings = ref<Booking[]>([]);
const loading = ref(true);
const error = ref('');

async function loadBookings() {
  loading.value = true;
  error.value = '';

  try {
    const response = await getAdminBookings();
    bookings.value = response.data.data.bookings;
  } catch (err) {
    error.value = getApiErrorMessage(err);
  } finally {
    loading.value = false;
  }
}

onMounted(loadBookings);
</script>
