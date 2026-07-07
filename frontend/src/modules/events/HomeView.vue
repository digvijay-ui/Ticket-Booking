<template>
  <div class="space-y-8 text-white">
    <section class="overflow-hidden rounded-3xl bg-[#141414] shadow-2xl">
      <div class="relative min-h-[520px] p-6 sm:p-8 lg:p-10">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_78%_22%,rgba(255,255,255,0.18),transparent_23%),linear-gradient(135deg,#111827,#18181b_42%,#be123c)]" />
        <div class="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
        <div class="relative z-10 flex min-h-[440px] flex-col justify-between">
          <div class="flex flex-wrap gap-2">
            <span v-for="item in categories" :key="item" class="rounded-full bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur">
              {{ item }}
            </span>
          </div>

          <div class="max-w-3xl">
            <p class="text-sm font-bold uppercase text-white/60">Events · Seats · Wallet</p>
            <h1 class="mt-3 text-5xl font-black leading-none sm:text-7xl">Book your next live plan.</h1>
            <p class="mt-4 max-w-2xl text-lg text-white/75">
              Events, wallet, reservations, and bookings in one fast event-discovery experience.
            </p>
            <RouterLink to="/events" class="mt-7 inline-flex">
              <AppButton icon="mdi:magnify">Explore Events</AppButton>
            </RouterLink>
          </div>
        </div>
      </div>
    </section>

    <section class="grid gap-4 sm:grid-cols-3">
      <div v-for="feature in features" :key="feature.title" class="rounded-2xl bg-white/[0.04] p-5">
        <Icon :icon="feature.icon" class="h-8 w-8 text-white/55" aria-hidden="true" />
        <h2 class="mt-4 text-xl font-black">{{ feature.title }}</h2>
        <p class="mt-2 text-sm text-white/60">{{ feature.copy }}</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';

import AppButton from '@/components/common/AppButton.vue';

const categories = ['For you', 'Music', 'Comedy', 'Nightlife', 'Theatre'];
const features = [
  { title: 'Discover', copy: 'Browse published events from the backend feed.', icon: 'mdi:calendar-star' },
  { title: 'Reserve', copy: 'Select live seat inventory and create reservations.', icon: 'mdi:seat' },
  { title: 'Pay', copy: 'Use wallet balance to confirm your booking.', icon: 'mdi:wallet' },
];
</script>
