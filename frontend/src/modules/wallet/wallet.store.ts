import { defineStore } from 'pinia';

import type { WalletTransaction } from '@/services/apiTypes';
import { MAX_WALLET_TOP_UP_IN_PAISE } from '@/utils/money';
import { getWalletErrorMessage } from '@/utils/userFacingError';
import { addMoneyApi, getWalletBalanceApi, getWalletTransactionsApi } from './wallet.api';

interface WalletState {
  walletBalanceInPaise: number;
  transactions: WalletTransaction[];
  loading: boolean;
  addingMoney: boolean;
  error: string;
}

export const useWalletStore = defineStore('wallet', {
  state: (): WalletState => ({ walletBalanceInPaise: 0, transactions: [], loading: false, addingMoney: false, error: '' }),
  actions: {
    async fetchBalance() {
      this.error = '';
      try {
        const response = await getWalletBalanceApi();
        this.walletBalanceInPaise = response.data.data.walletBalanceInPaise;
      } catch (error) { this.error = getWalletErrorMessage(error); throw error; }
    },
    async fetchTransactions() {
      this.error = '';
      try {
        const response = await getWalletTransactionsApi();
        this.transactions = response.data.data.transactions;
      } catch (error) { this.error = getWalletErrorMessage(error); throw error; }
    },
    async fetchWallet() {
      this.loading = true; this.error = '';
      try {
        const [balanceResponse, transactionsResponse] = await Promise.all([
          getWalletBalanceApi(),
          getWalletTransactionsApi(),
        ]);
        this.walletBalanceInPaise = balanceResponse.data.data.walletBalanceInPaise;
        this.transactions = transactionsResponse.data.data.transactions;
      } catch (error) {
        this.error = getWalletErrorMessage(error);
        throw error;
      } finally { this.loading = false; }
    },
    async addMoney(amountInPaise: number) {
      if (this.addingMoney) return null;
      if (!Number.isSafeInteger(amountInPaise) || amountInPaise <= 0 || amountInPaise > MAX_WALLET_TOP_UP_IN_PAISE) {
        this.error = 'Enter a valid wallet amount.';
        return null;
      }

      this.addingMoney = true; this.error = '';
      try {
        const response = await addMoneyApi(amountInPaise);
        this.walletBalanceInPaise = response.data.data.walletBalanceInPaise;
        await this.fetchTransactions();
        return response.data.data.transaction;
      } catch (error) { this.error = getWalletErrorMessage(error); throw error; }
      finally { this.addingMoney = false; }
    },
  },
});
