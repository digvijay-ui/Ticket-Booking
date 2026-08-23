<template>
  <aside class="sticky top-0 z-40 flex w-full flex-col border-b-2 border-paperCream/15 bg-deepPlum text-paperCream md:min-h-screen md:w-72 md:border-b-0 md:border-r-2">
    <div class="flex items-center justify-between gap-3 p-4">
      <RouterLink to="/admin/dashboard" class="focus-ticket rounded-sm p-1" @click="closeMenu">
        <span class="block font-display text-4xl leading-none text-[#14b8a6]">ADMIN</span>
        <span class="block font-mono text-xs uppercase text-paperCream">Box office desk</span>
      </RouterLink>

      <button
        type="button"
        class="focus-ticket inline-flex h-11 w-11 items-center justify-center rounded-sm border-2 border-paperCream/20 text-paperCream md:hidden"
        :aria-expanded="isMenuOpen"
        aria-label="Toggle admin navigation"
        @click="isMenuOpen = !isMenuOpen"
      >
        <Icon :icon="isMenuOpen ? 'mdi:close' : 'mdi:menu'" class="h-6 w-6" aria-hidden="true" />
      </button>
    </div>

    <nav class="gap-2 px-4 pb-4 md:flex md:flex-col" :class="isMenuOpen ? 'flex flex-col' : 'hidden'">
      <RouterLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="focus-ticket inline-flex min-h-11 items-center gap-3 rounded-sm px-3 py-2 font-mono text-xs font-semibold uppercase hover:bg-paperCream hover:text-stubCharcoal"
        @click="closeMenu"
      >
        <Icon :icon="link.icon" class="h-4 w-4" aria-hidden="true" />
        {{ link.label }}
      </RouterLink>

      <button
        type="button"
        class="focus-ticket inline-flex min-h-11 items-center gap-3 rounded-sm px-3 py-2 font-mono text-xs font-semibold uppercase text-[#ef4444] hover:bg-[#ef4444] hover:text-paperCream"
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
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { useAuthStore } from '@/modules/auth/auth.store';

const auth = useAuthStore();
const router = useRouter();
const isMenuOpen = ref(false);

const links = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: 'mdi:view-dashboard-outline' },
  { to: '/admin/events', label: 'Events', icon: 'mdi:ticket-confirmation-outline' },
  { to: '/admin/bookings', label: 'Bookings', icon: 'mdi:clipboard-text-clock-outline' },
  { to: '/admin/transactions', label: 'Transactions', icon: 'mdi:receipt-text-outline' },
];

function logout() {
  auth.adminLogout();
  closeMenu();
  router.push('/admin/login');
}

function closeMenu() {
  isMenuOpen.value = false;
}
</script>
