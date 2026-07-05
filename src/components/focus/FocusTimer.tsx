'use client'

import { useEffect, useRef, useState } from 'react'
import { useSyncedStorage } from '@/hooks/useSyncedStorage'
import { cn } from '@/lib/utils'
import { Play, Pause, Square } from 'lucide-react'

interface FocusSession {
  date: string // YYYY-MM-DD
  minutes: number
  subject: string
}

const PRESETS = [25, 50, 90]
const WEEK_GOAL_HOURS = 15
const SUBJECTS = ['📐 Mathe', '🇰🇷 Koreanisch', '🇬🇧 Englisch', '🇩🇪 Deutsch', '💼 Wirtschaft', '📚 Sonstiges']

function todayStr() { return new Date().toISOString().split('T')[0] }

function weekDates(): string[] {
  const out: string[] = []
  const now = new Date()
  const day = (now.getDay() + 6) % 7 // Monday = 0
  for (let i = 0; i <= day; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() - (day - i))
    out.push(d.toISOString().split('T')[0])
  }
  return out
}

function fmtClock(secs: number) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export default function FocusTimer() {
  const [sessions, setSessions] = useSyncedStorage<FocusSession[]>('maxos-focus', [])
  const [preset, setPreset] = useState(25)
  const [subject, setSubject] = useState(SUBJECTS[0])
  const [secondsLeft, setSecondsLeft] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const startedRef = useRef<number>(25 * 60)

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setRunning(false)
          logSession(startedRef.current)
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            new Notification('Max OS ⏱️', { body: 'Focus-Session fertig. Pause verdient!' })
          }
          return preset * 60
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, preset])

  function logSession(totalSecs: number) {
    const minutes = Math.round(totalSecs / 60)
    if (minutes < 1) return
    setSessions((prev) => [...prev, { date: todayStr(), minutes, subject }])
  }

  function start() {
    startedRef.current = secondsLeft
    setRunning(true)
  }

  function stop() {
    setRunning(false)
    const elapsed = startedRef.current - secondsLeft
    if (elapsed >= 60) logSession(elapsed)
    setSecondsLeft(preset * 60)
  }

  function pickPreset(p: number) {
    if (running) return
    setPreset(p)
    setSecondsLeft(p * 60)
  }

  const week = weekDates()
  const weekMinutes = sessions.filter((s) => week.includes(s.date)).reduce((sum, s) => sum + s.minutes, 0)
  const todayMinutes = sessions.filter((s) => s.date === todayStr()).reduce((sum, s) => sum + s.minutes, 0)
  const weekPct = Math.min(100, Math.round((weekMinutes / (WEEK_GOAL_HOURS * 60)) * 100))

  const progress = 1 - secondsLeft / (preset * 60)
  const RADIUS = 88
  const CIRC = 2 * Math.PI * RADIUS

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">⏱️ Focus</h2>
        <span className="text-[11px] text-[var(--text-tertiary)]">
          Heute: {Math.floor(todayMinutes / 60)}h {todayMinutes % 60}m
        </span>
      </div>

      {/* Subject picker */}
      <div className="flex gap-1.5 flex-wrap mb-4">
        {SUBJECTS.map((s) => (
          <button key={s} onClick={() => !running && setSubject(s)}
            className={cn('px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors border',
              subject === s
                ? 'bg-[var(--accent)]/10 border-[var(--accent)] text-[var(--accent)]'
                : 'border-[var(--bg-border)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]')}>
            {s}
          </button>
        ))}
      </div>

      {/* Ring */}
      <div className="flex justify-center my-5">
        <div className="relative">
          <svg width={200} height={200} className="-rotate-90">
            <circle cx={100} cy={100} r={RADIUS} fill="none" stroke="var(--bg-elevated)" strokeWidth="7" />
            <circle cx={100} cy={100} r={RADIUS} fill="none" stroke="var(--accent)" strokeWidth="7"
              strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={CIRC - progress * CIRC}
              style={{ transition: running ? 'stroke-dashoffset 1s linear' : 'none' }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-[var(--text-primary)] font-mono tabular-nums">
              {fmtClock(secondsLeft)}
            </span>
            <span className="text-[11px] text-[var(--text-tertiary)] mt-1">{subject}</span>
          </div>
        </div>
      </div>

      {/* Presets + controls */}
      <div className="flex items-center justify-center gap-2 mb-5">
        {PRESETS.map((p) => (
          <button key={p} onClick={() => pickPreset(p)} disabled={running}
            className={cn('px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors border disabled:opacity-40',
              preset === p
                ? 'bg-[var(--accent)]/10 border-[var(--accent)] text-[var(--accent)]'
                : 'border-[var(--bg-border)] text-[var(--text-tertiary)]')}>
            {p}m
          </button>
        ))}
        <div className="w-px h-6 bg-[var(--bg-border)] mx-1" />
        <button onClick={running ? () => setRunning(false) : start}
          className="w-11 h-11 rounded-full bg-[var(--accent)] text-[#0A0A0B] flex items-center justify-center hover:opacity-90 transition-opacity">
          {running ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
        </button>
        <button onClick={stop}
          className="w-9 h-9 rounded-full border border-[var(--bg-border)] text-[var(--text-tertiary)] flex items-center justify-center hover:text-[var(--text-secondary)] transition-colors">
          <Square size={13} />
        </button>
      </div>

      {/* Week goal */}
      <div>
        <div className="flex justify-between text-[11px] text-[var(--text-tertiary)] mb-1.5">
          <span>Wochenziel: {WEEK_GOAL_HOURS}h Deep Work</span>
          <span className="text-[var(--accent)] font-medium">
            {Math.floor(weekMinutes / 60)}h {weekMinutes % 60}m · {weekPct}%
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
          <div className="h-full bg-[var(--accent)] rounded-full transition-all duration-500" style={{ width: `${weekPct}%` }} />
        </div>
      </div>
    </div>
  )
}
