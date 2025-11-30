/**
 * PlayerStatsRadar - Cyberpunk-style radar chart for player skills
 *
 * Uses Recharts with neon colors and dark theme
 */

'use client'

import React from 'react'
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface PlayerStat {
  skill: string
  value: number
  max: number
}

export interface PlayerStatsRadarProps {
  data: PlayerStat[]
  playerName?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Custom Tooltip - Cyberpunk style
 */
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || payload.length === 0) return null

  const data = payload[0].payload

  return (
    <div className="bg-black/95 border border-cyan-500/50 rounded-lg p-3 backdrop-blur-sm">
      <p className="text-cyan-400 font-semibold text-sm mb-1">{data.skill}</p>
      <p className="text-white text-lg font-bold tabular-nums">
        {data.value}
        <span className="text-xs text-cyan-400/70 ml-1">/ {data.max}</span>
      </p>
      <div className="mt-2 h-1 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
          style={{ width: `${(data.value / data.max) * 100}%` }}
        />
      </div>
    </div>
  )
}

export function PlayerStatsRadar({
  data,
  playerName,
  className,
  size = 'md',
}: PlayerStatsRadarProps) {
  const heights = {
    sm: 300,
    md: 400,
    lg: 500,
  }

  const height = heights[size]

  return (
    <Card
      className={cn(
        'overflow-hidden border-cyan-500/20 bg-gradient-to-br from-gray-900 via-black to-gray-900',
        className
      )}
    >
      <CardHeader className="border-b border-cyan-500/20 bg-black/40">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
            Player Skills
          </span>
          {playerName && (
            <>
              <span className="text-cyan-500/50">•</span>
              <span className="text-sm font-normal text-muted-foreground">{playerName}</span>
            </>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        <ResponsiveContainer width="100%" height={height}>
          <RadarChart data={data} className="mx-auto">
            {/* Grid - Neon Cyan */}
            <PolarGrid
              stroke="#06b6d4"
              strokeOpacity={0.2}
              strokeWidth={1}
              gridType="polygon"
            />

            {/* Angle Axis (Labels) - Cyan */}
            <PolarAngleAxis
              dataKey="skill"
              tick={{
                fill: '#22d3ee',
                fontSize: 12,
                fontWeight: 600,
              }}
              stroke="#06b6d4"
              strokeOpacity={0.3}
            />

            {/* Radius Axis (Scale) - Hidden for cleaner look */}
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{
                fill: '#06b6d4',
                fontSize: 10,
              }}
              stroke="#06b6d4"
              strokeOpacity={0.2}
            />

            {/* Main Radar Area - Gradient Cyan to Purple */}
            <Radar
              name={playerName || 'Player'}
              dataKey="value"
              stroke="#06b6d4"
              strokeWidth={3}
              fill="url(#cyberpunkGradient)"
              fillOpacity={0.6}
              dot={{
                r: 5,
                fill: '#22d3ee',
                stroke: '#0891b2',
                strokeWidth: 2,
              }}
              activeDot={{
                r: 7,
                fill: '#a855f7',
                stroke: '#7e22ce',
                strokeWidth: 2,
              }}
            />

            {/* Gradient Definition */}
            <defs>
              <linearGradient id="cyberpunkGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.8} />
                <stop offset="50%" stopColor="#8b5cf6" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#a855f7" stopOpacity={0.4} />
              </linearGradient>
            </defs>

            {/* Tooltip */}
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>

        {/* Stats Summary - Neon Cards */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
          {data.map((stat, index) => {
            const percentage = (stat.value / stat.max) * 100
            const color =
              percentage >= 80
                ? 'from-cyan-500 to-cyan-400'
                : percentage >= 60
                ? 'from-purple-500 to-purple-400'
                : 'from-gray-500 to-gray-400'

            return (
              <div
                key={stat.skill}
                className="relative p-3 rounded-lg border border-cyan-500/20 bg-black/40 backdrop-blur-sm overflow-hidden group hover:border-cyan-500/50 transition-all"
                style={{
                  animation: `fadeIn 0.3s ease-out ${index * 0.1}s both`,
                }}
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-purple-500/0 group-hover:from-cyan-500/10 group-hover:to-purple-500/10 transition-all duration-500" />

                <div className="relative z-10">
                  <p className="text-xs text-cyan-400/70 font-medium mb-1">{stat.skill}</p>
                  <p className="text-2xl font-bold tabular-nums">
                    <span className={cn('text-transparent bg-clip-text bg-gradient-to-r', color)}>
                      {stat.value}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">/ {stat.max}</span>
                  </p>
                  {/* Progress bar */}
                  <div className="mt-2 h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full bg-gradient-to-r transition-all duration-1000', color)}
                      style={{
                        width: `${percentage}%`,
                        animation: `slideIn 1s ease-out ${index * 0.1}s both`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Inline Styles for Animations */}
        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes slideIn {
            from {
              width: 0;
            }
          }
        `}</style>
      </CardContent>
    </Card>
  )
}
