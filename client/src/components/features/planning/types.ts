import { Match } from '@/types/tournament.types'

export interface ScheduleSlot {
  id: string
  matchId?: string
  match?: Match
  startTime: Date
  endTime: Date
  venue?: string
}

export interface ScheduleDay {
  date: Date
  slots: ScheduleSlot[]
}

export interface DraggedMatch {
  match: Match
  originalSlotId?: string
}
