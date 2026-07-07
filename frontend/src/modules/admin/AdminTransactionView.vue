<template>
  <div class="space-y-6">
    <div>
      <p class="font-mono text-xs font-bold uppercase text-ticketGold">Latest Ledger</p>
      <h1 class="font-display text-5xl leading-none text-paperCream">TRANSACTION LEDGER</h1>
      <p class="text-sm text-paperCream/70">Track wallet credits, booking debits, refunds, and balance movement.</p>
    </div>

    <form class="rounded-md border-2 border-ticketGold/35 bg-deepPlum p-4" @submit.prevent="loadTransactions">
      <div class="grid gap-3 md:grid-cols-3">
        <label class="block">
          <span class="transaction-filter-label">Type</span>
          <select v-model="filters.type" class="transaction-filter-input">
            <option value="">All</option>
            <option value="CREDIT">Credit</option>
            <option value="DEBIT">Debit</option>
            <option value="REFUND">Refund</option>
          </select>
        </label>

        <label class="block">
          <span class="transaction-filter-label">Reference Type</span>
          <select v-model="filters.referenceType" class="transaction-filter-input">
            <option value="">All</option>
            <option value="ADD_MONEY">Add Money</option>
            <option value="BOOKING">Booking</option>
            <option value="REFUND">Refund</option>
          </select>
        </label>

        <label class="block">
          <span class="transaction-filter-label">User ID</span>
          <input v-model.trim="filters.userId" class="transaction-filter-input" placeholder="user id" />
        </label>
      </div>

      <div class="mt-4 flex flex-wrap gap-3">
        <AppButton type="submit" icon="mdi:filter" :loading="adminStore.transactionsLoading">Apply Filters</AppButton>
        <AppButton type="button" variant="secondary" icon="mdi:restore" @click="resetFilters">Reset</AppButton>
      </div>
    </form>

    <div v-if="adminStore.transactionsLoading" class="flex min-h-56 items-center justify-center rounded-md bg-deepPlum">
      <LoadingSpinner size="lg" />
    </div>
    <div v-else-if="adminStore.transactionsError" class="rounded-md border border-marqueeRed bg-marqueeRed/10 p-4 text-sm font-semibold text-paperCream">
      {{ adminStore.transactionsError }}
    </div>
    <div v-else-if="transactions.length" class="space-y-3">
      <article
        v-for="transaction in transactions"
        :key="getTransactionId(transaction)"
        class="relative overflow-hidden rounded-md border-2 border-stubCharcoal bg-paperCream p-4 text-stubCharcoal shadow-ticket"
      >
        <span class="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-inkNight" aria-hidden="true" />

        <div class="grid gap-4 lg:grid-cols-[1.2fr_0.85fr_0.8fr] lg:items-start">
          <div class="min-w-0">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="font-mono text-[10px] font-bold uppercase text-marqueeRed">Transaction ID</p>
                <p class="truncate font-mono text-xs font-black text-stubCharcoal/65">{{ getTransactionId(transaction) }}</p>
              </div>
              <span class="rounded-sm border px-2.5 py-1 font-mono text-xs font-black uppercase" :class="typeBadgeClass(transaction.type)">
                {{ transaction.type }}
              </span>
            </div>

            <h2 class="mt-3 line-clamp-1 font-display text-3xl uppercase leading-none">
              {{ transaction.description || 'Wallet transaction' }}
            </h2>
            <p class="mt-1 truncate text-sm font-semibold text-stubCharcoal/65">{{ userLabel(transaction) }}</p>
          </div>

          <div class="grid grid-cols-2 gap-2 font-mono text-[11px] font-bold uppercase">
            <div class="rounded-sm border border-stubCharcoal/15 bg-stubCharcoal/5 p-2">
              <span class="block text-stubCharcoal/45">Amount</span>
              <span class="block text-sm font-black" :class="amountClass(transaction.type)">
                {{ amountPrefix(transaction.type) }}{{ formatINR(transaction.amountInPaise) }}
              </span>
            </div>
            <div class="rounded-sm border border-stubCharcoal/15 bg-stubCharcoal/5 p-2">
              <span class="block text-stubCharcoal/45">Balance</span>
              <span class="block text-sm font-black">{{ formatINR(transaction.balanceAfterInPaise) }}</span>
            </div>
            <div class="rounded-sm border border-stubCharcoal/15 bg-stubCharcoal/5 p-2">
              <span class="block text-stubCharcoal/45">Reference</span>
              <span class="block truncate text-sm font-black">{{ transaction.referenceType || 'N/A' }}</span>
            </div>
            <div class="rounded-sm border border-stubCharcoal/15 bg-stubCharcoal/5 p-2">
              <span class="block text-stubCharcoal/45">Created</span>
              <span class="block truncate text-sm font-black">{{ formatDateTime(transaction.createdAt) }}</span>
            </div>
          </div>

          <div class="min-w-0 border-t-2 border-dashed border-stubCharcoal/25 pt-3 lg:border-l-2 lg:border-t-0 lg:pl-4 lg:pt-0">
            <div class="space-y-2 font-mono text-[11px] font-bold uppercase">
              <div>
                <span class="block text-stubCharcoal/45">Reference ID</span>
                <span class="block truncate">{{ transaction.referenceId || 'Not available' }}</span>
              </div>
              <div>
                <span class="block text-stubCharcoal/45">User</span>
                <span class="block truncate">{{ userIdLabel(transaction) }}</span>
              </div>
            </div>
            <div class="mt-3 w-32 [&>div]:h-7">
              <BarcodeStrip />
            </div>
            <p class="mt-2 font-mono text-[10px] font-black uppercase text-stubCharcoal/35">
              Ledger receipt
            </p>
          </div>
        </div>
      </article>
    </div>
    <div v-else class="rounded-md border-2 border-stubCharcoal bg-paperCream p-8 text-center text-stubCharcoal shadow-ticket">
      <p class="font-display text-4xl leading-none">No transactions found.</p>
      <p class="mt-2 text-sm text-stubCharcoal/65">Wallet credits, booking debits, and refunds will appear here.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue';

import AppButton from '@/components/common/AppButton.vue';
import BarcodeStrip from '@/components/common/BarcodeStrip.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import type { User, WalletTransaction } from '@/services/apiTypes';
import { formatDateTime } from '@/utils/date';
import { formatINR } from '@/utils/money';
import { useAdminStore } from './admin.store';

type AdminTransaction = WalletTransaction & {
  _id?: string;
  userId?: string | Pick<User, 'id' | 'name' | 'email' | 'role'>;
  user?: Pick<User, 'id' | 'name' | 'email' | 'role'>;
};

const adminStore = useAdminStore();
const filters = reactive({
  type: '',
  referenceType: '',
  userId: '',
});

const transactions = computed(() => {
  return [...(adminStore.transactions as AdminTransaction[])]
    .filter((transaction) => {
      if (!filters.userId) return true;
      return userIdLabel(transaction).toLowerCase().includes(filters.userId.toLowerCase());
    })
    .sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime());
});

function getTransactionId(transaction: AdminTransaction) {
  return transaction.id || transaction._id || '';
}

function currentFilters() {
  return {
    type: filters.type,
    referenceType: filters.referenceType,
    userId: filters.userId,
  };
}

function userLabel(transaction: AdminTransaction) {
  const user = typeof transaction.userId === 'object' ? transaction.userId : transaction.user;

  if (user) {
    return `${user.name} (${user.email})`;
  }

  return userIdLabel(transaction);
}

function userIdLabel(transaction: AdminTransaction) {
  if (transaction.userId && typeof transaction.userId === 'object') {
    return transaction.userId.id;
  }

  if (transaction.user?.id) {
    return transaction.user.id;
  }

  return transaction.userId || 'User not available';
}

function amountPrefix(type: WalletTransaction['type']) {
  return type === 'DEBIT' ? '-' : '+';
}

function amountClass(type: WalletTransaction['type']) {
  if (type === 'DEBIT') return 'text-marqueeRed';
  if (type === 'REFUND') return 'text-ticketGold';
  return 'text-electricTeal';
}

function typeBadgeClass(type: WalletTransaction['type']) {
  if (type === 'DEBIT') return 'border-marqueeRed bg-marqueeRed text-paperCream';
  if (type === 'REFUND') return 'border-ticketGold bg-ticketGold text-stubCharcoal';
  return 'border-electricTeal bg-electricTeal text-inkNight';
}

async function loadTransactions() {
  await adminStore.fetchTransactions(currentFilters()).catch(() => undefined);
}

function resetFilters() {
  filters.type = '';
  filters.referenceType = '';
  filters.userId = '';
  loadTransactions();
}

onMounted(loadTransactions);
</script>

<style scoped>
.transaction-filter-label {
  @apply mb-1 block font-mono text-[10px] font-bold uppercase text-paperCream/60;
}

.transaction-filter-input {
  @apply focus-ticket w-full rounded-sm border-2 border-paperCream/25 bg-paperCream px-3 py-2.5 text-stubCharcoal placeholder:text-stubCharcoal/45;
}
</style>
