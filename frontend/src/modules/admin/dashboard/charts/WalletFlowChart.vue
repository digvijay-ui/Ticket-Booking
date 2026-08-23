<template>
  <AnalyticsChartCard
    eyebrow="Wallet ledger"
    title="Wallet Flow"
    type="bar"
    :series="series"
    :options="options"
  />
</template>

<script setup lang="ts">
import type { ApexAxisChartSeries, ApexOptions } from 'apexcharts';
import { computed } from 'vue';

import AnalyticsChartCard from '@/components/admin/AnalyticsChartCard.vue';
import { formatINR } from '@/utils/money';
import type { WalletFlowAnalytics } from '../../admin.api';

const props = defineProps<{
  data: WalletFlowAnalytics;
}>();

const series = computed<ApexAxisChartSeries>(() => [
  {
    name: 'Wallet Flow',
    data: [props.data.creditInPaise, props.data.debitInPaise, props.data.refundInPaise],
  },
]);

const options = computed<ApexOptions>(() => ({
  colors: ['#5eead4', '#fb7185', '#F2CC8F'],
  grid: {
    borderColor: 'rgba(242, 204, 143, 0.18)',
    strokeDashArray: 4,
  },
  plotOptions: {
    bar: {
      borderRadius: 4,
      columnWidth: '42%',
      distributed: true,
    },
  },
  tooltip: {
    y: {
      formatter: (value) => formatINR(Math.round(Number(value))),
    },
  },
  xaxis: {
    categories: ['Credits', 'Debits', 'Refunds'],
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
