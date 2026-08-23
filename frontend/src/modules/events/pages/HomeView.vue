<template>
  <div class="space-y-8">
    <section class="relative overflow-hidden rounded-md border-2 border-ticketGold/40 bg-deepPlum shadow-marquee">
      <div class="absolute inset-y-0 left-0 w-2 bg-marqueeRed" aria-hidden="true" />
      <div class="absolute right-6 top-6 hidden w-40 opacity-80 sm:block">
        <BarcodeStrip />
      </div>

      <div class="relative px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
        <p class="font-mono text-xs font-bold uppercase text-ticketGold">Box Office Noir</p>
        <h1 class="mt-3 max-w-4xl font-display text-6xl leading-none text-paperCream sm:text-7xl lg:text-8xl">
          BOOK YOUR TICKET
        </h1> 
        <p class="mt-5 max-w-2xl text-base text-paperCream/75 sm:text-lg">
          Discover events, add wallet money, reserve seats, and confirm tickets.
        </p>

        <div class="mt-8 flex flex-wrap gap-3">
          <RouterLink to="/login">
            <AppButton icon="mdi:login">Login</AppButton>
          </RouterLink>
          <RouterLink to="/signup">
            <AppButton variant="secondary" icon="mdi:account-plus">Signup</AppButton>
          </RouterLink>
          <RouterLink to="/events">
            <AppButton variant="ghost" icon="mdi:ticket-confirmation">Explore Events</AppButton>
          </RouterLink>
        </div>
      </div>
    </section>

    <section class="grid gap-4 md:grid-cols-3">
      <article v-for="item in steps" :key="item.title" class="rounded-md border-2 border-stubCharcoal bg-paperCream p-5 text-stubCharcoal shadow-ticket">
        <p class="font-mono text-[10px] font-bold uppercase text-marqueeRed">{{ item.label }}</p>
        <h2 class="mt-2 font-display text-3xl leading-none">{{ item.title }}</h2>
        <p class="mt-3 text-sm font-medium text-stubCharcoal/70">{{ item.copy }}</p>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import AppButton from '@/components/common/AppButton.vue';
import BarcodeStrip from '@/components/common/BarcodeStrip.vue';

const steps = [
  { label: 'Step 01', title: 'Browse Events', copy: 'Open published events before logging in and choose the show you want.' },
  { label: 'Step 02', title: 'Reserve Seats', copy: 'Login when you are ready to select seats and create a reservation.' },
  { label: 'Step 03', title: 'Pay Wallet', copy: 'Add wallet money, confirm the booking, and view your tickets.' },
];
</script>
