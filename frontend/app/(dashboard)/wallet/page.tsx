'use client'

import Link from 'next/link'
import { useWallet, useBalance, useTransactions } from '@/features/wallet/api/use-wallet'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Wallet, TrendingUp, TrendingDown, DollarSign, Download, Upload, History } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function WalletPage() {
  const { data: wallet, isLoading: walletLoading } = useWallet()
  const { data: balance, isLoading: balanceLoading } = useBalance()
  const { data: transactions, isLoading: transactionsLoading } = useTransactions({ page: 1, limit: 5 })

  const isLoading = walletLoading || balanceLoading || transactionsLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!wallet || !balance) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load wallet data. Please try again.
        </AlertDescription>
      </Alert>
    )
  }

  const totalBalance = parseFloat(balance.balance)
  const lockedBalance = parseFloat(balance.lockedBalance)
  const availableBalance = totalBalance - lockedBalance

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">My Wallet</h1>
        <p className="text-muted-foreground">
          Manage your funds and view transaction history
        </p>
      </div>

      {/* Balance Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${totalBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {wallet.currency}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">
              ${availableBalance.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Ready to use
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Locked</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-500">
              ${lockedBalance.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              In tournaments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Manage your wallet with quick actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button className="h-20 flex-col gap-2" variant="outline" asChild>
              <Link href="/dashboard/wallet/deposit">
                <Upload className="h-6 w-6" />
                <span>Deposit Funds</span>
              </Link>
            </Button>

            <Button className="h-20 flex-col gap-2" variant="outline" asChild>
              <Link href="/dashboard/wallet/withdraw">
                <Download className="h-6 w-6" />
                <span>Withdraw Funds</span>
              </Link>
            </Button>

            <Button className="h-20 flex-col gap-2" variant="outline" asChild>
              <Link href="/dashboard/wallet/transactions">
                <History className="h-6 w-6" />
                <span>View All Transactions</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Your latest wallet activity
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/wallet/transactions">
                View All
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {transactions && transactions.data.length > 0 ? (
            <div className="space-y-4">
              {transactions.data.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        transaction.entryType === 'CREDIT'
                          ? 'bg-green-500/10'
                          : 'bg-red-500/10'
                      }`}
                    >
                      {transaction.entryType === 'CREDIT' ? (
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {transaction.type.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.createdAt).toLocaleString()}
                      </p>
                      {transaction.description && (
                        <p className="text-xs text-muted-foreground">
                          {transaction.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
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
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No transactions yet
            </p>
          )}
        </CardContent>
      </Card>

      {/* Wallet Status */}
      <Card>
        <CardHeader>
          <CardTitle>Wallet Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Wallet ID</span>
            <span className="text-sm font-mono">{wallet.id}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Currency</span>
            <span className="text-sm font-medium">{wallet.currency}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge
              variant={wallet.status === 'ACTIVE' ? 'default' : 'destructive'}
            >
              {wallet.status}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Created</span>
            <span className="text-sm">
              {new Date(wallet.createdAt).toLocaleDateString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
