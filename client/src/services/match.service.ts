import api from './api'
import { Match, MatchFilters } from '@/types/tournament.types'
import { ApiResponse, PaginatedResponse } from '@/types/api.types'

/**
 * Match Service - API calls for matches
 */
export const matchService = {
  /**
   * Get list of matches with filters
   */
  async getAll(filters?: MatchFilters): Promise<PaginatedResponse<Match>> {
    return api.get('/matches', { params: filters })
  },

  /**
   * Get match details by ID
   */
  async getById(id: string): Promise<ApiResponse<Match>> {
    return api.get(`/matches/${id}`)
  },

  /**
   * Update match score (referee/organizer only)
   */
  async updateScore(
    id: string,
    data: { homeScore: number; awayScore: number }
  ): Promise<ApiResponse<Match>> {
    return api.patch(`/matches/${id}/score`, data)
  },

  /**
   * Report match result (referee only)
   */
  async reportResult(
    id: string,
    data: {
      homeScore: number
      awayScore: number
      winnerId: string
      matchData?: any
    }
  ): Promise<ApiResponse<Match>> {
    return api.post(`/matches/${id}/report`, data)
  },

  /**
   * Start match
   */
  async start(id: string): Promise<ApiResponse<Match>> {
    return api.post(`/matches/${id}/start`)
  },

  /**
   * Complete match
   */
  async complete(id: string): Promise<ApiResponse<Match>> {
    return api.post(`/matches/${id}/complete`)
  },

  /**
   * Create dispute for match
   */
  async dispute(id: string, reason: string): Promise<ApiResponse<any>> {
    return api.post(`/matches/${id}/dispute`, { reason })
  },

  /**
   * Get upcoming matches for user
   */
  async getUpcoming(): Promise<ApiResponse<Match[]>> {
    return api.get('/matches/upcoming')
  },

  /**
   * Get live matches
   */
  async getLive(): Promise<ApiResponse<Match[]>> {
    return api.get('/matches/live')
  },
}

export default matchService
