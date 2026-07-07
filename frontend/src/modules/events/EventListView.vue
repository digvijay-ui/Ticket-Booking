<template>
  <div class="space-y-8 text-white">
    <div class="space-y-5">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p class="text-sm font-semibold text-white/60">Select Location</p>
          <h1 class="text-4xl font-black tracking-normal sm:text-5xl">Events near you</h1>
        </div>
        <label class="focus-within:ring-2 focus-within:ring-ticketGold flex min-h-12 w-full items-center gap-3 rounded-full bg-white px-4 text-black lg:max-w-md">
          <Icon icon="mdi:magnify" class="h-5 w-5 text-black/50" aria-hidden="true" />
          <span class="sr-only">Search events</span>
          <input v-model="search" class="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-black/45" placeholder="Search for events" />
        </label>
      </div>

      <div class="flex gap-2 overflow-x-auto pb-1">
        <button
          v-for="filter in filters"
          :key="filter"
          type="button"
          class="focus-ticket shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition"
          :class="selectedFilter === filter ? 'border-white bg-white text-black' : 'border-white/15 bg-white/5 text-white hover:border-white/35'"
          @click="selectedFilter = filter"
        >
          {{ filter }}
        </button>
      </div>
    </div>

    <section class="rounded-2xl bg-white/[0.03] p-4 sm:p-5">
      <div class="mb-5 flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-black">All events</h2>
          <p class="text-sm text-white/55">{{ filteredEvents.length }} events available</p>
        </div>
        <AppBadge variant="published" label="Live" />
      </div>

      <div v-if="loading" class="flex min-h-60 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>

      <div v-else-if="error" class="rounded-xl border border-marqueeRed/50 bg-marqueeRed/10 p-5 text-sm font-semibold text-white">
        {{ error }}
      </div>

      <div v-else-if="filteredEvents.length" class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <EventCard v-for="(event, index) in filteredEvents" :key="event.id" :event="event" :index="index" />
      </div>

      <div v-else class="rounded-xl border border-white/10 bg-black/20 p-8 text-center">
        <Icon icon="mdi:calendar-search" class="mx-auto h-10 w-10 text-white/45" aria-hidden="true" />
        <p class="mt-3 font-bold">No published events found.</p>
        <p class="text-sm text-white/55">Create and publish events from the admin panel to see them here.</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { computed, onMounted, ref } from 'vue';

import AppBadge from '@/components/common/AppBadge.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import EventCard from '@/components/events/EventCard.vue';
import type { EventItem } from '@/services/apiTypes';
import { getApiErrorMessage } from '@/utils/apiError';
import { getEvents } from './event.api';

const events = ref<EventItem[]>([]);
const loading = ref(true);
const error = ref('');
const search = ref('');
const selectedFilter = ref('All');
const filters = ['All', 'Today', 'This Weekend', 'Music', 'Comedy', 'Under 10 km'];

const filteredEvents = computed(() => {
  const query = search.value.trim().toLowerCase();

  return events.value.filter((event) => {
    const matchesSearch =
      !query ||
      event.title.toLowerCase().includes(query) ||
      event.description.toLowerCase().includes(query) ||
      event.location.toLowerCase().includes(query);

    if (!matchesSearch) {
      return false;
    }

    if (selectedFilter.value === 'All' || selectedFilter.value === 'Under 10 km') {
      return true;
    }

    const text = `${event.title} ${event.description}`.toLowerCase();

    if (selectedFilter.value === 'Music') {
      return text.includes('music') || text.includes('concert') || text.includes('live');
    }

    if (selectedFilter.value === 'Comedy') {
      return text.includes('comedy') || text.includes('laugh');
    }

    if (selectedFilter.value === 'Today') {
      return new Date(event.startDate).toDateString() === new Date().toDateString();
    }

    if (selectedFilter.value === 'This Weekend') {
      const day = new Date(event.startDate).getDay();
      return day === 0 || day === 6;
    }

    return true;
  });
});

async function loadEvents() {
  loading.value = true;
  error.value = '';

  try {
    const response = await getEvents();
    events.value = response.data.data.events;
  } catch (err) {
    error.value = getApiErrorMessage(err);
  } finally {
    loading.value = false;
  }
}

onMounted(loadEvents);
</script>
