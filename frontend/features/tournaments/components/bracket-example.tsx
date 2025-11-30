/**
 * Example: Complete Tournament Bracket Integration
 *
 * This file demonstrates how to use the TournamentBracket component
 * with real data fetching and match arbitration.
 */

'use client'

import React, { useState } from 'react'
import { TournamentBracket, useBracketLayout, MatchRefereeModal, BracketMatch } from '@/features/tournaments'
import type { MatchResult } from '@/features/tournaments'

// Mock data for demonstration
const mockMatches = [
  // Winner's Bracket - Round 1
  {
    id: 'm1',
    tournamentId: 't1',
    round: 0,
    matchNumber: 0,
    bracket: 'winners' as const,
    status: 'COMPLETED' as const,
    participant1: { id: 'p1', name: 'Cloud9', seed: 1 },
    participant2: { id: 'p8', name: 'Team Liquid', seed: 8 },
    winnerId: 'p1',
    score: { participant1: 2, participant2: 0 },
    nextMatchId: 'm5',
  },
  {
    id: 'm2',
    tournamentId: 't1',
    round: 0,
    matchNumber: 1,
    bracket: 'winners' as const,
    status: 'IN_PROGRESS' as const,
    participant1: { id: 'p4', name: 'Fnatic', seed: 4 },
    participant2: { id: 'p5', name: 'G2 Esports', seed: 5 },
    nextMatchId: 'm5',
  },
  {
    id: 'm3',
    tournamentId: 't1',
    round: 0,
    matchNumber: 2,
    bracket: 'winners' as const,
    status: 'SCHEDULED' as const,
    participant1: { id: 'p2', name: 'Team Vitality', seed: 2 },
    participant2: { id: 'p7', name: 'NRG', seed: 7 },
    nextMatchId: 'm6',
  },
  {
    id: 'm4',
    tournamentId: 't1',
    round: 0,
    matchNumber: 3,
    bracket: 'winners' as const,
    status: 'SCHEDULED' as const,
    participant1: { id: 'p3', name: 'FaZe Clan', seed: 3 },
    participant2: { id: 'p6', name: 'NAVI', seed: 6 },
    nextMatchId: 'm6',
  },

  // Winner's Bracket - Round 2
  {
    id: 'm5',
    tournamentId: 't1',
    round: 1,
    matchNumber: 0,
    bracket: 'winners' as const,
    status: 'SCHEDULED' as const,
    participant1: { id: 'p1', name: 'Cloud9' },
    nextMatchId: 'm9',
  },
  {
    id: 'm6',
    tournamentId: 't1',
    round: 1,
    matchNumber: 1,
    bracket: 'winners' as const,
    status: 'SCHEDULED' as const,
    nextMatchId: 'm9',
  },

  // Loser's Bracket - Round 1
  {
    id: 'm7',
    tournamentId: 't1',
    round: 0,
    matchNumber: 0,
    bracket: 'losers' as const,
    status: 'SCHEDULED' as const,
    nextMatchId: 'm11',
  },
  {
    id: 'm8',
    tournamentId: 't1',
    round: 0,
    matchNumber: 1,
    bracket: 'losers' as const,
    status: 'SCHEDULED' as const,
    nextMatchId: 'm11',
  },

  // Winner's Finals
  {
    id: 'm9',
    tournamentId: 't1',
    round: 2,
    matchNumber: 0,
    bracket: 'winners' as const,
    status: 'SCHEDULED' as const,
    nextMatchId: 'gf',
  },

  // Loser's Finals
  {
    id: 'm11',
    tournamentId: 't1',
    round: 1,
    matchNumber: 0,
    bracket: 'losers' as const,
    status: 'SCHEDULED' as const,
    nextMatchId: 'gf',
  },

  // Grand Final
  {
    id: 'gf',
    tournamentId: 't1',
    round: 0,
    matchNumber: 0,
    bracket: 'grand-final' as const,
    status: 'SCHEDULED' as const,
  },
]

export function BracketExample() {
  const [selectedMatch, setSelectedMatch] = useState<BracketMatch | null>(null)

  // Transform matches to bracket layout
  const bracketData = useBracketLayout({
    matches: mockMatches,
    tournamentId: 't1',
  })

  // Populate tournament info
  bracketData.tournament = {
    id: 't1',
    name: 'Valorant Champions Tour 2025',
    game: 'Valorant',
    type: 'DOUBLE_ELIMINATION',
    status: 'IN_PROGRESS',
  } as any

  const handleMatchClick = (match: BracketMatch) => {
    console.log('Match clicked:', match)
    setSelectedMatch(match)
  }

  const handleSubmitResult = async (matchId: string, result: MatchResult) => {
    console.log('Submit result for match:', matchId, result)

    // In real app:
    // await apiClient.patch(`/matches/${matchId}`, result)
    // queryClient.invalidateQueries(['matches', tournamentId])

    alert(`Match ${matchId} result submitted!
Participant 1 Score: ${result.participant1Score}
Participant 2 Score: ${result.participant2Score}
Winner ID: ${result.winnerId}`)
  }

  const handleMatchUpdate = (matchId: string) => {
    console.log('Match updated:', matchId)
    // Refresh data in real app
  }

  return (
    <div className="w-full h-screen p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Tournament Bracket Example</h1>
        <p className="text-muted-foreground">
          Double Elimination Bracket with Pan & Zoom. Click on matches to arbitrate.
        </p>
      </div>

      <TournamentBracket
        tournamentId="t1"
        data={bracketData}
        onMatchClick={handleMatchClick}
        onMatchUpdate={handleMatchUpdate}
        className="h-[calc(100vh-8rem)] border rounded-lg"
      />

      <MatchRefereeModal
        match={selectedMatch}
        isOpen={!!selectedMatch}
        onClose={() => setSelectedMatch(null)}
        onSubmit={handleSubmitResult}
      />
    </div>
  )
}

/**
 * Usage in a page:
 *
 * // app/(dashboard)/tournaments/[id]/bracket/page.tsx
 * import { BracketExample } from '@/features/tournaments/components/bracket-example'
 *
 * export default function BracketPage() {
 *   return <BracketExample />
 * }
 */
