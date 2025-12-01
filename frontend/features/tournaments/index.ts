/**
 * Tournament Bracket - Public Exports
 */

// Components
export { TournamentBracket } from './components/tournament-bracket'
export { MatchNode } from './components/match-node'
export { BracketConnector } from './components/bracket-connector'
export { MatchRefereeModal } from './components/match-referee-modal'
export type { MatchResult } from './components/match-referee-modal'

// Hooks
export { useBracketLayout } from './hooks/use-bracket-layout'

// Types
export type {
  BracketMatch,
  BracketParticipant,
  BracketData,
  BracketRound,
  BracketConnection,
  BracketLayoutConfig,
  TournamentBracketProps,
  MatchNodeProps,
  BracketConnectorProps,
} from './types/bracket'

export {
  DEFAULT_BRACKET_LAYOUT,
  MATCH_STATUS_CONFIG,
  getRoundName,
  calculateVerticalSpacing,
} from './types/bracket'
