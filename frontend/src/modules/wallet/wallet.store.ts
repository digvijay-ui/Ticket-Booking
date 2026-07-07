import { defineStore } from 'pinia';

import type { WalletTransaction } from '@/services/apiTypes';
import { getApiErrorMessage } from '@/utils/apiError';
import { rupeesToPaise } from '@/utils/money';
import { addMoneyApi, getWalletBalanceApi, getWalletTransactionsApi } from './wallet.api';

interface WalletState {
  walletBalanceInPaise: number;
  transactions: WalletTransaction[];
  loading: boolean;
  addingMoney: boolean;
  error: string;
}

export const useWalletStore = defineStore('wallet', {
  state: (): WalletState => ({
    walletBalanceInPaise: 0,
    transactions: [],
    loading: false,
    addingMoney: false,
    error: '',
  }),
  actions: {
    async fetchBalance() {
      this.error = '';

      try {
        const response = await getWalletBalanceApi();
        this.walletBalanceInPaise = response.data.data.walletBalanceInPaise;
      } catch (error) {
        this.error = getApiErrorMessage(error);
        throw error;
      }
    },
    async fetchTransactions() {
      this.error = '';

      try {
        const response = await getWalletTransactionsApi();
        this.transactions = response.data.data.transactions;
      } catch (error) {
        this.error = getApiErrorMessage(error);
        throw error;
      }
    },
    async fetchWallet() {
      this.loading = true;
      this.error = '';

      try {
        await Promise.all([this.fetchBalance(), this.fetchTransactions()]);
      } finally {
        this.loading = false;
      }
    },
    async addMoney(amountInRupees: number) {
      this.addingMoney = true;
      this.error = '';

      try {
        const amountInPaise = rupeesToPaise(amountInRupees);
        await addMoneyApi(amountInPaise);
        await this.fetchWallet();
      } catch (error) {
        this.error = getApiErrorMessage(error);
        throw error;
      } finally {
        this.addingMoney = false;
      }
    },
  },
});
