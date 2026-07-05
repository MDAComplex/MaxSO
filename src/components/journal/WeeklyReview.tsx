'use client'

import { useEffect, useMemo, useState } from 'react'
import { format, subDays } from 'date-fns'
import { de } from 'date-fns/locale'
import { useSyncedStorage } from '@/hooks/useSyncedStorage'
import type { Habit } from '@/types'

interface Reflection { date: string; mood: number | null; energy: number | null }
interface FocusSession { date: string; minutes: number; subject: string }

const MOOD_EMOJI = ['', '😞', '😕', '😐', '🙂', '🔥']

function last7(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i)
    return d.toISOString().split('T')[0]
  })
}

export default function WeeklyReview() {
  const [habits] = useSyncedStorage<Habit[]>('maxos-habits', [])
  const [sessions] = useSyncedStorage<FocusSession[]>('maxos-focus', [])
  const [reflections, setReflections] = useState<Reflection[]>([])

  useEffect(() => {
    fetch('/api/reflections')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (Array.isArray(d?.reflections)) setReflections(d.reflections) })
      .catch(() => {})
  }, [])

  const days = last7()

  const stats = useMemo(() => {
    let possible = 0, done = 0
    let bestDay = { date: '', count: -1 }
    for (const d of days) {
      let dayCount = 0
      for (const h of habits) {
        if (h.createdAt.split('T')[0] <= d) {
          possible++
          if (h.completions.includes(d)) { done++; dayCount++ }
        }
      }
      if (dayCount > bestDay.count) bestDay = { date: d, count: dayCount }
    }
    const weekRefl = reflections.filter((r) => days.includes(r.date) && r.mood)
    const moodAvg = weekRefl.length
      ? weekRefl.reduce((a, r) => a + (r.mood ?? 0), 0) / weekRefl.length
      : null
    const focusMin = sessions.filter((s) => days.includes(s.date)).reduce((a, s) => a + s.minutes, 0)
    return {
      pct: possible ? Math.round((done / possible) * 100) : 0,
      done,
      bestDay: bestDay.count > 0 ? bestDay : null,
      moodAvg,
      journalDays: weekRefl.length,
      focusMin,
    }
  }, [habits, reflections, sessions, days])

  if (habits.length === 0 && reflections.length === 0 && sessions.length === 0) return null

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-2xl p-5 mb-2">
      <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-widest mb-3">Deine Woche im Rückblick</p>
      <div className="space-y-2 text-sm text-[var(--text-secondary)]">
        <p>
          ✅ <span className="text-[var(--text-primary)] font-medium">{stats.done} Habit-Checks</span> · {stats.pct}% Konsistenz
        </p>
        {stats.focusMin > 0 && (
          <p>
            ⏱️ <span className="text-[var(--text-primary)] font-medium">
              {Math.floor(stats.focusMin / 60)}h {stats.focusMin % 60}m
            </span> Deep Work
          </p>
        )}
        {stats.bestDay && (
          <p>
            🏆 Bester Tag: <span className="text-[var(--text-primary)] font-medium">
              {format(new Date(stats.bestDay.date), 'EEEE', { locale: de })}
            </span> ({stats.bestDay.count} Habits)
          </p>
        )}
        {stats.moodAvg !== null && (
          <p>
            {MOOD_EMOJI[Math.round(stats.moodAvg)]} Ø Stimmung: <span className="text-[var(--text-primary)] font-medium">
              {stats.moodAvg.toFixed(1)}/5
            </span> · {stats.journalDays}/7 Tage journaled
          </p>
        )}
      </div>
    </div>
  )
}
