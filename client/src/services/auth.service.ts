import api from './api'
import {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  AuthUser,
} from '@/types/api.types'

/**
 * Auth Service - API calls for authentication
 */
export const authService = {
  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials)

    // Save tokens to localStorage
    if (typeof window !== 'undefined' && response.accessToken) {
      localStorage.setItem('accessToken', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)
    }

    return response
  },

  /**
   * Register new user
   */
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', credentials)

    // Save tokens to localStorage
    if (typeof window !== 'undefined' && response.accessToken) {
      localStorage.setItem('accessToken', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)
    }

    return response
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    }
    await api.post('/auth/logout')
  },

  /**
   * Get current user profile
   */
  async getProfile(): Promise<AuthUser> {
    return api.get('/auth/profile')
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    return api.post('/auth/refresh', { refreshToken })
  },

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<void> {
    return api.post('/auth/verify-email', { token })
  },

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<void> {
    return api.post('/auth/forgot-password', { email })
  },

  /**
   * Reset password
   */
  async resetPassword(token: string, password: string): Promise<void> {
    return api.post('/auth/reset-password', { token, password })
  },
}

export default authService
