'use client'

import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import DayCalendar from './DayCalendar'
import TodoList from './TodoList'
import RoutineList from './RoutineList'
import WeekOverview from './WeekOverview'
import WhoopCard from './WhoopCard'
import Header from './Header'
import type { CalendarEvent, Todo, Routine, WhoopData } from '@/types'
import { createClient } from '@/lib/supabase/client'

const MOCK_MODE = !process.env.NEXT_PUBLIC_SUPABASE_URL

interface DashboardProps {
  events: CalendarEvent[]
  todos: Todo[]
  routines: Routine[]
  whoopData: WhoopData
  weekDays: { day: string; load: number; isToday: boolean }[]
}

export default function Dashboard({ events, todos, routines, whoopData, weekDays }: DashboardProps) {
  const router = useRouter()

  async function handleLogout() {
    if (!MOCK_MODE) {
      const supabase = createClient()
      await supabase.auth.signOut()
    }
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <Header onLogout={handleLogout} isAuthenticated={!MOCK_MODE} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-8">
          {/* LEFT — Day Calendar */}
          <div className="space-y-4">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-[#F4F4F5]">Heute</h2>
                <div className="flex items-center gap-3 text-[10px] text-[#52525B]">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] inline-block" />
                    Calendar
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#A78BFA] inline-block" />
                    Todoist
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] inline-block" />
                    Routine
                  </span>
                </div>
              </div>
              <DayCalendar events={events} />
            </Card>
          </div>

          {/* RIGHT — Tasks, Routines, Whoop, Week */}
          <div className="space-y-4">
            {/* Whoop */}
            <Card>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-[#F4F4F5]">Recovery</h2>
                <span className="text-[10px] text-[#52525B] bg-[#18181B] px-2 py-0.5 rounded-full border border-[#27272A]">
                  Whoop
                </span>
              </div>
              <WhoopCard data={whoopData} />
            </Card>

            {/* Week Overview */}
            <Card>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-[#F4F4F5]">Diese Woche</h2>
              </div>
              <WeekOverview days={weekDays} />
            </Card>

            {/* Routines */}
            <Card>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-[#F4F4F5]">Routinen</h2>
                <span className="text-xs text-[#52525B]">
                  {routines.filter((r) => r.completed).length}/{routines.length}
                </span>
              </div>
              <RoutineList routines={routines} />
            </Card>

            {/* To-Dos */}
            <Card>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-[#F4F4F5]">Tasks</h2>
                <span className="text-xs text-[#52525B]">
                  {todos.filter((t) => !t.completed).length} offen
                </span>
              </div>
              <TodoList todos={todos} />
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
