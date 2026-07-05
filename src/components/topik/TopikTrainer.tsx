'use client'

import { useMemo, useState } from 'react'
import { useSyncedStorage } from '@/hooks/useSyncedStorage'
import { TOPIK_DECK } from '@/lib/topik-deck'
import { cn } from '@/lib/utils'
import { RotateCcw, Check, X } from 'lucide-react'

// Leitner: box 0 → daily, 1 → 2d, 2 → 4d, 3 → 8d, 4 → 16d, 5 → done-ish (32d)
const BOX_INTERVALS = [1, 2, 4, 8, 16, 32]

interface CardState {
  box: number
  due: string // YYYY-MM-DD
}

type Progress = Record<string, CardState>

function todayStr() { return new Date().toISOString().split('T')[0] }

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

const MAX_NEW_PER_DAY = 8

export default function TopikTrainer() {
  const [progress, setProgress, loaded] = useSyncedStorage<Progress>('maxos-topik', {})
  const [flipped, setFlipped] = useState(false)
  const [sessionDone, setSessionDone] = useState(0)

  const today = todayStr()

  const queue = useMemo(() => {
    const due = TOPIK_DECK.filter((w) => progress[w.id] && progress[w.id].due <= today)
    const fresh = TOPIK_DECK.filter((w) => !progress[w.id]).slice(0, MAX_NEW_PER_DAY)
    return [...due, ...fresh]
  }, [progress, today])

  const current = queue[0] ?? null
  const learned = Object.values(progress).filter((c) => c.box >= 3).length
  const started = Object.keys(progress).length

  function answer(correct: boolean) {
    if (!current) return
    const prev = progress[current.id]
    const nextBox = correct ? Math.min((prev?.box ?? 0) + 1, 5) : 0
    setProgress((p) => ({
      ...p,
      [current.id]: { box: nextBox, due: addDays(today, BOX_INTERVALS[nextBox]) },
    }))
    setFlipped(false)
    setSessionDone((n) => n + 1)
  }

  if (!loaded) return <div className="h-48 rounded-2xl bg-[var(--bg-surface)] border border-[var(--bg-border)] animate-pulse" />

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">🇰🇷 TOPIK Vokabeln</h2>
        <span className="text-[11px] text-[var(--text-tertiary)]">
          {learned}/{TOPIK_DECK.length} gemeistert · {started} gestartet
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1 rounded-full bg-[var(--bg-elevated)] overflow-hidden mb-5">
        <div className="h-full bg-rose-400 rounded-full transition-all duration-500"
          style={{ width: `${(learned / TOPIK_DECK.length) * 100}%` }} />
      </div>

      {!current ? (
        <div className="text-center py-8">
          <p className="text-3xl mb-2">🎉</p>
          <p className="text-sm font-medium text-[var(--text-primary)]">Alles gelernt für heute!</p>
          <p className="text-xs text-[var(--text-tertiary)] mt-1">
            {sessionDone > 0 ? `${sessionDone} Karten heute · ` : ''}Morgen kommen die nächsten Wiederholungen.
          </p>
        </div>
      ) : (
        <>
          {/* Card */}
          <button onClick={() => setFlipped((f) => !f)}
            className="w-full bg-[var(--bg-elevated)] rounded-2xl py-10 px-6 text-center hover:bg-[var(--bg-border)] transition-colors">
            {!flipped ? (
              <>
                <p className="text-4xl font-bold text-[var(--text-primary)] mb-2">{current.ko}</p>
                <p className="text-xs text-[var(--text-tertiary)]">Tippen zum Umdrehen</p>
              </>
            ) : (
              <>
                <p className="text-2xl font-semibold text-[var(--text-primary)]">{current.de}</p>
                <p className="text-sm text-[var(--text-tertiary)] mt-1 font-mono">{current.rom}</p>
              </>
            )}
          </button>

          {/* Answer buttons */}
          {flipped ? (
            <div className="flex gap-2 mt-4">
              <button onClick={() => answer(false)}
                className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 font-medium rounded-xl py-3 text-sm hover:bg-red-500/20 transition-colors">
                <X size={15} /> Nochmal
              </button>
              <button onClick={() => answer(true)}
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-medium rounded-xl py-3 text-sm hover:bg-emerald-500/20 transition-colors">
                <Check size={15} /> Gewusst
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-1.5 mt-4 text-[11px] text-[var(--text-tertiary)]">
              <RotateCcw size={11} /> {queue.length} Karten in der Warteschlange
            </div>
          )}
        </>
      )}
    </div>
  )
}
