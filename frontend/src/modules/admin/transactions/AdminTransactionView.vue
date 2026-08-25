<template>
  <div class="space-y-6">
    <div>
      <p class="font-mono text-xs font-bold uppercase text-ticketGold">Latest Ledger</p>
      <h1 class="font-display text-5xl leading-none text-paperCream">TRANSACTION LEDGER</h1>
      <p class="text-sm text-paperCream/70">Track wallet credits, booking debits, refunds, and balance movement.</p>
    </div>

    <form class="rounded-md border-2 border-ticketGold/35 bg-deepPlum p-4" @submit.prevent="loadTransactions(1)">
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
          <span class="transaction-filter-label">User</span>
          <input v-model.trim="filters.userQuery" class="transaction-filter-input" list="transaction-user-options" placeholder="Search name or email" />
          <datalist id="transaction-user-options">
            <option v-for="user in userOptions" :key="user.id" :value="user.label" />
          </datalist>
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
        class="relative overflow-hidden admin-card-dark"
      >
        <span class="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-inkNight" aria-hidden="true" />

        <div class="grid gap-4 lg:grid-cols-[1.2fr_0.85fr_0.8fr] lg:items-start">
          <div class="min-w-0">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="font-mono text-[10px] font-bold uppercase text-ticketGold/75">Transaction ID</p>
                <IdCopy :id="getTransactionId(transaction)" label="Transaction ID" />
              </div>
              <span class="rounded-sm border px-2.5 py-1 font-mono text-xs font-black uppercase" :class="typeBadgeClass(transaction.type)">
                {{ transaction.type }}
              </span>
            </div>

            <h2 class="admin-card-title mt-3 line-clamp-1">
              {{ transaction.description || 'Wallet transaction' }}
            </h2>
            <p class="mt-1 truncate text-sm font-semibold text-paperCream/65">{{ userLabel(transaction) }}</p>
          </div>

          <div class="grid grid-cols-2 gap-2 font-mono text-[11px] font-bold uppercase">
            <div class="admin-muted-tile">
              <span class="block text-paperCream/45">Amount</span>
              <span class="block text-sm font-black" :class="amountClass(transaction.type)">
                {{ amountPrefix(transaction.type) }}{{ formatINR(transaction.amountInPaise) }}
              </span>
            </div>
            <div class="admin-muted-tile">
              <span class="block text-paperCream/45">Balance</span>
              <span class="block text-sm font-black">{{ formatINR(transaction.balanceAfterInPaise) }}</span>
            </div>
            <div class="admin-muted-tile">
              <span class="block text-paperCream/45">Reference</span>
              <span class="block truncate text-sm font-black">{{ transaction.referenceType || 'N/A' }}</span>
            </div>
            <div class="admin-muted-tile">
              <span class="block text-paperCream/45">Created</span>
              <span class="block truncate text-sm font-black">{{ formatDateTime(transaction.createdAt) }}</span>
            </div>
          </div>

          <div class="min-w-0 border-t-2 border-dashed border-paperCream/20 pt-3 lg:border-l-2 lg:border-t-0 lg:pl-4 lg:pt-0">
            <div class="space-y-2 font-mono text-[11px] font-bold uppercase">
              <div>
                <span class="block text-paperCream/45">Reference ID</span>
                <IdCopy :id="transaction.referenceId || ''" label="Reference ID" />
              </div>
              <div>
                <span class="block text-paperCream/45">User</span>
                <IdCopy :id="userIdValue(transaction)" label="User ID" />
              </div>
            </div>
            <p class="mt-3 font-mono text-[10px] font-black uppercase text-paperCream/35">
              Ledger receipt
            </p>
          </div>
        </div>
      </article>
    </div>
    <div v-if="!adminStore.transactionsLoading && adminStore.transactionsPagination.totalItems > adminStore.transactionsPagination.limit" class="flex flex-wrap items-center justify-between gap-3 rounded-md border border-paperCream/10 bg-deepPlum px-4 py-3">
      <p class="font-mono text-xs font-bold uppercase text-paperCream/60">
        Page {{ adminStore.transactionsPagination.page }} of {{ adminStore.transactionsPagination.totalPages }} · {{ adminStore.transactionsPagination.totalItems }} transactions
      </p>
      <div class="flex gap-2">
        <AppButton type="button" variant="ghost" icon="mdi:chevron-left" :disabled="!adminStore.transactionsPagination.hasPreviousPage" @click="loadTransactions(adminStore.transactionsPagination.page - 1)">
          Previous
        </AppButton>
        <AppButton type="button" variant="ghost" icon="mdi:chevron-right" :disabled="!adminStore.transactionsPagination.hasNextPage" @click="loadTransactions(adminStore.transactionsPagination.page + 1)">
          Next
        </AppButton>
      </div>
    </div>

    <div v-else-if="!transactions.length && !adminStore.transactionsError" class="admin-card-dark p-8 text-center">
      <p class="font-display text-4xl leading-none">No transactions found.</p>
      <p class="mt-2 text-sm text-paperCream/65">Wallet credits, booking debits, and refunds will appear here.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue';

import AppButton from '@/components/common/AppButton.vue';
import IdCopy from '@/components/common/IdCopy.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import type { User, WalletTransaction } from '@/services/apiTypes';
import { formatDateTime } from '@/utils/date';
import { formatINR } from '@/utils/money';
import { useAdminStore } from '../admin.store';

type AdminTransaction = WalletTransaction & {
  _id?: string;
  userId?: string | Pick<User, 'id' | 'name' | 'email' | 'role'>;
  user?: Pick<User, 'id' | 'name' | 'email' | 'role'>;
};

const adminStore = useAdminStore();
const filters = reactive({
  type: '',
  referenceType: '',
  userQuery: '',
});
const PAGE_SIZE = 24;

const transactions = computed(() => [...(adminStore.transactions as AdminTransaction[])].sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()));

const userOptions = computed(() => {
  const users = new Map<string, { id: string; label: string }>();

  transactions.value.forEach((transaction) => {
    const user = typeof transaction.userId === 'object' ? transaction.userId : transaction.user;

    if (user) {
      users.set(user.id, {
        id: user.id,
        label: `${user.name} (${user.email})`,
      });
    }
  });

  return Array.from(users.values()).sort((first, second) => first.label.localeCompare(second.label));
});

function getTransactionId(transaction: AdminTransaction) {
  return transaction.id || transaction._id || '';
}

function currentFilters() {
  return {
    type: filters.type,
    referenceType: filters.referenceType,
    userId: resolveOptionId(filters.userQuery, userOptions.value),
    limit: PAGE_SIZE,
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
  return userIdValue(transaction) || 'User not available';
}

function userIdValue(transaction: AdminTransaction) {
  if (transaction.userId && typeof transaction.userId === 'object') {
    return transaction.userId.id;
  }

  if (transaction.user?.id) {
    return transaction.user.id;
  }

  return transaction.userId || '';
}

function amountPrefix(type: WalletTransaction['type']) {
  return type === 'DEBIT' ? '-' : '+';
}

function amountClass(type: WalletTransaction['type']) {
  if (type === 'DEBIT') return 'text-marqueeRed';
  if (type === 'REFUND') return 'text-ticketGold';
  return 'text-[#5eead4]';
}

function typeBadgeClass(type: WalletTransaction['type']) {
  if (type === 'DEBIT') return 'border-marqueeRed bg-marqueeRed text-paperCream';
  if (type === 'REFUND') return 'border-ticketGold bg-ticketGold text-stubCharcoal';
  return 'border-electricTeal bg-electricTeal text-inkNight';
}

async function loadTransactions(page = adminStore.transactionsPagination.page) {
  await adminStore.fetchTransactions({
    ...currentFilters(),
    page,
  }).catch(() => undefined);
}

function resetFilters() {
  filters.type = '';
  filters.referenceType = '';
  filters.userQuery = '';
  loadTransactions(1);
}

function resolveOptionId(query: string, options: Array<{ id: string; label: string }>) {
  if (!query) return '';
  const exactMatch = options.find((option) => option.label === query || option.id === query);
  if (exactMatch) return exactMatch.id;
  return /^[a-f\d]{24}$/i.test(query) ? query : '';
}

onMounted(() => loadTransactions(1));
</script>

<style scoped>
.transaction-filter-label {
  @apply mb-1 block font-mono text-[10px] font-bold uppercase text-paperCream/60;
}

.transaction-filter-input {
  @apply admin-filter-input;
}
</style>
