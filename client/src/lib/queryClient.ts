import { QueryClient, DefaultOptions } from '@tanstack/react-query'

/**
 * Default options for React Query
 */
const queryConfig: DefaultOptions = {
  queries: {
    // Stale time: data is considered fresh for 5 minutes
    staleTime: 5 * 60 * 1000,

    // Cache time: inactive queries are garbage collected after 10 minutes
    gcTime: 10 * 60 * 1000,

    // Retry failed requests 3 times with exponential backoff
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

    // Don't refetch on window focus in development
    refetchOnWindowFocus: process.env.NODE_ENV === 'production',

    // Refetch on reconnect
    refetchOnReconnect: true,

    // Don't refetch on mount if data is fresh
    refetchOnMount: false,
  },
  mutations: {
    // Retry mutations once
    retry: 1,
  },
}

/**
 * Create a new QueryClient instance
 */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: queryConfig,
  })
}

/**
 * Singleton QueryClient for app
 */
let browserQueryClient: QueryClient | undefined = undefined

export function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient()
  } else {
    // Browser: make a new query client if we don't already have one
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient()
    }
    return browserQueryClient
  }
}
