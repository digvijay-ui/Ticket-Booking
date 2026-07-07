<template>
  <header class="border-b-2 border-ticketGold/60 bg-inkNight/95 text-paperCream">
    <div class="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
      <RouterLink to="/" class="focus-ticket group inline-flex w-fit items-end gap-3 rounded-sm" aria-label="EventBooking home">
        <span class="font-display text-4xl leading-none text-ticketGold sm:text-5xl">EVENT</span>
        <span class="font-display text-4xl leading-none text-paperCream sm:text-5xl">BOOKING</span>
        <BarcodeStrip class="mb-2 hidden max-w-20 sm:block" />
      </RouterLink>

      <nav class="flex flex-wrap items-center gap-2 font-mono text-xs font-semibold uppercase">
        <RouterLink v-for="link in visibleLinks" :key="link.to" :to="link.to" class="focus-ticket rounded-sm px-3 py-2 hover:bg-paperCream hover:text-stubCharcoal">
          {{ link.label }}
        </RouterLink>

        <button
          v-if="auth.isAuthenticated"
          type="button"
          class="focus-ticket inline-flex items-center gap-2 rounded-sm px-3 py-2 text-marqueeRed hover:bg-marqueeRed hover:text-paperCream"
          @click="logout"
        >
          <Icon icon="mdi:logout" class="h-4 w-4" aria-hidden="true" />
          Logout
        </button>
        <RouterLink v-else to="/login" class="focus-ticket inline-flex items-center gap-2 rounded-sm bg-marqueeRed px-3 py-2 text-paperCream hover:bg-paperCream hover:text-marqueeRed">
          <Icon icon="mdi:login" class="h-4 w-4" aria-hidden="true" />
          Login
        </RouterLink>
        <RouterLink v-if="!auth.isAuthenticated" to="/signup" class="focus-ticket inline-flex items-center gap-2 rounded-sm px-3 py-2 text-ticketGold hover:bg-ticketGold hover:text-stubCharcoal">
          <Icon icon="mdi:account-plus" class="h-4 w-4" aria-hidden="true" />
          Signup
        </RouterLink>
        <RouterLink :to="adminLink" class="focus-ticket inline-flex items-center gap-2 rounded-sm px-3 py-2 text-paperCream/80 hover:bg-ticketGold hover:text-stubCharcoal">
          <Icon icon="mdi:shield-account" class="h-4 w-4" aria-hidden="true" />
          Admin
        </RouterLink>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

import BarcodeStrip from '@/components/common/BarcodeStrip.vue';
import { useAuthStore } from '@/modules/auth/auth.store';

const auth = useAuthStore();
const router = useRouter();

const protectedLinks = [
  { to: '/events', label: 'Events' },
  { to: '/bookings', label: 'My Bookings' },
  { to: '/wallet', label: 'Wallet' },
];

const publicLinks = [{ to: '/events', label: 'Events' }];

const visibleLinks = computed(() => (auth.isAuthenticated ? protectedLinks : publicLinks));
const adminLink = computed(() => (auth.isAdminAuthenticated ? '/admin/dashboard' : '/admin/login'));

function logout() {
  auth.logout();
  router.push('/login');
}
</script>
