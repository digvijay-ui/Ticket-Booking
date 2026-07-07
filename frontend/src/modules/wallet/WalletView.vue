<template>
  <div class="space-y-6 text-white">
    <div>
      <p class="text-sm font-semibold text-white/55">Receipt desk</p>
      <h1 class="text-4xl font-black sm:text-5xl">Wallet ledger</h1>
      <p class="max-w-2xl text-white/70">Balance and transactions are connected to the backend wallet APIs.</p>
    </div>

    <section class="grid gap-5 lg:grid-cols-[360px_1fr]">
      <div class="h-fit rounded-2xl bg-white p-5 text-black">
        <p class="text-sm font-bold text-black/55">Available balance</p>
        <p class="mt-1 text-4xl font-black">{{ formatINR(balanceInPaise) }}</p>

        <form class="mt-6 space-y-4" @submit.prevent="submitTopUp">
          <AppInput v-model="topUpAmount" label="Add amount in rupees" type="number" placeholder="1000" :error="amountError" />
          <p v-if="submitError" class="rounded-sm bg-marqueeRed/10 px-3 py-2 text-sm font-semibold text-marqueeRed">
            {{ submitError }}
          </p>
          <AppButton class="w-full" type="submit" icon="mdi:wallet-plus" :loading="submitting">
            {{ submitting ? 'Please wait...' : 'Add money' }}
          </AppButton>
        </form>
      </div>

      <div class="rounded-2xl bg-white/[0.04] p-5">
        <div class="mb-5 flex items-center justify-between">
          <h2 class="text-2xl font-black">Transactions</h2>
          <button type="button" class="focus-ticket rounded-full bg-white/10 px-3 py-1 text-sm font-bold hover:bg-white hover:text-black" @click="loadWallet">
            Refresh
          </button>
        </div>

        <div v-if="loading" class="flex min-h-44 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>

        <div v-else-if="loadError" class="rounded-xl border border-marqueeRed/50 bg-marqueeRed/10 p-5 text-sm font-semibold">
          {{ loadError }}
        </div>

        <div v-else-if="transactions.length" class="space-y-3">
          <article v-for="transaction in transactions" :key="transaction.id" class="rounded-xl bg-black/25 p-4">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="font-bold">{{ transaction.description }}</p>
                <p class="mt-1 text-xs text-white/50">{{ formatDateTime(transaction.createdAt) }} · {{ transaction.referenceType }}</p>
              </div>
              <div class="text-right">
                <p class="font-black" :class="transaction.type === 'DEBIT' ? 'text-marqueeRed' : 'text-electricTeal'">
                  {{ transaction.type === 'DEBIT' ? '-' : '+' }} {{ formatINR(transaction.amountInPaise) }}
                </p>
                <p class="mt-1 text-xs text-white/50">Bal {{ formatINR(transaction.balanceAfterInPaise) }}</p>
              </div>
            </div>
          </article>
        </div>

        <div v-else class="rounded-xl bg-black/20 p-8 text-center">
          <Icon icon="mdi:receipt-text-outline" class="mx-auto h-10 w-10 text-white/45" aria-hidden="true" />
          <p class="mt-3 font-bold">No wallet transactions yet.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { onMounted, ref } from 'vue';

import AppButton from '@/components/common/AppButton.vue';
import AppInput from '@/components/common/AppInput.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import type { WalletTransaction } from '@/services/apiTypes';
import { getApiErrorMessage } from '@/utils/apiError';
import { formatDateTime } from '@/utils/date';
import { rupeesToPaise, formatINR } from '@/utils/money';
import { addMoney, getWalletBalance, getWalletTransactions } from './wallet.api';

const balanceInPaise = ref(0);
const transactions = ref<WalletTransaction[]>([]);
const topUpAmount = ref('');
const loading = ref(true);
const submitting = ref(false);
const loadError = ref('');
const submitError = ref('');
const amountError = ref('');

async function loadWallet() {
  loading.value = true;
  loadError.value = '';

  try {
    const [balanceResponse, transactionResponse] = await Promise.all([getWalletBalance(), getWalletTransactions()]);
    balanceInPaise.value = balanceResponse.data.data.walletBalanceInPaise;
    transactions.value = transactionResponse.data.data.transactions;
  } catch (err) {
    loadError.value = getApiErrorMessage(err);
  } finally {
    loading.value = false;
  }
}

async function submitTopUp() {
  amountError.value = '';
  submitError.value = '';
  const amount = Number(topUpAmount.value);

  if (!Number.isFinite(amount) || amount <= 0) {
    amountError.value = 'Enter an amount greater than 0';
    return;
  }

  submitting.value = true;

  try {
    await addMoney(rupeesToPaise(amount));
    topUpAmount.value = '';
    await loadWallet();
  } catch (err) {
    submitError.value = getApiErrorMessage(err);
  } finally {
    submitting.value = false;
  }
}

onMounted(loadWallet);
</script>
