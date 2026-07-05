'use client'

import { useEffect, useState } from 'react'
import { differenceInCalendarDays, parseISO, format, subDays } from 'date-fns'
import { de } from 'date-fns/locale'
import { MILESTONES_SEED } from '@/lib/milestones-seed'
import { useSyncedStorage } from '@/hooks/useSyncedStorage'
import type { Habit } from '@/types'

const QUOTES = [
  'Disziplin schlägt Motivation. Jeden Tag.',
  'Der Weg nach Yonsei beginnt mit dem heutigen Tag.',
  'Kleine Schritte, jeden Tag. Das ist der ganze Trick.',
  'Du musst nicht perfekt sein. Nur konsistent.',
  'Was du heute tust, entscheidet wer du 2027 bist.',
  'Ein Habit heute ist ein Ziegelstein für dein Fundament.',
  'Fokus ist eine Entscheidung, keine Fähigkeit.',
]

const MOOD_EMOJI = ['', '😞', '😕', '😐', '🙂', '🔥']

function greeting(): string {
  const h = new Date().getHours()
  if (h < 5) return 'Gute Nacht'
  if (h < 11) return 'Guten Morgen'
  if (h < 18) return 'Guten Tag'
  return 'Guten Abend'
}

export default function MorningBriefing() {
  const [habits] = useSyncedStorage<Habit[]>('maxos-habits', [])
  const [yesterdayMood, setYesterdayMood] = useState<number | null>(null)

  useEffect(() => {
    const y = format(subDays(new Date(), 1), 'yyyy-MM-dd')
    fetch(`/api/reflections?date=${y}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const entry = Array.isArray(d?.reflections) ? d.reflections[0] : d?.reflection
        if (entry?.mood) setYesterdayMood(entry.mood)
      })
      .catch(() => {})
  }, [])

  const next = MILESTONES_SEED
    .filter((m) => differenceInCalendarDays(parseISO(m.target_date), new Date()) >= 0)
    .sort((a, b) => a.target_date.localeCompare(b.target_date))[0]

  const today = new Date().toISOString().split('T')[0]
  const openHabits = habits.filter((h) => !h.completions.includes(today)).length
  const doneHabits = habits.length - openHabits

  // Stable quote per day
  const dayIndex = Math.floor(Date.now() / 86_400_000) % QUOTES.length
  const quote = QUOTES[dayIndex]

  const days = next ? differenceInCalendarDays(parseISO(next.target_date), new Date()) : null

  return (
    <div className="relative overflow-hidden bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-2xl p-5">
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at top right, #38BDF8, transparent 65%)' }} />

      <p className="text-sm font-semibold text-[var(--text-primary)]">{greeting()}, Max 👋</p>
      <p className="text-xs text-[var(--text-tertiary)] mt-1 italic leading-relaxed">„{quote}"</p>

      <div className="grid grid-cols-3 gap-2 mt-4">
        {next && (
          <div className="bg-[var(--bg-elevated)] rounded-xl p-3">
            <p className="font-mono text-xl font-bold text-sky-400 leading-none">{days}</p>
            <p className="text-[10px] text-[var(--text-tertiary)] mt-1 leading-tight">
              Tage bis<br />{next.label.split('—')[0].trim()}
            </p>
          </div>
        )}
        <div className="bg-[var(--bg-elevated)] rounded-xl p-3">
          <p className="font-mono text-xl font-bold text-emerald-400 leading-none">
            {doneHabits}<span className="text-sm text-[var(--text-tertiary)]">/{habits.length || 0}</span>
          </p>
          <p className="text-[10px] text-[var(--text-tertiary)] mt-1 leading-tight">Habits<br />heute</p>
        </div>
        <div className="bg-[var(--bg-elevated)] rounded-xl p-3">
          <p className="text-xl leading-none">{yesterdayMood ? MOOD_EMOJI[yesterdayMood] : '—'}</p>
          <p className="text-[10px] text-[var(--text-tertiary)] mt-1 leading-tight">Stimmung<br />gestern</p>
        </div>
      </div>
    </div>
  )
}
