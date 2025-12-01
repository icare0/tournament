// Authentication Types

export interface User {
  id: string
  email: string
  username: string
  firstName?: string
  lastName?: string
  avatar?: string
  role: 'ADMIN' | 'ORGANIZER' | 'PLAYER' | 'REFEREE' | 'SPECTATOR'
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED' | 'PENDING_VERIFICATION'
  emailVerified: boolean
  phoneNumber?: string
  country?: string
  timezone?: string
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  username: string
  password: string
  firstName?: string
  lastName?: string
}

export interface LoginResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface RefreshTokenResponse {
  accessToken: string
  refreshToken: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
}

export interface VerifyEmailRequest {
  token: string
}
