/**
 * MatchRefereeModal - Modal for match arbitration and score reporting
 */

'use client'

import React, { useState } from 'react'
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
import { BracketMatch } from '../types/bracket'
import { Trophy, Clock, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MatchRefereeModalProps {
  match: BracketMatch | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (matchId: string, data: MatchResult) => void
}

export interface MatchResult {
  participant1Score: number
  participant2Score: number
  winnerId: string
}

export const MatchRefereeModal: React.FC<MatchRefereeModalProps> = ({
  match,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [score1, setScore1] = useState(match?.participant1?.score?.toString() || '')
  const [score2, setScore2] = useState(match?.participant2?.score?.toString() || '')
  const [selectedWinner, setSelectedWinner] = useState<string | null>(match?.winnerId || null)

  if (!match) return null

  const handleSubmit = () => {
    const score1Num = parseInt(score1) || 0
    const score2Num = parseInt(score2) || 0

    // Determine winner if not manually selected
    const winnerId = selectedWinner || (score1Num > score2Num
      ? match.participant1?.id
      : match.participant2?.id)

    if (!winnerId) return

    onSubmit(match.id, {
      participant1Score: score1Num,
      participant2Score: score2Num,
      winnerId,
    })

    onClose()
  }

  const canSubmit = score1 !== '' && score2 !== '' && selectedWinner !== null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Match Arbitration
          </DialogTitle>
          <DialogDescription>
            Report the match result and declare the winner
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Match Info */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>
                {match.bracket === 'winners' ? 'Winners' : 'Losers'} - Round {match.round + 1}
              </span>
            </div>
            {match.status === 'IN_PROGRESS' && (
              <div className="flex items-center gap-1.5 text-green-500">
                <Clock className="h-4 w-4" />
                <span>Live</span>
              </div>
            )}
          </div>

          {/* Participants & Score */}
          <div className="space-y-3">
            {/* Participant 1 */}
            <div
              className={cn(
                'flex items-center gap-4 p-4 rounded-lg border-2 transition-all cursor-pointer',
                selectedWinner === match.participant1?.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              )}
              onClick={() => setSelectedWinner(match.participant1?.id || null)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {match.participant1?.seed && (
                    <span className="text-xs font-mono text-muted-foreground">
                      #{match.participant1.seed}
                    </span>
                  )}
                  <span className="font-semibold">{match.participant1?.name || 'TBD'}</span>
                  {selectedWinner === match.participant1?.id && (
                    <Trophy className="h-4 w-4 text-primary ml-auto" />
                  )}
                </div>
              </div>
              <Input
                type="number"
                min="0"
                value={score1}
                onChange={(e) => setScore1(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                placeholder="Score"
                className="w-20 text-center text-lg font-bold"
              />
            </div>

            {/* VS Divider */}
            <div className="flex items-center justify-center">
              <span className="text-sm font-semibold text-muted-foreground">VS</span>
            </div>

            {/* Participant 2 */}
            <div
              className={cn(
                'flex items-center gap-4 p-4 rounded-lg border-2 transition-all cursor-pointer',
                selectedWinner === match.participant2?.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              )}
              onClick={() => setSelectedWinner(match.participant2?.id || null)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {match.participant2?.seed && (
                    <span className="text-xs font-mono text-muted-foreground">
                      #{match.participant2.seed}
                    </span>
                  )}
                  <span className="font-semibold">{match.participant2?.name || 'TBD'}</span>
                  {selectedWinner === match.participant2?.id && (
                    <Trophy className="h-4 w-4 text-primary ml-auto" />
                  )}
                </div>
              </div>
              <Input
                type="number"
                min="0"
                value={score2}
                onChange={(e) => setScore2(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                placeholder="Score"
                className="w-20 text-center text-lg font-bold"
              />
            </div>
          </div>

          {/* Warnings */}
          {!canSubmit && (
            <p className="text-sm text-muted-foreground">
              Please enter scores for both participants and select a winner
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            Submit Result
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
