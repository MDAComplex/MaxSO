// Habits
export interface Habit {
  id: string
  name: string
  emoji: string
  color: string
  createdAt: string
  completions: string[] // ISO date strings "YYYY-MM-DD"
}

// Routines
export interface RoutineStep {
  id: string
  name: string
  duration: number // seconds
  emoji: string
}

export interface Routine {
  id: string
  name: string
  emoji: string
  steps: RoutineStep[]
  createdAt: string
}

export interface WhoopRecovery {
  date: string
  recovery_score: number
  hrv_rmssd_milli: number
  resting_heart_rate: number
  user_calibrating: boolean
}

export interface WhoopDashboard {
  connected: boolean
  recovery: WhoopRecovery | null
  sleep: null
  workouts: []
  strain: number | null
}
