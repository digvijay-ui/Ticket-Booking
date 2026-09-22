<template>
  <header class="landing-nav fixed inset-x-0 top-0 z-50" :class="{ 'landing-nav--scrolled': isScrolled, 'landing-nav--ready': isReady }">
    <div class="mx-auto flex h-[84px] max-w-[1440px] items-center justify-between px-5 transition-[height] duration-300 sm:px-8 lg:px-12">
      <RouterLink to="/" class="focus-midnight group inline-flex items-center gap-2.5 !bg-transparent !text-midnight-ivory" aria-label="EventBooking home" @click="closeMenu">
        <span class="relative grid h-8 w-8 place-items-center rounded-[7px] border border-midnight-ember text-midnight-ember" aria-hidden="true">
          <span class="absolute -left-1 h-2 w-2 rounded-full bg-midnight-ink" />
          <span class="absolute -right-1 h-2 w-2 rounded-full bg-midnight-ink" />
          <Icon icon="mdi:ticket-confirmation-outline" class="h-[18px] w-[18px]" />
        </span>
        <span class="text-[17px] font-bold tracking-[-0.03em] text-midnight-ivory">Event<span class="text-midnight-ember">Booking</span></span>
      </RouterLink>

      <nav class="hidden items-center gap-7 text-[13px] font-semibold text-midnight-stone lg:flex" aria-label="Primary navigation">
        <RouterLink to="/" class="focus-midnight nav-link !bg-transparent" :class="route.name === 'home' ? '!text-midnight-ivory' : '!text-midnight-stone'">Home</RouterLink>
        <RouterLink to="/events" class="focus-midnight nav-link !bg-transparent" :class="route.name === 'events' ? '!text-midnight-ivory' : '!text-midnight-stone'">Explore Events</RouterLink>
        <RouterLink :to="{ path: '/', hash: '#how-it-works' }" class="focus-midnight nav-link !bg-transparent !text-midnight-stone">How It Works</RouterLink>
        <RouterLink to="/bookings" class="focus-midnight nav-link">My Bookings</RouterLink>
      </nav>

      <div class="hidden items-center gap-3 lg:flex">
        <button v-if="auth.isAuthenticated" type="button" class="focus-midnight px-3 py-2 text-sm font-semibold text-midnight-stone transition hover:text-midnight-ivory" @click="logout">
          Log out
        </button>
        <RouterLink v-else to="/login" class="focus-midnight px-3 py-2 text-sm font-semibold text-midnight-ivory transition hover:text-midnight-ember">Log in</RouterLink>
        <RouterLink to="/events" class="nav-cta focus-midnight inline-flex min-h-11 items-center gap-2 rounded-full !bg-midnight-ember px-5 text-sm font-bold !text-white transition hover:brightness-110">
          Explore Events
          <Icon icon="mdi:arrow-up-right" class="h-4 w-4" aria-hidden="true" />
        </RouterLink>
      </div>

      <button
        type="button"
        class="focus-midnight grid h-11 w-11 place-items-center rounded-full border border-white/15 text-midnight-ivory lg:hidden"
        :aria-expanded="isMenuOpen"
        aria-controls="landing-mobile-menu"
        :aria-label="isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'"
        @click="isMenuOpen = !isMenuOpen"
      >
        <Icon :icon="isMenuOpen ? 'mdi:close' : 'mdi:menu'" class="h-6 w-6" aria-hidden="true" />
      </button>
    </div>

    <Transition name="mobile-menu">
      <div v-if="isMenuOpen" id="landing-mobile-menu" class="border-t border-white/10 bg-midnight-ink px-5 pb-6 pt-4 shadow-2xl lg:hidden">
        <nav class="mx-auto grid max-w-[1440px] gap-1" aria-label="Mobile navigation">
          <RouterLink to="/" class="focus-midnight mobile-link !bg-transparent !text-midnight-ivory" @click="closeMenu">Home</RouterLink>
          <RouterLink to="/events" class="focus-midnight mobile-link !bg-transparent !text-midnight-ivory" @click="closeMenu">Explore Events</RouterLink>
          <RouterLink :to="{ path: '/', hash: '#how-it-works' }" class="focus-midnight mobile-link !bg-transparent !text-midnight-ivory" @click="closeMenu">How It Works</RouterLink>
          <RouterLink to="/bookings" class="focus-midnight mobile-link" @click="closeMenu">My Bookings</RouterLink>
          <div class="mt-3 grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
            <button v-if="auth.isAuthenticated" type="button" class="focus-midnight min-h-11 rounded-full border border-white/15 text-sm font-bold" @click="logout">Log out</button>
            <RouterLink v-else to="/login" class="focus-midnight grid min-h-11 place-items-center rounded-full border border-white/15 text-sm font-bold" @click="closeMenu">Log in</RouterLink>
            <RouterLink to="/events" class="nav-cta focus-midnight grid min-h-11 place-items-center rounded-full !bg-midnight-ember px-4 text-center text-sm font-bold !text-white" @click="closeMenu">Explore Events</RouterLink>
          </div>
        </nav>
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useAuthStore } from '@/modules/auth/auth.store';

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();
const isScrolled = ref(false);
const isMenuOpen = ref(false);
const isReady = ref(false);

function onScroll() {
  isScrolled.value = window.scrollY > 24;
}

function closeMenu() {
  isMenuOpen.value = false;
}

function logout() {
  auth.logout();
  closeMenu();
  router.push('/');
}

watch(() => route.fullPath, closeMenu);

onMounted(() => {
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.requestAnimationFrame(() => {
    isReady.value = true;
  });
});

onBeforeUnmount(() => window.removeEventListener('scroll', onScroll));
</script>

<style scoped>
.landing-nav {
  border-bottom: 1px solid transparent;
  opacity: 0;
  transform: translateY(-12px);
  transition: background-color 240ms ease, border-color 240ms ease, opacity 500ms ease, transform 500ms ease;
}

.landing-nav--ready { opacity: 1; transform: translateY(0); }
.landing-nav--scrolled { border-color: rgb(247 243 236 / 0.1); background: rgb(9 9 11 / 0.92); backdrop-filter: blur(14px); }
.landing-nav--scrolled > div { height: 68px; }
.nav-link { position: relative; padding-block: 0.5rem; transition: color 180ms ease; }
.nav-link:hover { color: #f7f3ec; }
.landing-nav .router-link-active { background-color: transparent; color: inherit; }
.nav-cta.router-link-active { background-color: #ff5a36; color: white; }
.nav-link::after { position: absolute; inset-inline: 0; bottom: 0; height: 1px; content: ''; background: #ff5a36; transform: scaleX(0); transform-origin: left; transition: transform 180ms ease; }
.nav-link:hover::after { transform: scaleX(1); }
.mobile-link { border-radius: 0.5rem; padding: 0.85rem 0.75rem; font-size: 1.05rem; font-weight: 650; color: #f7f3ec; transition: background-color 180ms ease; }
.mobile-link:hover { background: rgb(247 243 236 / 0.06); }
.mobile-menu-enter-active, .mobile-menu-leave-active { transition: opacity 180ms ease, transform 180ms ease; }
.mobile-menu-enter-from, .mobile-menu-leave-to { opacity: 0; transform: translateY(-8px); }

@media (prefers-reduced-motion: reduce) {
  .landing-nav, .landing-nav > div, .nav-link::after, .mobile-menu-enter-active, .mobile-menu-leave-active { transition: none; }
}
</style>
