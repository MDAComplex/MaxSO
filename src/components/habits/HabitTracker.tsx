'use client'

import { useState } from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import type { Habit } from '@/types'
import { Plus, X, Flame, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const COLORS = ['#38BDF8', '#34D399', '#A78BFA', '#FB923C', '#F472B6', '#FBBF24']
const EMOJIS = ['💪', '📚', '🧘', '🏃', '🥗', '💧', '😴', '✍️', '🎯', '🧠', '🚿', '🌿']

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

function getLast7(completions: string[]): boolean[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return completions.includes(d.toISOString().split('T')[0])
  })
}

export default function HabitTracker() {
  const [habits, setHabits] = useLocalStorage<Habit[]>('maxos-habits', [])
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('💪')
  const [color, setColor] = useState(COLORS[0])

  function toggle(id: string) {
    const today = todayStr()
    setHabits((prev) => prev.map((h) => {
      if (h.id !== id) return h
      const done = h.completions.includes(today)
      return { ...h, completions: done ? h.completions.filter((d) => d !== today) : [...h.completions, today] }
    }))
  }

  function addHabit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setHabits((prev) => [...prev, {
      id: crypto.randomUUID(), name: name.trim(), emoji, color,
      createdAt: new Date().toISOString(), completions: [],
    }])
    setName('')
    setAdding(false)
  }

  function remove(id: string) { setHabits((prev) => prev.filter((h) => h.id !== id)) }

  const today = todayStr()

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">Habits</h2>
        <button onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)] hover:text-[var(--accent)] transition-colors">
          <Plus size={13} /> Neu
        </button>
      </div>

      {adding && (
        <form onSubmit={addHabit} className="mb-4 bg-[var(--bg-elevated)] rounded-xl p-4 space-y-3">
          <div className="flex gap-1.5 flex-wrap">
            {EMOJIS.map((e) => (
              <button key={e} type="button" onClick={() => setEmoji(e)}
                className={cn('text-lg w-8 h-8 rounded-lg flex items-center justify-center transition-all',
                  emoji === e ? 'bg-[var(--bg-border)]' : 'hover:bg-[var(--bg-border)]')}>
                {e}
              </button>
            ))}
          </div>
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Name des Habits…"
            className="w-full bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-xl px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] transition-colors" />
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button key={c} type="button" onClick={() => setColor(c)}
                className={cn('w-6 h-6 rounded-full transition-all', color === c ? 'ring-2 ring-offset-2 ring-offset-[var(--bg-elevated)]' : '')}
                style={{ background: c, '--tw-ring-color': c } as React.CSSProperties} />
            ))}
          </div>
          <div className="flex gap-2">
            <button type="submit"
              className="flex-1 bg-[var(--accent)] text-[#0A0A0B] font-semibold rounded-xl py-2 text-sm hover:opacity-90 transition-opacity">
              Hinzufügen
            </button>
            <button type="button" onClick={() => setAdding(false)}
              className="px-3 rounded-xl border border-[var(--bg-border)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors">
              <X size={14} />
            </button>
          </div>
        </form>
      )}

      {habits.length === 0 && !adding && (
        <p className="text-sm text-[var(--text-tertiary)] text-center py-6">
          Noch keine Habits. Füge deinen ersten hinzu.
        </p>
      )}

      <div className="space-y-2">
        {habits.map((habit) => {
          const done = habit.completions.includes(today)
          const streak = getStreak(habit.completions)
          const last7 = getLast7(habit.completions)
          return (
            <div key={habit.id} className="group flex items-center gap-3 py-2 px-1 rounded-xl hover:bg-[var(--bg-elevated)] transition-colors">
              <button onClick={() => toggle(habit.id)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 transition-all duration-200"
                style={{ background: done ? habit.color + '20' : 'var(--bg-elevated)', border: `1.5px solid ${done ? habit.color : 'var(--bg-border)'}` }}>
                {done ? <Check size={16} style={{ color: habit.color }} strokeWidth={3} /> : <span>{habit.emoji}</span>}
              </button>

              <div className="flex-1 min-w-0">
                <p className={cn('text-sm font-medium transition-colors', done ? 'text-[var(--text-tertiary)] line-through' : 'text-[var(--text-primary)]')}>
                  {habit.emoji} {habit.name}
                </p>
                {streak > 0 && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <Flame size={10} className="text-orange-400" />
                    <span className="text-[10px] text-orange-400">{streak} Tage</span>
                  </div>
                )}
              </div>

              <div className="flex gap-1 items-center shrink-0">
                {last7.map((d, i) => (
                  <div key={i} className="w-2 h-2 rounded-full"
                    style={{ background: d ? habit.color : 'var(--bg-border)' }} />
                ))}
              </div>

              <button onClick={() => remove(habit.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-[var(--text-tertiary)] hover:text-red-400 transition-all">
                <X size={12} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
