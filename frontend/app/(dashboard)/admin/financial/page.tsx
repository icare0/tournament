'use client'

import { useState } from 'react'
import { DollarSign, TrendingUp, TrendingDown, Users, Trophy, Download } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ExportButton } from '@/components/analytics/export-button'

// Mock data - Replace with real API call to /billing/admin/financial-summary
const mockFinancialData = {
  period: 'month',
  deposits: 15000.0,
  withdrawals: 8000.0,
  entryFees: 12500.0,
  prizesAwarded: 10000.0,
  netFlow: 7000.0,
  platformRevenue: 2500.0,
  activeWallets: 450,
  totalLockedFunds: 3500.0,
}

export default function AdminFinancialPage() {
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month')
  const [data] = useState(mockFinancialData)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const stats = [
    {
      label: 'Total Deposits',
      value: formatCurrency(data.deposits),
      icon: TrendingUp,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Total Withdrawals',
      value: formatCurrency(data.withdrawals),
      icon: TrendingDown,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    {
      label: 'Entry Fees Collected',
      value: formatCurrency(data.entryFees),
      icon: Trophy,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Prizes Awarded',
      value: formatCurrency(data.prizesAwarded),
      icon: Trophy,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      label: 'Net Cash Flow',
      value: formatCurrency(data.netFlow),
      icon: DollarSign,
      color: data.netFlow >= 0 ? 'text-green-500' : 'text-red-500',
      bgColor: data.netFlow >= 0 ? 'bg-green-500/10' : 'bg-red-500/10',
    },
    {
      label: 'Platform Revenue',
      value: formatCurrency(data.platformRevenue),
      icon: DollarSign,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      label: 'Active Wallets',
      value: data.activeWallets.toString(),
      icon: Users,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
    },
    {
      label: 'Locked Funds',
      value: formatCurrency(data.totalLockedFunds),
      icon: DollarSign,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Financial Overview</h2>
          <p className="text-muted-foreground">
            Revenue analytics and transaction monitoring
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Last 24 Hours</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <ExportButton type="revenue" />
        </div>
      </div>

      {/* Revenue Highlight */}
      <Card className="p-8 bg-gradient-to-br from-purple-600 to-blue-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">Total Platform Revenue</p>
            <p className="text-4xl font-bold mt-2">{formatCurrency(data.platformRevenue)}</p>
            <p className="text-sm opacity-75 mt-1">
              {period.charAt(0).toUpperCase() + period.slice(1)} Period
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <DollarSign className="h-16 w-16 opacity-50" />
            <div className="text-right">
              <p className="text-xs opacity-75">Profit Margin</p>
              <p className="text-lg font-bold">
                {((data.platformRevenue / data.entryFees) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className={`text-2xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
              </div>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-2 gap-6">
        {/* Cash Flow */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Cash Flow Analysis</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <span className="text-sm text-muted-foreground">Total Inflow</span>
              <span className="font-bold text-green-500">
                +{formatCurrency(data.deposits + data.entryFees)}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <span className="text-sm text-muted-foreground">Total Outflow</span>
              <span className="font-bold text-red-500">
                -{formatCurrency(data.withdrawals + data.prizesAwarded)}
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="font-medium">Net Position</span>
              <span className={`text-lg font-bold ${
                data.netFlow >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {data.netFlow >= 0 ? '+' : ''}{formatCurrency(data.netFlow)}
              </span>
            </div>
          </div>
        </Card>

        {/* Tournament Economics */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Tournament Economics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <span className="text-sm text-muted-foreground">Entry Fees Collected</span>
              <span className="font-bold text-blue-500">{formatCurrency(data.entryFees)}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <span className="text-sm text-muted-foreground">Prizes Awarded</span>
              <span className="font-bold text-purple-500">
                {formatCurrency(data.prizesAwarded)}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <span className="text-sm text-muted-foreground">Platform Fee (20%)</span>
              <span className="font-bold text-emerald-500">
                {formatCurrency(data.platformRevenue)}
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="font-medium">Locked in Escrow</span>
              <span className="text-lg font-bold text-yellow-500">
                {formatCurrency(data.totalLockedFunds)}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Key Metrics */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">Key Performance Indicators</h3>
        <div className="grid grid-cols-3 gap-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Average Transaction Size</p>
            <p className="text-2xl font-bold">
              {formatCurrency(data.deposits / (data.activeWallets || 1))}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Withdrawal Rate</p>
            <p className="text-2xl font-bold">
              {((data.withdrawals / data.deposits) * 100).toFixed(1)}%
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Prize Payout Ratio</p>
            <p className="text-2xl font-bold">
              {((data.prizesAwarded / data.entryFees) * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
