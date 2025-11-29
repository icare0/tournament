import { Match, Participant, TournamentType } from '@/types/tournament.types'

export interface BracketMatchNode {
  match: Match
  round: number
  position: number
  x: number
  y: number
  nextMatchId?: string
}

export interface BracketConnector {
  from: { x: number; y: number }
  to: { x: number; y: number }
  fromMatchId: string
  toMatchId: string
}

export interface BracketLayoutConfig {
  matchWidth: number
  matchHeight: number
  roundSpacing: number
  matchSpacing: number
  padding: number
}

export interface BracketProps {
  tournamentId: string
  type: TournamentType
  matches: Match[]
  participants: Participant[]
  onMatchClick?: (match: Match) => void
  enableZoom?: boolean
  className?: string
}

export const DEFAULT_LAYOUT_CONFIG: BracketLayoutConfig = {
  matchWidth: 280,
  matchHeight: 80,
  roundSpacing: 350,
  matchSpacing: 40,
  padding: 50,
}
