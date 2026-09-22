<template>
  <footer class="border-t border-white/10 bg-midnight-ink">
    <div class="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
      <div class="grid gap-10 border-b border-white/10 pb-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div class="max-w-sm">
          <RouterLink to="/" class="focus-midnight inline-flex items-center gap-2.5 !bg-transparent !text-midnight-ivory" aria-label="EventBooking home">
            <span class="grid h-8 w-8 place-items-center rounded-[7px] border border-midnight-ember text-midnight-ember"><Icon icon="mdi:ticket-confirmation-outline" class="h-[18px] w-[18px]" aria-hidden="true" /></span>
            <span class="text-[17px] font-bold tracking-[-0.03em]">Event<span class="text-midnight-ember">Booking</span></span>
          </RouterLink>
          <p class="mt-4 text-sm leading-6 text-midnight-stone">Your trusted way to find memorable events, choose the right seats, and book with confidence.</p>
        </div>
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.16em] text-midnight-stone">Product</p>
          <nav class="mt-4 grid gap-3 text-sm" aria-label="Footer product links">
            <RouterLink to="/events" class="focus-midnight w-fit !bg-transparent !text-midnight-ivory hover:!text-midnight-ember">Explore Events</RouterLink>
            <RouterLink to="/bookings" class="focus-midnight w-fit hover:text-midnight-ember">My Bookings</RouterLink>
            <RouterLink :to="{ path: '/', hash: '#how-it-works' }" class="focus-midnight w-fit !bg-transparent !text-midnight-ivory hover:!text-midnight-ember">How It Works</RouterLink>
          </nav>
        </div>
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.16em] text-midnight-stone">Company</p>
          <nav class="mt-4 grid gap-3 text-sm" aria-label="Footer company links">
            <RouterLink :to="{ path: '/', hash: '#experience' }" class="focus-midnight w-fit !bg-transparent !text-midnight-ivory hover:!text-midnight-ember">About the experience</RouterLink>
            <span class="text-midnight-stone">Privacy</span>
            <span class="text-midnight-stone">Terms</span>
          </nav>
        </div>
      </div>
      <div class="flex flex-col gap-2 pt-6 text-xs text-midnight-stone sm:flex-row sm:items-center sm:justify-between">
        <p>© {{ currentYear }} EventBooking. All rights reserved.</p>
        <p>Made for moments worth remembering.</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';

const currentYear = new Date().getFullYear();
</script>
