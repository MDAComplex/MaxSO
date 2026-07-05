'use client'

import { useMemo } from 'react'
import { useSyncedStorage } from '@/hooks/useSyncedStorage'
import type { Habit } from '@/types'

const WEEKS = 26 // last ~6 months fits mobile nicely, scrollable

function intensityColor(ratio: number): string {
  if (ratio === 0) return 'var(--bg-elevated)'
  if (ratio < 0.34) return 'rgba(56, 189, 248, 0.25)'
  if (ratio < 0.67) return 'rgba(56, 189, 248, 0.55)'
  if (ratio < 1) return 'rgba(56, 189, 248, 0.8)'
  return '#38BDF8'
}

export default function YearHeatmap() {
  const [habits] = useSyncedStorage<Habit[]>('maxos-habits', [])

  const grid = useMemo(() => {
    // Build columns of weeks, Mon-Sun, ending today
    const days: { date: string; ratio: number }[] = []
    const today = new Date()
    for (let i = WEEKS * 7 - 1; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const ds = d.toISOString().split('T')[0]
      const active = habits.filter((h) => h.createdAt.split('T')[0] <= ds)
      const done = active.filter((h) => h.completions.includes(ds)).length
      days.push({ date: ds, ratio: active.length > 0 ? done / active.length : 0 })
    }
    // chunk into weeks
    const weeks: typeof days[] = []
    for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7))
    return weeks
  }, [habits])

  const totalChecks = habits.reduce((a, h) => a + h.completions.length, 0)

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">🗓️ Konsistenz (6 Monate)</h2>
        <span className="text-[11px] text-[var(--text-tertiary)]">{totalChecks} Checks total</span>
      </div>
      <div className="overflow-x-auto scrollbar-thin pb-1">
        <div className="flex gap-[3px]" style={{ minWidth: WEEKS * 13 }}>
          {grid.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day) => (
                <div key={day.date} title={day.date}
                  className="w-[10px] h-[10px] rounded-[2px]"
                  style={{ background: intensityColor(day.ratio) }} />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-end gap-1.5 mt-3">
        <span className="text-[10px] text-[var(--text-tertiary)]">Weniger</span>
        {[0, 0.3, 0.6, 0.9, 1].map((r) => (
          <div key={r} className="w-[10px] h-[10px] rounded-[2px]" style={{ background: intensityColor(r) }} />
        ))}
        <span className="text-[10px] text-[var(--text-tertiary)]">Mehr</span>
      </div>
    </div>
  )
}
