'use client'

import React, { useMemo, useState } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { BracketMatch } from './BracketMatch'
import { BracketConnector } from './BracketConnector'
import {
  BracketProps,
  BracketMatchNode,
  BracketConnector as ConnectorType,
  DEFAULT_LAYOUT_CONFIG,
} from './types'
import { Match, TournamentType } from '@/types/tournament.types'
import { cn } from '@/lib/utils'

/**
 * Main Bracket Component
 * Renders tournament bracket with zoom/pan support
 */
export function Bracket({
  tournamentId,
  type,
  matches,
  participants,
  onMatchClick,
  enableZoom = true,
  className,
}: BracketProps) {
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null)

  /**
   * Calculate bracket layout
   */
  const { nodes, connectors, dimensions } = useMemo(() => {
    return calculateBracketLayout(matches, type)
  }, [matches, type])

  /**
   * Handle match click
   */
  const handleMatchClick = (match: Match) => {
    setSelectedMatchId(match.id)
    onMatchClick?.(match)
  }

  /**
   * Render bracket content
   */
  const bracketContent = (
    <svg
      width={dimensions.width}
      height={dimensions.height}
      className="bracket-svg"
      style={{ minWidth: dimensions.width, minHeight: dimensions.height }}
    >
      {/* Render round labels */}
      {nodes.length > 0 && (
        <g className="round-labels">
          {Array.from(new Set(nodes.map((n) => n.round))).map((round) => {
            const firstNodeInRound = nodes.find((n) => n.round === round)
            if (!firstNodeInRound) return null

            return (
              <text
                key={round}
                x={firstNodeInRound.x + DEFAULT_LAYOUT_CONFIG.matchWidth / 2}
                y={30}
                className="fill-foreground text-lg font-semibold"
                textAnchor="middle"
              >
                {getRoundLabel(round, type)}
              </text>
            )
          })}
        </g>
      )}

      {/* Render connectors */}
      <g className="connectors">
        {connectors.map((connector, index) => (
          <BracketConnector
            key={`connector-${index}`}
            fromX={connector.from.x}
            fromY={connector.from.y}
            toX={connector.to.x}
            toY={connector.to.y}
          />
        ))}
      </g>

      {/* Render matches */}
      <g className="matches">
        {nodes.map((node) => (
          <BracketMatch
            key={node.match.id}
            match={node.match}
            x={node.x}
            y={node.y}
            width={DEFAULT_LAYOUT_CONFIG.matchWidth}
            height={DEFAULT_LAYOUT_CONFIG.matchHeight}
            onClick={() => handleMatchClick(node.match)}
            isWinner={selectedMatchId === node.match.id}
          />
        ))}
      </g>
    </svg>
  )

  // Render with zoom/pan if enabled
  if (enableZoom) {
    return (
      <div className={cn('bracket-container w-full h-full', className)}>
        <TransformWrapper
          initialScale={0.8}
          minScale={0.3}
          maxScale={2}
          centerOnInit
          limitToBounds={false}
          panning={{ velocityDisabled: true }}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              {/* Zoom controls */}
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                <button
                  onClick={() => zoomIn()}
                  className="px-3 py-2 bg-card border border-border rounded-lg hover:bg-accent transition-colors"
                  aria-label="Zoom in"
                >
                  <span className="text-lg">+</span>
                </button>
                <button
                  onClick={() => zoomOut()}
                  className="px-3 py-2 bg-card border border-border rounded-lg hover:bg-accent transition-colors"
                  aria-label="Zoom out"
                >
                  <span className="text-lg">−</span>
                </button>
                <button
                  onClick={() => resetTransform()}
                  className="px-3 py-2 bg-card border border-border rounded-lg hover:bg-accent transition-colors text-sm"
                  aria-label="Reset zoom"
                >
                  Reset
                </button>
              </div>

              {/* Bracket content with pan/zoom */}
              <TransformComponent
                wrapperClass="w-full h-full"
                contentClass="w-full h-full"
              >
                {bracketContent}
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      </div>
    )
  }

  // Render without zoom/pan
  return (
    <div className={cn('bracket-container w-full overflow-auto', className)}>
      {bracketContent}
    </div>
  )
}

/**
 * Calculate bracket layout positions
 */
function calculateBracketLayout(matches: Match[], type: TournamentType) {
  const config = DEFAULT_LAYOUT_CONFIG
  const nodes: BracketMatchNode[] = []
  const connectors: ConnectorType[] = []

  // Group matches by round
  const matchesByRound = matches.reduce((acc, match) => {
    if (!acc[match.round]) {
      acc[match.round] = []
    }
    acc[match.round].push(match)
    return acc
  }, {} as Record<number, Match[]>)

  const rounds = Object.keys(matchesByRound)
    .map(Number)
    .sort((a, b) => a - b)

  // Calculate positions for each match
  rounds.forEach((round, roundIndex) => {
    const roundMatches = matchesByRound[round]
    const matchCount = roundMatches.length

    // Calculate vertical spacing for this round
    const totalHeight = matchCount * (config.matchHeight + config.matchSpacing)
    const startY = config.padding + (roundIndex * 100) // Offset each round slightly

    roundMatches.forEach((match, matchIndex) => {
      const x = config.padding + roundIndex * config.roundSpacing
      const y =
        startY +
        matchIndex * (config.matchHeight + config.matchSpacing) +
        matchIndex * Math.pow(2, roundIndex) * 20 // Spread matches vertically

      nodes.push({
        match,
        round,
        position: matchIndex,
        x,
        y,
        nextMatchId: undefined, // TODO: calculate based on bracket structure
      })
    })
  })

  // Calculate connectors between rounds
  for (let i = 0; i < rounds.length - 1; i++) {
    const currentRound = rounds[i]
    const nextRound = rounds[i + 1]

    const currentNodes = nodes.filter((n) => n.round === currentRound)
    const nextNodes = nodes.filter((n) => n.round === nextRound)

    // Connect pairs of matches to next round
    currentNodes.forEach((node, index) => {
      const nextNodeIndex = Math.floor(index / 2)
      const nextNode = nextNodes[nextNodeIndex]

      if (nextNode) {
        const fromX = node.x + config.matchWidth
        const fromY = node.y + config.matchHeight / 2

        const toX = nextNode.x
        const toY = nextNode.y + config.matchHeight / 2

        connectors.push({
          from: { x: fromX, y: fromY },
          to: { x: toX, y: toY },
          fromMatchId: node.match.id,
          toMatchId: nextNode.match.id,
        })
      }
    })
  }

  // Calculate total dimensions
  const maxX = Math.max(...nodes.map((n) => n.x)) + config.matchWidth + config.padding
  const maxY = Math.max(...nodes.map((n) => n.y)) + config.matchHeight + config.padding

  return {
    nodes,
    connectors,
    dimensions: {
      width: maxX || 800,
      height: maxY || 600,
    },
  }
}

/**
 * Get round label based on tournament type
 */
function getRoundLabel(round: number, type: TournamentType): string {
  if (type === TournamentType.SINGLE_ELIMINATION || type === TournamentType.DOUBLE_ELIMINATION) {
    const labels = ['Round of 128', 'Round of 64', 'Round of 32', 'Round of 16', 'Quarter Finals', 'Semi Finals', 'Finals']
    return labels[round - 1] || `Round ${round}`
  }

  return `Round ${round}`
}

export default Bracket
