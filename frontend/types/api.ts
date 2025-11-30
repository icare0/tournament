// API Response Types

export interface ApiResponse<T = any> {
  data: T
  message?: string
  statusCode: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface ApiError {
  message: string
  statusCode: number
  error?: string
  errors?: Record<string, string[]>
}

// Auth Types
export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  username: string
  password: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  user: User
}

// User Types
export enum UserRole {
  ADMIN = 'ADMIN',
  ORGANIZER = 'ORGANIZER',
  PLAYER = 'PLAYER',
  REFEREE = 'REFEREE',
  SPECTATOR = 'SPECTATOR',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  BANNED = 'BANNED',
}

export interface User {
  id: string
  email: string
  username: string
  role: UserRole
  status: UserStatus
  createdAt: string
  updatedAt: string
}

// Tournament Types
export enum TournamentType {
  SINGLE_ELIMINATION = 'SINGLE_ELIMINATION',
  DOUBLE_ELIMINATION = 'DOUBLE_ELIMINATION',
  ROUND_ROBIN = 'ROUND_ROBIN',
  SWISS = 'SWISS',
  BATTLE_ROYALE = 'BATTLE_ROYALE',
  CUSTOM = 'CUSTOM',
}

export enum TournamentStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  REGISTRATION_OPEN = 'REGISTRATION_OPEN',
  REGISTRATION_CLOSED = 'REGISTRATION_CLOSED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface Tournament {
  id: string
  name: string
  game: string
  type: TournamentType
  status: TournamentStatus
  maxParticipants: number
  currentParticipants: number
  entryFee: string
  prizePool: string
  startDate: string
  endDate?: string
  rules?: any
  prizes?: any
  customSettings?: any
  organizerId: string
  createdAt: string
  updatedAt: string
}

// Match Types
export enum MatchStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  DISPUTED = 'DISPUTED',
  CANCELLED = 'CANCELLED',
}

export interface Match {
  id: string
  tournamentId: string
  round: number
  matchNumber: number
  status: MatchStatus
  scheduledAt?: string
  startedAt?: string
  completedAt?: string
  winnerId?: string
  score?: any
  details?: any
}
