<template>
  <div class="space-y-6 text-white">
    <div>
      <p class="text-sm font-semibold text-electricTeal">Booking complete</p>
      <h1 class="text-4xl font-black sm:text-5xl">Ticket confirmed</h1>
      <p class="max-w-2xl text-white/70">Your booking has been confirmed by the backend.</p>
    </div>

    <section class="rounded-2xl bg-white p-6 text-black">
      <Icon icon="mdi:check-decagram" class="h-12 w-12 text-electricTeal" aria-hidden="true" />
      <h2 class="mt-4 text-2xl font-black">Booking ID: {{ route.params.bookingId }}</h2>
      <p class="mt-2 text-black/60">You can view this in My Bookings.</p>
      <RouterLink to="/bookings" class="inline-flex">
        <AppButton class="mt-5" variant="secondary" icon="mdi:format-list-bulleted">My Bookings</AppButton>
      </RouterLink>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { useRoute } from 'vue-router';

import AppButton from '@/components/common/AppButton.vue';

const route = useRoute();
</script>
