'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import type {
  Wallet,
  Transaction,
  TransactionListResponse,
  TransactionFilters,
  DepositRequest,
  WithdrawRequest,
  TransferRequest,
} from '../types'

// ============================================
// API Functions
// ============================================

export const walletAPI = {
  // Get my wallet
  getMyWallet: async (): Promise<Wallet> => {
    const response = await apiClient.get<Wallet>('/billing/wallet')
    return response.data
  },

  // Get balance
  getBalance: async (): Promise<{ balance: string; lockedBalance: string }> => {
    const response = await apiClient.get<{
      balance: string
      lockedBalance: string
    }>('/billing/balance')
    return response.data
  },

  // Get transactions
  getTransactions: async (
    filters?: TransactionFilters
  ): Promise<TransactionListResponse> => {
    const response = await apiClient.get<TransactionListResponse>(
      '/billing/transactions',
      {
        params: filters,
      }
    )
    return response.data
  },

  // Deposit
  deposit: async (data: DepositRequest): Promise<Transaction> => {
    const response = await apiClient.post<Transaction>('/billing/deposit', data)
    return response.data
  },

  // Withdraw
  withdraw: async (data: WithdrawRequest): Promise<Transaction> => {
    const response = await apiClient.post<Transaction>('/billing/withdraw', data)
    return response.data
  },

  // Transfer to another user
  transfer: async (data: TransferRequest): Promise<Transaction> => {
    const response = await apiClient.post<Transaction>('/billing/transfer', data)
    return response.data
  },
}

// ============================================
// Hooks
// ============================================

export function useWallet() {
  return useQuery({
    queryKey: ['wallet'],
    queryFn: walletAPI.getMyWallet,
    staleTime: 1000 * 60, // 1 minute
  })
}

export function useBalance() {
  return useQuery({
    queryKey: ['wallet', 'balance'],
    queryFn: walletAPI.getBalance,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute
  })
}

export function useTransactions(filters?: TransactionFilters) {
  return useQuery({
    queryKey: ['wallet', 'transactions', filters],
    queryFn: () => walletAPI.getTransactions(filters),
    staleTime: 1000 * 60, // 1 minute
  })
}

export function useDeposit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: walletAPI.deposit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] })
      queryClient.invalidateQueries({ queryKey: ['wallet', 'balance'] })
      queryClient.invalidateQueries({ queryKey: ['wallet', 'transactions'] })
    },
  })
}

export function useWithdraw() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: walletAPI.withdraw,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] })
      queryClient.invalidateQueries({ queryKey: ['wallet', 'balance'] })
      queryClient.invalidateQueries({ queryKey: ['wallet', 'transactions'] })
    },
  })
}

export function useTransfer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: walletAPI.transfer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] })
      queryClient.invalidateQueries({ queryKey: ['wallet', 'balance'] })
      queryClient.invalidateQueries({ queryKey: ['wallet', 'transactions'] })
    },
  })
}
