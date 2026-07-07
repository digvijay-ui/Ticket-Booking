import api from '@/services/axios';
import type { ApiResponse, WalletTransaction } from '@/services/apiTypes';

export function addMoneyApi(amountInPaise: number) {
  return api.post<ApiResponse<{ walletBalanceInPaise: number; transaction: WalletTransaction }>>('/api/wallet/add-money', { amountInPaise });
}

export function getWalletBalanceApi() {
  return api.get<ApiResponse<{ walletBalanceInPaise: number }>>('/api/wallet/balance');
}

export function getWalletTransactionsApi() {
  return api.get<ApiResponse<{ transactions: WalletTransaction[] }>>('/api/wallet/transactions');
}
