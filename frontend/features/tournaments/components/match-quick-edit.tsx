/**
 * MatchQuickEdit - Quick edit modal for match scores (Dashboard version)
 *
 * Simpler version of MatchRefereeModal for quick edits from Mission Control
 */

'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Match } from '@/types/api'
import { Trophy, Play, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface MatchQuickEditProps {
  match: Match | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (matchId: string, data: {
    participant1Score: number
    participant2Score: number
    winnerId: string
    status: 'IN_PROGRESS' | 'COMPLETED'
  }) => void
}

export function MatchQuickEdit({ match, isOpen, onClose, onSubmit }: MatchQuickEditProps) {
  const [score1, setScore1] = useState('')
  const [score2, setScore2] = useState('')
  const [selectedWinner, setSelectedWinner] = useState<string | null>(null)

  // Reset form when match changes
  useEffect(() => {
    if (match) {
      setScore1(match.score?.participant1?.toString() || '')
      setScore2(match.score?.participant2?.toString() || '')
      setSelectedWinner(match.winnerId || null)
    }
  }, [match?.id])

  if (!match) return null

  const handleStartMatch = () => {
    onSubmit(match.id, {
      participant1Score: 0,
      participant2Score: 0,
      winnerId: '',
      status: 'IN_PROGRESS',
    })
    onClose()
  }

  const handleCompleteMatch = () => {
    const score1Num = parseInt(score1) || 0
    const score2Num = parseInt(score2) || 0

    const winnerId = selectedWinner || (score1Num > score2Num
      ? match.participant1?.id
      : match.participant2?.id)

    if (!winnerId) return

    onSubmit(match.id, {
      participant1Score: score1Num,
      participant2Score: score2Num,
      winnerId,
      status: 'COMPLETED',
    })

    onClose()
  }

  const canComplete = score1 !== '' && score2 !== '' && selectedWinner !== null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Quick Match Edit</DialogTitle>
            <Badge variant={match.status === 'IN_PROGRESS' ? 'destructive' : 'secondary'}>
              {match.status}
            </Badge>
          </div>
          <DialogDescription>
            {match.bracket === 'winners' ? 'Winners' : 'Losers'} Round {match.round + 1} - Match{' '}
            {match.matchNumber + 1}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Quick Actions */}
          {match.status === 'SCHEDULED' && (
            <Button
              variant="outline"
              className="w-full justify-start gap-2 border-green-500 text-green-500 hover:bg-green-500/10"
              onClick={handleStartMatch}
            >
              <Play className="w-4 h-4" />
              Start Match Now
            </Button>
          )}

          {/* Participants & Scores */}
          <div className="space-y-3">
            {/* Participant 1 */}
            <div
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer',
                selectedWinner === match.participant1?.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              )}
              onClick={() => setSelectedWinner(match.participant1?.id || null)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {match.participant1?.seed && (
                    <span className="text-xs font-mono text-muted-foreground">
                      #{match.participant1.seed}
                    </span>
                  )}
                  <span className="font-semibold truncate">{match.participant1?.name || 'TBD'}</span>
                  {selectedWinner === match.participant1?.id && (
                    <Trophy className="w-4 h-4 text-primary ml-auto" />
                  )}
                </div>
              </div>
              <Input
                type="number"
                min="0"
                value={score1}
                onChange={(e) => setScore1(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                placeholder="0"
                className="w-16 text-center text-lg font-bold"
              />
            </div>

            {/* Participant 2 */}
            <div
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer',
                selectedWinner === match.participant2?.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              )}
              onClick={() => setSelectedWinner(match.participant2?.id || null)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {match.participant2?.seed && (
                    <span className="text-xs font-mono text-muted-foreground">
                      #{match.participant2.seed}
                    </span>
                  )}
                  <span className="font-semibold truncate">{match.participant2?.name || 'TBD'}</span>
                  {selectedWinner === match.participant2?.id && (
                    <Trophy className="w-4 h-4 text-primary ml-auto" />
                  )}
                </div>
              </div>
              <Input
                type="number"
                min="0"
                value={score2}
                onChange={(e) => setScore2(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                placeholder="0"
                className="w-16 text-center text-lg font-bold"
              />
            </div>
          </div>

          {/* Help Text */}
          {!canComplete && match.status !== 'SCHEDULED' && (
            <p className="text-xs text-muted-foreground">
              Enter scores and click on the winner's name
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {match.status !== 'COMPLETED' && (
            <Button onClick={handleCompleteMatch} disabled={!canComplete}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Complete Match
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
