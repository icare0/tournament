'use client'

import { useState } from 'react'
import { useTransactions } from '@/features/wallet/api/use-wallet'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, TrendingUp, TrendingDown, Loader2, Download } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'
import type { TransactionType, TransactionStatus } from '@/features/wallet/types'

export default function TransactionsPage() {
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'ALL'>('ALL')
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'ALL'>('ALL')
  const [page, setPage] = useState(1)

  const { data: transactions, isLoading, error } = useTransactions({
    type: typeFilter !== 'ALL' ? typeFilter : undefined,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
    page,
    limit: 20,
  })

  const handleExport = () => {
    console.log('Export transactions to CSV')
    // Implement CSV export
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/wallet">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Transaction History</h1>
            <p className="text-muted-foreground">
              View all your wallet transactions
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select
                value={typeFilter}
                onValueChange={(value) =>
                  setTypeFilter(value as TransactionType | 'ALL')
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="DEPOSIT">Deposit</SelectItem>
                  <SelectItem value="WITHDRAWAL">Withdrawal</SelectItem>
                  <SelectItem value="TOURNAMENT_ENTRY">Tournament Entry</SelectItem>
                  <SelectItem value="PRIZE_PAYOUT">Prize Payout</SelectItem>
                  <SelectItem value="REFUND">Refund</SelectItem>
                  <SelectItem value="FEE">Fee</SelectItem>
                  <SelectItem value="TRANSFER">Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as TransactionStatus | 'ALL')
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="REVERSED">Reversed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load transactions. Please try again.
          </AlertDescription>
        </Alert>
      )}

      {/* Empty State */}
      {!isLoading && !error && transactions?.data.length === 0 && (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No transactions found</h3>
            <p className="text-muted-foreground mb-4">
              Your transaction history will appear here
            </p>
          </CardContent>
        </Card>
      )}

      {/* Transactions List */}
      {!isLoading && !error && transactions && transactions.data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>
              Showing {transactions.data.length} of {transactions.total} transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.data.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-12 w-12 rounded-full flex items-center justify-center ${
                        transaction.entryType === 'CREDIT'
                          ? 'bg-green-500/10'
                          : 'bg-red-500/10'
                      }`}
                    >
                      {transaction.entryType === 'CREDIT' ? (
                        <TrendingUp className="h-6 w-6 text-green-500" />
                      ) : (
                        <TrendingDown className="h-6 w-6 text-red-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">
                        {transaction.type.replace(/_/g, ' ')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.createdAt).toLocaleString()}
                      </p>
                      {transaction.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {transaction.description}
                        </p>
                      )}
                      {transaction.referenceId && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Ref: {transaction.referenceId.slice(0, 8)}...
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <p
                      className={`text-lg font-bold ${
                        transaction.entryType === 'CREDIT'
                          ? 'text-green-500'
                          : 'text-red-500'
                      }`}
                    >
                      {transaction.entryType === 'CREDIT' ? '+' : '-'}$
                      {parseFloat(transaction.amount).toFixed(2)}
                    </p>
                    <Badge
                      variant={
                        transaction.status === 'COMPLETED'
                          ? 'default'
                          : transaction.status === 'PENDING'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {transaction.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      Balance: ${parseFloat(transaction.balanceAfter).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {transactions && transactions.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {transactions.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(transactions.totalPages, p + 1))}
            disabled={page === transactions.totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
