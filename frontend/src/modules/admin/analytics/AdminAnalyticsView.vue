<template>
  <div class="space-y-6">
    <header class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="admin-kicker">Performance desk</p>
        <h1 class="admin-page-title">Analytics</h1>
        <p class="admin-page-copy">Real booking, seat, event, and wallet signals from the current admin APIs.</p>
      </div>
      <label class="min-w-40">
        <span class="admin-field-label">Revenue range</span>
        <select v-model="range" class="admin-filter-input" @change="refresh">
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </label>
    </header>

    <div v-if="adminStore.analyticsError" class="admin-error-state" role="alert">
      <div>
        <p class="font-bold">Some analytics could not be loaded.</p>
        <p class="mt-1 text-sm text-admin-secondary">{{ adminStore.analyticsError }}</p>
      </div>
      <AppButton variant="ghost" icon="mdi:refresh" @click="refresh">Retry</AppButton>
    </div>

    <div v-if="adminStore.analyticsLoading" class="grid gap-4 xl:grid-cols-2" aria-label="Loading analytics">
      <div v-for="index in 5" :key="index" class="admin-panel-dark min-h-[330px]">
        <div class="skeleton h-3 w-28 rounded-sm" />
        <div class="skeleton mt-3 h-8 w-48 rounded-sm" />
        <div class="skeleton mt-8 h-52 w-full rounded-sm" />
      </div>
    </div>

    <template v-else>
      <section class="grid gap-4 xl:grid-cols-2" aria-label="Analytics charts">
        <div>
          <RevenueTrendChart :data="adminStore.revenueData" :range="range" />
          <p class="sr-only">{{ revenueSummary }}</p>
        </div>
        <div>
          <BookingStatusChart :data="adminStore.bookingStatusData" />
          <p class="sr-only">Confirmed {{ adminStore.bookingStatusData.confirmed }}, cancelled {{ adminStore.bookingStatusData.cancelled }}, refunded {{ adminStore.bookingStatusData.refunded }}.</p>
        </div>
        <div>
          <SeatStatusChart :data="adminStore.seatStatusData" />
          <p class="sr-only">Available {{ adminStore.seatStatusData.available }}, reserved {{ adminStore.seatStatusData.reserved }}, booked {{ adminStore.seatStatusData.booked }} seats.</p>
        </div>
        <div>
          <WalletFlowChart :data="adminStore.walletFlowData" />
          <p class="sr-only">Wallet credits {{ formatINR(adminStore.walletFlowData.creditInPaise) }}, debits {{ formatINR(adminStore.walletFlowData.debitInPaise) }}, refunds {{ formatINR(adminStore.walletFlowData.refundInPaise) }}.</p>
        </div>
        <TopEventsChart class="xl:col-span-2" :data="adminStore.topEvents" />
      </section>

      <section v-if="!hasAnalyticsData" class="admin-empty-state">
        <Icon icon="mdi:chart-box-outline" class="mx-auto h-9 w-9 text-admin-subtle" aria-hidden="true" />
        <h2 class="mt-3 text-lg font-bold text-admin-text">No analytics data yet</h2>
        <p class="mt-1 text-sm text-admin-secondary">Charts will populate as real bookings, seats, and wallet activity are recorded.</p>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { computed, onMounted, ref } from 'vue';

import AppButton from '@/components/common/AppButton.vue';
import { formatINR } from '@/utils/money';
import type { AnalyticsRange } from '../admin.api';
import { useAdminStore } from '../admin.store';
import BookingStatusChart from '../dashboard/charts/BookingStatusChart.vue';
import RevenueTrendChart from '../dashboard/charts/RevenueTrendChart.vue';
import SeatStatusChart from '../dashboard/charts/SeatStatusChart.vue';
import TopEventsChart from '../dashboard/charts/TopEventsChart.vue';
import WalletFlowChart from '../dashboard/charts/WalletFlowChart.vue';

const adminStore = useAdminStore();
const range = ref<AnalyticsRange>('daily');
const revenueSummary = computed(() => {
  const total = adminStore.revenueData.values.reduce((sum, value) => sum + value, 0);
  return adminStore.revenueData.values.length
    ? `${adminStore.revenueData.values.length} ${range.value} revenue periods totalling ${formatINR(total)}.`
    : 'No revenue time-series data is available for this range.';
});

const hasAnalyticsData = computed(() =>
  Boolean(
    adminStore.revenueData.values.some((value) => value > 0) ||
      Object.values(adminStore.bookingStatusData).some((value) => value > 0) ||
      Object.values(adminStore.seatStatusData).some((value) => value > 0) ||
      Object.values(adminStore.walletFlowData).some((value) => value > 0) ||
      adminStore.topEvents.length,
  ),
);

function refresh() {
  void adminStore.fetchAnalyticsData(range.value);
}

onMounted(refresh);
</script>
