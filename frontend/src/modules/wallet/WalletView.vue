<template>
  <div class="space-y-6 text-paperCream">
    <div>
      <p class="font-mono text-xs font-semibold uppercase text-ticketGold">Receipt desk</p>
      <h1 class="font-display text-6xl leading-none text-paperCream">WALLET LEDGER</h1>
      <p class="max-w-2xl text-paperCream/70">Load your wallet in rupees. The backend receives paise only.</p>
    </div>

    <section class="grid gap-5 lg:grid-cols-[360px_1fr]">
      <div class="h-fit rounded-md border-2 border-stubCharcoal bg-paperCream p-5 text-stubCharcoal shadow-ticket">
        <p class="font-mono text-xs font-bold uppercase text-stubCharcoal/55">Available balance</p>
        <p class="mt-1 font-display text-6xl leading-none text-stubCharcoal">{{ formatINR(wallet.walletBalanceInPaise) }}</p>

        <div class="mt-6 grid grid-cols-3 gap-2">
          <button
            v-for="amount in quickAmounts"
            :key="amount"
            type="button"
            class="focus-ticket rounded-sm border-2 border-stubCharcoal/20 bg-ticketGold px-3 py-2 font-mono text-xs font-bold text-stubCharcoal hover:bg-stubCharcoal hover:text-paperCream"
            @click="setQuickAmount(amount)"
          >
            ₹{{ amount }}
          </button>
        </div>

        <form class="mt-5 space-y-4" @submit.prevent="submitTopUp">
          <label class="block">
            <span class="mb-2 block font-mono text-xs font-semibold uppercase text-stubCharcoal/70">Add amount in rupees</span>
            <input
              v-model="topUpAmount"
              class="focus-ticket w-full rounded-sm border-2 border-stubCharcoal/25 bg-white px-4 py-3 text-stubCharcoal placeholder:text-stubCharcoal/45"
              :class="{ 'border-marqueeRed': amountError }"
              inputmode="numeric"
              placeholder="1000"
              type="text"
            />
            <span v-if="amountError" class="mt-2 block font-mono text-xs font-semibold text-marqueeRed">{{ amountError }}</span>
          </label>

          <p v-if="successMessage" class="rounded-sm bg-electricTeal/15 px-3 py-2 text-sm font-semibold text-stubCharcoal">
            {{ successMessage }}
          </p>
          <p v-if="wallet.error && !wallet.loading" class="rounded-sm bg-marqueeRed/10 px-3 py-2 text-sm font-semibold text-marqueeRed">
            {{ wallet.error }}
          </p>

          <AppButton class="w-full" type="submit" icon="mdi:wallet-plus" :loading="wallet.addingMoney">
            {{ wallet.addingMoney ? 'Please wait...' : 'Add money' }}
          </AppButton>
        </form>
      </div>

      <div class="rounded-md border-2 border-paperCream/10 bg-deepPlum p-5">
        <div class="mb-5 flex items-center justify-between">
          <div>
            <p class="font-mono text-xs font-bold uppercase text-ticketGold">Receipt roll</p>
            <h2 class="font-display text-4xl leading-none">Transactions</h2>
          </div>
          <button type="button" class="focus-ticket rounded-sm bg-paperCream/10 px-3 py-2 font-mono text-xs font-bold uppercase hover:bg-paperCream hover:text-stubCharcoal" @click="wallet.fetchWallet">
            Refresh
          </button>
        </div>

        <div v-if="wallet.loading" class="flex min-h-44 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>

        <div v-else-if="wallet.error" class="rounded-sm border border-marqueeRed/50 bg-marqueeRed/10 p-5 text-sm font-semibold">
          {{ wallet.error }}
        </div>

        <div v-else-if="wallet.transactions.length" class="space-y-3">
          <article
            v-for="transaction in wallet.transactions"
            :key="transaction.id"
            class="relative overflow-hidden rounded-md bg-paperCream p-4 text-stubCharcoal shadow-ticket"
          >
            <span class="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-deepPlum" aria-hidden="true" />
            <span class="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-deepPlum" aria-hidden="true" />

            <div class="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
              <div>
                <div class="flex flex-wrap items-center gap-2">
                  <AppBadge :variant="transactionVariant(transaction.type)" :label="transaction.type" />
                  <span class="font-mono text-xs font-bold uppercase text-stubCharcoal/50">{{ transaction.referenceType }}</span>
                </div>
                <p class="mt-3 font-bold">{{ transaction.description }}</p>
                <p class="mt-1 font-mono text-xs text-stubCharcoal/55">{{ formatDateTime(transaction.createdAt) }}</p>
              </div>
              <div class="sm:text-right">
                <p class="font-display text-3xl leading-none" :class="amountClass(transaction.type)">
                  {{ transaction.type === 'DEBIT' ? '-' : '+' }}{{ formatINR(transaction.amountInPaise) }}
                </p>
                <p class="mt-1 font-mono text-xs text-stubCharcoal/55">Balance {{ formatINR(transaction.balanceAfterInPaise) }}</p>
              </div>
            </div>
          </article>
        </div>

        <div v-else class="rounded-md border border-paperCream/10 bg-inkNight/35 p-8 text-center">
          <Icon icon="mdi:receipt-text-outline" class="mx-auto h-10 w-10 text-paperCream/45" aria-hidden="true" />
          <p class="mt-3 font-bold">No wallet transactions yet.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { onMounted, ref } from 'vue';

import AppBadge from '@/components/common/AppBadge.vue';
import AppButton from '@/components/common/AppButton.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import { formatDateTime } from '@/utils/date';
import { formatINR } from '@/utils/money';
import { useWalletStore } from './wallet.store';

const wallet = useWalletStore();
const topUpAmount = ref('');
const amountError = ref('');
const successMessage = ref('');
const quickAmounts = [500, 1000, 2000];

function setQuickAmount(amount: number) {
  topUpAmount.value = String(amount);
  amountError.value = '';
  successMessage.value = '';
}

function validateAmount() {
  amountError.value = '';
  const trimmedAmount = topUpAmount.value.trim();

  if (!trimmedAmount) {
    amountError.value = 'Amount is required';
    return null;
  }

  if (!/^\d+$/.test(trimmedAmount)) {
    amountError.value = 'Amount must be a whole number';
    return null;
  }

  const amount = Number(trimmedAmount);

  if (!Number.isSafeInteger(amount) || amount <= 0) {
    amountError.value = 'Amount must be greater than 0';
    return null;
  }

  return amount;
}

async function submitTopUp() {
  successMessage.value = '';
  const amount = validateAmount();

  if (amount === null) {
    return;
  }

  try {
    await wallet.addMoney(amount);
    topUpAmount.value = '';
    successMessage.value = `Added ${formatINR(amount * 100)} to your wallet`;
  } catch {
    // The store already exposes the backend error message.
  }
}

function transactionVariant(type: 'CREDIT' | 'DEBIT' | 'REFUND') {
  if (type === 'CREDIT') return 'paid';
  if (type === 'REFUND') return 'refunded';
  return 'cancelled';
}

function amountClass(type: 'CREDIT' | 'DEBIT' | 'REFUND') {
  if (type === 'CREDIT') return 'text-electricTeal';
  if (type === 'REFUND') return 'text-ticketGold';
  return 'text-marqueeRed';
}

onMounted(() => {
  wallet.fetchWallet();
});
</script>
