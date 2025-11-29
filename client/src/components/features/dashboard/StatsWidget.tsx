'use client'

import React from 'react'
import { Trophy, Users, Calendar, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  icon: React.ElementType
  trend?: 'up' | 'down' | 'neutral'
}

function StatCard({ title, value, change, icon: Icon, trend = 'neutral' }: StatCardProps) {
  return (
    <div className="glass rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={cn(
          'p-3 rounded-lg',
          trend === 'up' && 'bg-green-500/20',
          trend === 'down' && 'bg-red-500/20',
          trend === 'neutral' && 'bg-gaming-purple/20'
        )}>
          <Icon className={cn(
            'w-6 h-6',
            trend === 'up' && 'text-green-500',
            trend === 'down' && 'text-red-500',
            trend === 'neutral' && 'text-gaming-purple'
          )} />
        </div>
        {change && (
          <span className={cn(
            'text-sm font-medium flex items-center gap-1',
            trend === 'up' && 'text-green-500',
            trend === 'down' && 'text-red-500'
          )}>
            <TrendingUp className="w-4 h-4" />
            {change}
          </span>
        )}
      </div>
      <div>
        <p className="text-3xl font-bold mb-1">{value}</p>
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>
    </div>
  )
}

export function StatsWidget() {
  // This would come from React Query in production
  const stats = {
    activeTournaments: 12,
    totalParticipants: 1248,
    upcomingMatches: 24,
    completedToday: 38,
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Active Tournaments"
        value={stats.activeTournaments}
        change="+3"
        icon={Trophy}
        trend="up"
      />
      <StatCard
        title="Total Participants"
        value={stats.totalParticipants}
        change="+124"
        icon={Users}
        trend="up"
      />
      <StatCard
        title="Upcoming Matches"
        value={stats.upcomingMatches}
        icon={Calendar}
        trend="neutral"
      />
      <StatCard
        title="Completed Today"
        value={stats.completedToday}
        change="+12"
        icon={TrendingUp}
        trend="up"
      />
    </div>
  )
}
