'use client'

import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Routine } from '@/types'
import HabitTracker from '@/components/habits/HabitTracker'
import RoutineBuilder from '@/components/routine/RoutineBuilder'
import RoutineRunner from '@/components/routine/RoutineRunner'
import { LogOut } from 'lucide-react'

function formatDate() {
  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())
}

function Inner() {
  const router = useRouter()
  const [activeRoutine, setActiveRoutine] = useState<Routine | null>(null)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      {/* Fullscreen Routine Runner */}
      {activeRoutine && (
        <RoutineRunner
          routine={activeRoutine}
          onClose={() => setActiveRoutine(null)}
        />
      )}

      <div className="min-h-screen bg-[#0A0A0B]">
        <div className="max-w-2xl mx-auto px-4 pb-16">

          {/* Header */}
          <header className="flex items-start justify-between pt-10 pb-8">
            <div>
              <p className="text-[11px] text-[#3F3F46] uppercase tracking-[0.15em] mb-1">Max OS</p>
              <h1 className="text-2xl font-semibold text-[#F4F4F5] tracking-tight leading-tight">
                {formatDate()}
              </h1>
            </div>
            <button onClick={handleLogout}
              className="mt-1 p-2 rounded-lg text-[#3F3F46] hover:text-[#A1A1AA] hover:bg-[#111113] transition-colors"
              title="Logout">
              <LogOut size={16} />
            </button>
          </header>

          {/* Content */}
          <div className="space-y-4">
            <HabitTracker />
            <RoutineBuilder onStart={(r) => setActiveRoutine(r)} />
          </div>

        </div>
      </div>
    </>
  )
}

export default function DashboardPage() {
  return (
    <Suspense>
      <Inner />
    </Suspense>
  )
}
