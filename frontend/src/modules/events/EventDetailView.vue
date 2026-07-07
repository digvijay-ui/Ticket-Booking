<template>
  <div class="space-y-6 text-white">
    <div v-if="loading" class="flex min-h-80 items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>

    <div v-else-if="error" class="rounded-xl border border-marqueeRed/50 bg-marqueeRed/10 p-5 text-sm font-semibold">
      {{ error }}
    </div>

    <template v-else-if="event">
      <section class="overflow-hidden rounded-2xl bg-[#171717] shadow-2xl">
        <div class="relative min-h-[360px] bg-[#242424]">
          <div class="absolute inset-0 bg-[radial-gradient(circle_at_72%_22%,rgba(255,255,255,0.25),transparent_24%),linear-gradient(135deg,#6d28d9,#111827_45%,#e11d48)]" />
          <div class="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
          <div class="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
            <div class="mb-4 flex flex-wrap gap-2">
              <span class="rounded-full bg-white px-3 py-1 text-xs font-bold text-black">Events</span>
              <span class="rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white">{{ event.availableSeats }} seats left</span>
            </div>
            <h1 class="max-w-4xl text-4xl font-black leading-tight sm:text-6xl">{{ event.title }}</h1>
            <p class="mt-4 max-w-3xl text-base text-white/75">{{ event.description }}</p>
          </div>
        </div>
      </section>

      <section class="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div class="space-y-4 rounded-2xl bg-white/[0.04] p-5">
          <h2 class="text-2xl font-black">About the event</h2>
          <p class="leading-7 text-white/75">{{ event.description }}</p>

          <div class="grid gap-3 sm:grid-cols-3">
            <div class="rounded-xl bg-black/25 p-4">
              <Icon icon="mdi:calendar-clock" class="mb-3 h-6 w-6 text-white/50" aria-hidden="true" />
              <p class="text-xs font-bold uppercase text-white/45">Date and time</p>
              <p class="mt-1 font-semibold">{{ formatDateTime(event.startDate) }}</p>
            </div>
            <div class="rounded-xl bg-black/25 p-4">
              <Icon icon="mdi:map-marker" class="mb-3 h-6 w-6 text-white/50" aria-hidden="true" />
              <p class="text-xs font-bold uppercase text-white/45">Venue</p>
              <p class="mt-1 font-semibold">{{ event.location }}</p>
            </div>
            <div class="rounded-xl bg-black/25 p-4">
              <Icon icon="mdi:seat" class="mb-3 h-6 w-6 text-white/50" aria-hidden="true" />
              <p class="text-xs font-bold uppercase text-white/45">Availability</p>
              <p class="mt-1 font-semibold">{{ event.availableSeats }} / {{ event.totalSeats }} seats</p>
            </div>
          </div>
        </div>

        <aside class="h-fit rounded-2xl bg-white p-5 text-black">
          <p class="text-sm font-bold text-black/55">Starts from</p>
          <p class="mt-1 text-3xl font-black">{{ formatINR(event.seatPriceInPaise) }}</p>
          <RouterLink :to="`/events/${event.id}/seats`" class="mt-5 block">
            <AppButton class="w-full" icon="mdi:ticket-confirmation">Book tickets</AppButton>
          </RouterLink>
        </aside>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import AppButton from '@/components/common/AppButton.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import type { EventItem } from '@/services/apiTypes';
import { getApiErrorMessage } from '@/utils/apiError';
import { formatDateTime } from '@/utils/date';
import { formatINR } from '@/utils/money';
import { getEvent } from './event.api';

const route = useRoute();
const event = ref<EventItem | null>(null);
const loading = ref(true);
const error = ref('');

async function loadEvent() {
  loading.value = true;
  error.value = '';

  try {
    const response = await getEvent(String(route.params.eventId));
    event.value = response.data.data.event;
  } catch (err) {
    error.value = getApiErrorMessage(err);
  } finally {
    loading.value = false;
  }
}

onMounted(loadEvent);
</script>
