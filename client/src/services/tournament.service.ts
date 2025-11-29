import api from './api'
import {
  Tournament,
  TournamentFilters,
  BracketData,
  Participant,
} from '@/types/tournament.types'
import { ApiResponse, PaginatedResponse } from '@/types/api.types'

/**
 * Tournament Service - API calls for tournaments
 */
export const tournamentService = {
  /**
   * Get list of tournaments with filters
   */
  async getAll(filters?: TournamentFilters): Promise<PaginatedResponse<Tournament>> {
    return api.get('/tournaments', { params: filters })
  },

  /**
   * Get tournament details by ID
   */
  async getById(id: string): Promise<ApiResponse<Tournament>> {
    return api.get(`/tournaments/${id}`)
  },

  /**
   * Create new tournament
   */
  async create(data: Partial<Tournament>): Promise<ApiResponse<Tournament>> {
    return api.post('/tournaments', data)
  },

  /**
   * Update tournament
   */
  async update(id: string, data: Partial<Tournament>): Promise<ApiResponse<Tournament>> {
    return api.patch(`/tournaments/${id}`, data)
  },

  /**
   * Delete tournament
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    return api.delete(`/tournaments/${id}`)
  },

  /**
   * Register participant to tournament
   */
  async register(tournamentId: string): Promise<ApiResponse<Participant>> {
    return api.post(`/tournaments/${tournamentId}/register`)
  },

  /**
   * Check-in participant
   */
  async checkIn(tournamentId: string): Promise<ApiResponse<Participant>> {
    return api.post(`/tournaments/${tournamentId}/check-in`)
  },

  /**
   * Start tournament
   */
  async start(tournamentId: string): Promise<ApiResponse<Tournament>> {
    return api.post(`/tournaments/${tournamentId}/start`)
  },

  /**
   * Get tournament bracket
   */
  async getBracket(tournamentId: string): Promise<ApiResponse<BracketData>> {
    return api.get(`/tournaments/${tournamentId}/bracket`)
  },

  /**
   * Get tournament participants
   */
  async getParticipants(tournamentId: string): Promise<ApiResponse<Participant[]>> {
    return api.get(`/tournaments/${tournamentId}/participants`)
  },

  /**
   * Get user's tournaments (as organizer)
   */
  async getMyTournaments(): Promise<PaginatedResponse<Tournament>> {
    return api.get('/tournaments/my-tournaments')
  },

  /**
   * Get tournaments user is participating in
   */
  async getParticipating(): Promise<PaginatedResponse<Tournament>> {
    return api.get('/tournaments/participating')
  },
}

export default tournamentService
