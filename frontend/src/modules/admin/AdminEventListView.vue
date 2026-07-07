<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="font-mono text-xs uppercase text-ticketGold">Inventory</p>
        <h1 class="font-display text-5xl leading-none text-paperCream">EVENTS</h1>
        <p class="text-sm text-paperCream/70">Admin event table placeholder.</p>
      </div>
      <RouterLink to="/admin/events/create">
        <AppButton variant="secondary" icon="mdi:plus">Create Event</AppButton>
      </RouterLink>
    </div>

    <div v-if="loading" class="flex min-h-56 items-center justify-center rounded-md bg-deepPlum">
      <LoadingSpinner size="lg" />
    </div>

    <div v-else-if="error" class="rounded-md border border-marqueeRed bg-marqueeRed/10 p-4 text-sm font-semibold text-paperCream">
      {{ error }}
    </div>

    <div v-else-if="events.length" class="grid gap-4 xl:grid-cols-2">
      <article v-for="event in events" :key="event.id" class="rounded-md bg-paperCream p-5 text-stubCharcoal">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="font-mono text-xs font-bold uppercase text-stubCharcoal/50">{{ formatDateTime(event.startDate) }}</p>
            <h2 class="mt-1 text-2xl font-black">{{ event.title }}</h2>
            <p class="mt-1 text-sm text-stubCharcoal/65">{{ event.location }}</p>
          </div>
          <AppBadge variant="published" :label="event.status" />
        </div>

        <div class="mt-5 flex flex-wrap gap-3">
          <RouterLink :to="`/admin/events/${event.id}/edit`">
            <AppButton variant="ghost" icon="mdi:pencil">Edit</AppButton>
          </RouterLink>
          <RouterLink :to="`/admin/events/${event.id}/seats`">
            <AppButton variant="ghost" icon="mdi:seat">Seats</AppButton>
          </RouterLink>
        </div>
      </article>
    </div>

    <div v-else class="rounded-md bg-deepPlum p-8 text-center text-paperCream/70">
      No published events found yet.
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

import AppBadge from '@/components/common/AppBadge.vue';
import AppButton from '@/components/common/AppButton.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import type { EventItem } from '@/services/apiTypes';
import { getApiErrorMessage } from '@/utils/apiError';
import { formatDateTime } from '@/utils/date';
import { getAdminEvents } from './admin.api';

const events = ref<EventItem[]>([]);
const loading = ref(true);
const error = ref('');

async function loadEvents() {
  loading.value = true;
  error.value = '';

  try {
    const response = await getAdminEvents();
    events.value = response.data.data.events;
  } catch (err) {
    error.value = getApiErrorMessage(err);
  } finally {
    loading.value = false;
  }
}

onMounted(loadEvents);
</script>
