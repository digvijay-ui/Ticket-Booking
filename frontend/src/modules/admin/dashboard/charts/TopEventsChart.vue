<template>
  <AnalyticsChartCard
    eyebrow="Event comparison"
    title="Top-performing events"
    type="bar"
    :height="Math.max(260, data.length * 52)"
    :series="series"
    :options="options"
    meta="By revenue"
    :summary="summary"
  >
    <p class="mt-3 text-sm text-admin-secondary">
      {{ summary }}
    </p>
  </AnalyticsChartCard>
</template>

<script setup lang="ts">
import type { ApexAxisChartSeries, ApexOptions } from 'apexcharts';
import { computed } from 'vue';

import AnalyticsChartCard from '@/components/admin/AnalyticsChartCard.vue';
import { formatINR } from '@/utils/money';
import type { TopEventAnalytics } from '../../admin.api';

const props = defineProps<{ data: TopEventAnalytics[] }>();

const series = computed<ApexAxisChartSeries>(() => [
  {
    name: 'Revenue',
    data: props.data.map((event) => event.revenueInPaise),
  },
]);

const summary = computed(() => {
  const leader = props.data[0];
  return leader
    ? `${leader.title} leads with ${formatINR(leader.revenueInPaise)} from ${formatCount(leader.totalBookings)} bookings.`
    : 'No event performance data is available yet.';
});

const options = computed<ApexOptions>(() => ({
  colors: ['#111111'],
  grid: { borderColor: '#E5E7EB', strokeDashArray: 4 },
  plotOptions: {
    bar: {
      borderRadius: 2,
      horizontal: true,
      barHeight: '55%',
    },
  },
  tooltip: {
    y: { formatter: (value) => formatINR(Math.round(Number(value))) },
  },
  xaxis: {
    categories: props.data.map((event) => event.title),
    labels: { formatter: (value) => formatShortINR(Number(value)) },
  },
  yaxis: {
    labels: {
      maxWidth: 180,
      style: { colors: '#A8A29E', fontFamily: 'Manrope, sans-serif', fontSize: '12px', fontWeight: 600 },
    },
  },
}));

function formatCount(value: number) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value);
}

function formatShortINR(value: number) {
  const rupees = value / 100;
  if (rupees >= 10000000) return `₹${Math.round(rupees / 100000) / 100}Cr`;
  if (rupees >= 100000) return `₹${Math.round(rupees / 1000) / 100}L`;
  if (rupees >= 1000) return `₹${Math.round(rupees / 100) / 10}K`;
  return `₹${Math.round(rupees)}`;
}
</script>
