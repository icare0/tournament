/**
 * DisputesPanel - Alerts and disputes monitoring
 *
 * Shows alerts with blinking animation when IA detects problems
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, AlertCircle, CheckCircle2, X, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Alert {
  id: string
  type: 'dispute' | 'warning' | 'info'
  title: string
  message: string
  matchId?: string
  createdAt: string
  resolved?: boolean
}

export interface DisputesPanelProps {
  alerts: Alert[]
  onAlertClick?: (alert: Alert) => void
  onResolveAlert?: (alertId: string) => void
  className?: string
}

export function DisputesPanel({
  alerts,
  onAlertClick,
  onResolveAlert,
  className,
}: DisputesPanelProps) {
  const [isBlinking, setIsBlinking] = useState(false)

  // Filter unresolved alerts
  const unresolvedAlerts = alerts.filter((a) => !a.resolved)
  const hasUnresolved = unresolvedAlerts.length > 0

  // Trigger blink animation on new alerts
  useEffect(() => {
    if (hasUnresolved) {
      setIsBlinking(true)
      const timer = setTimeout(() => setIsBlinking(false), 5000) // Blink for 5 seconds
      return () => clearTimeout(timer)
    }
  }, [alerts.length]) // Trigger on new alerts

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'dispute':
        return <AlertTriangle className="w-4 h-4" />
      case 'warning':
        return <AlertCircle className="w-4 h-4" />
      case 'info':
        return <Bell className="w-4 h-4" />
    }
  }

  const getAlertColor = (type: Alert['type']) => {
    switch (type) {
      case 'dispute':
        return 'text-destructive border-destructive bg-destructive/10'
      case 'warning':
        return 'text-orange-500 border-orange-500 bg-orange-500/10'
      case 'info':
        return 'text-blue-500 border-blue-500 bg-blue-500/10'
    }
  }

  return (
    <Card
      className={cn(
        'flex flex-col transition-all duration-300',
        hasUnresolved && isBlinking && 'ring-2 ring-destructive animate-pulse',
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Alerts & Disputes
        </CardTitle>
        {hasUnresolved ? (
          <Badge variant="destructive" className={cn(isBlinking && 'animate-pulse')}>
            {unresolvedAlerts.length}
          </Badge>
        ) : (
          <Badge variant="secondary">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            All Clear
          </Badge>
        )}
      </CardHeader>

      <CardContent className="flex-1 overflow-auto space-y-3">
        {unresolvedAlerts.length > 0 ? (
          unresolvedAlerts.map((alert) => (
            <div
              key={alert.id}
              className={cn(
                'p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md',
                getAlertColor(alert.type)
              )}
              onClick={() => onAlertClick?.(alert)}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  {getAlertIcon(alert.type)}
                  <h4 className="font-semibold text-sm">{alert.title}</h4>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 -mt-1 -mr-1"
                  onClick={(e) => {
                    e.stopPropagation()
                    onResolveAlert?.(alert.id)
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Message */}
              <p className="text-sm mb-2">{alert.message}</p>

              {/* Footer */}
              <div className="flex items-center justify-between text-xs opacity-70">
                <span>
                  {new Date(alert.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                {alert.matchId && <span>Match ID: {alert.matchId.slice(0, 8)}</span>}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-50 text-green-500" />
            <p className="text-sm font-medium">No active alerts</p>
            <p className="text-xs mt-1">Everything is running smoothly</p>
          </div>
        )}

        {/* Resolved Alerts (collapsed) */}
        {alerts.filter((a) => a.resolved).length > 0 && (
          <div className="pt-2 border-t">
            <details className="group">
              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                {alerts.filter((a) => a.resolved).length} resolved alerts
              </summary>
              <div className="mt-2 space-y-2">
                {alerts
                  .filter((a) => a.resolved)
                  .slice(0, 3)
                  .map((alert) => (
                    <div
                      key={alert.id}
                      className="p-2 border rounded text-xs opacity-60 hover:opacity-100 transition-opacity"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                        <span className="font-medium">{alert.title}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </details>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
