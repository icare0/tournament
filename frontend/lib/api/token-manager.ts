// Token Manager - Handles JWT token storage and retrieval

interface Tokens {
  accessToken: string
  refreshToken: string
}

class TokenManager {
  private readonly ACCESS_TOKEN_KEY = 'access_token'
  private readonly REFRESH_TOKEN_KEY = 'refresh_token'

  // Set tokens in both localStorage and cookies
  setTokens(tokens: Tokens): void {
    if (typeof window === 'undefined') return

    // Set in localStorage
    localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.accessToken)
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken)

    // Set in cookies (for middleware access)
    this.setCookie(this.ACCESS_TOKEN_KEY, tokens.accessToken, 7) // 7 days
    this.setCookie(this.REFRESH_TOKEN_KEY, tokens.refreshToken, 30) // 30 days
  }

  // Get access token
  getToken(): string | null {
    if (typeof window === 'undefined') return null

    // Try localStorage first
    const token = localStorage.getItem(this.ACCESS_TOKEN_KEY)
    if (token) return token

    // Fallback to cookie
    return this.getCookie(this.ACCESS_TOKEN_KEY)
  }

  // Get refresh token
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null

    // Try localStorage first
    const token = localStorage.getItem(this.REFRESH_TOKEN_KEY)
    if (token) return token

    // Fallback to cookie
    return this.getCookie(this.REFRESH_TOKEN_KEY)
  }

  // Clear all tokens
  clearTokens(): void {
    if (typeof window === 'undefined') return

    // Clear localStorage
    localStorage.removeItem(this.ACCESS_TOKEN_KEY)
    localStorage.removeItem(this.REFRESH_TOKEN_KEY)

    // Clear cookies
    this.deleteCookie(this.ACCESS_TOKEN_KEY)
    this.deleteCookie(this.REFRESH_TOKEN_KEY)
  }

  // Helper: Set cookie
  private setCookie(name: string, value: string, days: number): void {
    const expires = new Date()
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`
  }

  // Helper: Get cookie
  private getCookie(name: string): string | null {
    const nameEQ = name + '='
    const ca = document.cookie.split(';')
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) === ' ') c = c.substring(1, c.length)
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
    }
    return null
  }

  // Helper: Delete cookie
  private deleteCookie(name: string): void {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`
  }
}

export const tokenManager = new TokenManager()
