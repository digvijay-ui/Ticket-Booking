<template>
  <Teleport to="body">
    <Transition name="wallet-panel">
      <div v-if="open" class="fixed inset-0 z-[70] grid place-items-end bg-midnight-ink/80 p-0 backdrop-blur-sm sm:place-items-center sm:p-6" @click.self="close">
        <section ref="panel" role="dialog" aria-modal="true" aria-labelledby="add-money-title" class="w-full max-w-lg rounded-t-[26px] border border-white/10 bg-midnight-surface p-6 text-midnight-ivory shadow-2xl sm:rounded-[26px] sm:p-8" @keydown.esc="close">
          <div class="flex items-start justify-between gap-4">
            <div><p class="text-[9px] font-extrabold uppercase tracking-[0.18em] text-midnight-mint">Wallet top-up</p><h2 id="add-money-title" class="mt-2 text-3xl font-black tracking-[-0.04em]">Add money</h2></div>
            <button type="button" class="focus-midnight grid h-11 w-11 place-items-center rounded-full border border-white/15 text-midnight-stone hover:text-midnight-ivory" :disabled="adding" aria-label="Close add money panel" @click="close"><Icon icon="mdi:close" class="h-5 w-5" aria-hidden="true" /></button>
          </div>

          <p class="mt-3 text-sm font-medium leading-6 text-midnight-stone">Enter a rupee amount. It is converted to exact integer paise before being sent.</p>
          <div class="mt-6 grid grid-cols-3 gap-2">
            <button v-for="amount in quickAmounts" :key="amount" type="button" class="focus-midnight min-h-11 rounded-xl border border-white/10 text-sm font-extrabold text-midnight-ivory hover:border-midnight-mint/50" @click="amountInput = String(amount)">₹{{ amount.toLocaleString('en-IN') }}</button>
          </div>

          <form class="mt-5" @submit.prevent="submit">
            <label for="wallet-amount" class="block text-xs font-extrabold text-midnight-ivory">Amount in rupees</label>
            <div class="relative mt-2">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-extrabold text-midnight-stone" aria-hidden="true">₹</span>
              <input id="wallet-amount" ref="amountField" v-model="amountInput" name="amount" inputmode="decimal" autocomplete="off" class="focus-midnight min-h-14 w-full rounded-xl border bg-midnight-ink pl-9 pr-4 text-xl font-extrabold text-midnight-ivory outline-none" :class="localError ? 'border-midnight-ember' : 'border-white/15 focus:border-midnight-mint'" placeholder="1,000" :aria-invalid="Boolean(localError)" :aria-describedby="localError ? 'wallet-amount-error' : 'wallet-amount-preview'" />
            </div>
            <p v-if="localError" id="wallet-amount-error" class="mt-2 text-xs font-bold text-midnight-ember">{{ localError }}</p>
            <p v-else id="wallet-amount-preview" class="mt-2 text-xs font-semibold text-midnight-stone">You’ll add <strong class="text-midnight-ivory">{{ preview }}</strong></p>
            <p v-if="error" class="mt-4 rounded-xl border border-midnight-ember/35 bg-midnight-ember/10 p-3 text-sm font-semibold" role="alert">{{ error }}</p>
            <AppButton variant="midnight" type="submit" class="mt-6 w-full rounded-full" icon="mdi:wallet-plus-outline" :loading="adding" :disabled="!parsedAmount">Confirm {{ preview }}</AppButton>
          </form>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { computed, nextTick, ref, watch } from 'vue';
import AppButton from '@/components/common/AppButton.vue';
import { formatINR, parseRupeeInputToPaise } from '@/utils/money';

const props = withDefaults(defineProps<{ open: boolean; adding: boolean; error?: string; suggestedAmountInPaise?: number }>(), { error: '', suggestedAmountInPaise: 0 });
const emit = defineEmits<{ close: []; add: [amountInPaise: number] }>();
const amountInput = ref('');
const localError = ref('');
const amountField = ref<HTMLInputElement | null>(null);
const quickAmounts = [500, 1000, 2000];
const parsed = computed(() => parseRupeeInputToPaise(amountInput.value));
const parsedAmount = computed(() => parsed.value.amountInPaise);
const preview = computed(() => formatINR(parsedAmount.value ?? 0));

watch(amountInput, () => { localError.value = ''; });

watch(() => props.open, async (open) => {
  if (!open) return;
  amountInput.value = props.suggestedAmountInPaise > 0 ? String(Math.ceil(props.suggestedAmountInPaise / 100)) : '';
  localError.value = '';
  await nextTick();
  amountField.value?.focus();
});

function close() { if (!props.adding) emit('close'); }
function submit() {
  localError.value = parsed.value.error;
  if (parsedAmount.value === null) return;
  emit('add', parsedAmount.value);
}
</script>

<style scoped>
.wallet-panel-enter-active,.wallet-panel-leave-active{transition:opacity 180ms ease}.wallet-panel-enter-active section,.wallet-panel-leave-active section{transition:transform 220ms cubic-bezier(.2,.8,.2,1)}.wallet-panel-enter-from,.wallet-panel-leave-to{opacity:0}.wallet-panel-enter-from section,.wallet-panel-leave-to section{transform:translateY(18px)}
@media (prefers-reduced-motion:reduce){.wallet-panel-enter-active,.wallet-panel-leave-active,.wallet-panel-enter-active section,.wallet-panel-leave-active section{transition:none}}
</style>
