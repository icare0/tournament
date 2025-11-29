'use client'

import { DashboardLayout } from '@/components/features/dashboard/DashboardLayout'
import { StatsWidget } from '@/components/features/dashboard/StatsWidget'
import { LiveMatchWidget } from '@/components/features/dashboard/LiveMatchWidget'

export default function DashboardPage() {
  return (
    <DashboardLayout>
      {/* Stats Overview */}
      <StatsWidget />

      {/* Live Matches and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <LiveMatchWidget />

        {/* Recent Activity Widget */}
        <div className="glass rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <ActivityItem
              type="tournament"
              title="New Tournament Created"
              description="Valorant Championship 2025"
              time="2 minutes ago"
            />
            <ActivityItem
              type="match"
              title="Match Completed"
              description="Team A vs Team B - 2:1"
              time="15 minutes ago"
            />
            <ActivityItem
              type="participant"
              title="New Registration"
              description="Player joined 'CS:GO Masters'"
              time="1 hour ago"
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <QuickActionCard
          title="Create Tournament"
          description="Start a new tournament with our wizard"
          action="Create"
        />
        <QuickActionCard
          title="Manage Schedule"
          description="View and adjust match schedules"
          action="Schedule"
        />
        <QuickActionCard
          title="View Analytics"
          description="Check detailed performance metrics"
          action="Analytics"
        />
      </div>
    </DashboardLayout>
  )
}

interface ActivityItemProps {
  type: 'tournament' | 'match' | 'participant'
  title: string
  description: string
  time: string
}

function ActivityItem({ type, title, description, time }: ActivityItemProps) {
  const colors = {
    tournament: 'bg-gaming-purple/20 text-gaming-purple',
    match: 'bg-gaming-blue/20 text-gaming-blue',
    participant: 'bg-gaming-cyan/20 text-gaming-cyan',
  }

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
      <div className={`w-2 h-2 rounded-full mt-2 ${colors[type]}`} />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-muted-foreground truncate">{description}</p>
        <p className="text-xs text-muted-foreground mt-1">{time}</p>
      </div>
    </div>
  )
}

interface QuickActionCardProps {
  title: string
  description: string
  action: string
}

function QuickActionCard({ title, description, action }: QuickActionCardProps) {
  return (
    <div className="glass rounded-xl p-6 border border-white/10 hover:border-gaming-purple transition-all group cursor-pointer">
      <h4 className="font-semibold mb-2">{title}</h4>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      <button className="text-sm text-gaming-purple font-medium group-hover:underline">
        {action} →
      </button>
    </div>
  )
}
