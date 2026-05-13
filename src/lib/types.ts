export type EnergyLevel = 'low' | 'medium' | 'high'
export type NightMode = 'mic' | 'light' | 'rest' | 'open'

export interface BacklogItem {
  id: string
  userId: string
  text: string
  createdAt: string
}

export interface DayPlan {
  id: string
  userId: string
  planDate: string // ISO date YYYY-MM-DD
  priority1: string | null
  priority2: string | null
  priority3: string | null
  notToday: string | null
  energyLevel: EnergyLevel | null
  nightMode: NightMode | null
  sentToDisplayAt: string | null
  reflectionNote: string | null
  tomorrowDraft: string | null
  createdAt: string
  updatedAt: string
}

export interface Routine {
  id: string
  userId: string
  name: string
  type: 'morning' | 'evening'
  isDefault: boolean
  steps: RoutineStep[]
}

export interface RoutineStep {
  id: string
  routineId: string
  stepOrder: number
  label: string
  durationMinutes: number | null
}

export interface WeeklyPattern {
  id: string
  userId: string
  dayOfWeek: number
  defaultNightMode: NightMode | null
  morningRoutineId: string | null
  eveningRoutineId: string | null
}

export interface DeviceToken {
  id: string
  userId: string
  token: string
  label: string | null
  lastPolledAt: string | null
  createdAt: string
}

export interface WeeklyMetrics {
  id: string
  userId: string
  weekOf: string // ISO date YYYY-MM-DD (Monday of the week)
  meditation7: boolean
  earlyBed5: boolean
  kidMoments: boolean
  comedySessions: boolean
  workMilestone: boolean
  exReachouts: boolean
  hingeChecks: boolean
  createdAt: string
  updatedAt: string
}

export interface PlanRitual {
  id: string
  title: string
  time: string
  steps: string[]
}

export interface PlanWeek {
  theme: string
  top3: string[]
  nonNegotiables: string[]
}

export interface PlanDeliverablePart {
  part: number
  task: string
}

export interface PlanDeliverable {
  title: string
  goal: string
  breakdown: PlanDeliverablePart[]
  reflections: string[]
}

export interface PlanLetter {
  title: string
  instruction: string
  prompts: string[]
}

export interface PlanHeritage {
  title: string
  instruction: string
  dayCount: number
}

export interface PlanPayload {
  meta: {
    title: string
    durationDays: number
    startDate: string
    endDate: string
    intention: string
  }
  dailyTop3: {
    priorities: string[]
    rituals: PlanRitual[]
    reflections: string[]
  }
  weeks: PlanWeek[]
  mustDo: string[]
  shouldDo: string[]
  deferUntilLater: string[]
  deliverable: PlanDeliverable
  letter: PlanLetter
  heritage: PlanHeritage
}

export interface Plan {
  id: string
  userId: string
  title: string
  startDate: string
  endDate: string
  intention: string
  payload: PlanPayload
  createdAt: string
  updatedAt: string
}

// Free-form progress map keyed by string. Examples:
//   heritage.1 -> "..."
//   letter.0 -> "..."
//   deliverable.part.3 -> true
//   ritual.ritual_1.2026-05-14 -> true
export interface PlanProgressEntry {
  key: string
  value: unknown
  updatedAt: string
}
