'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import type { Match, UpdateMatchRequest, MatchStatus } from '../types'

// ============================================
// API Functions
// ============================================

export const matchesAPI = {
  // List all matches (with optional filters)
  list: async (filters?: {
    tournamentId?: string
    status?: MatchStatus
    page?: number
    limit?: number
  }): Promise<{ data: Match[]; total: number }> => {
    const response = await apiClient.get<{ data: Match[]; total: number }>(
      '/matches',
      {
        params: filters,
      }
    )
    return response.data
  },

  // Get match by ID
  get: async (id: string): Promise<Match> => {
    const response = await apiClient.get<Match>(`/matches/${id}`)
    return response.data
  },

  // Update match
  update: async (id: string, data: UpdateMatchRequest): Promise<Match> => {
    const response = await apiClient.patch<Match>(`/matches/${id}`, data)
    return response.data
  },

  // Get matches for tournament
  getByTournament: async (tournamentId: string): Promise<Match[]> => {
    const response = await apiClient.get<Match[]>(
      `/tournaments/${tournamentId}/matches`
    )
    return response.data
  },

  // Start match
  start: async (id: string): Promise<Match> => {
    const response = await apiClient.post<Match>(`/matches/${id}/start`)
    return response.data
  },

  // Complete match
  complete: async (
    id: string,
    data: { homeScore: number; awayScore: number; winnerId: string }
  ): Promise<Match> => {
    const response = await apiClient.post<Match>(`/matches/${id}/complete`, data)
    return response.data
  },

  // Report dispute
  reportDispute: async (id: string, reason: string): Promise<Match> => {
    const response = await apiClient.post<Match>(`/matches/${id}/dispute`, {
      reason,
    })
    return response.data
  },
}

// ============================================
// Hooks
// ============================================

export function useMatches(filters?: {
  tournamentId?: string
  status?: MatchStatus
  page?: number
  limit?: number
}) {
  return useQuery({
    queryKey: ['matches', filters],
    queryFn: () => matchesAPI.list(filters),
    staleTime: 1000 * 30, // 30 seconds
  })
}

export function useMatch(id: string, enabled = true) {
  return useQuery({
    queryKey: ['matches', id],
    queryFn: () => matchesAPI.get(id),
    enabled: !!id && enabled,
    staleTime: 1000 * 15, // 15 seconds
  })
}

export function useTournamentMatches(tournamentId: string) {
  return useQuery({
    queryKey: ['tournaments', tournamentId, 'matches'],
    queryFn: () => matchesAPI.getByTournament(tournamentId),
    enabled: !!tournamentId,
    staleTime: 1000 * 30, // 30 seconds
  })
}

export function useUpdateMatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMatchRequest }) =>
      matchesAPI.update(id, data),
    onSuccess: (match) => {
      // Invalidate match queries
      queryClient.invalidateQueries({ queryKey: ['matches'] })
      queryClient.invalidateQueries({ queryKey: ['matches', match.id] })

      // Invalidate tournament queries
      if (match.tournamentId) {
        queryClient.invalidateQueries({
          queryKey: ['tournaments', match.tournamentId, 'matches'],
        })
        queryClient.invalidateQueries({
          queryKey: ['tournaments', match.tournamentId, 'bracket'],
        })
      }
    },
  })
}

export function useStartMatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: matchesAPI.start,
    onSuccess: (match) => {
      queryClient.invalidateQueries({ queryKey: ['matches'] })
      queryClient.invalidateQueries({ queryKey: ['matches', match.id] })

      if (match.tournamentId) {
        queryClient.invalidateQueries({
          queryKey: ['tournaments', match.tournamentId, 'matches'],
        })
      }
    },
  })
}

export function useCompleteMatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: { homeScore: number; awayScore: number; winnerId: string }
    }) => matchesAPI.complete(id, data),
    onSuccess: (match) => {
      queryClient.invalidateQueries({ queryKey: ['matches'] })
      queryClient.invalidateQueries({ queryKey: ['matches', match.id] })

      if (match.tournamentId) {
        queryClient.invalidateQueries({
          queryKey: ['tournaments', match.tournamentId],
        })
        queryClient.invalidateQueries({
          queryKey: ['tournaments', match.tournamentId, 'matches'],
        })
        queryClient.invalidateQueries({
          queryKey: ['tournaments', match.tournamentId, 'bracket'],
        })
      }
    },
  })
}

export function useReportDispute() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      matchesAPI.reportDispute(id, reason),
    onSuccess: (match) => {
      queryClient.invalidateQueries({ queryKey: ['matches'] })
      queryClient.invalidateQueries({ queryKey: ['matches', match.id] })
    },
  })
}
