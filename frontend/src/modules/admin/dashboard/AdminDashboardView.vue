<template>
  <div class="space-y-6">
    <header class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="admin-kicker">{{ currentDate }}</p>
        <h1 class="admin-page-title">Dashboard overview</h1>
        <p class="admin-page-copy">A current view of events, bookings, revenue, refunds, and seat inventory.</p>
      </div>
      <RouterLink to="/admin/events/create" class="inline-flex">
        <AppButton icon="mdi:plus">Create event</AppButton>
      </RouterLink>
    </header>

    <div v-if="dashboardError" class="admin-error-state" role="alert">
      <p class="text-sm font-medium">{{ dashboardError }}</p>
      <AppButton variant="ghost" icon="mdi:refresh" @click="refreshDashboard">Retry</AppButton>
    </div>

    <section v-if="adminStore.analyticsLoading" class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div v-for="index in 8" :key="index" class="h-36 admin-card-dark">
        <div class="h-2.5 w-20 animate-pulse rounded-sm bg-paperCream/15" />
        <div class="mt-3 h-8 w-24 animate-pulse rounded-sm bg-paperCream/20" />
        <div class="mt-4 h-5 w-40 animate-pulse rounded-sm bg-paperCream/10" />
      </div>
    </section>

    <section v-else class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <AdminStatCard v-for="(stat, index) in stats" :key="stat.label" v-bind="stat" :index="index" />
    </section>

    <section v-if="!adminStore.loading && !adminStore.analyticsLoading && !hasData" class="admin-empty-state">
      <p class="text-lg font-bold text-admin-text">No admin data yet</p>
      <p class="mt-1 text-sm text-admin-secondary">Create events and start bookings.</p>
    </section>

    <section class="space-y-4">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p class="admin-kicker">Analytics</p>
          <h2 class="mt-1 text-xl font-semibold text-admin-text">Performance signals</h2>
        </div>
        <label class="flex items-center gap-2 text-xs font-medium text-admin-secondary">
          Range
          <select
            v-model="revenueRange"
            class="admin-filter-input h-10 py-0 text-sm font-bold"
            @change="refreshAnalytics"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </label>
      </div>

      <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <RevenueTrendChart :data="adminStore.revenueData" :range="revenueRange" />
        <BookingStatusChart :data="adminStore.bookingStatusData" />
        <SeatStatusChart :data="adminStore.seatStatusData" />
        <WalletFlowChart :data="adminStore.walletFlowData" />
      </div>
    </section>

    <section class="admin-panel-dark">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="admin-kicker">Top performers</p>
          <h2 class="mt-1 text-xl font-semibold text-admin-text">Top events</h2>
        </div>
        <span class="rounded-full border border-admin-border bg-admin-canvas px-2.5 py-1 text-[11px] font-semibold text-admin-secondary">
          By revenue
        </span>
      </div>

      <div v-if="adminStore.topEvents.length" class="grid gap-3">
        <article
          v-for="(event, index) in adminStore.topEvents"
          :key="event.eventId"
          class="relative grid gap-3 overflow-hidden admin-card-dark sm:grid-cols-[3rem_minmax(0,1fr)_auto_auto_auto] sm:items-center"
        >
          <span class="text-xs font-bold text-admin-subtle tabular-nums">#{{ index + 1 }}</span>
          <div class="min-w-0">
            <h3 class="truncate font-semibold text-admin-text">{{ event.title }}</h3>
            <p class="mt-1 flex min-w-0 items-center gap-1 text-[11px] font-medium text-admin-secondary">
              Event <IdCopy :id="event.eventId" label="Event ID" />
            </p>
          </div>
          <p class="text-xs font-medium text-admin-secondary tabular-nums">{{ formatCount(event.totalBookings) }} bookings</p>
          <p class="text-xs font-semibold text-admin-success tabular-nums">{{ formatINR(event.revenueInPaise) }}</p>
          <p class="text-xs font-semibold text-admin-text tabular-nums">{{ formatCount(event.bookedSeats) }} seats</p>
        </article>
      </div>

      <div v-else class="rounded-md border border-admin-border bg-admin-canvas p-5 text-center text-admin-secondary">
        <p class="font-medium">No top events yet.</p>
      </div>
    </section>

    <section class="grid items-start gap-5 2xl:grid-cols-2">
      <AdminActivityPanel
        eyebrow="Latest ledger"
        title="Recent Bookings"
        :items="bookingRows"
        search-placeholder="Search booking ID or event"
        empty-text="No bookings match these filters."
      />

      <AdminActivityPanel
        eyebrow="Wallet flow"
        title="Recent Transactions"
        :items="transactionRows"
        search-placeholder="Search transaction ID or reference"
        empty-text="No transactions match these filters."
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import AppButton from '@/components/common/AppButton.vue';
import IdCopy from '@/components/common/IdCopy.vue';
import type { Booking, EventItem, WalletTransaction } from '@/services/apiTypes';
import { formatDateTime } from '@/utils/date';
import { formatINR } from '@/utils/money';
import BookingStatusChart from './charts/BookingStatusChart.vue';
import RevenueTrendChart from './charts/RevenueTrendChart.vue';
import SeatStatusChart from './charts/SeatStatusChart.vue';
import WalletFlowChart from './charts/WalletFlowChart.vue';
import AdminActivityPanel from './components/AdminActivityPanel.vue';
import AdminStatCard from './components/AdminStatCard.vue';
import type { AnalyticsRange } from '../admin.api';
import { useAdminStore } from '../admin.store';

type BadgeVariant = 'available' | 'reserved' | 'booked' | 'paid' | 'refunded' | 'cancelled' | 'draft' | 'published' | 'completed';
type TrendTone = 'positive' | 'negative' | 'neutral';
type TrendPolarity = 'positive' | 'negative';
type DashboardBooking = Omit<Booking, 'eventId'> & {
  eventId?: string | Pick<EventItem, 'id' | 'title' | 'location' | 'startDate'>;
};
type ActivityPanelItem = {
  id: string;
  name: string;
  amount: string;
  amountClass: string;
  status: string;
  badgeVariant: BadgeVariant;
  createdAt: string;
  relativeTime: string;
  details: Array<{ label: string; value: string }>;
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const RECENT_ROW_LIMIT = 8;
const adminStore = useAdminStore();
const revenueRange = ref<AnalyticsRange>('daily');
const currentDate = new Intl.DateTimeFormat('en-IN', { dateStyle: 'full' }).format(new Date());

const dashboardError = computed(() => [adminStore.error, adminStore.analyticsError].filter(Boolean).join(' | '));
const summary = computed(() => adminStore.analyticsSummary);
const hasData = computed(() =>
  Boolean(
    adminStore.events.length ||
      adminStore.bookings.length ||
      adminStore.transactions.length ||
      summary.value?.totalBookings ||
      summary.value?.totalEvents ||
      summary.value?.totalSeats,
  ),
);
const recentBookings = computed(() => [...(adminStore.bookings as DashboardBooking[])].sort(byCreatedAt).slice(0, RECENT_ROW_LIMIT));
const recentTransactions = computed(() => [...adminStore.transactions].sort(byCreatedAt).slice(0, RECENT_ROW_LIMIT));

const bookingRows = computed<ActivityPanelItem[]>(() =>
  recentBookings.value.map((booking) => ({
    id: booking.id,
    name: bookingEventName(booking),
    amount: formatINR(booking.totalAmountInPaise),
    amountClass: bookingStatusLabel(booking) === 'CONFIRMED' ? 'text-[#5eead4]' : 'text-[#fb7185]',
    status: bookingStatusLabel(booking),
    badgeVariant: bookingStatusVariant(booking),
    createdAt: booking.createdAt,
    relativeTime: formatRelativeTime(booking.createdAt),
    details: [
      { label: 'Booking ID', value: booking.id },
      { label: 'Event', value: bookingEventName(booking) },
      { label: 'Amount', value: formatINR(booking.totalAmountInPaise) },
      { label: 'Payment', value: booking.paymentStatus },
      { label: 'Created', value: formatDateTime(booking.createdAt) },
      { label: 'Seats', value: booking.seats?.map((seat) => `${seat.row}${seat.seatNumber}`).join(', ') || String(booking.seatIds?.length || 0) },
    ],
  })),
);

const transactionRows = computed<ActivityPanelItem[]>(() =>
  recentTransactions.value.map((transaction) => ({
    id: transaction.id,
    name: transaction.referenceId || transaction.referenceType || transaction.description,
    amount: formatINR(transaction.amountInPaise),
    amountClass: transactionAmountClass(transaction.type),
    status: transaction.type,
    badgeVariant: transactionVariant(transaction.type),
    createdAt: transaction.createdAt,
    relativeTime: formatRelativeTime(transaction.createdAt),
    details: [
      { label: 'Transaction ID', value: transaction.id },
      { label: 'Type', value: transaction.type },
      { label: 'Reference', value: transaction.referenceType },
      { label: 'Reference ID', value: transaction.referenceId || 'None' },
      { label: 'Balance After', value: formatINR(transaction.balanceAfterInPaise) },
      { label: 'Created', value: formatDateTime(transaction.createdAt) },
      { label: 'Description', value: transaction.description },
    ],
  })),
);

const stats = computed(() => [
  {
    label: 'Total Events',
    value: formatCount(summary.value?.totalEvents ?? adminStore.totalEvents),
    valueClass: 'text-midnight-ivory',
    subtitle: 'All event records',
    icon: 'mdi:calendar-multiple',
  },
  {
    label: 'Active Events',
    value: formatCount(summary.value?.activeEvents ?? adminStore.events.filter((event) => event.status === 'PUBLISHED').length),
    valueClass: 'text-midnight-mint',
    subtitle: 'Currently published',
    icon: 'mdi:calendar-check',
  },
  {
    label: 'Total Bookings',
    value: formatCount(summary.value?.totalBookings ?? adminStore.totalBookings),
    valueClass: 'text-midnight-ivory',
    subtitle: 'All booking records',
    icon: 'mdi:ticket-confirmation-outline',
  },
  {
    label: 'Confirmed',
    value: formatCount(summary.value?.confirmedBookings ?? adminStore.confirmedBookings),
    valueClass: 'text-midnight-mint',
    subtitle: 'Paid and confirmed',
    icon: 'mdi:check-decagram-outline',
  },
  {
    label: 'Refund amount',
    value: formatINR(summary.value?.refundedAmountInPaise ?? adminStore.refundedAmountInPaise),
    valueClass: 'text-admin-text',
    subtitle: 'Returned to user wallets',
    icon: 'mdi:cash-refund',
  },
  {
    label: 'Total Revenue',
    value: formatINR(summary.value?.totalRevenueInPaise ?? adminStore.totalRevenueInPaise),
    valueClass: 'text-midnight-mint',
    subtitle: 'Confirmed paid bookings',
    icon: 'mdi:currency-inr',
  },
  {
    label: 'Available Seats',
    value: formatCount(summary.value?.availableSeats ?? totalAvailableSeatsFromEvents.value),
    valueClass: 'text-midnight-mint',
    subtitle: 'Ready to book',
    icon: 'mdi:seat-outline',
  },
  {
    label: 'Booked Seats',
    value: formatCount(summary.value?.bookedSeats ?? totalBookedSeatsFromEvents.value),
    valueClass: 'text-midnight-ember',
    subtitle: 'Confirmed inventory',
    icon: 'mdi:seat-passenger',
  },
]);

const totalBookedSeatsFromEvents = computed(() => adminStore.events.reduce((total, event) => total + event.bookedSeats, 0));
const totalAvailableSeatsFromEvents = computed(() => adminStore.events.reduce((total, event) => total + event.availableSeats, 0));
const closedBookingsCount = computed(() => {
  if (summary.value) return Math.max(0, summary.value.totalBookings - summary.value.confirmedBookings);
  return adminStore.bookings.filter((booking) => booking.status === 'CANCELLED' || booking.status === 'REFUNDED' || booking.paymentStatus === 'REFUNDED').length;
});

function byCreatedAt(first: { createdAt: string }, second: { createdAt: string }) {
  return new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime();
}

function formatCount(value: number) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value);
}

function bookingEventName(booking: DashboardBooking) {
  if (booking.event?.title) {
    return booking.event.title;
  }

  if (booking.eventId && typeof booking.eventId === 'object') {
    return booking.eventId.title;
  }

  return 'Booked event';
}

function bookingStatusVariant(booking: DashboardBooking): BadgeVariant {
  if (booking.paymentStatus === 'REFUNDED' || booking.status === 'REFUNDED') {
    return 'refunded';
  }

  if (booking.status === 'CANCELLED') {
    return 'cancelled';
  }

  return booking.status === 'CONFIRMED' ? 'paid' : 'draft';
}

function bookingStatusLabel(booking: DashboardBooking) {
  if (booking.paymentStatus === 'REFUNDED' || booking.status === 'REFUNDED') {
    return 'REFUNDED';
  }

  return booking.status;
}

function transactionVariant(type: WalletTransaction['type']): BadgeVariant {
  if (type === 'CREDIT') {
    return 'paid';
  }

  if (type === 'REFUND') {
    return 'refunded';
  }

  return 'cancelled';
}

function transactionAmountClass(type: WalletTransaction['type']) {
  if (type === 'CREDIT') return 'text-admin-success';
  if (type === 'REFUND') return 'text-admin-info';
  return 'text-admin-error';
}

function periodDelta<T extends { createdAt: string }>(items: T[], filter: (item: T) => boolean, polarity: TrendPolarity) {
  return formatDelta(countInWindow(items, filter, 7, 0), countInWindow(items, filter, 14, 7), polarity);
}

function moneyDelta(items: WalletTransaction[], filter: (item: WalletTransaction) => boolean, polarity: TrendPolarity) {
  return formatDelta(sumInWindow(items, filter, 7, 0), sumInWindow(items, filter, 14, 7), polarity);
}

function countInWindow<T extends { createdAt: string }>(items: T[], filter: (item: T) => boolean, startDaysAgo: number, endDaysAgo: number) {
  const now = Date.now();
  const start = now - startDaysAgo * DAY_IN_MS;
  const end = now - endDaysAgo * DAY_IN_MS;

  return items.filter((item) => filter(item) && isWithinWindow(item.createdAt, start, end)).length;
}

function sumInWindow(items: WalletTransaction[], filter: (item: WalletTransaction) => boolean, startDaysAgo: number, endDaysAgo: number) {
  const now = Date.now();
  const start = now - startDaysAgo * DAY_IN_MS;
  const end = now - endDaysAgo * DAY_IN_MS;

  return items
    .filter((item) => filter(item) && isWithinWindow(item.createdAt, start, end))
    .reduce((total, item) => total + item.amountInPaise, 0);
}

function isWithinWindow(createdAt: string, start: number, end: number) {
  const created = new Date(createdAt).getTime();
  return created >= start && created < end;
}

function formatDelta(current: number, previous: number, polarity: TrendPolarity): { deltaLabel: string; tone: TrendTone } {
  if (previous === 0 && current === 0) {
    return {
      deltaLabel: '',
      tone: 'neutral',
    };
  }

  const percent = previous === 0 ? (current > 0 ? 100 : 0) : Math.round(((current - previous) / previous) * 100);
  const sign = percent > 0 ? '+' : '';
  let tone: TrendTone = 'neutral';

  if (percent !== 0) {
    tone = polarity === 'positive' ? (percent > 0 ? 'positive' : 'negative') : percent > 0 ? 'negative' : 'positive';
  }

  return {
    deltaLabel: `${sign}${percent}% vs last week`,
    tone,
  };
}

function formatRelativeTime(date: string) {
  const deltaSeconds = Math.round((new Date(date).getTime() - Date.now()) / 1000);
  const absoluteSeconds = Math.abs(deltaSeconds);
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  if (absoluteSeconds < 60) {
    return formatter.format(deltaSeconds, 'second');
  }

  const deltaMinutes = Math.round(deltaSeconds / 60);
  if (Math.abs(deltaMinutes) < 60) {
    return formatter.format(deltaMinutes, 'minute');
  }

  const deltaHours = Math.round(deltaMinutes / 60);
  if (Math.abs(deltaHours) < 24) {
    return formatter.format(deltaHours, 'hour');
  }

  const deltaDays = Math.round(deltaHours / 24);
  if (Math.abs(deltaDays) < 30) {
    return formatter.format(deltaDays, 'day');
  }

  const deltaMonths = Math.round(deltaDays / 30);
  if (Math.abs(deltaMonths) < 12) {
    return formatter.format(deltaMonths, 'month');
  }

  return formatter.format(Math.round(deltaMonths / 12), 'year');
}

function refreshAnalytics() {
  void adminStore.fetchAnalyticsData(revenueRange.value);
}

function refreshDashboard() {
  void adminStore.fetchDashboardData();
  refreshAnalytics();
}

onMounted(() => {
  adminStore.fetchDashboardData();
  refreshAnalytics();
});
</script>
