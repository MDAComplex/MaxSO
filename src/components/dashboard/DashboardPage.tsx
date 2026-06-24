'use client'

import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Routine } from '@/types'
import HabitTracker from '@/components/habits/HabitTracker'
import RoutineBuilder from '@/components/routine/RoutineBuilder'
import RoutineRunner from '@/components/routine/RoutineRunner'
import MilestoneTimeline from '@/components/timeline/MilestoneTimeline'
import ReflectionJournal from '@/components/journal/ReflectionJournal'
import StatsPage from '@/components/stats/StatsPage'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { LogOut, Home, Map, BookOpen, BarChart2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const TABS = [
  { id: 'home',     label: 'Home',      icon: Home },
  { id: 'timeline', label: 'Timeline',  icon: Map },
  { id: 'journal',  label: 'Journal',   icon: BookOpen },
  { id: 'stats',    label: 'Stats',     icon: BarChart2 },
] as const

type Tab = typeof TABS[number]['id']

function formatDate() {
  return new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())
}

function Inner() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('home')
  const [activeRoutine, setActiveRoutine] = useState<Routine | null>(null)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      {activeRoutine && (
        <RoutineRunner routine={activeRoutine} onClose={() => setActiveRoutine(null)} />
      )}

      <div className="min-h-screen bg-[var(--bg-base)]">
        <div className="max-w-2xl mx-auto px-4 pb-24">

          {/* Header */}
          <header className="flex items-center justify-between pt-8 pb-6">
            <div>
              <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-[0.2em] mb-0.5">Max OS</p>
              <h1 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">{formatDate()}</h1>
            </div>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <button onClick={handleLogout}
                className="p-2 rounded-xl text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors"
                title="Logout">
                <LogOut size={16} />
              </button>
            </div>
          </header>

          {/* Content */}
          <div className="space-y-4">
            {tab === 'home' && (
              <>
                <HabitTracker />
                <RoutineBuilder onStart={(r) => setActiveRoutine(r)} />
              </>
            )}
            {tab === 'timeline' && <MilestoneTimeline />}
            {tab === 'journal' && <ReflectionJournal />}
            {tab === 'stats' && <StatsPage />}
          </div>
        </div>

        {/* Bottom Nav */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--bg-border)] bg-[var(--bg-base)]/90 backdrop-blur-xl">
          <div className="max-w-2xl mx-auto flex">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setTab(id)}
                className={cn(
                  'flex-1 flex flex-col items-center gap-1 py-3.5 text-[10px] font-medium transition-colors',
                  tab === id
                    ? 'text-[var(--accent)]'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                )}>
                <Icon size={18} strokeWidth={tab === id ? 2 : 1.5} />
                {label}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </>
  )
}

export default function DashboardPage() {
  return <Suspense><Inner /></Suspense>
}
