<template>
  <AnalyticsChartCard
    eyebrow="Booking split"
    title="Booking Status"
    type="donut"
    :series="series"
    :options="options"
  />
</template>

<script setup lang="ts">
import type { ApexNonAxisChartSeries, ApexOptions } from 'apexcharts';
import { computed } from 'vue';

import AnalyticsChartCard from '@/components/admin/AnalyticsChartCard.vue';
import type { BookingStatusAnalytics } from '../../admin.api';

const props = defineProps<{
  data: BookingStatusAnalytics;
}>();

const series = computed<ApexNonAxisChartSeries>(() => [props.data.confirmed, props.data.cancelled, props.data.refunded]);
const totalBookings = computed(() => props.data.confirmed + props.data.cancelled + props.data.refunded);

const options = computed<ApexOptions>(() => ({
  colors: ['#5eead4', '#fb7185', '#F2CC8F'],
  dataLabels: {
    enabled: true,
    formatter: (_value, options) => {
      const values = [props.data.confirmed, props.data.cancelled, props.data.refunded];
      const value = values[options?.seriesIndex ?? 0] || 0;
      return totalBookings.value ? `${Math.round((value / totalBookings.value) * 100)}%` : '0%';
    },
    style: {
      colors: ['#121221'],
      fontFamily: 'Space Mono, monospace',
      fontSize: '11px',
      fontWeight: 700,
    },
  },
  labels: ['Confirmed', 'Cancelled', 'Refunded'],
  plotOptions: {
    pie: {
      donut: {
        labels: {
          show: true,
          name: { color: '#F2CC8F', fontFamily: 'Space Mono, monospace' },
          value: {
            color: '#f7f1e3',
            fontFamily: 'Space Mono, monospace',
            formatter: (value) => formatCount(Number(value)),
          },
        },
        size: '68%',
      },
    },
  },
}));

function formatCount(value: number) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value);
}
</script>
