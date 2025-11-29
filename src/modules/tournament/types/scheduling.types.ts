// Types pour le système de planification de matchs

export interface SchedulingConstraints {
  minRestTime: number; // Minutes de repos minimum entre deux matchs
  startTime: Date; // Heure de début du tournoi
  endTime: Date; // Heure de fin du tournoi
  participantAvailability?: Map<string, TimeSlot[]>; // Disponibilités spécifiques
}

export interface TimeSlot {
  startTime: Date;
  endTime: Date;
}

export interface Venue {
  id: string;
  name: string;
  capacity?: number;
  availability?: TimeSlot[]; // Créneaux de disponibilité
}

export interface MatchToSchedule {
  id: string;
  phase?: string;
  round: number;
  participants: Array<{ id: string; name: string }>;
  estimatedDuration: number; // en minutes
  dependencies?: string[]; // IDs des matchs dont celui-ci dépend
  preferredVenueId?: string;
  priority?: number; // Pour override le tri automatique
}

export interface ScheduledMatch extends MatchToSchedule {
  scheduledAt: Date;
  venueId: string;
  endTime: Date;
}

export interface TimelineSlot {
  startTime: Date;
  endTime: Date;
  matchId?: string;
}

export interface SlotCandidate {
  startTime: Date;
  endTime: Date;
  venueId: string;
  score: number;
}

export interface ScheduleMetrics {
  venueUtilization: number; // 0-1
  averageRestTime: number; // en minutes
  peakLoadTime: Date;
  constraintViolations: number;
  qualityScore: number; // 0-1
}

export interface SchedulingResult {
  scheduledMatches: ScheduledMatch[];
  metrics: ScheduleMetrics;
  warnings: string[];
}
