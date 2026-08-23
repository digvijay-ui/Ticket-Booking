<template>
  <AnalyticsChartCard
    eyebrow="Paid bookings"
    title="Revenue Trend"
    type="line"
    :series="series"
    :options="options"
    :meta="range"
  />
</template>

<script setup lang="ts">
import type { ApexAxisChartSeries, ApexOptions } from 'apexcharts';
import { computed } from 'vue';

import AnalyticsChartCard from '@/components/admin/AnalyticsChartCard.vue';
import { formatINR } from '@/utils/money';
import type { AnalyticsRange, ChartSeriesData } from '../../admin.api';

const props = defineProps<{
  data: ChartSeriesData;
  range: AnalyticsRange;
}>();

const series = computed<ApexAxisChartSeries>(() => [
  {
    name: 'Revenue',
    data: props.data.values,
  },
]);

const options = computed<ApexOptions>(() => ({
  colors: ['#5eead4'],
  fill: {
    gradient: {
      opacityFrom: 0.42,
      opacityTo: 0.08,
      shadeIntensity: 0.35,
      type: 'vertical',
    },
    type: 'gradient',
  },
  grid: {
    borderColor: 'rgba(242, 204, 143, 0.18)',
    strokeDashArray: 4,
  },
  markers: {
    colors: ['#F2CC8F'],
    hover: { size: 7 },
    size: 5,
    strokeColors: '#241f2f',
    strokeWidth: 3,
  },
  stroke: {
    curve: 'smooth',
    lineCap: 'round',
    width: 4,
  },
  tooltip: {
    y: {
      formatter: (value) => formatINR(Math.round(Number(value))),
    },
  },
  xaxis: {
    categories: props.data.labels,
    tickAmount: 6,
  },
  yaxis: {
    labels: {
      formatter: (value) => formatShortINR(Number(value)),
    },
  },
}));

function formatShortINR(value: number) {
  const rupees = value / 100;

  if (rupees >= 10000000) {
    return `₹${Math.round(rupees / 100000) / 100}Cr`;
  }

  if (rupees >= 100000) {
    return `₹${Math.round(rupees / 1000) / 100}L`;
  }

  if (rupees >= 1000) {
    return `₹${Math.round(rupees / 100) / 10}K`;
  }

  return `₹${Math.round(rupees)}`;
}
</script>
