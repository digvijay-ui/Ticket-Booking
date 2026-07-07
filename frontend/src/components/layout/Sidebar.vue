<template>
  <aside class="flex w-full flex-col border-b-2 border-ticketGold/40 bg-deepPlum text-paperCream md:min-h-screen md:w-72 md:border-b-0 md:border-r-2">
    <RouterLink to="/admin/dashboard" class="focus-ticket m-4 rounded-sm border-2 border-ticketGold p-4">
      <span class="block font-display text-4xl leading-none text-ticketGold">ADMIN</span>
      <span class="block font-mono text-xs uppercase text-paperCream">Box office desk</span>
    </RouterLink>

    <nav class="flex flex-wrap gap-2 px-4 pb-4 md:flex-col">
      <RouterLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="focus-ticket inline-flex items-center gap-3 rounded-sm px-3 py-2 font-mono text-xs font-semibold uppercase hover:bg-paperCream hover:text-stubCharcoal"
      >
        <Icon :icon="link.icon" class="h-4 w-4" aria-hidden="true" />
        {{ link.label }}
      </RouterLink>

      <button
        type="button"
        class="focus-ticket inline-flex items-center gap-3 rounded-sm px-3 py-2 font-mono text-xs font-semibold uppercase text-marqueeRed hover:bg-marqueeRed hover:text-paperCream"
        @click="logout"
      >
        <Icon icon="mdi:logout" class="h-4 w-4" aria-hidden="true" />
        Logout
      </button>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { useRouter } from 'vue-router';

import { useAuthStore } from '@/modules/auth/auth.store';

const auth = useAuthStore();
const router = useRouter();

const links = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: 'mdi:view-dashboard-outline' },
  { to: '/admin/events', label: 'Events', icon: 'mdi:ticket-confirmation-outline' },
  { to: '/admin/bookings', label: 'Bookings', icon: 'mdi:clipboard-text-clock-outline' },
  { to: '/admin/transactions', label: 'Transactions', icon: 'mdi:receipt-text-outline' },
];

function logout() {
  auth.adminLogout();
  router.push('/admin/login');
}
</script>
