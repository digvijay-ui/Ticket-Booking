<template>
  <div class="grid gap-5 sm:grid-cols-2" :class="compact ? '' : 'lg:grid-cols-4'">
    <label class="filter-field">
      <span>Date</span>
      <select :value="date" @change="$emit('update:date', ($event.target as HTMLSelectElement).value as DateFilter)">
        <option value="all">Any date</option><option value="upcoming">Upcoming</option><option value="next-seven-days">Next 7 days</option><option value="this-month">This month</option>
      </select>
    </label>
    <label class="filter-field">
      <span>Location</span>
      <select :value="location" @change="$emit('update:location', ($event.target as HTMLSelectElement).value)">
        <option value="all">All locations</option><option v-for="option in locations" :key="option" :value="option">{{ option }}</option>
      </select>
    </label>
    <label class="filter-field">
      <span>Price</span>
      <select :value="price" @change="$emit('update:price', ($event.target as HTMLSelectElement).value as PriceFilter)">
        <option value="all">Any price</option><option value="under-500">Under ₹500</option><option value="500-1000">₹500–₹1,000</option><option value="over-1000">Over ₹1,000</option>
      </select>
    </label>
    <label class="filter-field">
      <span>Availability</span>
      <select :value="availability" @change="$emit('update:availability', ($event.target as HTMLSelectElement).value as AvailabilityFilter)">
        <option value="all">Any availability</option><option value="available">Seats available</option><option value="selling-fast">Selling fast</option><option value="sold-out">Sold out</option>
      </select>
    </label>
  </div>
</template>

<script setup lang="ts">
import type { AvailabilityFilter, DateFilter, PriceFilter } from '@/modules/events/useEventDiscovery';

withDefaults(defineProps<{
  date: DateFilter;
  location: string;
  price: PriceFilter;
  availability: AvailabilityFilter;
  locations: string[];
  compact?: boolean;
}>(), { compact: false });

defineEmits<{
  'update:date': [value: DateFilter];
  'update:location': [value: string];
  'update:price': [value: PriceFilter];
  'update:availability': [value: AvailabilityFilter];
}>();
</script>

<style scoped>
.filter-field { display: grid; gap: 0.5rem; }
.filter-field > span { font-size: 0.625rem; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; color: var(--midnight-stone); }
.filter-field select { width: 100%; min-height: 2.75rem; border: 1px solid rgb(247 243 236 / 0.12); border-radius: 0.75rem; background-color: var(--midnight-ink); padding: 0.65rem 0.8rem; font-size: 0.8125rem; font-weight: 650; color: var(--midnight-ivory); color-scheme: dark; }
.filter-field select:focus-visible { outline: 2px solid var(--midnight-mint); outline-offset: 3px; }
</style>
