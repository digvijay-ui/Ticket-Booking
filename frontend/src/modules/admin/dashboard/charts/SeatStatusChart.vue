<template>
  <AnalyticsChartCard
    eyebrow="Inventory capacity"
    title="Seat Status"
    type="radialBar"
    :height="245"
    :series="series"
    :options="options"
  >
    <div class="mt-3 grid grid-cols-3 gap-2">
      <div v-for="item in seatItems" :key="item.label" class="rounded-sm border border-ticketGold/15 bg-paperCream/5 px-2 py-2">
        <p class="font-mono text-[9px] font-bold uppercase text-ticketGold/70">{{ item.label }}</p>
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
  { label: 'Available', value: props.data.available, className: 'text-[#5eead4]' },
  { label: 'Reserved', value: props.data.reserved, className: 'text-[#F2CC8F]' },
  { label: 'Booked', value: props.data.booked, className: 'text-[#fb7185]' },
]);

const series = computed<ApexNonAxisChartSeries>(() => {
  if (!totalSeats.value) {
    return [0, 0, 0];
  }

  return seatItems.value.map((item) => Math.round((item.value / totalSeats.value) * 100));
});

const options = computed<ApexOptions>(() => ({
  colors: ['#5eead4', '#F2CC8F', '#fb7185'],
  labels: ['Available', 'Reserved', 'Booked'],
  plotOptions: {
    radialBar: {
      hollow: {
        margin: 4,
        size: '28%',
      },
      track: {
        background: 'rgba(247, 241, 227, 0.16)',
        margin: 6,
        strokeWidth: '94%',
      },
      dataLabels: {
        name: {
          color: '#F2CC8F',
          fontFamily: 'Space Mono, monospace',
          fontSize: '11px',
          offsetY: -4,
        },
        value: {
          color: '#f7f1e3',
          fontFamily: 'Space Mono, monospace',
          fontSize: '18px',
          formatter: (value) => `${Math.round(Number(value))}%`,
          offsetY: 2,
        },
        total: {
          show: true,
          color: '#f7f1e3',
          fontFamily: 'Space Mono, monospace',
          fontSize: '13px',
          label: 'Total',
          formatter: () => formatCount(totalSeats.value),
        },
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
