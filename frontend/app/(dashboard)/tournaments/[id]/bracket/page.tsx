'use client'

import { use } from 'react'
import { useTournamentBracket } from '@/features/tournaments/api/use-tournaments'
import { TournamentBracket } from '@/features/tournaments/components/tournament-bracket'
import { Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useState } from 'react'
import type { BracketMatch } from '@/features/tournaments/types'

interface BracketPageProps {
  params: Promise<{ id: string }>
}

export default function BracketPage({ params }: BracketPageProps) {
  const { id } = use(params)
  const { data: bracketData, isLoading, error } = useTournamentBracket(id)
  const [selectedMatch, setSelectedMatch] = useState<BracketMatch | null>(null)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !bracketData) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load tournament bracket. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="h-screen">
      <TournamentBracket
        tournamentId={id}
        data={bracketData}
        onMatchClick={(match) => setSelectedMatch(match)}
        className="h-full"
      />
    </div>
  )
}
