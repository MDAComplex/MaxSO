// Habits
export interface Habit {
  id: string
  name: string
  emoji: string
  color: string
  createdAt: string
  completions: string[] // "YYYY-MM-DD"
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
