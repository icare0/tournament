// Enums matching backend
export enum TournamentType {
  SINGLE_ELIMINATION = 'SINGLE_ELIMINATION',
  DOUBLE_ELIMINATION = 'DOUBLE_ELIMINATION',
  ROUND_ROBIN = 'ROUND_ROBIN',
  SWISS = 'SWISS',
  BATTLE_ROYALE = 'BATTLE_ROYALE',
}

export enum TournamentStatus {
  DRAFT = 'DRAFT',
  REGISTRATION_OPEN = 'REGISTRATION_OPEN',
  REGISTRATION_CLOSED = 'REGISTRATION_CLOSED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum ParticipantStatus {
  REGISTERED = 'REGISTERED',
  CHECKED_IN = 'CHECKED_IN',
  READY = 'READY',
  IN_MATCH = 'IN_MATCH',
  ELIMINATED = 'ELIMINATED',
  WINNER = 'WINNER',
}

// Interfaces
export interface Tournament {
  id: string
  name: string
  game: string
  type: TournamentType
  status: TournamentStatus

  maxParticipants: number
  currentParticipants: number

  entryFee: number
  prizePool: number

  startDate: string
  endDate?: string

  organizerId: string
  organizer?: User

  // JSONB fields
  rules?: TournamentRules
  prizes?: PrizeDistribution
  customSettings?: Record<string, any>

  createdAt: string
  updatedAt: string
}

export interface TournamentRules {
  matchFormat: 'BO1' | 'BO3' | 'BO5'
  maps?: string[]
  timePerMatch?: number
  allowSubstitutes?: boolean
  [key: string]: any
}

export interface PrizeDistribution {
  type: 'PERCENTAGE' | 'FIXED'
  distribution: Array<{
    rank: number
    amount: number
    percentage?: number
  }>
}

export interface TournamentPhase {
  id: string
  tournamentId: string
  name: string
  type: TournamentType
  order: number
  status: string
  config?: Record<string, any>
}

export interface Participant {
  id: string
  tournamentId: string
  userId: string
  user?: User
  status: ParticipantStatus
  seed?: number
  finalRank?: number
  teamName?: string
  teamMembers?: TeamMember[]
  createdAt: string
}

export interface TeamMember {
  userId: string
  username: string
  role?: string
}

export interface User {
  id: string
  email: string
  username: string
  role: string
}

// Bracket types
export interface BracketData {
  type: TournamentType
  rounds: BracketRound[]
  participants: Participant[]
}

export interface BracketRound {
  round: number
  name: string
  matches: Match[]
}

export interface Match {
  id: string
  tournamentId: string
  phaseId?: string

  round: number
  matchNumber: number
  bestOf: number

  homeParticipantId?: string
  awayParticipantId?: string
  homeParticipant?: Participant
  awayParticipant?: Participant

  homeScore: number
  awayScore: number

  winnerId?: string
  winner?: Participant

  status: MatchStatus
  scheduledFor?: string
  startedAt?: string
  completedAt?: string

  // JSONB fields
  matchData?: MatchData

  createdAt: string
  updatedAt: string
}

export enum MatchStatus {
  PENDING = 'PENDING',
  SCHEDULED = 'SCHEDULED',
  LIVE = 'LIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  DISPUTED = 'DISPUTED',
  CANCELLED = 'CANCELLED',
}

export interface MatchData {
  maps?: MapResult[]
  mvp?: string
  duration?: number
  [key: string]: any
}

export interface MapResult {
  name: string
  homeScore: number
  awayScore: number
  duration?: number
}

// WebSocket Events
export interface MatchUpdateEvent {
  matchId: string
  tournamentId: string
  homeScore: number
  awayScore: number
  status: MatchStatus
  winnerId?: string
}

export interface TournamentUpdateEvent {
  tournamentId: string
  status: TournamentStatus
  currentParticipants?: number
}
