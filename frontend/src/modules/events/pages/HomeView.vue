<template>
  <div id="top" ref="pageRoot" class="landing-page overflow-hidden bg-midnight-ink text-midnight-ivory" :class="{ 'hero-ready': heroReady }">
    <section class="hero-section relative isolate min-h-[720px] border-b border-white/10 pt-28 sm:pt-36 xl:flex xl:min-h-[850px] xl:items-center xl:pt-24">
      <div class="hero-stage-lines absolute inset-0 -z-10" aria-hidden="true" />
      <div class="mx-auto grid min-w-0 w-full max-w-[1440px] items-center gap-14 px-5 pb-20 sm:px-8 lg:px-12 lg:pb-24 xl:grid-cols-[minmax(0,0.92fr)_minmax(460px,1.08fr)] xl:gap-20">
        <div class="min-w-0 max-w-[680px]">
          <p class="hero-reveal hero-delay-1 flex max-w-full items-start gap-2 text-xs font-bold uppercase tracking-[0.17em] text-midnight-mint"><span class="mt-[0.45rem] h-px w-7 shrink-0 bg-midnight-mint" /><span>Tickets to something unforgettable</span></p>
          <h1 class="hero-reveal hero-delay-2 mt-6 max-w-[720px] break-normal text-[clamp(2.65rem,6.2vw,6.1rem)] font-extrabold leading-[0.9] tracking-[-0.065em]">Your next <span class="text-midnight-ember">unforgettable</span> moment starts here.</h1>
          <p class="hero-reveal hero-delay-3 mt-7 max-w-xl text-base leading-7 text-midnight-stone sm:text-lg sm:leading-8">Discover events you’ll love, choose your seats, and book securely—in one simple experience.</p>
          <div class="hero-reveal hero-delay-4 mt-9 flex flex-col gap-3 sm:flex-row">
            <RouterLink to="/events" class="focus-midnight hero-primary-action inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-midnight-ember px-7 text-sm font-bold text-white transition">Explore Events <Icon icon="mdi:arrow-right" class="h-4 w-4" aria-hidden="true" /></RouterLink>
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

    <section id="experience" aria-labelledby="experience-heading" class="border-t border-white/10 px-5 py-20 sm:px-8 lg:px-12 lg:py-24">
      <div class="mx-auto max-w-[1440px]">
        <div data-reveal class="reveal-item flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
          <div class="max-w-5xl">
            <p class="section-kicker">CURATED FOR YOU</p>
            <h2 id="experience-heading" class="section-title experience-heading mt-4">Experiences worth showing up for.</h2>
            <p class="mt-5 max-w-2xl text-base leading-7 text-midnight-stone">Discover live music, sports, theatre and unforgettable events happening near you.</p>
          </div>
          <RouterLink to="/events" class="focus-midnight experience-all-action group inline-flex min-h-12 shrink-0 items-center justify-center gap-2 self-start rounded-full bg-midnight-ember px-6 text-sm font-bold text-white sm:self-auto">Explore All Events <Icon icon="mdi:arrow-right" class="experience-all-arrow h-4 w-4" aria-hidden="true" /></RouterLink>
        </div>

        <div v-if="eventStore.loading" class="mt-10 grid gap-4 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]" aria-live="polite" aria-label="Loading featured events">
          <div class="skeleton min-h-[370px] rounded-[20px] border border-white/10 lg:min-h-[512px]" />
          <div class="grid gap-4"><div v-for="index in 2" :key="index" class="skeleton min-h-[248px] rounded-[20px] border border-white/10" /></div>
        </div>
        <div v-else-if="eventStore.error" class="mt-10 rounded-[20px] border border-white/10 bg-midnight-surface px-6 py-12 text-center" role="alert">
          <h3 class="text-xl font-bold">Featured events are unavailable.</h3>
          <p class="mt-2 text-sm text-midnight-stone">{{ eventStore.error }}</p>
          <button type="button" class="focus-midnight mt-5 min-h-11 rounded-full border border-white/20 px-5 text-sm font-bold hover:border-white/40" @click="eventStore.fetchEvents()">Try again</button>
        </div>
        <div v-else-if="experienceEvents.length" class="mt-10 grid gap-4" :class="{ 'lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]': experienceEvents.length > 1 }">
          <div data-reveal class="reveal-item"><ExperienceEventCard :event="experienceEvents[0]!" featured /></div>
          <div v-if="experienceEvents.length > 1" class="grid gap-4">
            <div v-for="event in experienceEvents.slice(1)" :key="event.id" data-reveal class="reveal-item experience-secondary-reveal"><ExperienceEventCard :event="event" /></div>
          </div>
        </div>
        <div v-else class="mt-10 rounded-[20px] border border-dashed border-white/15 bg-midnight-surface px-6 py-12 text-center">
          <h3 class="text-xl font-bold">No upcoming events right now.</h3>
          <p class="mt-2 text-sm text-midnight-stone">Check back for the next lineup.</p>
          <RouterLink to="/events" class="focus-midnight mt-5 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 px-5 text-sm font-bold hover:border-white/40">Explore Events <Icon icon="mdi:arrow-right" class="h-4 w-4" aria-hidden="true" /></RouterLink>
        </div>
      </div>
    </section>

    <section class="px-5 pb-24 sm:px-8 lg:px-12 lg:pb-32">
      <div data-reveal class="reveal-item final-cta relative mx-auto max-w-[1340px] overflow-hidden rounded-[28px] border border-white/10 bg-midnight-ember px-6 py-16 text-center sm:px-10 lg:py-24">
        <span class="absolute -left-5 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-midnight-ink" aria-hidden="true" /><span class="absolute -right-5 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-midnight-ink" aria-hidden="true" /><div class="absolute inset-x-10 top-6 border-t border-dashed border-white/30" aria-hidden="true" />
        <div class="relative mx-auto max-w-3xl"><p class="text-xs font-bold uppercase tracking-[0.18em] text-white/75">Your seat is waiting</p><h2 class="mt-5 text-[clamp(2.4rem,6vw,5.8rem)] font-black leading-[0.9] tracking-[-0.065em] text-white">Ready for something unforgettable?</h2><p class="mx-auto mt-6 max-w-xl text-base leading-7 text-white/80">Find the event that feels like yours, then book it in a few confident steps.</p><RouterLink to="/events" class="focus-midnight mt-8 inline-flex min-h-[52px] items-center gap-2 rounded-full bg-midnight-ink px-7 text-sm font-bold text-midnight-ivory transition hover:bg-midnight-surface">Explore Events <Icon icon="mdi:arrow-up-right" class="h-4 w-4" aria-hidden="true" /></RouterLink></div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import FeaturedEventCard from '@/components/landing/FeaturedEventCard.vue';
import ExperienceEventCard from '@/components/landing/ExperienceEventCard.vue';
import HeroTicket from '@/components/landing/HeroTicket.vue';
import { useEventStore } from '../event.store';

const eventStore = useEventStore();
const pageRoot = ref<HTMLElement | null>(null);
const heroReady = ref(false);
let revealObserver: IntersectionObserver | null = null;
const featuredEvents = computed(() => eventStore.events.slice(0, 3));
const experienceEvents = computed(() => eventStore.events
  .filter((event) => event.status === 'PUBLISHED' && Number.isFinite(Date.parse(event.startDate)) && Date.parse(event.startDate) > Date.now())
  .sort((a, b) => Date.parse(a.startDate) - Date.parse(b.startDate))
  .slice(0, 3));
const attendeeColors = ['#78DCCA', '#F7F3EC', '#FF9B75'];
const trustBenefits = [
  { icon: 'mdi:shield-lock-outline', label: 'Secure payments' },
  { icon: 'mdi:check-circle-outline', label: 'Instant confirmation' },
  { icon: 'mdi:tag-outline', label: 'Transparent pricing' },
  { icon: 'mdi:seat-outline', label: 'Easy seat selection' },
];
function setupReveal() {
  const elements = pageRoot.value?.querySelectorAll<HTMLElement>('[data-reveal]');
  if (!elements?.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    elements.forEach((element) => element.classList.add('is-visible'));
    return;
  }
  if (!revealObserver) revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver?.unobserve(entry.target);
    });
  }, { threshold: 0.14 });
  elements.forEach((element) => { if (!element.classList.contains('is-visible')) revealObserver?.observe(element); });
}

onMounted(async () => {
  eventStore.fetchEvents();
  await nextTick();
  window.requestAnimationFrame(() => { heroReady.value = true; });
  setupReveal();
});

watch(() => eventStore.loading, async (loading) => {
  if (!loading) { await nextTick(); setupReveal(); }
});

onBeforeUnmount(() => revealObserver?.disconnect());
</script>

<style scoped>
.experience-heading { font-size: clamp(2.4rem, 5vw, 4.75rem); }
.experience-all-action { transition: background-color 180ms ease, transform 180ms ease; }
.experience-all-action:hover { background-color: #ed4828; }
.experience-all-action:active { transform: scale(.985); }
.experience-all-arrow { transition: transform 180ms cubic-bezier(.2,.8,.2,1); }
.experience-all-action:hover .experience-all-arrow { transform: translateX(3px); }
.experience-secondary-reveal { transition-delay: 90ms; }
.experience-secondary-reveal:last-child { transition-delay: 170ms; }
@media (prefers-reduced-motion: reduce) { .experience-all-action, .experience-all-arrow, .experience-secondary-reveal { transition: none; transition-delay: 0ms; } .experience-all-action:active, .experience-all-action:hover .experience-all-arrow { transform: none; } }
</style>
