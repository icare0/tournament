/**
 * Hook to transform backend match data into positioned bracket layout
 */

import { useMemo } from 'react'
import { Match } from '@/types/api'
import {
  BracketData,
  BracketMatch,
  BracketRound,
  BracketConnection,
  BracketLayoutConfig,
  DEFAULT_BRACKET_LAYOUT,
  calculateVerticalSpacing,
  getRoundName,
} from '../types/bracket'

interface UseBracketLayoutProps {
  matches: Match[]
  tournamentId: string
  config?: Partial<BracketLayoutConfig>
}

/**
 * Calculate bracket layout from raw match data
 */
export function useBracketLayout({
  matches,
  tournamentId,
  config: userConfig,
}: UseBracketLayoutProps): BracketData {
  const config: BracketLayoutConfig = {
    ...DEFAULT_BRACKET_LAYOUT,
    ...userConfig,
  }

  return useMemo(() => {
    // Separate matches by bracket type
    const winnerMatches = matches.filter((m) => m.bracket === 'winners')
    const loserMatches = matches.filter((m) => m.bracket === 'losers')
    const grandFinalMatch = matches.find((m) => m.bracket === 'grand-final')

    // Group by rounds
    const winnersRounds = groupMatchesByRounds(winnerMatches, 'winners', config)
    const losersRounds = groupMatchesByRounds(loserMatches, 'losers', config)

    // Calculate positions
    positionWinnersBracket(winnersRounds, config)
    positionLosersBracket(losersRounds, winnersRounds, config)

    // Position grand final if exists
    let grandFinal: BracketMatch | undefined
    if (grandFinalMatch) {
      const lastWinnerRound = winnersRounds[winnersRounds.length - 1]
      const lastLoserRound = losersRounds[losersRounds.length - 1]

      grandFinal = {
        ...transformMatch(grandFinalMatch),
        x:
          Math.max(
            lastWinnerRound?.x || 0,
            lastLoserRound?.x || 0
          ) +
          config.matchWidth +
          config.horizontalGap,
        y:
          (lastWinnerRound?.matches[0]?.y || 0) +
          config.matchHeight / 2 +
          config.winnerLoserGap / 2,
        bracket: 'grand-final',
      }
    }

    // Generate connections
    const connections = generateConnections(
      [...winnersRounds, ...losersRounds],
      grandFinal,
      config
    )

    // Calculate total dimensions
    const allMatches = [
      ...winnersRounds.flatMap((r) => r.matches),
      ...losersRounds.flatMap((r) => r.matches),
    ]
    if (grandFinal) allMatches.push(grandFinal)

    const maxX = Math.max(...allMatches.map((m) => m.x)) + config.matchWidth + config.paddingX
    const maxY = Math.max(...allMatches.map((m) => m.y)) + config.matchHeight + config.paddingY

    return {
      tournament: { id: tournamentId } as any, // Will be populated by parent
      winnersBracket: winnersRounds,
      losersBracket: losersRounds,
      grandFinal,
      connections,
      dimensions: {
        width: maxX,
        height: maxY,
      },
    }
  }, [matches, tournamentId, config])
}

/**
 * Group matches by rounds and assign round metadata
 */
function groupMatchesByRounds(
  matches: Match[],
  bracket: 'winners' | 'losers',
  config: BracketLayoutConfig
): BracketRound[] {
  const roundMap = new Map<number, BracketMatch[]>()

  matches.forEach((match) => {
    const round = match.round
    if (!roundMap.has(round)) {
      roundMap.set(round, [])
    }
    roundMap.get(round)!.push(transformMatch(match))
  })

  const rounds: BracketRound[] = []
  const sortedRounds = Array.from(roundMap.keys()).sort((a, b) => a - b)

  sortedRounds.forEach((roundNumber, index) => {
    const roundMatches = roundMap.get(roundNumber)!.sort((a, b) => a.matchNumber - b.matchNumber)

    rounds.push({
      roundNumber,
      name: getRoundName(roundNumber, sortedRounds.length - 1, bracket),
      matches: roundMatches,
      x: config.paddingX + index * (config.matchWidth + config.horizontalGap),
    })
  })

  return rounds
}

/**
 * Transform backend Match to BracketMatch
 */
function transformMatch(match: Match): BracketMatch {
  return {
    id: match.id,
    tournamentId: match.tournamentId,
    round: match.round,
    matchNumber: match.matchNumber,
    status: match.status,
    participant1: match.participant1
      ? {
          id: match.participant1.id,
          name: match.participant1.name || 'TBD',
          seed: match.participant1.seed,
          score: match.score?.participant1,
          isWinner: match.winnerId === match.participant1.id,
        }
      : undefined,
    participant2: match.participant2
      ? {
          id: match.participant2.id,
          name: match.participant2.name || 'TBD',
          seed: match.participant2.seed,
          score: match.score?.participant2,
          isWinner: match.winnerId === match.participant2.id,
        }
      : undefined,
    winnerId: match.winnerId,
    nextMatchId: match.nextMatchId,
    bracket: match.bracket as 'winners' | 'losers' | 'grand-final',
    x: 0, // Will be calculated
    y: 0, // Will be calculated
    scheduledAt: match.scheduledAt,
    startedAt: match.startedAt,
    completedAt: match.completedAt,
    score: match.score,
  }
}

/**
 * Calculate positions for winner's bracket
 */
function positionWinnersBracket(
  rounds: BracketRound[],
  config: BracketLayoutConfig
): void {
  rounds.forEach((round, roundIndex) => {
    const verticalSpacing = calculateVerticalSpacing(roundIndex, config)

    round.matches.forEach((match, matchIndex) => {
      match.x = round.x
      match.y = config.paddingY + matchIndex * verticalSpacing
    })
  })
}

/**
 * Calculate positions for loser's bracket
 * Positioned below winner's bracket with offset
 */
function positionLosersBracket(
  losersRounds: BracketRound[],
  winnersRounds: BracketRound[],
  config: BracketLayoutConfig
): void {
  // Calculate Y offset (bottom of winner's bracket + gap)
  let maxWinnersY = 0
  winnersRounds.forEach((round) => {
    round.matches.forEach((match) => {
      maxWinnersY = Math.max(maxWinnersY, match.y + config.matchHeight)
    })
  })

  const losersYOffset = maxWinnersY + config.winnerLoserGap

  losersRounds.forEach((round, roundIndex) => {
    const verticalSpacing = calculateVerticalSpacing(roundIndex, config)

    round.matches.forEach((match, matchIndex) => {
      match.x = round.x
      match.y = losersYOffset + matchIndex * verticalSpacing
    })
  })
}

/**
 * Generate Bézier connections between matches
 */
function generateConnections(
  allRounds: BracketRound[],
  grandFinal: BracketMatch | undefined,
  config: BracketLayoutConfig
): BracketConnection[] {
  const connections: BracketConnection[] = []
  const matchMap = new Map<string, BracketMatch>()

  // Build match lookup map
  allRounds.forEach((round) => {
    round.matches.forEach((match) => {
      matchMap.set(match.id, match)
    })
  })

  if (grandFinal) {
    matchMap.set(grandFinal.id, grandFinal)
  }

  // Generate connections
  matchMap.forEach((fromMatch) => {
    if (fromMatch.nextMatchId) {
      const toMatch = matchMap.get(fromMatch.nextMatchId)
      if (toMatch) {
        connections.push({
          id: `${fromMatch.id}-${toMatch.id}`,
          fromMatchId: fromMatch.id,
          toMatchId: toMatch.id,
          fromX: fromMatch.x + config.matchWidth,
          fromY: fromMatch.y + config.matchHeight / 2,
          toX: toMatch.x,
          toY: toMatch.y + config.matchHeight / 2,
          type: fromMatch.bracket === 'losers' ? 'loser' : 'winner',
        })
      }
    }
  })

  return connections
}
