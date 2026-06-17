import { mockEvents, mockTodos, mockRoutines, mockWhoop, mockWeek } from '@/lib/mock-data'
import Dashboard from '@/components/dashboard/Dashboard'

export default function Home() {
  return (
    <Dashboard
      events={mockEvents}
      todos={mockTodos}
      routines={mockRoutines}
      whoopData={mockWhoop}
      weekDays={mockWeek}
    />
  )
}
