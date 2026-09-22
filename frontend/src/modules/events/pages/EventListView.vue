<template>
  <div class="event-discovery min-h-screen bg-midnight-ink text-midnight-ivory" :class="{ 'discovery-ready': pageReady }">
    <EventDiscoveryHeader />

    <section class="px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
      <div class="mx-auto max-w-[1440px]">
        <div class="discovery-enter discovery-delay-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
          <EventSearchBar :model-value="searchInput" @update:model-value="updateSearch" />
          <button type="button" class="focus-midnight inline-flex min-h-[58px] items-center justify-center gap-2 rounded-2xl border border-white/10 bg-midnight-surface px-5 text-sm font-extrabold lg:hidden" :aria-expanded="mobileFiltersOpen" aria-controls="mobile-event-filters" @click="mobileFiltersOpen = true">
            <Icon icon="mdi:tune-variant" class="h-5 w-5 text-midnight-mint" aria-hidden="true" /> Filters
            <span v-if="activeFilters.length" class="grid h-5 min-w-5 place-items-center rounded-full bg-midnight-ember px-1 text-[10px] text-white">{{ activeFilters.length }}</span>
          </button>
          <label class="hidden min-h-[58px] items-center gap-3 rounded-2xl border border-white/10 bg-midnight-surface px-4 lg:flex">
            <span class="text-[10px] font-extrabold uppercase tracking-[0.14em] text-midnight-stone">Sort</span>
            <select :value="sortBy" class="bg-transparent text-sm font-bold text-midnight-ivory outline-none" aria-label="Sort events" @change="onSortChange">
              <option value="upcoming">Upcoming first</option><option value="newest">Recently added</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option>
            </select>
          </label>
        </div>

        <div class="discovery-enter discovery-delay-5 mt-4 hidden rounded-[20px] border border-white/10 bg-midnight-surface p-5 lg:block">
          <EventFilterControls v-model:date="dateFilter" v-model:location="locationFilter" v-model:price="priceFilter" v-model:availability="availabilityFilter" :locations="locations" />
        </div>

        <div class="mt-5 min-h-9"><ActiveFilterChips :filters="activeFilters" @remove="removeFilter" @clear="clearFilters" /></div>

        <div class="mt-8 flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="text-[10px] font-extrabold uppercase tracking-[0.16em] text-midnight-mint">The current lineup</p>
            <h2 class="mt-2 text-3xl font-extrabold tracking-[-0.045em] sm:text-4xl">Events worth showing up for.</h2>
          </div>
          <div class="flex items-center justify-between gap-4 sm:justify-end">
            <p class="text-sm font-semibold text-midnight-stone" aria-live="polite"><strong class="text-midnight-ivory">{{ filteredEvents.length }}</strong> {{ filteredEvents.length === 1 ? 'event' : 'events' }}</p>
            <label class="flex items-center gap-2 lg:hidden"><span class="sr-only">Sort events</span><select :value="sortBy" class="rounded-xl border border-white/10 bg-midnight-surface px-3 py-2 text-xs font-bold text-midnight-ivory outline-none focus-visible:ring-2 focus-visible:ring-midnight-mint" @change="onSortChange"><option value="upcoming">Upcoming</option><option value="newest">Newest</option><option value="price-low">Lowest price</option><option value="price-high">Highest price</option></select></label>
          </div>
        </div>

        <div v-if="eventStore.loading" class="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4" aria-label="Loading events" aria-live="polite"><EventCardSkeleton v-for="index in 8" :key="index" /></div>

        <EventEmptyState v-else-if="eventStore.error" class="mt-7" icon="mdi:calendar-remove-outline" title="The lineup didn’t load." copy="We couldn’t reach the event list right now. Check your connection and try once more." action-label="Try again" @action="loadEvents" />

        <EventEmptyState v-else-if="!eventStore.events.length" class="mt-7" icon="mdi:ticket-outline" title="The next lineup is taking shape." copy="There are no published events right now. Check back soon for fresh experiences." />

        <EventEmptyState v-else-if="!filteredEvents.length" class="mt-7" icon="mdi:magnify-close" title="No events match those filters." copy="Try a different date, location, or price range to see more of the lineup." action-label="Clear filters" @action="clearFilters" />

        <div v-else class="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          <div v-for="(event, index) in filteredEvents" :key="event.id" :class="{ 'initial-card-reveal': initialRevealActive }" :style="initialRevealActive ? { animationDelay: `${Math.min(index, 7) * 55}ms` } : undefined">
            <EventCard :event="event" :index="index" />
          </div>
        </div>
      </div>
    </section>

    <MobileFilterPanel :open="mobileFiltersOpen" :result-count="filteredEvents.length" @close="mobileFiltersOpen = false">
      <div id="mobile-event-filters">
        <EventFilterControls v-model:date="dateFilter" v-model:location="locationFilter" v-model:price="priceFilter" v-model:availability="availabilityFilter" :locations="locations" compact />
        <button v-if="activeFilters.length" type="button" class="focus-midnight mt-6 text-sm font-bold text-midnight-stone underline underline-offset-4" @click="clearFilters">Clear all filters</button>
      </div>
    </MobileFilterPanel>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';

import ActiveFilterChips from '@/components/events/ActiveFilterChips.vue';
import EventCard from '@/components/events/EventCard.vue';
import EventCardSkeleton from '@/components/events/EventCardSkeleton.vue';
import EventDiscoveryHeader from '@/components/events/EventDiscoveryHeader.vue';
import EventEmptyState from '@/components/events/EventEmptyState.vue';
import EventFilterControls from '@/components/events/EventFilterControls.vue';
import EventSearchBar from '@/components/events/EventSearchBar.vue';
import MobileFilterPanel from '@/components/events/MobileFilterPanel.vue';
import { useEventStore } from '../event.store';
import { useEventDiscovery, type EventSort } from '../useEventDiscovery';

const eventStore = useEventStore();
const pageReady = ref(false);
const mobileFiltersOpen = ref(false);
const initialRevealActive = ref(false);
let revealTimer: ReturnType<typeof setTimeout> | undefined;
const sourceEvents = computed(() => eventStore.events);
const {
  searchInput,
  dateFilter,
  locationFilter,
  priceFilter,
  availabilityFilter,
  sortBy,
  locations,
  filteredEvents,
  activeFilters,
  updateSearch,
  removeFilter,
  clearFilters,
} = useEventDiscovery(sourceEvents);

function onSortChange(event: Event) {
  sortBy.value = (event.target as HTMLSelectElement).value as EventSort;
}

async function loadEvents() {
  await eventStore.fetchEvents();
  if (!eventStore.error && eventStore.events.length) {
    initialRevealActive.value = true;
    await nextTick();
    if (revealTimer) clearTimeout(revealTimer);
    revealTimer = setTimeout(() => { initialRevealActive.value = false; }, 850);
  }
}

onMounted(() => {
  window.requestAnimationFrame(() => { pageReady.value = true; });
  loadEvents();
});

onBeforeUnmount(() => {
  if (revealTimer) clearTimeout(revealTimer);
});
</script>
