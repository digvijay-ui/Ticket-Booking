<template>
  <article class="admin-chart-card admin-ticket-card p-4 sm:p-5">
    <span class="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border border-admin-border bg-admin-canvas" aria-hidden="true" />

    <div class="mb-4 flex min-w-0 items-start justify-between gap-3">
      <div class="min-w-0">
        <p class="text-xs font-medium text-admin-secondary">{{ eyebrow }}</p>
        <h2 :id="`${chartId}-title`" class="mt-1 truncate text-lg font-semibold tracking-[-0.02em] text-admin-text sm:text-xl">{{ title }}</h2>
      </div>
      <span v-if="meta" class="shrink-0 rounded-md border border-admin-border bg-admin-canvas px-2 py-1 text-[10px] font-medium text-admin-secondary">
        {{ meta }}
      </span>
    </div>

    <div ref="chartFrame" class="admin-chart-surface min-h-[220px]" role="img" :aria-labelledby="`${chartId}-title ${chartId}-summary`">
      <p :id="`${chartId}-summary`" class="sr-only">{{ summary || fallbackSummary }}</p>
      <VueApexCharts
        v-if="canRenderChart"
        class="admin-chart-enter"
        :height="height"
        :options="mergedOptions"
        :series="series"
        :type="type"
        :width="chartWidth ?? '100%'"
      />
      <div v-else class="flex h-[220px] items-center justify-center rounded-md border border-dashed border-admin-border bg-admin-canvas text-center">
        <p class="text-xs font-medium text-admin-secondary">No analytics data</p>
      </div>
    </div>

    <slot />
  </article>
</template>

<script setup lang="ts">
import type { ApexAxisChartSeries, ApexNonAxisChartSeries, ApexOptions } from 'apexcharts';
import 'apexcharts/bar';
import 'apexcharts/donut';
import 'apexcharts/features/legend';
import 'apexcharts/line';
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import VueApexCharts from 'vue3-apexcharts/core';

const props = withDefaults(
  defineProps<{
    eyebrow: string;
    title: string;
    type: 'line' | 'bar' | 'donut';
    series: ApexAxisChartSeries | ApexNonAxisChartSeries;
    options: ApexOptions;
    height?: number;
    meta?: string;
    summary?: string;
  }>(),
  {
    height: 220,
    meta: '',
    summary: '',
  },
);

const chartFrame = ref<HTMLElement | null>(null);
const chartWidth = ref<number | null>(null);
const devicePixelRatio = ref(1);
const isMounted = ref(false);
const reduceMotion = ref(false);
const chartId = `admin-chart-${Math.random().toString(36).slice(2, 10)}`;
let resizeObserver: ResizeObserver | null = null;
let motionQuery: MediaQueryList | null = null;

const hasData = computed(() =>
  props.series.some((seriesItem: number | ApexAxisChartSeries[number]) => {
    if (typeof seriesItem === 'number') {
      return seriesItem > 0;
    }

    return Array.isArray(seriesItem.data) && seriesItem.data.some((value: unknown) => Number(value) > 0);
  }),
);

const canRenderChart = computed(() => isMounted.value && hasData.value && Boolean(chartWidth.value));
const fallbackSummary = computed(() => hasData.value
  ? `${props.title} visualization. Use the accompanying page totals for exact values.`
  : `No ${props.title.toLowerCase()} data is available.`);

const mergedOptions = computed<ApexOptions>(() => ({
  ...props.options,
  chart: {
    animations: {
      enabled: !reduceMotion.value,
      easing: 'easeout',
      speed: 420,
      animateGradually: { enabled: !reduceMotion.value, delay: 45 },
      dynamicAnimation: { enabled: !reduceMotion.value, speed: 260 },
    },
    background: 'transparent',
    fontFamily: 'Manrope, Work Sans, system-ui, sans-serif',
    parentHeightOffset: 0,
    redrawOnParentResize: true,
    redrawOnWindowResize: true,
    id: chartId,
    sparkline: { enabled: false },
    toolbar: { show: false },
    zoom: { enabled: false },
    ...props.options.chart,
  },
  colors: props.options.colors ?? ['#111111', '#525252', '#9CA3AF', '#D1D5DB'],
  dataLabels: {
    enabled: false,
    ...props.options.dataLabels,
  },
  legend: {
    fontFamily: 'Manrope, Work Sans, system-ui, sans-serif',
    fontSize: '11px',
    labels: { colors: '#6B7280' },
    markers: { strokeWidth: 0 },
    ...props.options.legend,
  },
  stroke: {
    curve: 'smooth',
    width: 3,
    ...props.options.stroke,
  },
  theme: {
    mode: 'light',
    ...props.options.theme,
  },
  tooltip: {
    theme: 'light',
    style: {
      fontFamily: 'Space Mono, ui-monospace, SFMono-Regular, Menlo, monospace',
      fontSize: '12px',
    },
    ...props.options.tooltip,
  },
  xaxis: {
    axisBorder: { color: '#E5E7EB' },
    axisTicks: { color: '#E5E7EB' },
    labels: {
      style: {
        colors: '#6B7280',
        fontFamily: 'Manrope, Work Sans, system-ui, sans-serif',
        fontSize: '12px',
        fontWeight: 700,
      },
    },
    ...props.options.xaxis,
  },
  yaxis: {
    labels: {
      style: {
        colors: '#6B7280',
        fontFamily: 'Manrope, Work Sans, system-ui, sans-serif',
        fontSize: '12px',
        fontWeight: 700,
      },
    },
    ...props.options.yaxis,
  },
}));

async function syncChartWidth() {
  await nextTick();

  if (!chartFrame.value) {
    chartWidth.value = null;
    return;
  }

  const width = chartFrame.value.getBoundingClientRect().width;
  const ratio = window.devicePixelRatio || 1;
  devicePixelRatio.value = ratio;
  chartWidth.value = width > 0 ? Math.max(1, Math.round(width * ratio) / ratio) : null;
}

onMounted(() => {
  isMounted.value = true;
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  reduceMotion.value = motionQuery.matches;
  motionQuery.addEventListener('change', syncMotionPreference);
  void syncChartWidth();
  resizeObserver = new ResizeObserver(syncChartWidth);

  if (chartFrame.value) {
    resizeObserver.observe(chartFrame.value);
  }

  window.addEventListener('resize', syncChartWidth);
});

onBeforeUnmount(() => {
  isMounted.value = false;
  resizeObserver?.disconnect();
  window.removeEventListener('resize', syncChartWidth);
  motionQuery?.removeEventListener('change', syncMotionPreference);
});

function syncMotionPreference(event: MediaQueryListEvent) {
  reduceMotion.value = event.matches;
}
</script>

<style scoped>
.admin-chart-enter {
  animation: admin-chart-fade 180ms ease-out both;
}

@keyframes admin-chart-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .admin-chart-enter { animation: none; }
}

.admin-chart-surface {
  transform: none;
  text-rendering: geometricPrecision;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.admin-chart-surface :deep(.apexcharts-canvas),
.admin-chart-surface :deep(.apexcharts-svg) {
  transform: none !important;
  text-rendering: geometricPrecision;
}

.admin-chart-surface :deep(.apexcharts-text),
.admin-chart-surface :deep(.apexcharts-xaxis-label),
.admin-chart-surface :deep(.apexcharts-yaxis-label),
.admin-chart-surface :deep(.apexcharts-tooltip),
.admin-chart-surface :deep(.apexcharts-tooltip *) {
  text-rendering: geometricPrecision;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
