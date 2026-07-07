<template>
  <div class="space-y-6 text-paperCream">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="font-mono text-xs font-bold uppercase text-ticketGold">Admin desk</p>
        <h1 class="font-display text-5xl leading-none sm:text-6xl">ADMIN DASHBOARD</h1>
        <p class="max-w-3xl text-sm text-paperCream/70">Monitor events, bookings, wallet payments, reservations, and refunds.</p>
      </div>
      <RouterLink to="/admin/events/create" class="inline-flex">
        <AppButton icon="mdi:ticket-plus">Create Event</AppButton>
      </RouterLink>
    </div>

    <p v-if="adminStore.error" class="rounded-sm border border-marqueeRed bg-marqueeRed/15 px-3 py-2 text-sm font-semibold text-paperCream">
      {{ adminStore.error }}
    </p>

    <section v-if="adminStore.loading" class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      <div v-for="index in 8" :key="index" class="h-32 rounded-md border-2 border-stubCharcoal bg-paperCream p-3 text-stubCharcoal shadow-ticket">
        <div class="h-2.5 w-20 animate-pulse rounded-sm bg-stubCharcoal/15" />
        <div class="mt-3 h-8 w-24 animate-pulse rounded-sm bg-stubCharcoal/20" />
        <div class="mt-4 h-7 w-36 animate-pulse rounded-sm bg-stubCharcoal/10" />
      </div>
    </section>

    <section v-else class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      <article
        v-for="stat in stats"
        :key="stat.label"
        class="relative flex h-32 flex-col justify-between overflow-hidden rounded-md border-2 border-stubCharcoal bg-paperCream p-3 text-stubCharcoal shadow-ticket"
      >
        <span class="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-inkNight" aria-hidden="true" />
        <div>
          <p class="font-mono text-[9px] font-bold uppercase text-stubCharcoal/50">{{ stat.label }}</p>
          <p class="mt-1 truncate font-display text-[1.7rem] leading-none sm:text-3xl" :class="stat.valueClass">{{ stat.value }}</p>
        </div>
        <div class="w-36 [&>div]:h-7">
          <BarcodeStrip />
        </div>
      </article>
    </section>

    <section v-if="!adminStore.loading && !hasData" class="rounded-md border-2 border-stubCharcoal bg-paperCream p-8 text-center text-stubCharcoal shadow-ticket">
      <p class="font-display text-4xl leading-none">No admin data yet.</p>
      <p class="mt-2 text-sm text-stubCharcoal/65">Create events and start bookings.</p>
    </section>

    <section class="grid gap-5 xl:grid-cols-2">
      <div class="rounded-md border-2 border-paperCream/15 bg-deepPlum p-5">
        <div class="mb-4 flex items-center justify-between gap-3">
          <div>
            <p class="font-mono text-xs font-bold uppercase text-ticketGold">Latest ledger</p>
            <h2 class="font-display text-4xl leading-none">RECENT BOOKINGS</h2>
          </div>
          <AppBadge variant="paid" :label="String(recentBookings.length)" />
        </div>

        <div v-if="recentBookings.length" class="space-y-3">
          <article v-for="booking in recentBookings" :key="booking.id" class="rounded-sm border border-paperCream/15 bg-paperCream p-4 text-stubCharcoal">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p class="font-mono text-[10px] font-bold uppercase text-stubCharcoal/45">Booking ID</p>
                <p class="max-w-64 truncate font-mono text-xs font-bold">{{ booking.id }}</p>
              </div>
              <AppBadge :variant="bookingStatusVariant(booking)" :label="booking.status" />
            </div>
            <div class="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <p class="font-mono text-[10px] font-bold uppercase text-stubCharcoal/45">Event</p>
                <p class="text-sm font-bold">{{ bookingEventName(booking) }}</p>
              </div>
              <div>
                <p class="font-mono text-[10px] font-bold uppercase text-stubCharcoal/45">Amount</p>
                <p class="font-mono text-sm font-bold text-marqueeRed">{{ formatINR(booking.totalAmountInPaise) }}</p>
              </div>
              <div>
                <p class="font-mono text-[10px] font-bold uppercase text-stubCharcoal/45">Payment</p>
                <p class="font-mono text-sm font-bold">{{ booking.paymentStatus }}</p>
              </div>
              <div>
                <p class="font-mono text-[10px] font-bold uppercase text-stubCharcoal/45">Created</p>
                <p class="font-mono text-xs font-bold">{{ formatDateTime(booking.createdAt) }}</p>
              </div>
            </div>
          </article>
        </div>

        <div v-else class="rounded-sm border border-paperCream/15 bg-paperCream p-5 text-center text-stubCharcoal">
          <p class="font-semibold">No bookings yet.</p>
        </div>
      </div>

      <div class="rounded-md border-2 border-paperCream/15 bg-deepPlum p-5">
        <div class="mb-4 flex items-center justify-between gap-3">
          <div>
            <p class="font-mono text-xs font-bold uppercase text-ticketGold">Wallet flow</p>
            <h2 class="font-display text-4xl leading-none">RECENT TRANSACTIONS</h2>
          </div>
          <AppBadge variant="reserved" :label="String(recentTransactions.length)" />
        </div>

        <div v-if="recentTransactions.length" class="space-y-3">
          <article
            v-for="transaction in recentTransactions"
            :key="transaction.id"
            class="rounded-sm border border-paperCream/15 bg-paperCream p-4 text-stubCharcoal"
          >
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p class="font-mono text-[10px] font-bold uppercase text-stubCharcoal/45">Transaction ID</p>
                <p class="max-w-64 truncate font-mono text-xs font-bold">{{ transaction.id }}</p>
              </div>
              <AppBadge :variant="transactionVariant(transaction.type)" :label="transaction.type" />
            </div>
            <div class="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <p class="font-mono text-[10px] font-bold uppercase text-stubCharcoal/45">Amount</p>
                <p class="font-mono text-sm font-bold" :class="transactionAmountClass(transaction.type)">
                  {{ formatINR(transaction.amountInPaise) }}
                </p>
              </div>
              <div>
                <p class="font-mono text-[10px] font-bold uppercase text-stubCharcoal/45">Reference</p>
                <p class="font-mono text-sm font-bold">{{ transaction.referenceType }}</p>
              </div>
              <div class="sm:col-span-2">
                <p class="font-mono text-[10px] font-bold uppercase text-stubCharcoal/45">Created</p>
                <p class="font-mono text-xs font-bold">{{ formatDateTime(transaction.createdAt) }}</p>
              </div>
            </div>
          </article>
        </div>

        <div v-else class="rounded-sm border border-paperCream/15 bg-paperCream p-5 text-center text-stubCharcoal">
          <p class="font-semibold">No wallet transactions yet.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';

import AppBadge from '@/components/common/AppBadge.vue';
import AppButton from '@/components/common/AppButton.vue';
import BarcodeStrip from '@/components/common/BarcodeStrip.vue';
import type { Booking, EventItem, WalletTransaction } from '@/services/apiTypes';
import { formatDateTime } from '@/utils/date';
import { formatINR } from '@/utils/money';
import { useAdminStore } from './admin.store';

type BadgeVariant = 'available' | 'reserved' | 'booked' | 'paid' | 'refunded' | 'cancelled' | 'draft' | 'published';
type DashboardBooking = Omit<Booking, 'eventId'> & {
  eventId?: string | Pick<EventItem, 'id' | 'title' | 'location' | 'startDate'>;
};

const adminStore = useAdminStore();

const hasData = computed(() => Boolean(adminStore.events.length || adminStore.bookings.length || adminStore.transactions.length));
const recentBookings = computed(() => [...(adminStore.bookings as DashboardBooking[])].sort(byCreatedAt).slice(0, 5));
const recentTransactions = computed(() => [...adminStore.transactions].sort(byCreatedAt).slice(0, 5));
const stats = computed(() => [
  { label: 'Total Events', value: String(adminStore.totalEvents), valueClass: 'text-stubCharcoal' },
  { label: 'Total Bookings', value: String(adminStore.totalBookings), valueClass: 'text-stubCharcoal' },
  { label: 'Confirmed Bookings', value: String(adminStore.confirmedBookings), valueClass: 'text-electricTeal' },
  { label: 'Cancelled Bookings', value: String(adminStore.cancelledBookings), valueClass: 'text-marqueeRed' },
  { label: 'Total Revenue', value: formatINR(adminStore.totalRevenueInPaise), valueClass: 'text-ticketGold' },
  { label: 'Refunded Amount', value: formatINR(adminStore.refundedAmountInPaise), valueClass: 'text-marqueeRed' },
  { label: 'Wallet Credits', value: formatINR(adminStore.walletCreditAmountInPaise), valueClass: 'text-electricTeal' },
  { label: 'Wallet Debits', value: formatINR(adminStore.walletDebitAmountInPaise), valueClass: 'text-ticketGold' },
]);

function byCreatedAt(first: { createdAt: string }, second: { createdAt: string }) {
  return new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime();
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
  if (booking.paymentStatus === 'REFUNDED') {
    return 'refunded';
  }

  if (booking.status === 'CANCELLED') {
    return 'cancelled';
  }

  return booking.status === 'CONFIRMED' ? 'paid' : 'draft';
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
  if (type === 'CREDIT') {
    return 'text-electricTeal';
  }

  if (type === 'REFUND') {
    return 'text-ticketGold';
  }

  return 'text-marqueeRed';
}

onMounted(() => {
  adminStore.fetchDashboardData();
});
</script>
