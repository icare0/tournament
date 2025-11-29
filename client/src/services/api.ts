import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { ApiError } from '@/types/api.types'

/**
 * Base API URL from environment
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

/**
 * Create Axios instance with default config
 */
const api: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api/v1`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Request interceptor - Add JWT token to requests
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage (browser only)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken')

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }

    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

/**
 * Response interceptor - Handle errors and token refresh
 */
api.interceptors.response.use(
  (response) => {
    // Return data directly
    return response.data
  },
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refreshToken')

        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        const response = await axios.post<{ accessToken: string }>(
          `${API_URL}/api/v1/auth/refresh`,
          { refreshToken }
        )

        const { accessToken } = response.data

        // Save new token
        localStorage.setItem('accessToken', accessToken)

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
        }

        return api(originalRequest)
      } catch (refreshError) {
        // Refresh failed - logout user
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          window.location.href = '/login'
        }

        return Promise.reject(refreshError)
      }
    }

    // Handle network errors
    if (!error.response) {
      const networkError: ApiError = {
        message: 'Erreur réseau - Vérifiez votre connexion',
        statusCode: 0,
        error: 'NetworkError',
      }
      return Promise.reject(networkError)
    }

    // Return formatted error
    const apiError: ApiError = {
      message: error.response.data?.message || 'Une erreur est survenue',
      statusCode: error.response.status,
      error: error.response.data?.error,
      errors: error.response.data?.errors,
    }

    return Promise.reject(apiError)
  }
)

/**
 * Helper function to handle API errors in components
 */
export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return (error as ApiError).message
  }

  return 'Une erreur inattendue est survenue'
}

export default api
