'use client'

import { useMemo } from 'react'
import { differenceInCalendarDays, parseISO } from 'date-fns'
import { useSyncedStorage } from '@/hooks/useSyncedStorage'
import { MILESTONES_SEED } from '@/lib/milestones-seed'
import type { Habit } from '@/types'

interface FocusSession { date: string; minutes: number; subject: string }

const WEEK_GOAL_MIN = 15 * 60

function last30(): string[] {
  const out: string[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    out.push(d.toISOString().split('T')[0])
  }
  return out
}

function weekDates(): string[] {
  const out: string[] = []
  const now = new Date()
  const day = (now.getDay() + 6) % 7
  for (let i = 0; i <= day; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() - (day - i))
    out.push(d.toISOString().split('T')[0])
  }
  return out
}

export default function WarRoom() {
  const [habits] = useSyncedStorage<Habit[]>('maxos-habits', [])
  const [sessions] = useSyncedStorage<FocusSession[]>('maxos-focus', [])

  const { score, consistency, focusPct, daysToNext, nextLabel } = useMemo(() => {
    const days = last30()
    let possible = 0
    let done = 0
    for (const h of habits) {
      const created = h.createdAt.split('T')[0]
      for (const d of days) {
        if (d >= created) {
          possible++
          if (h.completions.includes(d)) done++
        }
      }
    }
    const consistency = possible > 0 ? Math.round((done / possible) * 100) : 0

    const week = weekDates()
    const weekMin = sessions.filter((s) => week.includes(s.date)).reduce((a, s) => a + s.minutes, 0)
    const focusPct = Math.min(100, Math.round((weekMin / WEEK_GOAL_MIN) * 100))

    const next = MILESTONES_SEED
      .filter((m) => differenceInCalendarDays(parseISO(m.target_date), new Date()) >= 0)
      .sort((a, b) => a.target_date.localeCompare(b.target_date))[0]
    const daysToNext = next ? differenceInCalendarDays(parseISO(next.target_date), new Date()) : null

    const score = possible === 0 && sessions.length === 0
      ? null
      : Math.round(consistency * 0.6 + focusPct * 0.4)

    return { score, consistency, focusPct, daysToNext, nextLabel: next?.label ?? '' }
  }, [habits, sessions])

  const scoreColor = score === null ? 'var(--text-tertiary)'
    : score >= 75 ? '#34D399' : score >= 45 ? '#FBBF24' : '#F87171'

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-2xl p-5 mb-2">
      <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-widest mb-4">War Room · Bist du on track?</p>
      <div className="flex items-center gap-5">
        {/* Score ring */}
        <div className="relative shrink-0">
          <svg width={92} height={92} className="-rotate-90">
            <circle cx={46} cy={46} r={38} fill="none" stroke="var(--bg-elevated)" strokeWidth="6" />
            <circle cx={46} cy={46} r={38} fill="none" stroke={scoreColor} strokeWidth="6"
              strokeLinecap="round" strokeDasharray={2 * Math.PI * 38}
              strokeDashoffset={2 * Math.PI * 38 * (1 - (score ?? 0) / 100)}
              className="transition-all duration-700" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold font-mono" style={{ color: scoreColor }}>
              {score === null ? '—' : score}
            </span>
            <span className="text-[9px] text-[var(--text-tertiary)] uppercase">Score</span>
          </div>
        </div>

        {/* Breakdown */}
        <div className="flex-1 space-y-2.5 min-w-0">
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-[var(--text-secondary)]">Habit-Konsistenz (30d)</span>
              <span className="text-[var(--text-primary)] font-medium">{consistency}%</span>
            </div>
            <div className="h-1 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${consistency}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-[var(--text-secondary)]">Deep Work Woche</span>
              <span className="text-[var(--text-primary)] font-medium">{focusPct}%</span>
            </div>
            <div className="h-1 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
              <div className="h-full bg-sky-400 rounded-full" style={{ width: `${focusPct}%` }} />
            </div>
          </div>
          {daysToNext !== null && (
            <p className="text-[11px] text-[var(--text-tertiary)] truncate">
              ⏳ <span className="text-[var(--text-secondary)] font-medium">{daysToNext} Tage</span> bis {nextLabel.split('—')[0].trim()}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
