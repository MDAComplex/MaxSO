import type { CalendarEvent, Todo, Routine, WhoopData } from '@/types'

export const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Team Standup',
    startTime: '09:00',
    endTime: '09:30',
    source: 'calendar',
  },
  {
    id: '2',
    title: 'Deep Work — Feature Sprint',
    startTime: '10:00',
    endTime: '12:00',
    source: 'todoist',
  },
  {
    id: '3',
    title: 'Mittagessen',
    startTime: '12:30',
    endTime: '13:15',
    source: 'calendar',
    location: 'Kantine',
  },
  {
    id: '4',
    title: 'Design Review',
    startTime: '14:00',
    endTime: '15:00',
    source: 'calendar',
  },
  {
    id: '5',
    title: 'Product Roadmap schreiben',
    startTime: '15:30',
    endTime: '17:00',
    source: 'todoist',
  },
  {
    id: '6',
    title: 'Abendlauf',
    startTime: '18:30',
    endTime: '19:30',
    source: 'routine',
  },
  {
    id: '7',
    title: 'Lesen / Wind-down',
    startTime: '21:00',
    endTime: '22:00',
    source: 'routine',
  },
]

export const mockTodos: Todo[] = [
  {
    id: 't1',
    title: 'Pull Request für Auth-Flow reviewen',
    completed: false,
    priority: 1,
    project: 'Arbeit',
    source: 'todoist',
  },
  {
    id: 't2',
    title: 'E-Mail an Steuerberater',
    completed: false,
    priority: 2,
    project: 'Home',
    source: 'todoist',
  },
  {
    id: 't3',
    title: 'Weekly Recap schreiben',
    completed: true,
    priority: 3,
    project: 'Arbeit',
    source: 'todoist',
  },
  {
    id: 't4',
    title: 'Groceries bestellen',
    completed: false,
    priority: 4,
    project: 'Home',
    source: 'todoist',
  },
  {
    id: 't5',
    title: 'Figma-Mockups finalisieren',
    completed: false,
    priority: 1,
    project: 'Arbeit',
    source: 'todoist',
  },
  {
    id: 't6',
    title: 'Arzttermin buchen',
    completed: false,
    priority: 3,
    project: 'Home',
    source: 'todoist',
  },
]

export const mockRoutines: Routine[] = [
  { id: 'r1', title: 'Morgenmeditation', emoji: '🧘', completed: true, streak: 14, time: '07:00' },
  { id: 'r2', title: 'Workout / Laufen', emoji: '🏃', completed: false, streak: 7, time: '18:30' },
  { id: 'r3', title: 'Journaling', emoji: '📓', completed: false, streak: 21, time: '21:30' },
  { id: 'r4', title: 'Kalt duschen', emoji: '🚿', completed: true, streak: 30, time: '07:30' },
]

export const mockWhoop: WhoopData = {
  recovery: 82,
  hrv: 68,
  restingHr: 52,
  sleep: {
    duration: 7.4,
    performance: 88,
    efficiency: 91,
  },
  strain: 8.3,
}

export const mockWeek = [
  { day: 'Mo', load: 0.8, isToday: false },
  { day: 'Di', load: 0.5, isToday: false },
  { day: 'Mi', load: 0.9, isToday: true },
  { day: 'Do', load: 0.3, isToday: false },
  { day: 'Fr', load: 0.6, isToday: false },
  { day: 'Sa', load: 0.2, isToday: false },
  { day: 'So', load: 0.0, isToday: false },
]
