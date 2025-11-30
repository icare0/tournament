/**
 * TournamentBracket - Main bracket visualization component
 *
 * Features:
 * - Double elimination support (Winner's + Loser's brackets)
 * - Pan & Zoom with react-zoom-pan-pinch
 * - Mobile pinch-to-zoom
 * - Bézier curve connections
 * - Performance optimized with React.memo
 * - Click handlers for match arbitration
 */

'use client'

import React, { useState, useCallback } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { cn } from '@/lib/utils'
import {
  TournamentBracketProps,
  BracketMatch,
  DEFAULT_BRACKET_LAYOUT,
} from '../types/bracket'
import { MatchNode } from './match-node'
import { BracketConnector } from './bracket-connector'
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const TournamentBracket: React.FC<TournamentBracketProps> = ({
  tournamentId,
  data,
  onMatchClick,
  onMatchUpdate,
  config: userConfig,
  className,
}) => {
  const config = { ...DEFAULT_BRACKET_LAYOUT, ...userConfig }
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null)

  const handleMatchClick = useCallback(
    (match: BracketMatch) => {
      setSelectedMatchId(match.id)
      onMatchClick?.(match)
    },
    [onMatchClick]
  )

  // Collect all matches for rendering
  const allMatches = [
    ...data.winnersBracket.flatMap((round) => round.matches),
    ...data.losersBracket.flatMap((round) => round.matches),
  ]
  if (data.grandFinal) {
    allMatches.push(data.grandFinal)
  }

  return (
    <div className={cn('relative w-full h-full bg-background rounded-lg overflow-hidden', className)}>
      <TransformWrapper
        initialScale={0.7}
        minScale={0.3}
        maxScale={2}
        centerOnInit
        wheel={{ step: 0.05 }}
        pinch={{ step: 5 }}
        doubleClick={{ mode: 'reset' }}
        panning={{ velocityDisabled: false }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            {/* Zoom Controls */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
              <Button
                size="icon"
                variant="outline"
                onClick={() => zoomIn()}
                className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={() => zoomOut()}
                className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={() => resetTransform()}
                className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Bracket Info */}
            <div className="absolute top-4 left-4 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-lg px-4 py-2 border">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Tournament</p>
                  <p className="text-sm font-semibold">{data.tournament.name}</p>
                </div>
                <div className="h-8 w-px bg-border" />
                <div>
                  <p className="text-xs text-muted-foreground">Matches</p>
                  <p className="text-sm font-semibold">{allMatches.length}</p>
                </div>
              </div>
            </div>

            {/* SVG Bracket */}
            <TransformComponent
              wrapperClass="w-full h-full"
              contentClass="w-full h-full flex items-center justify-center"
            >
              <svg
                width={data.dimensions.width}
                height={data.dimensions.height}
                viewBox={`0 0 ${data.dimensions.width} ${data.dimensions.height}`}
                className="select-none"
                style={{
                  minWidth: data.dimensions.width,
                  minHeight: data.dimensions.height,
                }}
              >
                {/* Background Grid (subtle) */}
                <defs>
                  <pattern
                    id="grid"
                    width="40"
                    height="40"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 40 0 L 0 0 0 40"
                      fill="none"
                      stroke="hsl(var(--border) / 0.1)"
                      strokeWidth="1"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Bracket Labels */}
                <g>
                  {/* Winner's Bracket Label */}
                  {data.winnersBracket.length > 0 && (
                    <text
                      x={config.paddingX}
                      y={config.paddingY - 20}
                      className="fill-foreground font-semibold text-base"
                      style={{ fontSize: '18px' }}
                    >
                      Winner's Bracket
                    </text>
                  )}

                  {/* Loser's Bracket Label */}
                  {data.losersBracket.length > 0 && (
                    <text
                      x={config.paddingX}
                      y={
                        Math.max(
                          ...data.winnersBracket.flatMap((r) =>
                            r.matches.map((m) => m.y + config.matchHeight)
                          )
                        ) +
                        config.winnerLoserGap / 2
                      }
                      className="fill-foreground font-semibold text-base"
                      style={{ fontSize: '18px' }}
                    >
                      Loser's Bracket
                    </text>
                  )}

                  {/* Grand Final Label */}
                  {data.grandFinal && (
                    <text
                      x={data.grandFinal.x}
                      y={data.grandFinal.y - 20}
                      className="fill-primary font-bold text-lg"
                      style={{ fontSize: '20px' }}
                    >
                      🏆 Grand Final
                    </text>
                  )}
                </g>

                {/* Round Labels */}
                <g className="fill-muted-foreground text-sm">
                  {[...data.winnersBracket, ...data.losersBracket].map((round) => (
                    <text
                      key={`label-${round.roundNumber}-${round.matches[0]?.bracket}`}
                      x={round.x + config.matchWidth / 2}
                      y={
                        round.matches[0]?.y > 300
                          ? round.matches[0]?.y - 30
                          : config.paddingY - 40
                      }
                      textAnchor="middle"
                      className="fill-muted-foreground font-medium"
                      style={{ fontSize: '14px' }}
                    >
                      {round.name}
                    </text>
                  ))}
                </g>

                {/* Connections Layer (rendered first, behind matches) */}
                <g className="connections">
                  {data.connections.map((connection) => (
                    <BracketConnector
                      key={connection.id}
                      connection={connection}
                      config={config}
                      isHighlighted={
                        connection.fromMatchId === selectedMatchId ||
                        connection.toMatchId === selectedMatchId
                      }
                    />
                  ))}
                </g>

                {/* Matches Layer */}
                <g className="matches">
                  {allMatches.map((match) => (
                    <MatchNode
                      key={match.id}
                      match={match}
                      onClick={handleMatchClick}
                      isHighlighted={match.id === selectedMatchId}
                    />
                  ))}
                </g>
              </svg>
            </TransformComponent>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-lg px-4 py-3 border">
              <div className="flex items-center gap-6 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-muted-foreground">Live</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full border-2 border-border" />
                  <span className="text-muted-foreground">Scheduled</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                  <span className="text-muted-foreground">Completed</span>
                </div>
              </div>
            </div>
          </>
        )}
      </TransformWrapper>
    </div>
  )
}
