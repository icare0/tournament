// API Response types
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
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
  errors?: ValidationError[]
}

export interface ValidationError {
  field: string
  message: string
}

// Auth types
export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  username: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

export interface AuthUser {
  id: string
  email: string
  username: string
  role: UserRole
  status: UserStatus
}

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

// Query params
export interface TournamentFilters {
  game?: string
  type?: string
  status?: string
  search?: string
  page?: number
  limit?: number
}

export interface MatchFilters {
  tournamentId?: string
  status?: string
  participantId?: string
  page?: number
  limit?: number
}
