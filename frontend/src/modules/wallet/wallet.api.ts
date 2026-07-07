import api from '@/services/axios';
import type { ApiResponse, WalletTransaction } from '@/services/apiTypes';

export function addMoney(amountInPaise: number) {
  return api.post<ApiResponse<{ walletBalanceInPaise: number; transaction: WalletTransaction }>>('/api/wallet/add-money', { amountInPaise });
}

export function getWalletBalance() {
  return api.get<ApiResponse<{ walletBalanceInPaise: number }>>('/api/wallet/balance');
}

export function getWalletTransactions() {
  return api.get<ApiResponse<{ transactions: WalletTransaction[] }>>('/api/wallet/transactions');
}
