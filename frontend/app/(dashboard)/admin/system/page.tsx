'use client'

import { useState } from 'react'
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Database,
  DollarSign,
  Server,
  Loader2,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Mock data - Replace with real API call to /billing/admin/validate-integrity
const mockIntegrityData = {
  isValid: true,
  totalDebits: 50000.0,
  totalCredits: 50000.0,
  difference: 0.0,
  issues: [],
}

export default function AdminSystemPage() {
  const [checking, setChecking] = useState(false)
  const [lastCheck, setLastCheck] = useState(new Date())
  const [integrity] = useState(mockIntegrityData)

  const handleCheckIntegrity = async () => {
    setChecking(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setLastCheck(new Date())
    setChecking(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">System Health</h2>
          <p className="text-muted-foreground">
            Monitor system integrity and database consistency
          </p>
        </div>
        <Button onClick={handleCheckIntegrity} disabled={checking}>
          {checking ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Run Integrity Check
            </>
          )}
        </Button>
      </div>

      {/* System Status */}
      <Card
        className={`p-8 ${
          integrity.isValid
            ? 'bg-gradient-to-br from-green-600 to-emerald-600'
            : 'bg-gradient-to-br from-red-600 to-pink-600'
        } text-white`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">System Status</p>
            <p className="text-4xl font-bold mt-2">
              {integrity.isValid ? 'Healthy' : 'Issues Detected'}
            </p>
            <p className="text-sm opacity-75 mt-1">
              Last checked: {lastCheck.toLocaleString()}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {integrity.isValid ? (
              <CheckCircle className="h-16 w-16 opacity-50" />
            ) : (
              <AlertTriangle className="h-16 w-16 opacity-50" />
            )}
            <div className="text-right">
              <p className="text-xs opacity-75">Issues Found</p>
              <p className="text-lg font-bold">{integrity.issues.length}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Issues Alert */}
      {integrity.issues.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Critical Issues Detected:</strong>
            <ul className="mt-2 space-y-1">
              {integrity.issues.map((issue, index) => (
                <li key={index}>• {issue}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Total Debits</p>
              <p className="text-2xl font-bold text-red-500 mt-2">
                {formatCurrency(integrity.totalDebits)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Money leaving system</p>
            </div>
            <div className="p-2 rounded-lg bg-red-500/10">
              <DollarSign className="h-5 w-5 text-red-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Total Credits</p>
              <p className="text-2xl font-bold text-green-500 mt-2">
                {formatCurrency(integrity.totalCredits)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Money entering system</p>
            </div>
            <div className="p-2 rounded-lg bg-green-500/10">
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Difference</p>
              <p
                className={`text-2xl font-bold mt-2 ${
                  Math.abs(integrity.difference) < 0.01
                    ? 'text-green-500'
                    : 'text-red-500'
                }`}
              >
                {formatCurrency(Math.abs(integrity.difference))}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {Math.abs(integrity.difference) < 0.01
                  ? 'Balanced ✓'
                  : 'Imbalanced ✗'}
              </p>
            </div>
            <div
              className={`p-2 rounded-lg ${
                Math.abs(integrity.difference) < 0.01
                  ? 'bg-green-500/10'
                  : 'bg-red-500/10'
              }`}
            >
              {Math.abs(integrity.difference) < 0.01 ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* System Components */}
      <div className="grid grid-cols-2 gap-6">
        {/* Database Health */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Health
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm">Connection Status</span>
              <span className="flex items-center gap-2 text-green-500">
                <CheckCircle className="h-4 w-4" />
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm">Query Performance</span>
              <span className="text-sm font-medium text-green-500">Optimal</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm">Storage Usage</span>
              <span className="text-sm font-medium">1.2 GB / 10 GB</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm">Last Backup</span>
              <span className="text-sm font-medium">2 hours ago</span>
            </div>
          </div>
        </Card>

        {/* API Health */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Server className="h-5 w-5" />
            API Health
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm">Status</span>
              <span className="flex items-center gap-2 text-green-500">
                <CheckCircle className="h-4 w-4" />
                Online
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm">Response Time</span>
              <span className="text-sm font-medium text-green-500">45ms</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm">Uptime</span>
              <span className="text-sm font-medium">99.9%</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm">Active Connections</span>
              <span className="text-sm font-medium">127</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Integrity Explanation */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">About Transaction Integrity</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            The system uses <strong>double-entry accounting</strong> to ensure all financial
            transactions are properly tracked:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>
              Every transaction creates two entries: one DEBIT (money leaving) and one
              CREDIT (money entering)
            </li>
            <li>The sum of all debits must equal the sum of all credits</li>
            <li>
              Each wallet's balance is validated against its transaction history
            </li>
            <li>Orphaned transactions (missing counterparty) are flagged</li>
          </ul>
          <p className="mt-4">
            Regular integrity checks ensure the platform's financial data remains
            consistent and accurate.
          </p>
        </div>
      </Card>
    </div>
  )
}
