/**
 * MatchNode - Visual representation of a single match in the bracket
 */

import React from 'react'
import { cn } from '@/lib/utils'
import { MatchNodeProps, MATCH_STATUS_CONFIG } from '../types/bracket'
import { Trophy, Clock, CheckCircle2 } from 'lucide-react'

const MATCH_WIDTH = 280
const MATCH_HEIGHT = 120
const PARTICIPANT_HEIGHT = 50

export const MatchNode: React.FC<MatchNodeProps> = React.memo(
  ({ match, onClick, isHighlighted = false, className }) => {
    const { x, y, participant1, participant2, status } = match
    const statusConfig = MATCH_STATUS_CONFIG[status]

    const handleClick = () => {
      onClick?.(match)
    }

    return (
      <g
        transform={`translate(${x}, ${y})`}
        onClick={handleClick}
        className={cn('cursor-pointer transition-all duration-200', className)}
        style={{
          filter: isHighlighted ? 'drop-shadow(0 4px 12px hsl(var(--primary) / 0.3))' : undefined,
        }}
      >
        {/* Match Container */}
        <rect
          width={MATCH_WIDTH}
          height={MATCH_HEIGHT}
          rx="8"
          fill="hsl(var(--card))"
          stroke={isHighlighted ? 'hsl(var(--primary))' : statusConfig.borderColor}
          strokeWidth={isHighlighted ? 3 : 2}
          className="transition-all duration-200"
        />

        {/* Status Indicator */}
        {status === 'IN_PROGRESS' && (
          <circle cx={MATCH_WIDTH - 16} cy={16} r={6} fill="hsl(142 76% 36%)" className="animate-pulse" />
        )}

        {/* Participant 1 */}
        <g transform={`translate(0, 0)`}>
          <rect
            width={MATCH_WIDTH}
            height={PARTICIPANT_HEIGHT}
            fill={participant1?.isWinner ? 'hsl(var(--primary) / 0.1)' : 'transparent'}
            className="transition-colors duration-200"
          />

          {/* Participant 1 Info */}
          <foreignObject width={MATCH_WIDTH - 60} height={PARTICIPANT_HEIGHT} x={16} y={0}>
            <div className="flex items-center h-full">
              {participant1 ? (
                <>
                  {participant1.seed && (
                    <span className="text-xs font-mono text-muted-foreground mr-2 w-6">
                      #{participant1.seed}
                    </span>
                  )}
                  <span
                    className={cn(
                      'text-sm font-medium truncate',
                      participant1.isWinner && 'text-foreground font-semibold'
                    )}
                  >
                    {participant1.name}
                  </span>
                  {participant1.isWinner && (
                    <Trophy className="w-4 h-4 ml-2 text-primary" />
                  )}
                </>
              ) : (
                <span className="text-sm text-muted-foreground italic">TBD</span>
              )}
            </div>
          </foreignObject>

          {/* Participant 1 Score */}
          {participant1?.score !== undefined && (
            <foreignObject width={40} height={PARTICIPANT_HEIGHT} x={MATCH_WIDTH - 50} y={0}>
              <div className="flex items-center justify-center h-full">
                <span
                  className={cn(
                    'text-lg font-bold tabular-nums',
                    participant1.isWinner ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {participant1.score}
                </span>
              </div>
            </foreignObject>
          )}
        </g>

        {/* Divider */}
        <line
          x1={12}
          y1={PARTICIPANT_HEIGHT}
          x2={MATCH_WIDTH - 12}
          y2={PARTICIPANT_HEIGHT}
          stroke="hsl(var(--border))"
          strokeWidth={1}
        />

        {/* Participant 2 */}
        <g transform={`translate(0, ${PARTICIPANT_HEIGHT})`}>
          <rect
            width={MATCH_WIDTH}
            height={PARTICIPANT_HEIGHT}
            fill={participant2?.isWinner ? 'hsl(var(--primary) / 0.1)' : 'transparent'}
            className="transition-colors duration-200"
          />

          {/* Participant 2 Info */}
          <foreignObject width={MATCH_WIDTH - 60} height={PARTICIPANT_HEIGHT} x={16} y={0}>
            <div className="flex items-center h-full">
              {participant2 ? (
                <>
                  {participant2.seed && (
                    <span className="text-xs font-mono text-muted-foreground mr-2 w-6">
                      #{participant2.seed}
                    </span>
                  )}
                  <span
                    className={cn(
                      'text-sm font-medium truncate',
                      participant2.isWinner && 'text-foreground font-semibold'
                    )}
                  >
                    {participant2.name}
                  </span>
                  {participant2.isWinner && (
                    <Trophy className="w-4 h-4 ml-2 text-primary" />
                  )}
                </>
              ) : (
                <span className="text-sm text-muted-foreground italic">TBD</span>
              )}
            </div>
          </foreignObject>

          {/* Participant 2 Score */}
          {participant2?.score !== undefined && (
            <foreignObject width={40} height={PARTICIPANT_HEIGHT} x={MATCH_WIDTH - 50} y={0}>
              <div className="flex items-center justify-center h-full">
                <span
                  className={cn(
                    'text-lg font-bold tabular-nums',
                    participant2.isWinner ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {participant2.score}
                </span>
              </div>
            </foreignObject>
          )}
        </g>

        {/* Bottom Status Bar */}
        <foreignObject width={MATCH_WIDTH} height={20} x={0} y={MATCH_HEIGHT - 20}>
          <div className="flex items-center justify-between px-3 h-full">
            <div className="flex items-center gap-1.5">
              {status === 'IN_PROGRESS' && (
                <>
                  <Clock className="w-3 h-3 text-green-500" />
                  <span className="text-xs font-medium text-green-500">Live</span>
                </>
              )}
              {status === 'COMPLETED' && (
                <>
                  <CheckCircle2 className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Completed</span>
                </>
              )}
              {status === 'SCHEDULED' && (
                <span className="text-xs text-muted-foreground">Scheduled</span>
              )}
            </div>

            <span className="text-xs font-mono text-muted-foreground">
              {match.bracket === 'winners' ? 'W' : match.bracket === 'losers' ? 'L' : 'GF'}
              {match.round + 1}-{match.matchNumber + 1}
            </span>
          </div>
        </foreignObject>

        {/* Hover Effect Overlay */}
        <rect
          width={MATCH_WIDTH}
          height={MATCH_HEIGHT}
          rx="8"
          fill="hsl(var(--primary) / 0)"
          className="transition-all duration-200 hover:fill-[hsl(var(--primary)/0.05)]"
          pointerEvents="all"
        />
      </g>
    )
  },
  (prev, next) =>
    prev.match.id === next.match.id &&
    prev.match.status === next.match.status &&
    prev.isHighlighted === next.isHighlighted &&
    prev.match.participant1?.score === next.match.participant1?.score &&
    prev.match.participant2?.score === next.match.participant2?.score
)

MatchNode.displayName = 'MatchNode'
