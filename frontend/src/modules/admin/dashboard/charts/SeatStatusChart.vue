<template>
  <AnalyticsChartCard
    eyebrow="Inventory capacity"
    title="Seat Status"
    type="donut"
    :height="245"
    :series="series"
    :options="options"
    :summary="`Available ${data.available}, reserved ${data.reserved}, booked ${data.booked} seats.`"
  >
    <div class="mt-3 grid grid-cols-3 gap-2">
      <div v-for="item in seatItems" :key="item.label" class="rounded-md border border-admin-border bg-admin-canvas px-2 py-2">
        <p class="text-[10px] font-semibold text-admin-secondary">{{ item.label }}</p>
        <p class="mt-1 font-mono text-sm font-bold tabular-nums" :class="item.className">{{ formatCount(item.value) }}</p>
      </div>
    </div>
  </AnalyticsChartCard>
</template>

<script setup lang="ts">
import type { ApexNonAxisChartSeries, ApexOptions } from 'apexcharts';
import { computed } from 'vue';

import AnalyticsChartCard from '@/components/admin/AnalyticsChartCard.vue';
import type { SeatStatusAnalytics } from '../../admin.api';

const props = defineProps<{
  data: SeatStatusAnalytics;
}>();

const totalSeats = computed(() => props.data.available + props.data.reserved + props.data.booked);

const seatItems = computed(() => [
  { label: 'Available', value: props.data.available, className: 'text-admin-success' },
  { label: 'Reserved', value: props.data.reserved, className: 'text-admin-warning' },
  { label: 'Booked', value: props.data.booked, className: 'text-admin-error' },
]);

const series = computed<ApexNonAxisChartSeries>(() => seatItems.value.map((item) => item.value));

const options = computed<ApexOptions>(() => ({
  colors: ['#3F7652', '#9A6700', '#B54747'],
  dataLabels: {
    enabled: true,
    formatter: (_value, options) => {
      const item = seatItems.value[options?.seriesIndex ?? 0];
      return totalSeats.value && item ? `${Math.round((item.value / totalSeats.value) * 100)}%` : '0%';
    },
    style: {
      colors: ['#121221'],
      fontFamily: 'Space Mono, monospace',
      fontSize: '11px',
      fontWeight: 700,
    },
  },
  labels: ['Available', 'Reserved', 'Booked'],
  plotOptions: {
    pie: {
      donut: {
        labels: {
          show: true,
          name: { color: '#6B7280', fontFamily: 'Manrope, sans-serif' },
          value: {
            color: '#171717',
            fontFamily: 'Manrope, sans-serif',
            formatter: (value) => formatCount(Number(value)),
          },
          total: {
            show: true,
            color: '#171717',
            fontFamily: 'Manrope, sans-serif',
            label: 'Total',
            formatter: () => formatCount(totalSeats.value),
          },
        },
        size: '68%',
      },
    },
  },
  tooltip: {
    y: {
      formatter: (_value, context) => {
        const item = seatItems.value[context?.seriesIndex ?? 0];
        return item ? `${formatCount(item.value)} seats` : '0 seats';
      },
    },
  },
}));

function formatCount(value: number) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value);
}
</script>
