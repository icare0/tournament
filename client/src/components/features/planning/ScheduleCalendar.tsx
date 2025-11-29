'use client'

import React, { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { MatchDragItem } from './MatchDragItem'
import { ScheduleSlot, DraggedMatch } from './types'
import { Match } from '@/types/tournament.types'
import { format, addDays, startOfWeek } from 'date-fns'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

interface ScheduleCalendarProps {
  matches: Match[]
  onScheduleChange?: (matchId: string, slotId: string) => void
}

export function ScheduleCalendar({ matches, onScheduleChange }: ScheduleCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date()))
  const [activeMatch, setActiveMatch] = useState<DraggedMatch | null>(null)
  const [scheduleSlots, setScheduleSlots] = useState<ScheduleSlot[]>(
    generateDefaultSlots(currentWeek)
  )

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const match = matches.find((m) => m.id === event.active.id)
    if (match) {
      setActiveMatch({ match })
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const matchId = active.id as string
      const slotId = over.id as string

      // Update schedule
      setScheduleSlots((slots) => {
        const newSlots = slots.map((slot) => {
          if (slot.id === slotId) {
            const match = matches.find((m) => m.id === matchId)
            return { ...slot, matchId, match }
          }
          if (slot.matchId === matchId) {
            return { ...slot, matchId: undefined, match: undefined }
          }
          return slot
        })
        return newSlots
      })

      onScheduleChange?.(matchId, slotId)
    }

    setActiveMatch(null)
  }

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i))
  const timeSlots = Array.from({ length: 12 }, (_, i) => i + 9) // 9 AM to 8 PM

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="glass rounded-xl p-6 border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Calendar className="text-gaming-purple" size={24} />
            <h3 className="text-xl font-semibold">Match Schedule</h3>
          </div>

          {/* Week navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentWeek(addDays(currentWeek, -7))}
              className="p-2 rounded-lg hover:bg-accent transition-colors"
              aria-label="Previous week"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-medium min-w-[200px] text-center">
              {format(currentWeek, 'MMM d')} - {format(addDays(currentWeek, 6), 'MMM d, yyyy')}
            </span>
            <button
              onClick={() => setCurrentWeek(addDays(currentWeek, 7))}
              className="p-2 rounded-lg hover:bg-accent transition-colors"
              aria-label="Next week"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-8 gap-px bg-border rounded-lg overflow-hidden">
          {/* Time column header */}
          <div className="bg-card p-3 font-semibold text-sm">Time</div>

          {/* Day headers */}
          {weekDays.map((day) => (
            <div
              key={day.toISOString()}
              className="bg-card p-3 text-center"
            >
              <div className="font-semibold text-sm">{format(day, 'EEE')}</div>
              <div className="text-xs text-muted-foreground">{format(day, 'd')}</div>
            </div>
          ))}

          {/* Time slots */}
          {timeSlots.map((hour) => (
            <React.Fragment key={hour}>
              {/* Time label */}
              <div className="bg-card p-3 text-sm text-muted-foreground">
                {hour}:00
              </div>

              {/* Slots for each day */}
              {weekDays.map((day, dayIndex) => {
                const slotId = `slot-${format(day, 'yyyy-MM-dd')}-${hour}`
                const slot = scheduleSlots.find((s) => s.id === slotId)

                return (
                  <ScheduleCell
                    key={slotId}
                    slotId={slotId}
                    match={slot?.match}
                  />
                )
              })}
            </React.Fragment>
          ))}
        </div>

        {/* Unscheduled matches */}
        <div className="mt-6">
          <h4 className="text-sm font-semibold mb-3">Unscheduled Matches</h4>
          <SortableContext
            items={matches.filter((m) => !m.scheduledFor).map((m) => m.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {matches
                .filter((m) => !scheduleSlots.some((s) => s.matchId === m.id))
                .map((match) => (
                  <MatchDragItem key={match.id} match={match} />
                ))}
            </div>
          </SortableContext>
        </div>
      </div>

      <DragOverlay>
        {activeMatch ? <MatchDragItem match={activeMatch.match} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  )
}

interface ScheduleCellProps {
  slotId: string
  match?: Match
}

function ScheduleCell({ slotId, match }: ScheduleCellProps) {
  return (
    <div
      id={slotId}
      className={cn(
        'bg-card p-2 min-h-[80px] transition-colors',
        'hover:bg-accent/50',
        match && 'bg-gaming-purple/10'
      )}
    >
      {match && <MatchDragItem match={match} isInSlot />}
    </div>
  )
}

function generateDefaultSlots(weekStart: Date): ScheduleSlot[] {
  const slots: ScheduleSlot[] = []
  const days = 7
  const hoursPerDay = 12

  for (let day = 0; day < days; day++) {
    for (let hour = 9; hour < 9 + hoursPerDay; hour++) {
      const date = addDays(weekStart, day)
      const startTime = new Date(date)
      startTime.setHours(hour, 0, 0, 0)

      const endTime = new Date(startTime)
      endTime.setHours(hour + 1)

      slots.push({
        id: `slot-${format(date, 'yyyy-MM-dd')}-${hour}`,
        startTime,
        endTime,
      })
    }
  }

  return slots
}
