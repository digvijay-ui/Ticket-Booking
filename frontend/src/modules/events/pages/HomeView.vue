<template>
  <div id="top" ref="pageRoot" class="landing-page overflow-hidden bg-midnight-ink text-midnight-ivory" :class="{ 'hero-ready': heroReady }">
    <section class="relative isolate min-h-[760px] border-b border-white/10 pt-32 sm:pt-36 xl:flex xl:min-h-[850px] xl:items-center xl:pt-24">
      <div class="hero-spotlight absolute right-[-20%] top-[-12%] -z-10 h-[780px] w-[780px] rounded-full opacity-50" aria-hidden="true" />
      <div class="mx-auto grid w-full max-w-[1440px] items-center gap-14 px-5 pb-20 sm:px-8 lg:px-12 lg:pb-24 xl:grid-cols-[minmax(0,0.95fr)_minmax(460px,1.05fr)] xl:gap-16">
        <div class="max-w-[680px]">
          <p class="hero-reveal hero-delay-1 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.17em] text-midnight-mint"><span class="h-px w-7 bg-midnight-mint" /> Tickets to something unforgettable</p>
          <h1 class="hero-reveal hero-delay-2 mt-6 max-w-[720px] text-[clamp(3.25rem,6.6vw,6.7rem)] font-extrabold leading-[0.9] tracking-[-0.065em]">Your next <span class="text-midnight-ember">unforgettable</span> moment starts here.</h1>
          <p class="hero-reveal hero-delay-3 mt-7 max-w-xl text-base leading-7 text-midnight-stone sm:text-lg sm:leading-8">Discover events you’ll love, choose your seats, and book securely—in one simple experience.</p>
          <div class="hero-reveal hero-delay-4 mt-9 flex flex-col gap-3 sm:flex-row">
            <RouterLink to="/events" class="focus-midnight inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-midnight-ember px-7 text-sm font-bold text-white transition hover:brightness-110">Explore Events <Icon icon="mdi:arrow-right" class="h-4 w-4" aria-hidden="true" /></RouterLink>
            <a href="#how-it-works" class="focus-midnight inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full border border-white/15 px-7 text-sm font-bold text-midnight-ivory transition hover:border-white/35 hover:bg-white/[0.04]"><Icon icon="mdi:play-circle-outline" class="h-[18px] w-[18px] text-midnight-mint" aria-hidden="true" /> How It Works</a>
          </div>
          <div class="hero-reveal hero-delay-5 mt-9 flex items-center gap-3 text-xs text-midnight-stone">
            <span class="flex -space-x-2" aria-hidden="true"><span v-for="color in attendeeColors" :key="color" class="grid h-8 w-8 place-items-center rounded-full border-2 border-midnight-ink text-[9px] font-black text-midnight-ink" :style="{ backgroundColor: color }">★</span></span>
            <span><strong class="text-midnight-ivory">Simple from start to seat.</strong><br />Built for confident booking.</span>
          </div>
        </div>
        <div class="hero-reveal hero-delay-6 relative xl:pl-4"><HeroTicket /></div>
      </div>
    </section>

    <section aria-label="Booking benefits" class="border-b border-white/10 bg-midnight-surface/45">
      <div class="mx-auto grid max-w-[1440px] grid-cols-2 px-5 sm:px-8 md:grid-cols-4 lg:px-12">
        <div v-for="(benefit, index) in trustBenefits" :key="benefit.label" class="flex items-center gap-3 border-white/10 py-5" :class="{ 'md:border-l md:pl-7': index > 0, 'pr-4': index < trustBenefits.length - 1 }"><Icon :icon="benefit.icon" class="h-5 w-5 shrink-0 text-midnight-mint" aria-hidden="true" /><span class="text-xs font-semibold text-midnight-stone sm:text-sm">{{ benefit.label }}</span></div>
      </div>
    </section>

    <section class="px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
      <div class="mx-auto max-w-[1440px]">
        <div data-reveal class="reveal-item flex items-end justify-between gap-6">
          <div><p class="section-kicker">Curated for you</p><h2 class="section-title mt-4">What’s on <span class="text-midnight-stone">next.</span></h2></div>
          <RouterLink to="/events" class="focus-midnight group hidden items-center gap-2 pb-1 text-sm font-bold sm:flex">View all events <Icon icon="mdi:arrow-right" class="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" /></RouterLink>
        </div>
        <div v-if="eventStore.loading" class="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3" aria-live="polite" aria-label="Loading featured events">
          <div v-for="index in 3" :key="index" class="overflow-hidden rounded-[20px] border border-white/10 bg-midnight-surface"><div class="skeleton aspect-[4/3]" /><div class="space-y-4 p-5"><div class="skeleton h-5 w-3/4 rounded" /><div class="skeleton h-3 w-1/2 rounded" /><div class="skeleton h-12 rounded" /></div></div>
        </div>
        <div v-else-if="eventStore.error" class="mt-10 flex min-h-64 flex-col items-center justify-center rounded-[20px] border border-white/10 bg-midnight-surface p-8 text-center" role="alert">
          <span class="grid h-12 w-12 place-items-center rounded-full bg-midnight-ember/10 text-midnight-ember"><Icon icon="mdi:calendar-remove-outline" class="h-6 w-6" aria-hidden="true" /></span><h3 class="mt-4 text-xl font-bold">We couldn’t load the lineup.</h3><p class="mt-2 max-w-sm text-sm text-midnight-stone">{{ eventStore.error }}</p><button type="button" class="focus-midnight mt-5 rounded-full border border-white/15 px-5 py-2.5 text-sm font-bold hover:border-white/35" @click="eventStore.fetchEvents()">Try again</button>
        </div>
        <div v-else-if="featuredEvents.length" class="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3"><FeaturedEventCard v-for="(event, index) in featuredEvents" :key="event.id" :event="event" :index="index" /></div>
        <div v-else class="mt-10 flex min-h-64 flex-col items-center justify-center rounded-[20px] border border-dashed border-white/15 bg-midnight-surface/50 p-8 text-center"><span class="grid h-12 w-12 place-items-center rounded-full bg-white/5 text-midnight-stone"><Icon icon="mdi:ticket-outline" class="h-6 w-6" aria-hidden="true" /></span><h3 class="mt-4 text-xl font-bold">The next lineup is taking shape.</h3><p class="mt-2 max-w-sm text-sm text-midnight-stone">There are no published events right now. Check back soon for fresh experiences.</p></div>
        <RouterLink to="/events" class="focus-midnight mt-6 inline-flex items-center gap-2 text-sm font-bold sm:hidden">View all events <Icon icon="mdi:arrow-right" class="h-4 w-4" aria-hidden="true" /></RouterLink>
      </div>
    </section>

    <section id="how-it-works" class="border-y border-white/10 bg-midnight-surface px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
      <div class="mx-auto max-w-[1280px]">
        <div data-reveal class="reveal-item mx-auto max-w-2xl text-center"><p class="section-kicker">From discovery to entry</p><h2 class="section-title mt-4">Three steps. <span class="text-midnight-ember">One great night.</span></h2><p class="mt-5 text-base leading-7 text-midnight-stone">Booking should build anticipation, not add friction.</p></div>
        <div data-reveal class="reveal-item booking-timeline relative mt-16 grid gap-10 md:grid-cols-3 md:gap-8">
          <article v-for="(step, index) in bookingSteps" :key="step.title" class="relative text-center md:px-5"><div class="relative z-10 mx-auto grid h-16 w-16 place-items-center rounded-full border border-white/15 bg-midnight-ink text-midnight-mint"><Icon :icon="step.icon" class="h-7 w-7" aria-hidden="true" /><span class="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-midnight-ember text-[10px] font-black text-white">{{ index + 1 }}</span></div><h3 class="mt-6 text-xl font-bold tracking-[-0.025em]">{{ step.title }}</h3><p class="mx-auto mt-3 max-w-xs text-sm leading-6 text-midnight-stone">{{ step.copy }}</p></article>
        </div>
      </div>
    </section>

    <section id="experience" class="px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
      <div class="mx-auto grid max-w-[1320px] items-center gap-16 lg:grid-cols-[1.08fr_0.92fr] lg:gap-24">
        <div data-reveal class="reveal-item relative min-h-[490px]">
          <div class="experience-frame absolute inset-x-0 top-0 overflow-hidden rounded-[24px] border border-white/10 bg-midnight-surface p-5 sm:inset-x-8 sm:p-7">
            <div class="flex items-center justify-between border-b border-white/10 pb-5"><div><p class="text-[10px] font-bold uppercase tracking-[0.16em] text-midnight-mint">Booking preview</p><p class="mt-1 text-lg font-bold">Your seats are ready</p></div><span class="rounded-full bg-midnight-mint/10 px-3 py-1 text-xs font-bold text-midnight-mint">Reserved</span></div>
            <div class="grid gap-4 py-6 sm:grid-cols-[1fr_auto] sm:items-center"><div><p class="text-[10px] font-bold uppercase tracking-[0.14em] text-midnight-stone">Live experience</p><p class="mt-2 text-3xl font-black leading-none tracking-[-0.04em]">A NIGHT TO<br />REMEMBER</p><p class="mt-3 text-xs text-midnight-stone">Friday · 8:30 PM · Grand Hall</p></div><div class="grid grid-cols-2 gap-2"><span v-for="seat in ['B11', 'B12']" :key="seat" class="grid h-14 w-14 place-items-center rounded-xl border border-midnight-mint/40 bg-midnight-mint/10 text-xs font-black text-midnight-mint">{{ seat }}</span></div></div>
            <div class="flex items-center justify-between border-t border-dashed border-white/15 pt-5"><span class="text-xs text-midnight-stone">2 tickets · secure hold</span><span class="font-bold">Ready to confirm</span></div>
          </div>
          <div class="absolute bottom-0 left-0 rounded-[18px] border border-white/10 bg-midnight-ivory p-5 text-midnight-ink shadow-2xl sm:w-[290px]"><Icon icon="mdi:check-decagram" class="h-7 w-7 text-[#168674]" aria-hidden="true" /><p class="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-midnight-ink/50">Booking confirmed</p><p class="mt-1 text-lg font-black">You’re on the list.</p><div class="mt-4 h-8 barcode-dark" aria-hidden="true" /></div>
        </div>
        <div data-reveal class="reveal-item"><p class="section-kicker">Designed around you</p><h2 class="section-title mt-4">Less friction.<br /><span class="text-midnight-stone">More anticipation.</span></h2><p class="mt-6 max-w-lg text-base leading-7 text-midnight-stone">From the first event you spot to the ticket in your bookings, every step keeps the important details clear and the momentum moving.</p><div class="mt-9 grid gap-6"><div v-for="benefit in experienceBenefits" :key="benefit.title" class="flex gap-4"><span class="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-midnight-mint"><Icon :icon="benefit.icon" class="h-5 w-5" aria-hidden="true" /></span><div><h3 class="font-bold">{{ benefit.title }}</h3><p class="mt-1 text-sm leading-6 text-midnight-stone">{{ benefit.copy }}</p></div></div></div></div>
      </div>
    </section>

    <section class="px-5 pb-24 sm:px-8 lg:px-12 lg:pb-32">
      <div data-reveal class="reveal-item final-cta relative mx-auto max-w-[1340px] overflow-hidden rounded-[28px] border border-white/10 bg-midnight-ember px-6 py-16 text-center sm:px-10 lg:py-24">
        <span class="absolute -left-5 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-midnight-ink" aria-hidden="true" /><span class="absolute -right-5 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-midnight-ink" aria-hidden="true" /><div class="absolute inset-x-10 top-6 border-t border-dashed border-white/30" aria-hidden="true" />
        <div class="relative mx-auto max-w-3xl"><p class="text-xs font-bold uppercase tracking-[0.18em] text-white/75">Your seat is waiting</p><h2 class="mt-5 text-[clamp(2.8rem,6vw,5.8rem)] font-black leading-[0.9] tracking-[-0.065em] text-white">Ready for something unforgettable?</h2><p class="mx-auto mt-6 max-w-xl text-base leading-7 text-white/80">Find the event that feels like yours, then book it in a few confident steps.</p><RouterLink to="/events" class="focus-midnight mt-8 inline-flex min-h-[52px] items-center gap-2 rounded-full bg-midnight-ink px-7 text-sm font-bold text-midnight-ivory transition hover:bg-midnight-surface">Explore Events <Icon icon="mdi:arrow-up-right" class="h-4 w-4" aria-hidden="true" /></RouterLink></div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';

import FeaturedEventCard from '@/components/landing/FeaturedEventCard.vue';
import HeroTicket from '@/components/landing/HeroTicket.vue';
import { useEventStore } from '../event.store';

const eventStore = useEventStore();
const pageRoot = ref<HTMLElement | null>(null);
const heroReady = ref(false);
let revealObserver: IntersectionObserver | null = null;
const featuredEvents = computed(() => eventStore.events.slice(0, 3));
const attendeeColors = ['#78DCCA', '#F7F3EC', '#FF9B75'];
const trustBenefits = [
  { icon: 'mdi:shield-lock-outline', label: 'Secure payments' },
  { icon: 'mdi:check-circle-outline', label: 'Instant confirmation' },
  { icon: 'mdi:tag-outline', label: 'Transparent pricing' },
  { icon: 'mdi:seat-outline', label: 'Easy seat selection' },
];
const bookingSteps = [
  { icon: 'mdi:compass-outline', title: 'Discover your event', copy: 'Browse the latest published experiences and open the details that catch your eye.' },
  { icon: 'mdi:seat-outline', title: 'Choose your seats', copy: 'See live availability and select the seats that fit your perfect night.' },
  { icon: 'mdi:ticket-confirmation-outline', title: 'Confirm your booking', copy: 'Complete a secure checkout and find your confirmed tickets in one place.' },
];
const experienceBenefits = [
  { icon: 'mdi:eye-outline', title: 'Clarity at every step', copy: 'Dates, venues, prices, and availability stay easy to scan.' },
  { icon: 'mdi:timer-sand-complete', title: 'A focused seat flow', copy: 'Choose from real seat availability before confirming your booking.' },
  { icon: 'mdi:wallet-outline', title: 'One connected journey', copy: 'Your wallet, reservations, and booking history work together.' },
];

function setupReveal() {
  const elements = pageRoot.value?.querySelectorAll<HTMLElement>('[data-reveal]');
  if (!elements?.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    elements.forEach((element) => element.classList.add('is-visible'));
    return;
  }
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver?.unobserve(entry.target);
    });
  }, { threshold: 0.14 });
  elements.forEach((element) => revealObserver?.observe(element));
}

onMounted(async () => {
  eventStore.fetchEvents();
  await nextTick();
  window.requestAnimationFrame(() => { heroReady.value = true; });
  setupReveal();
});

onBeforeUnmount(() => revealObserver?.disconnect());
</script>
