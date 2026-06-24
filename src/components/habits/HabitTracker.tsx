'use client'

import { useState } from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import type { Habit } from '@/types'
import { Plus, X, Flame, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const COLORS = ['#38BDF8', '#34D399', '#A78BFA', '#FB923C', '#F472B6', '#FBBF24']
const EMOJIS = ['💪', '📚', '🧘', '🏃', '🥗', '💧', '😴', '✍️', '🎯', '🧠', '🚿', '🌿']

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function getStreak(completions: string[]): number {
  if (!completions.length) return 0
  const sorted = [...completions].sort().reverse()
  const today = todayStr()
  let streak = 0
  let check = today
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
  const days: boolean[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(completions.includes(d.toISOString().split('T')[0]))
  }
  return days
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
      return {
        ...h,
        completions: done
          ? h.completions.filter((d) => d !== today)
          : [...h.completions, today],
      }
    }))
  }

  function addHabit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    const h: Habit = {
      id: crypto.randomUUID(),
      name: name.trim(),
      emoji,
      color,
      createdAt: new Date().toISOString(),
      completions: [],
    }
    setHabits((prev) => [...prev, h])
    setName('')
    setAdding(false)
  }

  function remove(id: string) {
    setHabits((prev) => prev.filter((h) => h.id !== id))
  }

  const today = todayStr()

  return (
    <div className="bg-[#111113] border border-[#1F1F23] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-semibold text-[#F4F4F5]">Habits</h2>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 text-xs text-[#52525B] hover:text-[#38BDF8] transition-colors"
        >
          <Plus size={13} /> Neu
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <form onSubmit={addHabit} className="mb-4 bg-[#0D0D0F] rounded-xl p-4 space-y-3">
          <div className="flex gap-2">
            {EMOJIS.map((e) => (
              <button key={e} type="button" onClick={() => setEmoji(e)}
                className={cn('text-lg w-8 h-8 rounded-lg flex items-center justify-center transition-all',
                  emoji === e ? 'bg-[#27272A]' : 'hover:bg-[#1F1F23]')}>
                {e}
              </button>
            ))}
          </div>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name des Habits…"
            className="w-full bg-[#111113] border border-[#1F1F23] rounded-xl px-3 py-2.5 text-sm text-[#F4F4F5] placeholder-[#3F3F46] outline-none focus:border-[#38BDF8] transition-colors"
          />
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button key={c} type="button" onClick={() => setColor(c)}
                className={cn('w-6 h-6 rounded-full transition-all', color === c ? 'ring-2 ring-offset-2 ring-offset-[#0D0D0F]' : '')}
                style={{ background: c, '--tw-ring-color': c } as React.CSSProperties}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button type="submit"
              className="flex-1 bg-[#38BDF8] text-[#0A0A0B] font-semibold rounded-xl py-2 text-sm hover:bg-[#7DD3FC] transition-colors">
              Hinzufügen
            </button>
            <button type="button" onClick={() => setAdding(false)}
              className="px-3 rounded-xl border border-[#27272A] text-[#52525B] hover:text-[#A1A1AA] transition-colors">
              <X size={14} />
            </button>
          </div>
        </form>
      )}

      {habits.length === 0 && !adding && (
        <p className="text-sm text-[#3F3F46] text-center py-6">
          Noch keine Habits. Füge deinen ersten hinzu.
        </p>
      )}

      <div className="space-y-3">
        {habits.map((habit) => {
          const done = habit.completions.includes(today)
          const streak = getStreak(habit.completions)
          const last7 = getLast7(habit.completions)
          return (
            <div key={habit.id} className="group">
              <div className="flex items-center gap-3">
                {/* Check button */}
                <button onClick={() => toggle(habit.id)}
                  className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all duration-200 shrink-0',
                    done ? 'scale-95' : 'hover:scale-105'
                  )}
                  style={{ background: done ? habit.color + '20' : '#18181B', border: `1.5px solid ${done ? habit.color : '#27272A'}` }}>
                  {done
                    ? <Check size={16} style={{ color: habit.color }} strokeWidth={3} />
                    : <span>{habit.emoji}</span>
                  }
                </button>

                {/* Name + streak */}
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm font-medium transition-colors', done ? 'text-[#52525B]' : 'text-[#E4E4E7]')}>
                    {habit.emoji} {habit.name}
                  </p>
                  {streak > 0 && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Flame size={11} className="text-orange-400" />
                      <span className="text-[11px] text-orange-400">{streak} Tage</span>
                    </div>
                  )}
                </div>

                {/* Last 7 days */}
                <div className="flex gap-1 items-center shrink-0">
                  {last7.map((d, i) => (
                    <div key={i} className="w-2 h-2 rounded-full transition-all"
                      style={{ background: d ? habit.color : '#27272A' }} />
                  ))}
                </div>

                {/* Delete */}
                <button onClick={() => remove(habit.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-[#3F3F46] hover:text-red-400 transition-all">
                  <X size={12} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
