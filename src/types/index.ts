export type EventSource = 'calendar' | 'todoist' | 'routine'

export interface CalendarEvent {
  id: string
  title: string
  startTime: string // "HH:MM"
  endTime: string
  source: EventSource
  color?: string
  location?: string
  description?: string
  todoistId?: string
  completed?: boolean
}

export interface Todo {
  id: string
  title: string
  completed: boolean
  priority?: 1 | 2 | 3 | 4
  dueTime?: string
  project?: string
  source?: 'todoist' | 'local'
  todoistId?: string
}

export interface Routine {
  id: string
  title: string
  emoji: string
  completed: boolean
  streak: number
  time?: string
}

export interface WhoopData {
  recovery: number // 0-100
  hrv: number
  restingHr: number
  sleep: {
    duration: number // hours
    performance: number // 0-100
    efficiency: number
  }
  strain: number // 0-21
}
