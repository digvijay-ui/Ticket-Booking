<template>
  <div class="wallet-page min-h-screen overflow-x-clip bg-midnight-ink px-5 pb-24 pt-28 text-midnight-ivory sm:px-8 lg:px-12 lg:pt-32">
    <div class="mx-auto max-w-[1320px]">
      <header class="flex flex-col gap-5 border-b border-white/10 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div><p class="text-[10px] font-extrabold uppercase tracking-[0.18em] text-midnight-mint">Your ticket fund</p><h1 class="mt-3 text-4xl font-black tracking-[-0.055em] sm:text-6xl">Wallet ledger.</h1><p class="mt-3 max-w-2xl text-sm font-medium leading-6 text-midnight-stone">A simple balance for tickets, refunds, and nothing else.</p></div>
        <AppButton variant="midnight" class="rounded-full" icon="mdi:wallet-plus-outline" @click="topUpOpen = true">Add money</AppButton>
      </header>

      <WalletSkeleton v-if="wallet.loading && !wallet.transactions.length" class="mt-7" />

      <div v-else class="mt-7 grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        <section class="wallet-balance relative h-fit overflow-hidden rounded-[26px] bg-midnight-ember p-7 text-white">
          <div class="relative"><div class="flex items-center justify-between"><p class="text-[9px] font-extrabold uppercase tracking-[0.18em] text-white/70">Available balance</p><Icon icon="mdi:ticket-confirmation-outline" class="h-6 w-6" aria-hidden="true" /></div><p class="mt-10 break-words text-[clamp(2.6rem,5vw,4.4rem)] font-black leading-none tracking-[-0.06em]">{{ formatINR(wallet.walletBalanceInPaise) }}</p><p class="mt-4 text-sm font-semibold text-white/75">Ready for your next booking.</p><div class="mt-10 flex items-end justify-between border-t border-dashed border-white/35 pt-5"><span class="text-[9px] font-extrabold uppercase tracking-[0.18em]">EventBooking Wallet</span><span class="wallet-barcode h-8 w-20" aria-hidden="true" /></div></div>
        </section>

        <section class="min-w-0 rounded-[26px] border border-white/10 bg-midnight-surface p-5 sm:p-7" aria-labelledby="wallet-transactions-heading">
          <div class="flex items-center justify-between gap-4"><div><p class="text-[9px] font-extrabold uppercase tracking-[0.18em] text-midnight-mint">Ticket ledger</p><h2 id="wallet-transactions-heading" class="mt-2 text-2xl font-black tracking-[-0.035em]">Recent transactions</h2></div><button type="button" class="focus-midnight grid h-11 w-11 place-items-center rounded-full border border-white/15 text-midnight-stone hover:text-midnight-ivory" :disabled="wallet.loading" aria-label="Refresh wallet transactions" @click="loadWallet"><Icon icon="mdi:refresh" class="h-5 w-5" :class="{ 'animate-spin': wallet.loading }" aria-hidden="true" /></button></div>

          <div v-if="wallet.error" class="mt-6 rounded-2xl border border-midnight-ember/35 bg-midnight-ember/10 p-5" role="alert"><p class="font-extrabold">Your wallet didn’t load.</p><p class="mt-1 text-sm text-midnight-stone">{{ wallet.error }}</p><button type="button" class="focus-midnight mt-4 text-sm font-extrabold text-midnight-ivory underline decoration-midnight-ember underline-offset-4" @click="loadWallet">Try again</button></div>
          <div v-else-if="wallet.transactions.length" class="mt-6 divide-y divide-white/10">
            <article v-for="transaction in wallet.transactions" :key="transaction.id" class="grid gap-4 py-5 first:pt-0 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
              <span class="grid h-11 w-11 place-items-center rounded-xl border" :class="transactionVisual(transaction.type).class"><Icon :icon="transactionVisual(transaction.type).icon" class="h-5 w-5" aria-hidden="true" /></span>
              <div class="min-w-0"><div class="flex flex-wrap items-center gap-2"><span class="text-[9px] font-extrabold uppercase tracking-[0.15em]" :class="transactionVisual(transaction.type).text">{{ transaction.type }}</span><span class="text-[9px] font-bold uppercase tracking-[0.13em] text-midnight-stone">{{ transaction.referenceType }}</span></div><p class="mt-1 truncate text-sm font-bold text-midnight-ivory">{{ transaction.description }}</p><p class="mt-1 text-xs font-medium text-midnight-stone">{{ formatDateTime(transaction.createdAt) }}<span v-if="transaction.referenceId"> · Ref {{ transaction.referenceId }}</span></p></div>
              <div class="sm:text-right"><p class="text-lg font-black" :class="transactionVisual(transaction.type).text">{{ transaction.type === 'DEBIT' ? '−' : '+' }}{{ formatINR(transaction.amountInPaise) }}</p><p class="mt-1 text-xs font-semibold text-midnight-stone">Balance {{ formatINR(transaction.balanceAfterInPaise) }}</p></div>
            </article>
          </div>
          <div v-else class="mt-6 rounded-2xl border border-dashed border-white/15 px-6 py-12 text-center"><Icon icon="mdi:receipt-text-outline" class="mx-auto h-8 w-8 text-midnight-stone" aria-hidden="true" /><h3 class="mt-4 text-xl font-extrabold">Your ledger is empty.</h3><p class="mt-2 text-sm text-midnight-stone">Add money when you’re ready to book your first event.</p></div>
        </section>
      </div>

      <p v-if="successMessage" class="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full border border-midnight-mint/40 bg-midnight-surface px-5 py-3 text-sm font-bold shadow-2xl" role="status">{{ successMessage }}</p>
      <AddMoneyPanel :open="topUpOpen" :adding="wallet.addingMoney" :error="wallet.error" @close="topUpOpen = false" @add="addMoney" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { onMounted, ref } from 'vue';
import AppButton from '@/components/common/AppButton.vue';
import AddMoneyPanel from '@/components/wallet/AddMoneyPanel.vue';
import WalletSkeleton from '@/components/wallet/WalletSkeleton.vue';
import { formatDateTime } from '@/utils/date';
import { formatINR } from '@/utils/money';
import { useWalletStore } from '../wallet.store';

const wallet = useWalletStore();
const topUpOpen = ref(false);
const successMessage = ref('');

function transactionVisual(type: 'CREDIT' | 'DEBIT' | 'REFUND') {
  if (type === 'CREDIT') return { icon: 'mdi:arrow-down-left', class: 'border-midnight-mint/40 bg-midnight-mint/10 text-midnight-mint', text: 'text-midnight-mint' };
  if (type === 'REFUND') return { icon: 'mdi:backup-restore', class: 'border-midnight-ivory/25 bg-white/[0.04] text-midnight-ivory', text: 'text-midnight-ivory' };
  return { icon: 'mdi:ticket-confirmation-outline', class: 'border-midnight-ember/40 bg-midnight-ember/10 text-midnight-ember', text: 'text-midnight-ember' };
}
async function loadWallet() { try { await wallet.fetchWallet(); } catch { /* Safe store error is rendered. */ } }
async function addMoney(amountInPaise: number) {
  successMessage.value = '';
  try {
    const transaction = await wallet.addMoney(amountInPaise);
    if (!transaction) return;
    topUpOpen.value = false;
    successMessage.value = `${formatINR(amountInPaise)} added to your wallet.`;
    window.setTimeout(() => { successMessage.value = ''; }, 4000);
  } catch { /* Safe store error remains in the panel. */ }
}
onMounted(loadWallet);
</script>

<style scoped>
.wallet-balance::before{position:absolute;right:-20%;top:-35%;width:75%;aspect-ratio:1;content:'';border:1px solid rgb(255 255 255 / .35);border-radius:999px}.wallet-barcode{background:repeating-linear-gradient(90deg,currentColor 0 2px,transparent 2px 5px,currentColor 5px 8px,transparent 8px 11px)}
@media (prefers-reduced-motion:reduce){.animate-spin{animation:none}}
</style>
