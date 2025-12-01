/**
 * Tournament Bracket Types
 *
 * Type definitions for rendering tournament brackets with double elimination support
 */

import { Match, MatchStatus, Tournament } from '@/types/api'

// ============================================================================
// Core Bracket Types
// ============================================================================

/**
 * Participant in a match
 */
export interface BracketParticipant {
  id: string
  name: string
  seed?: number
  avatar?: string
  score?: number
  isWinner?: boolean
}

/**
 * Match node with calculated position for rendering
 */
export interface BracketMatch {
  // Core match data
  id: string
  tournamentId: string
  round: number
  matchNumber: number
  status: MatchStatus

  // Participants
  participant1?: BracketParticipant
  participant2?: BracketParticipant
  winnerId?: string

  // Bracket structure
  nextMatchId?: string
  bracket: 'winners' | 'losers' | 'grand-final'

  // Calculated positions (in pixels)
  x: number
  y: number

  // Metadata
  scheduledAt?: string
  startedAt?: string
  completedAt?: string
  score?: {
    participant1: number
    participant2: number
  }
}

/**
 * Connection between matches (for Bézier curves)
 */
export interface BracketConnection {
  id: string
  fromMatchId: string
  toMatchId: string
  fromX: number
  fromY: number
  toX: number
  toY: number
  type: 'winner' | 'loser'
}

/**
 * Complete bracket data structure
 */
export interface BracketData {
  tournament: Tournament
  winnersBracket: BracketRound[]
  losersBracket: BracketRound[]
  grandFinal?: BracketMatch
  connections: BracketConnection[]
  dimensions: {
    width: number
    height: number
  }
}

/**
 * Matches grouped by round
 */
export interface BracketRound {
  roundNumber: number
  name: string // "Round 1", "Quarterfinals", etc.
  matches: BracketMatch[]
  x: number // Horizontal position of this round
}

// ============================================================================
// Layout Configuration
// ============================================================================

/**
 * Configuration for bracket layout calculations
 */
export interface BracketLayoutConfig {
  // Match dimensions
  matchWidth: number
  matchHeight: number

  // Spacing
  horizontalGap: number      // Between rounds
  verticalGap: number        // Between matches in same round

  // Bracket separation
  winnerLoserGap: number     // Vertical gap between winner's and loser's brackets

  // Padding
  paddingX: number
  paddingY: number

  // Connector style
  connectorCurve: number     // Control point offset for Bézier curves
  connectorStrokeWidth: number
}

/**
 * Default layout configuration
 */
export const DEFAULT_BRACKET_LAYOUT: BracketLayoutConfig = {
  matchWidth: 280,
  matchHeight: 120,
  horizontalGap: 200,
  verticalGap: 40,
  winnerLoserGap: 200,
  paddingX: 60,
  paddingY: 60,
  connectorCurve: 0.5, // 50% of horizontal distance
  connectorStrokeWidth: 2,
}

// ============================================================================
// Props Types
// ============================================================================

/**
 * Props for TournamentBracket component
 */
export interface TournamentBracketProps {
  tournamentId: string
  data: BracketData
  onMatchClick?: (match: BracketMatch) => void
  onMatchUpdate?: (matchId: string) => void
  config?: Partial<BracketLayoutConfig>
  className?: string
}

/**
 * Props for MatchNode component
 */
export interface MatchNodeProps {
  match: BracketMatch
  onClick?: (match: BracketMatch) => void
  isHighlighted?: boolean
  className?: string
}

/**
 * Props for BracketConnector component
 */
export interface BracketConnectorProps {
  connection: BracketConnection
  config: BracketLayoutConfig
  isHighlighted?: boolean
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Match status with colors for UI
 */
export const MATCH_STATUS_CONFIG: Record<MatchStatus, {
  label: string
  color: string
  borderColor: string
}> = {
  SCHEDULED: {
    label: 'Scheduled',
    color: 'hsl(var(--muted))',
    borderColor: 'hsl(var(--border))',
  },
  IN_PROGRESS: {
    label: 'Live',
    color: 'hsl(142 76% 36%)', // Green
    borderColor: 'hsl(142 76% 36%)',
  },
  COMPLETED: {
    label: 'Completed',
    color: 'hsl(var(--card))',
    borderColor: 'hsl(var(--border))',
  },
  DISPUTED: {
    label: 'Disputed',
    color: 'hsl(38 92% 50%)', // Orange
    borderColor: 'hsl(38 92% 50%)',
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'hsl(var(--destructive))',
    borderColor: 'hsl(var(--destructive))',
  },
}

/**
 * Round naming based on remaining players
 */
export function getRoundName(roundNumber: number, totalRounds: number, bracket: 'winners' | 'losers'): string {
  const roundsRemaining = totalRounds - roundNumber

  if (bracket === 'winners') {
    if (roundsRemaining === 0) return 'Finals'
    if (roundsRemaining === 1) return 'Semi-Finals'
    if (roundsRemaining === 2) return 'Quarter-Finals'
    return `Round ${roundNumber + 1}`
  } else {
    if (roundsRemaining === 0) return 'Losers Finals'
    if (roundsRemaining === 1) return 'Losers Semi-Finals'
    return `Losers Round ${roundNumber + 1}`
  }
}

/**
 * Calculate vertical spacing between matches based on round
 */
export function calculateVerticalSpacing(
  round: number,
  config: BracketLayoutConfig
): number {
  return Math.pow(2, round) * (config.matchHeight + config.verticalGap)
}
