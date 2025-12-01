'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import type {
  Tournament,
  TournamentListResponse,
  TournamentFilters,
  CreateTournamentRequest,
  UpdateTournamentRequest,
  RegisterParticipantRequest,
  Participant,
  BracketData,
} from '../types'

// ============================================
// API Functions
// ============================================

export const tournamentsAPI = {
  // List tournaments with filters
  list: async (filters?: TournamentFilters): Promise<TournamentListResponse> => {
    const response = await apiClient.get<TournamentListResponse>('/tournaments', {
      params: filters,
    })
    return response.data
  },

  // Get tournament by ID
  get: async (id: string): Promise<Tournament> => {
    const response = await apiClient.get<Tournament>(`/tournaments/${id}`)
    return response.data
  },

  // Create tournament
  create: async (data: CreateTournamentRequest): Promise<Tournament> => {
    const response = await apiClient.post<Tournament>('/tournaments', data)
    return response.data
  },

  // Update tournament
  update: async (id: string, data: UpdateTournamentRequest): Promise<Tournament> => {
    const response = await apiClient.patch<Tournament>(`/tournaments/${id}`, data)
    return response.data
  },

  // Delete tournament
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/tournaments/${id}`)
  },

  // Start tournament
  start: async (id: string): Promise<Tournament> => {
    const response = await apiClient.post<Tournament>(`/tournaments/${id}/start`)
    return response.data
  },

  // Register participant
  register: async (
    id: string,
    data: RegisterParticipantRequest
  ): Promise<Participant> => {
    const response = await apiClient.post<Participant>(
      `/tournaments/${id}/register`,
      data
    )
    return response.data
  },

  // Get tournament bracket
  getBracket: async (id: string): Promise<BracketData> => {
    const response = await apiClient.get<BracketData>(`/tournaments/${id}/bracket`)
    return response.data
  },

  // Get tournament participants
  getParticipants: async (id: string): Promise<Participant[]> => {
    const response = await apiClient.get<Participant[]>(
      `/tournaments/${id}/participants`
    )
    return response.data
  },
}

// ============================================
// Hooks
// ============================================

export function useTournaments(filters?: TournamentFilters) {
  return useQuery({
    queryKey: ['tournaments', filters],
    queryFn: () => tournamentsAPI.list(filters),
    staleTime: 1000 * 60, // 1 minute
  })
}

export function useTournament(id: string, enabled = true) {
  return useQuery({
    queryKey: ['tournaments', id],
    queryFn: () => tournamentsAPI.get(id),
    enabled: !!id && enabled,
    staleTime: 1000 * 30, // 30 seconds
  })
}

export function useCreateTournament() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: tournamentsAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] })
    },
  })
}

export function useUpdateTournament() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTournamentRequest }) =>
      tournamentsAPI.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] })
      queryClient.invalidateQueries({ queryKey: ['tournaments', variables.id] })
    },
  })
}

export function useDeleteTournament() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: tournamentsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] })
    },
  })
}

export function useStartTournament() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: tournamentsAPI.start,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] })
      queryClient.invalidateQueries({ queryKey: ['tournaments', data.id] })
    },
  })
}

export function useRegisterParticipant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      tournamentId,
      data,
    }: {
      tournamentId: string
      data: RegisterParticipantRequest
    }) => tournamentsAPI.register(tournamentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['tournaments', variables.tournamentId],
      })
      queryClient.invalidateQueries({
        queryKey: ['tournaments', variables.tournamentId, 'participants'],
      })
    },
  })
}

export function useTournamentBracket(tournamentId: string) {
  return useQuery({
    queryKey: ['tournaments', tournamentId, 'bracket'],
    queryFn: () => tournamentsAPI.getBracket(tournamentId),
    enabled: !!tournamentId,
    staleTime: 1000 * 30, // 30 seconds
  })
}

export function useTournamentParticipants(tournamentId: string) {
  return useQuery({
    queryKey: ['tournaments', tournamentId, 'participants'],
    queryFn: () => tournamentsAPI.getParticipants(tournamentId),
    enabled: !!tournamentId,
    staleTime: 1000 * 60, // 1 minute
  })
}
