import { computed, onBeforeUnmount, ref, type ComputedRef } from 'vue';

import type { EventItem } from '@/services/apiTypes';

export type DateFilter = 'all' | 'upcoming' | 'next-seven-days' | 'this-month';
export type PriceFilter = 'all' | 'under-500' | '500-1000' | 'over-1000';
export type AvailabilityFilter = 'all' | 'available' | 'selling-fast' | 'sold-out';
export type EventSort = 'upcoming' | 'newest' | 'price-low' | 'price-high';
export type FilterKey = 'search' | 'date' | 'location' | 'price' | 'availability';

export interface ActiveEventFilter {
  key: FilterKey;
  label: string;
}

const dateLabels: Record<Exclude<DateFilter, 'all'>, string> = {
  upcoming: 'Upcoming',
  'next-seven-days': 'Next 7 days',
  'this-month': 'This month',
};

const priceLabels: Record<Exclude<PriceFilter, 'all'>, string> = {
  'under-500': 'Under ₹500',
  '500-1000': '₹500–₹1,000',
  'over-1000': 'Over ₹1,000',
};

const availabilityLabels: Record<Exclude<AvailabilityFilter, 'all'>, string> = {
  available: 'Seats available',
  'selling-fast': 'Selling fast',
  'sold-out': 'Sold out',
};

export function useEventDiscovery(events: ComputedRef<EventItem[]>) {
  const searchInput = ref('');
  const searchQuery = ref('');
  const dateFilter = ref<DateFilter>('all');
  const locationFilter = ref('all');
  const priceFilter = ref<PriceFilter>('all');
  const availabilityFilter = ref<AvailabilityFilter>('all');
  const sortBy = ref<EventSort>('upcoming');
  let searchTimer: ReturnType<typeof setTimeout> | undefined;

  const locations = computed(() => [...new Set(events.value.map((event) => event.location).filter(Boolean))].sort((a, b) => a.localeCompare(b)));

  const filteredEvents = computed(() => {
    const query = searchQuery.value.trim().toLocaleLowerCase();
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysFromNow = new Date(todayStart);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const matches = events.value.filter((event) => {
      const eventDate = new Date(event.startDate);
      const searchableText = `${event.title} ${event.description} ${event.location}`.toLocaleLowerCase();
      const availabilityPercent = event.totalSeats > 0 ? (event.availableSeats / event.totalSeats) * 100 : 0;

      if (query && !searchableText.includes(query)) return false;
      if (locationFilter.value !== 'all' && event.location !== locationFilter.value) return false;
      if (dateFilter.value === 'upcoming' && eventDate < todayStart) return false;
      if (dateFilter.value === 'next-seven-days' && (eventDate < todayStart || eventDate >= sevenDaysFromNow)) return false;
      if (dateFilter.value === 'this-month' && (eventDate < todayStart || eventDate.getMonth() !== now.getMonth() || eventDate.getFullYear() !== now.getFullYear())) return false;
      if (priceFilter.value === 'under-500' && event.seatPriceInPaise >= 50_000) return false;
      if (priceFilter.value === '500-1000' && (event.seatPriceInPaise < 50_000 || event.seatPriceInPaise > 100_000)) return false;
      if (priceFilter.value === 'over-1000' && event.seatPriceInPaise <= 100_000) return false;
      if (availabilityFilter.value === 'available' && event.availableSeats <= 0) return false;
      if (availabilityFilter.value === 'selling-fast' && (event.availableSeats <= 0 || availabilityPercent > 20)) return false;
      if (availabilityFilter.value === 'sold-out' && event.availableSeats !== 0) return false;

      return true;
    });

    return [...matches].sort((a, b) => {
      if (sortBy.value === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy.value === 'price-low') return a.seatPriceInPaise - b.seatPriceInPaise;
      if (sortBy.value === 'price-high') return b.seatPriceInPaise - a.seatPriceInPaise;
      const currentTime = Date.now();
      const aTime = new Date(a.startDate).getTime();
      const bTime = new Date(b.startDate).getTime();
      const aIsPast = aTime < currentTime;
      const bIsPast = bTime < currentTime;
      if (aIsPast !== bIsPast) return aIsPast ? 1 : -1;
      return aIsPast ? bTime - aTime : aTime - bTime;
    });
  });

  const activeFilters = computed<ActiveEventFilter[]>(() => {
    const filters: ActiveEventFilter[] = [];
    if (searchQuery.value.trim()) filters.push({ key: 'search', label: `“${searchQuery.value.trim()}”` });
    if (dateFilter.value !== 'all') filters.push({ key: 'date', label: dateLabels[dateFilter.value] });
    if (locationFilter.value !== 'all') filters.push({ key: 'location', label: locationFilter.value });
    if (priceFilter.value !== 'all') filters.push({ key: 'price', label: priceLabels[priceFilter.value] });
    if (availabilityFilter.value !== 'all') filters.push({ key: 'availability', label: availabilityLabels[availabilityFilter.value] });
    return filters;
  });

  function updateSearch(value: string) {
    searchInput.value = value;
    if (searchTimer) clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      searchQuery.value = value;
    }, 250);
  }

  function removeFilter(key: FilterKey) {
    if (key === 'search') {
      if (searchTimer) clearTimeout(searchTimer);
      searchInput.value = '';
      searchQuery.value = '';
    }
    if (key === 'date') dateFilter.value = 'all';
    if (key === 'location') locationFilter.value = 'all';
    if (key === 'price') priceFilter.value = 'all';
    if (key === 'availability') availabilityFilter.value = 'all';
  }

  function clearFilters() {
    if (searchTimer) clearTimeout(searchTimer);
    searchInput.value = '';
    searchQuery.value = '';
    dateFilter.value = 'all';
    locationFilter.value = 'all';
    priceFilter.value = 'all';
    availabilityFilter.value = 'all';
  }

  onBeforeUnmount(() => {
    if (searchTimer) clearTimeout(searchTimer);
  });

  return {
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
  };
}
