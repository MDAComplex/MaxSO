'use client'

import { useSyncedStorage } from '@/hooks/useSyncedStorage'
import type { Habit, Routine } from '@/types'
import { differenceInCalendarDays } from 'date-fns'
import { Flame, Target, TrendingUp, Award, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

function todayStr() { return new Date().toISOString().split('T')[0] }

function getStreak(completions: string[]): number {
  if (!completions.length) return 0
  const sorted = [...completions].sort().reverse()
  let streak = 0
  let check = todayStr()
  for (const d of sorted) {
    if (d === check) {
      streak++
      const prev = new Date(check)
      prev.setDate(prev.getDate() - 1)
      check = prev.toISOString().split('T')[0]
    } else break
  }
  return streak
}

function getLast30(completions: string[]): boolean[] {
  const days: boolean[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(completions.includes(d.toISOString().split('T')[0]))
  }
  return days
}

function StatCard({ icon, label, value, sub, color = 'text-[var(--accent)]' }: {
  icon: React.ReactNode; label: string; value: string | number; sub?: string; color?: string
}) {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-xl p-4">
      <div className={cn('mb-2', color)}>{icon}</div>
      <p className={cn('font-mono text-3xl font-bold text-[var(--text-primary)]')}>{value}</p>
      <p className="text-xs text-[var(--text-secondary)] mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-[var(--text-tertiary)] mt-1">{sub}</p>}
    </div>
  )
}

function HeatMap({ completions, color }: { completions: string[]; color: string }) {
  const days = getLast30(completions)
  const done = days.filter(Boolean).length
  return (
    <div>
      <div className="flex gap-0.5 flex-wrap">
        {days.map((d, i) => (
          <div key={i} className="w-[calc(100%/30-1px)] aspect-square rounded-sm transition-all"
            style={{ background: d ? color : 'var(--bg-elevated)' }} />
        ))}
      </div>
      <p className="text-[10px] text-[var(--text-tertiary)] mt-1.5">{done}/30 Tage in den letzten 30 Tagen</p>
    </div>
  )
}

export default function StatsPage() {
  const [habits] = useSyncedStorage<Habit[]>('maxos-habits', [])
  const [routines] = useSyncedStorage<Routine[]>('maxos-routines', [])

  const today = todayStr()
  const doneToday = habits.filter((h) => h.completions.includes(today)).length
  const totalHabits = habits.length
  const bestStreak = habits.reduce((max, h) => Math.max(max, getStreak(h.completions)), 0)
  const totalCompletions = habits.reduce((sum, h) => sum + h.completions.length, 0)

  const allLast30 = habits.map((h) => getLast30(h.completions))
  const consistency = allLast30.length > 0
    ? Math.round(allLast30.flat().filter(Boolean).length / (allLast30.flat().length || 1) * 100)
    : 0

  const HABIT_COLORS: Record<string, string> = {}
  habits.forEach((h) => { HABIT_COLORS[h.id] = h.color })

  return (
    <div className="space-y-5">
      {/* Overview cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={<Target size={16} />} label="Heute erledigt" value={`${doneToday}/${totalHabits}`} color="text-[var(--accent)]" />
        <StatCard icon={<Flame size={16} />} label="Bester Streak" value={`${bestStreak}d`} color="text-orange-400" />
        <StatCard icon={<TrendingUp size={16} />} label="Konsistenz (30T)" value={`${consistency}%`} color="text-emerald-400" />
        <StatCard icon={<Award size={16} />} label="Gesamt Checks" value={totalCompletions} color="text-violet-400" />
      </div>

      {/* Per-habit heatmaps */}
      {habits.length > 0 && (
        <div className="bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-5">30-Tage Verlauf</h3>
          <div className="space-y-5">
            {habits.map((h) => {
              const streak = getStreak(h.completions)
              const last30done = getLast30(h.completions).filter(Boolean).length
              return (
                <div key={h.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span>{h.emoji}</span>
                      <span className="text-sm text-[var(--text-primary)]">{h.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)]">
                      {streak > 0 && (
                        <span className="flex items-center gap-1 text-orange-400">
                          <Flame size={11} /> {streak}
                        </span>
                      )}
                      <span>{last30done}/30</span>
                    </div>
                  </div>
                  <HeatMap completions={h.completions} color={h.color} />
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Routines overview */}
      {routines.length > 0 && (
        <div className="bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Routinen</h3>
          <div className="space-y-3">
            {routines.map((r) => {
              const total = r.steps.reduce((s, st) => s + st.duration, 0)
              const mins = Math.round(total / 60)
              return (
                <div key={r.id} className="flex items-center justify-between py-2 border-b border-[var(--bg-border)] last:border-0">
                  <div className="flex items-center gap-2">
                    <span>{r.emoji}</span>
                    <span className="text-sm text-[var(--text-primary)]">{r.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-semibold text-[var(--accent)]">{mins} min</p>
                    <p className="text-[10px] text-[var(--text-tertiary)]">{r.steps.length} Schritte</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {habits.length === 0 && routines.length === 0 && (
        <div className="bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-2xl p-8 text-center">
          <Calendar size={28} className="text-[var(--text-tertiary)] mx-auto mb-3" />
          <p className="text-sm text-[var(--text-secondary)]">Lege zuerst Habits an um Statistiken zu sehen.</p>
        </div>
      )}
    </div>
  )
}
