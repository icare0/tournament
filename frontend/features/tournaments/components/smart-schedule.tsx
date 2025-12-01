/**
 * SmartSchedule - Drag & Drop Match Scheduling Interface
 *
 * Uses @dnd-kit for drag and drop functionality
 * Gantt-style timeline with multiple servers/fields
 */

'use client'

import React, { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Match } from '@/types/api'
import { Calendar, Server, Clock, RefreshCw, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface TimeSlot {
  id: string
  startTime: string
  endTime: string
  duration: number // minutes
}

export interface Server {
  id: string
  name: string
  capacity: number
  status: 'available' | 'busy' | 'maintenance'
}

export interface ScheduledMatch extends Match {
  serverId?: string
  timeSlotId?: string
}

export interface SmartScheduleProps {
  matches: ScheduledMatch[]
  servers: Server[]
  timeSlots: TimeSlot[]
  onMatchMove?: (matchId: string, serverId: string, timeSlotId: string) => void
  onAutoSchedule?: () => void
  className?: string
}

/**
 * Droppable Time Slot
 */
function TimeSlotDropzone({
  slot,
  serverId,
  children,
}: {
  slot: TimeSlot
  serverId: string
  children: React.ReactNode
}) {
  return (
    <div
      data-server-id={serverId}
      data-slot-id={slot.id}
      className={cn(
        'min-h-[100px] p-2 border border-dashed border-border rounded-lg',
        'hover:border-primary/50 hover:bg-accent/20 transition-all',
        'relative'
      )}
    >
      {children}
    </div>
  )
}

/**
 * Draggable Match Card
 */
function DraggableMatch({ match }: { match: ScheduledMatch }) {
  return (
    <div
      className={cn(
        'p-3 bg-card border-2 rounded-lg cursor-move',
        'hover:shadow-lg hover:scale-105 transition-all',
        match.status === 'IN_PROGRESS' && 'border-green-500 bg-green-500/10',
        match.status === 'SCHEDULED' && 'border-border',
        match.status === 'COMPLETED' && 'border-gray-600 opacity-50'
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <Badge variant={match.status === 'IN_PROGRESS' ? 'destructive' : 'secondary'} className="text-xs">
          {match.bracket === 'winners' ? 'W' : 'L'}
          {match.round + 1}-{match.matchNumber + 1}
        </Badge>
        {match.status === 'IN_PROGRESS' && (
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        )}
      </div>

      <div className="space-y-1 text-xs">
        <div className="flex items-center gap-1 truncate">
          <span className="font-medium">{match.participant1?.name || 'TBD'}</span>
        </div>
        <div className="flex items-center gap-1 truncate">
          <span className="font-medium">{match.participant2?.name || 'TBD'}</span>
        </div>
      </div>

      {match.scheduledAt && (
        <div className="mt-2 pt-2 border-t border-border/50 text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {new Date(match.scheduledAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      )}
    </div>
  )
}

export function SmartSchedule({
  matches,
  servers,
  timeSlots,
  onMatchMove,
  onAutoSchedule,
  className,
}: SmartScheduleProps) {
  const [activeMatch, setActiveMatch] = useState<ScheduledMatch | null>(null)
  const [scheduledMatches, setScheduledMatches] = useState<ScheduledMatch[]>(matches)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const match = scheduledMatches.find((m) => m.id === event.active.id)
    setActiveMatch(match || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveMatch(null)

    const { active, over } = event

    if (!over) return

    const matchId = active.id as string
    const overElement = over.data.current || {}
    const serverId = overElement.serverId || over.id
    const timeSlotId = overElement.timeSlotId

    // Update match position
    const updatedMatches = scheduledMatches.map((m) =>
      m.id === matchId
        ? {
            ...m,
            serverId: serverId as string,
            timeSlotId: timeSlotId as string,
          }
        : m
    )

    setScheduledMatches(updatedMatches)

    // Callback
    if (onMatchMove && timeSlotId) {
      onMatchMove(matchId, serverId as string, timeSlotId as string)
    }
  }

  // Group matches by server and time slot
  const getMatchesForSlot = (serverId: string, slotId: string) => {
    return scheduledMatches.filter((m) => m.serverId === serverId && m.timeSlotId === slotId)
  }

  // Unscheduled matches (no server/slot assigned)
  const unscheduledMatches = scheduledMatches.filter((m) => !m.serverId || !m.timeSlotId)

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Match Schedule
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onAutoSchedule}>
            <Sparkles className="w-4 h-4 mr-2" />
            AI Auto-Schedule
          </Button>
          <Button variant="outline" size="icon">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex flex-col">
            {/* Timeline Header */}
            <div className="sticky top-0 z-10 bg-background border-b">
              <div className="flex">
                <div className="w-32 p-3 border-r font-semibold text-sm flex items-center gap-2">
                  <Server className="w-4 h-4" />
                  Servers
                </div>
                <div className="flex-1 flex overflow-x-auto">
                  {timeSlots.map((slot) => (
                    <div key={slot.id} className="min-w-[200px] p-3 border-r text-center">
                      <div className="text-xs font-medium">
                        {new Date(slot.startTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      <div className="text-xs text-muted-foreground">{slot.duration}min</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Server Rows */}
            <div className="overflow-auto max-h-[600px]">
              {servers.map((server) => (
                <div key={server.id} className="flex border-b hover:bg-accent/5">
                  {/* Server Name */}
                  <div className="w-32 p-3 border-r">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          'w-2 h-2 rounded-full',
                          server.status === 'available' && 'bg-green-500',
                          server.status === 'busy' && 'bg-orange-500',
                          server.status === 'maintenance' && 'bg-red-500'
                        )}
                      />
                      <span className="text-sm font-medium truncate">{server.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Cap: {server.capacity}
                    </div>
                  </div>

                  {/* Time Slots */}
                  <div className="flex-1 flex">
                    {timeSlots.map((slot) => (
                      <div key={slot.id} className="min-w-[200px] p-2 border-r">
                        <TimeSlotDropzone slot={slot} serverId={server.id}>
                          <div className="space-y-2">
                            {getMatchesForSlot(server.id, slot.id).map((match) => (
                              <div
                                key={match.id}
                                draggable
                                onDragStart={() => setActiveMatch(match)}
                              >
                                <DraggableMatch match={match} />
                              </div>
                            ))}
                          </div>
                        </TimeSlotDropzone>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Unscheduled Matches */}
            {unscheduledMatches.length > 0 && (
              <div className="border-t bg-muted/20 p-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Unscheduled Matches ({unscheduledMatches.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                  {unscheduledMatches.map((match) => (
                    <div
                      key={match.id}
                      draggable
                      onDragStart={() => setActiveMatch(match)}
                      className="cursor-move"
                    >
                      <DraggableMatch match={match} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeMatch ? (
              <div className="opacity-80 scale-110">
                <DraggableMatch match={activeMatch} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </CardContent>
    </Card>
  )
}
