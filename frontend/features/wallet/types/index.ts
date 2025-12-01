// Wallet & Billing Types

export type WalletStatus = 'ACTIVE' | 'FROZEN' | 'CLOSED'

export interface Wallet {
  id: string
  userId: string
  balance: string
  lockedBalance: string
  currency: string
  status: WalletStatus
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export type TransactionType =
  | 'DEPOSIT'
  | 'WITHDRAWAL'
  | 'TOURNAMENT_ENTRY'
  | 'PRIZE_PAYOUT'
  | 'REFUND'
  | 'FEE'
  | 'TRANSFER'

export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED'

export type EntryType = 'DEBIT' | 'CREDIT'

export interface Transaction {
  id: string
  walletId: string
  userId: string
  type: TransactionType
  entryType: EntryType
  amount: string
  status: TransactionStatus
  referenceId?: string
  referenceType?: string
  counterpartyTransactionId?: string
  balanceAfter: string
  description?: string
  metadata?: Record<string, any>
  createdAt: string
  processedAt?: string
}

export interface DepositRequest {
  amount: number
  paymentMethod: string
  metadata?: Record<string, any>
}

export interface WithdrawRequest {
  amount: number
  method: string
  destination: string
  metadata?: Record<string, any>
}

export interface TransferRequest {
  recipientId: string
  amount: number
  description?: string
}

export interface TransactionFilters {
  type?: TransactionType
  status?: TransactionStatus
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export interface TransactionListResponse {
  data: Transaction[]
  total: number
  page: number
  limit: number
  totalPages: number
}
