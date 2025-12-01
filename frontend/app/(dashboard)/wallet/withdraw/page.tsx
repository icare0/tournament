'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useBalance, useWithdraw } from '@/features/wallet/api/use-wallet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Loader2, DollarSign, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function WithdrawPage() {
  const router = useRouter()
  const { data: balance } = useBalance()
  const { mutate: withdraw, isPending, error } = useWithdraw()

  const [formData, setFormData] = useState({
    amount: '',
    method: 'bank_transfer',
    destination: '',
    description: '',
  })

  const availableBalance = balance
    ? parseFloat(balance.balance) - parseFloat(balance.lockedBalance)
    : 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const amount = parseFloat(formData.amount)

    if (amount <= 0) {
      return
    }

    if (amount > availableBalance) {
      return
    }

    withdraw(
      {
        amount,
        method: formData.method,
        destination: formData.destination,
        metadata: {
          description: formData.description,
        },
      },
      {
        onSuccess: () => {
          router.push('/dashboard/wallet')
        },
      }
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const amountError =
    formData.amount && parseFloat(formData.amount) > availableBalance

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/wallet">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Withdraw Funds</h1>
          <p className="text-muted-foreground">
            Transfer money from your wallet to your bank account
          </p>
        </div>
      </div>

      {/* Available Balance Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-3xl font-bold text-green-500">
                ${availableBalance.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">
                Ready to withdraw
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Withdraw Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Withdrawal Details</CardTitle>
            <CardDescription>
              Enter the amount and destination for your withdrawal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>
                  {error instanceof Error
                    ? error.message
                    : 'Withdrawal failed. Please try again.'}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USD) *</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                max={availableBalance}
                placeholder="0.00"
                value={formData.amount}
                onChange={handleChange}
                required
                disabled={isPending}
              />
              {amountError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Amount exceeds available balance (${availableBalance.toFixed(2)})
                  </AlertDescription>
                </Alert>
              )}
              <p className="text-xs text-muted-foreground">
                Minimum withdrawal: $10.00
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="method">Withdrawal Method *</Label>
              <Select
                value={formData.method}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, method: value }))
                }
                disabled={isPending}
              >
                <SelectTrigger id="method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="crypto">Cryptocurrency</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination">Destination *</Label>
              <Input
                id="destination"
                name="destination"
                type="text"
                placeholder={
                  formData.method === 'bank_transfer'
                    ? 'Account number or IBAN'
                    : formData.method === 'paypal'
                    ? 'PayPal email'
                    : 'Wallet address'
                }
                value={formData.destination}
                onChange={handleChange}
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                name="description"
                type="text"
                placeholder="Add a note..."
                value={formData.description}
                onChange={handleChange}
                disabled={isPending}
              />
            </div>

            {/* Fee Information */}
            <Alert>
              <AlertDescription>
                <p className="font-medium mb-1">Processing Fee</p>
                <p className="text-sm">
                  A 2.5% processing fee will be deducted from your withdrawal amount.
                  Estimated arrival time: 1-3 business days.
                </p>
              </AlertDescription>
            </Alert>

            {/* Summary */}
            {formData.amount && parseFloat(formData.amount) > 0 && (
              <div className="p-4 rounded-lg border space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Withdrawal amount</span>
                  <span className="font-medium">${parseFloat(formData.amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Processing fee (2.5%)</span>
                  <span className="font-medium text-red-500">
                    -${(parseFloat(formData.amount) * 0.025).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-semibold">You will receive</span>
                  <span className="font-bold text-lg">
                    ${(parseFloat(formData.amount) * 0.975).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 justify-end mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending || amountError}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Withdraw Funds
          </Button>
        </div>
      </form>
    </div>
  )
}
