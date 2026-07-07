<template>
  <div class="space-y-6">
    <div>
      <p class="font-mono text-xs uppercase text-ticketGold">Ledger</p>
      <h1 class="font-display text-5xl leading-none text-paperCream">TRANSACTIONS</h1>
      <p class="text-sm text-paperCream/70">Wallet and refund transaction placeholders.</p>
    </div>

    <div v-if="loading" class="flex min-h-56 items-center justify-center rounded-md bg-deepPlum">
      <LoadingSpinner size="lg" />
    </div>
    <div v-else-if="error" class="rounded-md border border-marqueeRed bg-marqueeRed/10 p-4 text-sm font-semibold text-paperCream">
      {{ error }}
    </div>
    <div v-else-if="transactions.length" class="space-y-3">
      <article v-for="transaction in transactions" :key="transaction.id" class="rounded-md bg-paperCream p-5 text-stubCharcoal">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="font-bold">{{ transaction.description }}</p>
            <p class="mt-1 font-mono text-xs uppercase text-stubCharcoal/50">{{ formatDateTime(transaction.createdAt) }} · {{ transaction.referenceType }}</p>
          </div>
          <div class="text-right">
            <p class="font-black" :class="transaction.type === 'DEBIT' ? 'text-marqueeRed' : 'text-electricTeal'">
              {{ transaction.type === 'DEBIT' ? '-' : '+' }} {{ formatINR(transaction.amountInPaise) }}
            </p>
            <p class="mt-1 text-xs text-stubCharcoal/55">Bal {{ formatINR(transaction.balanceAfterInPaise) }}</p>
          </div>
        </div>
      </article>
    </div>
    <div v-else class="rounded-md bg-deepPlum p-8 text-center text-paperCream/70">
      No transactions yet.
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import type { WalletTransaction } from '@/services/apiTypes';
import { getApiErrorMessage } from '@/utils/apiError';
import { formatDateTime } from '@/utils/date';
import { formatINR } from '@/utils/money';
import { getAdminTransactions } from './admin.api';

const transactions = ref<WalletTransaction[]>([]);
const loading = ref(true);
const error = ref('');

async function loadTransactions() {
  loading.value = true;
  error.value = '';

  try {
    const response = await getAdminTransactions();
    transactions.value = response.data.data.transactions;
  } catch (err) {
    error.value = getApiErrorMessage(err);
  } finally {
    loading.value = false;
  }
}

onMounted(loadTransactions);
</script>
