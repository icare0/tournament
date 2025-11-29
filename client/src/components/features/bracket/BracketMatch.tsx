'use client'

import React from 'react'
import { Match, Participant } from '@/types/tournament.types'
import { cn } from '@/lib/utils'

interface BracketMatchProps {
  match: Match
  x: number
  y: number
  width: number
  height: number
  onClick?: () => void
  isWinner?: boolean
}

export function BracketMatch({
  match,
  x,
  y,
  width,
  height,
  onClick,
  isWinner = false,
}: BracketMatchProps) {
  const halfHeight = height / 2

  // Get participant names
  const homeName = match.homeParticipant?.teamName || match.homeParticipant?.user?.username || 'TBD'
  const awayName = match.awayParticipant?.teamName || match.awayParticipant?.user?.username || 'TBD'

  // Determine winner styling
  const homeIsWinner = match.winnerId === match.homeParticipantId
  const awayIsWinner = match.winnerId === match.awayParticipantId

  return (
    <g
      className={cn(
        'bracket-match',
        'cursor-pointer transition-all',
        isWinner && 'winner'
      )}
      onClick={onClick}
    >
      {/* Match container */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        className={cn(
          'fill-card stroke-border',
          match.status === 'LIVE' && 'stroke-red-500 stroke-2',
          match.status === 'COMPLETED' && 'stroke-green-500',
          isWinner && 'stroke-gaming-gold stroke-2'
        )}
        rx={8}
      />

      {/* Home participant */}
      <g className={cn(homeIsWinner && 'font-bold')}>
        <rect
          x={x}
          y={y}
          width={width}
          height={halfHeight}
          className={cn(
            'fill-transparent',
            homeIsWinner && 'fill-green-500/10'
          )}
          rx={8}
        />
        <text
          x={x + 12}
          y={y + halfHeight / 2 + 5}
          className={cn(
            'fill-foreground text-sm',
            homeIsWinner ? 'font-semibold' : 'font-normal'
          )}
        >
          {homeName}
        </text>
        <text
          x={x + width - 30}
          y={y + halfHeight / 2 + 5}
          className={cn(
            'fill-foreground text-base',
            homeIsWinner && 'fill-green-500 font-bold'
          )}
        >
          {match.homeScore}
        </text>
      </g>

      {/* Divider */}
      <line
        x1={x}
        x2={x + width}
        y1={y + halfHeight}
        y2={y + halfHeight}
        className="stroke-border"
        strokeWidth={1}
      />

      {/* Away participant */}
      <g className={cn(awayIsWinner && 'font-bold')}>
        <rect
          x={x}
          y={y + halfHeight}
          width={width}
          height={halfHeight}
          className={cn(
            'fill-transparent',
            awayIsWinner && 'fill-green-500/10'
          )}
          rx={8}
        />
        <text
          x={x + 12}
          y={y + halfHeight + halfHeight / 2 + 5}
          className={cn(
            'fill-foreground text-sm',
            awayIsWinner ? 'font-semibold' : 'font-normal'
          )}
        >
          {awayName}
        </text>
        <text
          x={x + width - 30}
          y={y + halfHeight + halfHeight / 2 + 5}
          className={cn(
            'fill-foreground text-base',
            awayIsWinner && 'fill-green-500 font-bold'
          )}
        >
          {match.awayScore}
        </text>
      </g>

      {/* Match status indicator */}
      {match.status === 'LIVE' && (
        <circle
          cx={x + width - 15}
          cy={y + 15}
          r={6}
          className="fill-red-500 animate-pulse-glow"
        />
      )}

      {/* Best of indicator */}
      <text
        x={x + width / 2}
        y={y - 8}
        className="fill-muted-foreground text-xs"
        textAnchor="middle"
      >
        BO{match.bestOf}
      </text>
    </g>
  )
}
