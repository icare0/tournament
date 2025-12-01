// Tournament Types

export type TournamentStatus =
  | 'DRAFT'
  | 'REGISTRATION_OPEN'
  | 'REGISTRATION_CLOSED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'

export type TournamentType =
  | 'SINGLE_ELIMINATION'
  | 'DOUBLE_ELIMINATION'
  | 'ROUND_ROBIN'
  | 'SWISS'
  | 'BATTLE_ROYALE'
  | 'CUSTOM'

export type TournamentVisibility = 'PUBLIC' | 'PRIVATE' | 'INVITE_ONLY'

export interface Tournament {
  id: string
  name: string
  description?: string
  game: string
  type: TournamentType
  status: TournamentStatus
  visibility: TournamentVisibility
  organizerId: string
  maxParticipants: number
  currentParticipants: number
  entryFee: string
  prizePool: string
  registrationStart: string
  registrationEnd: string
  startDate: string
  endDate?: string
  rules?: Record<string, any>
  prizes?: Record<string, any>
  customSettings?: Record<string, any>
  banner?: string
  logo?: string
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
  organizer?: {
    id: string
    username: string
    avatar?: string
  }
}

export interface CreateTournamentRequest {
  name: string
  description?: string
  game: string
  type: TournamentType
  visibility?: TournamentVisibility
  maxParticipants: number
  entryFee?: number
  prizePool?: number
  registrationStart: string
  registrationEnd: string
  startDate: string
  endDate?: string
  rules?: Record<string, any>
  prizes?: Record<string, any>
  customSettings?: Record<string, any>
  banner?: string
  logo?: string
}

export interface UpdateTournamentRequest extends Partial<CreateTournamentRequest> {
  status?: TournamentStatus
}

export interface TournamentFilters {
  game?: string
  type?: TournamentType
  status?: TournamentStatus
  visibility?: TournamentVisibility
  search?: string
  page?: number
  limit?: number
}

export interface TournamentListResponse {
  data: Tournament[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Participant Types

export type ParticipantStatus =
  | 'REGISTERED'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'ELIMINATED'
  | 'WITHDRAWN'
  | 'DISQUALIFIED'

export interface Participant {
  id: string
  tournamentId: string
  userId: string
  status: ParticipantStatus
  seed?: number
  finalRank?: number
  teamName?: string
  teamMembers?: any[]
  checkedInAt?: string
  wins: number
  losses: number
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    username: string
    avatar?: string
  }
}

export interface RegisterParticipantRequest {
  userId?: string
  teamName?: string
  teamMembers?: any[]
}

// Match Types

export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED'

export interface Match {
  id: string
  tournamentId: string
  phaseId?: string
  round: number
  matchNumber: number
  bestOf: number
  status: MatchStatus
  homeParticipantId?: string
  awayParticipantId?: string
  homeScore: number
  awayScore: number
  winnerId?: string
  scheduledAt?: string
  startedAt?: string
  completedAt?: string
  matchData?: Record<string, any>
  streamUrl?: string
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
  homeParticipant?: Participant
  awayParticipant?: Participant
}

export interface UpdateMatchRequest {
  status?: MatchStatus
  homeScore?: number
  awayScore?: number
  winnerId?: string
  matchData?: Record<string, any>
  streamUrl?: string
  scheduledAt?: string
}

// Bracket Types (for visualization)

export interface BracketParticipant {
  id: string
  name: string
  avatar?: string
  seed?: number
}

export interface BracketMatch {
  id: string
  round: number
  matchNumber: number
  bracket: 'winners' | 'losers' | 'grand-final'
  participant1?: BracketParticipant
  participant2?: BracketParticipant
  score1: number
  score2: number
  winnerId?: string
  status: MatchStatus
  nextMatchId?: string
  x: number
  y: number
}

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

export interface BracketRound {
  round: number
  matches: BracketMatch[]
}

export interface BracketData {
  winnersBracket: BracketRound[]
  losersBracket: BracketRound[]
  grandFinal?: BracketMatch
  connections: BracketConnection[]
  dimensions: {
    width: number
    height: number
  }
}
