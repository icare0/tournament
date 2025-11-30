/**
 * Tournament Schedule Management Page - With Drag & Drop
 */

'use client'

import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import {
  SmartSchedule,
  type Server,
  type TimeSlot,
  type ScheduledMatch,
} from '@/features/tournaments/components/smart-schedule'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Download, Save, Sparkles } from 'lucide-react'

export default function ScheduleManagementPage() {
  const params = useParams()
  const tournamentId = params.id as string

  // Mock servers/fields
  const [servers] = useState<Server[]>([
    { id: 's1', name: 'Server Alpha', capacity: 10, status: 'available' },
    { id: 's2', name: 'Server Beta', capacity: 10, status: 'available' },
    { id: 's3', name: 'Server Gamma', capacity: 10, status: 'busy' },
    { id: 's4', name: 'Server Delta', capacity: 10, status: 'available' },
  ])

  // Mock time slots (30-minute intervals)
  const [timeSlots] = useState<TimeSlot[]>(() => {
    const slots: TimeSlot[] = []
    const startHour = 10 // 10 AM
    const totalSlots = 12 // 6 hours

    for (let i = 0; i < totalSlots; i++) {
      const startTime = new Date()
      startTime.setHours(startHour + Math.floor(i / 2), (i % 2) * 30, 0, 0)

      const endTime = new Date(startTime)
      endTime.setMinutes(endTime.getMinutes() + 30)

      slots.push({
        id: `slot-${i}`,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: 30,
      })
    }

    return slots
  })

  // Mock matches
  const [matches, setMatches] = useState<ScheduledMatch[]>([
    {
      id: 'm1',
      tournamentId,
      round: 0,
      matchNumber: 0,
      bracket: 'winners',
      status: 'SCHEDULED',
      participant1: { id: 'p1', name: 'Cloud9', seed: 1 },
      participant2: { id: 'p8', name: 'Team Liquid', seed: 8 },
      serverId: 's1',
      timeSlotId: 'slot-0',
    },
    {
      id: 'm2',
      tournamentId,
      round: 0,
      matchNumber: 1,
      bracket: 'winners',
      status: 'IN_PROGRESS',
      participant1: { id: 'p4', name: 'Fnatic', seed: 4 },
      participant2: { id: 'p5', name: 'G2 Esports', seed: 5 },
      score: { participant1: 1, participant2: 0 },
      serverId: 's2',
      timeSlotId: 'slot-1',
    },
    {
      id: 'm3',
      tournamentId,
      round: 0,
      matchNumber: 2,
      bracket: 'winners',
      status: 'SCHEDULED',
      participant1: { id: 'p2', name: 'Team Vitality', seed: 2 },
      participant2: { id: 'p7', name: 'NRG', seed: 7 },
      serverId: 's1',
      timeSlotId: 'slot-2',
    },
    {
      id: 'm4',
      tournamentId,
      round: 0,
      matchNumber: 3,
      bracket: 'winners',
      status: 'SCHEDULED',
      participant1: { id: 'p3', name: 'FaZe Clan', seed: 3 },
      participant2: { id: 'p6', name: 'NAVI', seed: 6 },
      // No server/slot assigned (unscheduled)
    },
    {
      id: 'm5',
      tournamentId,
      round: 0,
      matchNumber: 4,
      bracket: 'winners',
      status: 'SCHEDULED',
      participant1: { id: 'p9', name: 'Sentinels', seed: 9 },
      participant2: { id: 'p10', name: 'OpTic Gaming', seed: 10 },
      // Unscheduled
    },
  ])

  const handleMatchMove = (matchId: string, serverId: string, timeSlotId: string) => {
    console.log('Match moved:', { matchId, serverId, timeSlotId })

    // Update match in state
    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? {
              ...m,
              serverId,
              timeSlotId,
            }
          : m
      )
    )

    // API call would go here
    // await apiClient.patch(`/matches/${matchId}/schedule`, { serverId, timeSlotId })
  }

  const handleAutoSchedule = () => {
    console.log('Running AI auto-schedule...')
    // API call to backend AI scheduler
    // const schedule = await apiClient.post(`/tournaments/${tournamentId}/auto-schedule`)
    // setMatches(schedule.matches)
  }

  const handleSaveSchedule = () => {
    console.log('Saving schedule...')
    // API call to persist schedule
    // await apiClient.patch(`/tournaments/${tournamentId}/schedule`, { matches })
  }

  const handleExportSchedule = () => {
    console.log('Exporting schedule...')
    // Generate CSV/PDF export
  }

  const scheduledCount = matches.filter((m) => m.serverId && m.timeSlotId).length
  const unscheduledCount = matches.length - scheduledCount

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Calendar className="w-8 h-8" />
            Schedule Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Drag and drop matches to assign servers and time slots
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportSchedule}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="default" size="sm" onClick={handleSaveSchedule}>
            <Save className="w-4 h-4 mr-2" />
            Save Schedule
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4">
        <Badge variant="default" className="text-sm">
          {scheduledCount} Scheduled
        </Badge>
        <Badge variant={unscheduledCount > 0 ? 'destructive' : 'secondary'} className="text-sm">
          {unscheduledCount} Unscheduled
        </Badge>
        <Badge variant="outline" className="text-sm">
          {servers.filter((s) => s.status === 'available').length} / {servers.length} Servers
          Available
        </Badge>
      </div>

      {/* Smart Schedule Component */}
      <SmartSchedule
        matches={matches}
        servers={servers}
        timeSlots={timeSlots}
        onMatchMove={handleMatchMove}
        onAutoSchedule={handleAutoSchedule}
      />

      {/* Help Text */}
      <div className="bg-muted/50 border rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <h3 className="font-semibold mb-1">AI Auto-Scheduling</h3>
            <p className="text-sm text-muted-foreground">
              Click "AI Auto-Schedule" to let our intelligent algorithm optimize match timings based
              on server availability, participant preferences, and estimated match duration. You can
              manually adjust any match by dragging it to a different time slot.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
