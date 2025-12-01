'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { tokenManager } from '@/lib/api/token-manager'
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RefreshTokenResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  User,
} from '../types'

// ============================================
// API Functions
// ============================================

export const authAPI = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data)
    return response.data
  },

  register: async (data: RegisterRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/register', data)
    return response.data
  },

  refresh: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh', {
      refreshToken,
    })
    return response.data
  },

  verifyEmail: async (data: VerifyEmailRequest): Promise<void> => {
    await apiClient.post('/auth/verify-email', data)
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
    await apiClient.post('/auth/forgot-password', data)
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    await apiClient.post('/auth/reset-password', data)
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/me')
    return response.data
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout')
  },
}

// ============================================
// Hooks
// ============================================

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authAPI.login,
    onSuccess: (data) => {
      // Store tokens
      tokenManager.setTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      })

      // Cache user data
      queryClient.setQueryData(['auth', 'me'], data.user)
    },
  })
}

export function useRegister() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authAPI.register,
    onSuccess: (data) => {
      // Store tokens
      tokenManager.setTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      })

      // Cache user data
      queryClient.setQueryData(['auth', 'me'], data.user)
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authAPI.logout,
    onSuccess: () => {
      // Clear tokens
      tokenManager.clearTokens()

      // Clear all cached data
      queryClient.clear()
    },
  })
}

export function useMe() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authAPI.getMe,
    enabled: !!tokenManager.getToken(),
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: authAPI.verifyEmail,
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: authAPI.forgotPassword,
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: authAPI.resetPassword,
  })
}
