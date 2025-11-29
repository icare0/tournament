'use client'

import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Match } from '@/types/tournament.types'
import { cn } from '@/lib/utils'
import { GripVertical } from 'lucide-react'

interface MatchDragItemProps {
  match: Match
  isDragging?: boolean
  isInSlot?: boolean
}

export function MatchDragItem({ match, isDragging = false, isInSlot = false }: MatchDragItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: match.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const homeName = match.homeParticipant?.teamName || match.homeParticipant?.user?.username || 'TBD'
  const awayName = match.awayParticipant?.teamName || match.awayParticipant?.user?.username || 'TBD'

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-lg border border-border bg-card p-3 transition-all',
        'hover:border-gaming-purple cursor-move',
        (isDragging || isSortableDragging) && 'opacity-50',
        isInSlot && 'text-xs p-2'
      )}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="flex-shrink-0 text-muted-foreground" size={isInSlot ? 14 : 16} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className={cn(
              'font-medium truncate',
              isInSlot ? 'text-xs' : 'text-sm'
            )}>
              {homeName}
            </span>
            <span className={cn(
              'text-muted-foreground',
              isInSlot ? 'text-xs' : 'text-sm'
            )}>
              {match.homeScore}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className={cn(
              'font-medium truncate',
              isInSlot ? 'text-xs' : 'text-sm'
            )}>
              {awayName}
            </span>
            <span className={cn(
              'text-muted-foreground',
              isInSlot ? 'text-xs' : 'text-sm'
            )}>
              {match.awayScore}
            </span>
          </div>

          {!isInSlot && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-muted-foreground">Round {match.round}</span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">BO{match.bestOf}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
