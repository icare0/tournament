import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format date
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }
  return new Date(date).toLocaleDateString('fr-FR', defaultOptions)
}

/**
 * Format date with time
 */
export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Format currency
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
  }).format(amount)
}

/**
 * Format large numbers (1000 -> 1K)
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}

/**
 * Truncate text
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return `${text.slice(0, length)}...`
}

/**
 * Get match status color
 */
export function getMatchStatusColor(status: string): string {
  const colors: Record<string, string> = {
    LIVE: 'text-red-500 bg-red-500/20 border-red-500/50',
    PENDING: 'text-gray-500 bg-gray-500/20 border-gray-500/50',
    SCHEDULED: 'text-blue-500 bg-blue-500/20 border-blue-500/50',
    COMPLETED: 'text-green-500 bg-green-500/20 border-green-500/50',
    DISPUTED: 'text-yellow-500 bg-yellow-500/20 border-yellow-500/50',
    CANCELLED: 'text-red-500 bg-red-500/20 border-red-500/50',
  }
  return colors[status] || colors.PENDING
}

/**
 * Get tournament status color
 */
export function getTournamentStatusColor(status: string): string {
  const colors: Record<string, string> = {
    DRAFT: 'text-gray-500 bg-gray-500/20',
    REGISTRATION_OPEN: 'text-green-500 bg-green-500/20',
    REGISTRATION_CLOSED: 'text-yellow-500 bg-yellow-500/20',
    IN_PROGRESS: 'text-blue-500 bg-blue-500/20',
    COMPLETED: 'text-purple-500 bg-purple-500/20',
    CANCELLED: 'text-red-500 bg-red-500/20',
  }
  return colors[status] || colors.DRAFT
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Sleep function
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Generate bracket coordinates for SVG rendering
 */
export function calculateBracketPosition(
  round: number,
  matchIndex: number,
  totalRounds: number
): { x: number; y: number } {
  const roundSpacing = 300
  const matchSpacing = 100
  const baseSpacing = Math.pow(2, round)

  return {
    x: round * roundSpacing,
    y: matchIndex * matchSpacing * baseSpacing + baseSpacing * 50,
  }
}

/**
 * Check if user has permission
 */
export function hasPermission(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole)
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
