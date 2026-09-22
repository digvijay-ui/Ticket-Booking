<template>
  <div class="flex min-h-screen flex-col" :class="usesMidnightShell ? 'midnight-shell bg-midnight-ink text-midnight-ivory' : 'bg-inkNight text-paperCream'">
    <LandingNavbar v-if="usesMidnightShell" />
    <Navbar v-else />
    <main :class="usesMidnightShell ? 'w-full flex-1' : 'mx-auto w-full max-w-7xl flex-1 px-4 pb-24 pt-8 sm:px-6 lg:pt-10'">
      <RouterView />
    </main>
    <LandingFooter v-if="usesMidnightShell" />
    <Footer v-else />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import LandingFooter from '@/components/landing/LandingFooter.vue';
import LandingNavbar from '@/components/landing/LandingNavbar.vue';
import Footer from './Footer.vue';
import Navbar from './Navbar.vue';

const route = useRoute();
const usesMidnightShell = computed(() => route.name === 'home' || route.name === 'events');
</script>
