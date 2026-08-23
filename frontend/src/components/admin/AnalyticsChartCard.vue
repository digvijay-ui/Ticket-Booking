<template>
  <article class="relative overflow-hidden rounded-md border-2 border-ticketGold/25 bg-[#241f2f] p-4 text-paperCream shadow-[8px_8px_0_rgba(8,8,15,0.35)] sm:p-5">
    <span class="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-inkNight" aria-hidden="true" />

    <div class="mb-4 flex min-w-0 items-start justify-between gap-3">
      <div class="min-w-0">
        <p class="font-mono text-[10px] font-bold uppercase text-ticketGold/75">{{ eyebrow }}</p>
        <h2 class="mt-1 truncate font-display text-2xl uppercase leading-none tracking-normal text-paperCream sm:text-3xl">{{ title }}</h2>
      </div>
      <span v-if="meta" class="shrink-0 rounded-sm border border-ticketGold/30 bg-ticketGold/10 px-2 py-1 font-mono text-[10px] font-bold uppercase text-ticketGold">
        {{ meta }}
      </span>
    </div>

    <div class="min-h-[220px]">
      <VueApexCharts v-if="hasData" :height="height" :options="mergedOptions" :series="series" :type="type" />
      <div v-else class="flex h-[220px] items-center justify-center rounded-sm border border-ticketGold/15 bg-paperCream/5 text-center">
        <p class="font-mono text-xs font-bold uppercase text-paperCream/55">No analytics data</p>
      </div>
    </div>

    <slot />
  </article>
</template>

<script setup lang="ts">
import type { ApexAxisChartSeries, ApexNonAxisChartSeries, ApexOptions } from 'apexcharts';
import { computed } from 'vue';
import VueApexCharts from 'vue3-apexcharts';

const props = withDefaults(
  defineProps<{
    eyebrow: string;
    title: string;
    type: 'line' | 'bar' | 'donut' | 'radialBar';
    series: ApexAxisChartSeries | ApexNonAxisChartSeries;
    options: ApexOptions;
    height?: number;
    meta?: string;
  }>(),
  {
    height: 220,
    meta: '',
  },
);

const hasData = computed(() =>
  props.series.some((seriesItem: number | ApexAxisChartSeries[number]) => {
    if (typeof seriesItem === 'number') {
      return seriesItem > 0;
    }

    return Array.isArray(seriesItem.data) && seriesItem.data.some((value: unknown) => Number(value) > 0);
  }),
);

const mergedOptions = computed<ApexOptions>(() => ({
  chart: {
    background: 'transparent',
    fontFamily: 'Space Mono, ui-monospace, SFMono-Regular, Menlo, monospace',
    sparkline: { enabled: false },
    toolbar: { show: false },
    zoom: { enabled: false },
    ...props.options.chart,
  },
  colors: ['#2EC4B6', '#E07A5F', '#F2CC8F', '#f97316'],
  dataLabels: {
    enabled: false,
    ...props.options.dataLabels,
  },
  legend: {
    fontFamily: 'Space Mono, ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: '11px',
    labels: { colors: '#f7f1e3' },
    markers: { strokeWidth: 0 },
    ...props.options.legend,
  },
  stroke: {
    curve: 'smooth',
    width: 3,
    ...props.options.stroke,
  },
  theme: {
    mode: 'dark',
    ...props.options.theme,
  },
  tooltip: {
    theme: 'dark',
    style: {
      fontFamily: 'Space Mono, ui-monospace, SFMono-Regular, Menlo, monospace',
      fontSize: '11px',
    },
    ...props.options.tooltip,
  },
  xaxis: {
    axisBorder: { color: 'rgba(230, 227, 208, 0.14)' },
    axisTicks: { color: 'rgba(230, 227, 208, 0.14)' },
    labels: {
      style: {
        colors: '#f2cc8f',
        fontFamily: 'Space Mono, ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: '10px',
      },
    },
    ...props.options.xaxis,
  },
  yaxis: {
    labels: {
      style: {
        colors: '#f2cc8f',
        fontFamily: 'Space Mono, ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: '10px',
      },
    },
    ...props.options.yaxis,
  },
  ...props.options,
}));
</script>
