'use client'

import { useState } from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import type { Routine, RoutineStep } from '@/types'
import { Plus, X, GripVertical, Play, Trash2, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEP_EMOJIS = ['🧘', '💪', '📚', '🚿', '☕', '🥗', '✍️', '🎯', '🏃', '💧', '🧠', '🌿', '📱', '🎵', '🔥']
const ROUTINE_EMOJIS = ['🌅', '🌙', '💪', '🧘', '🎯', '⚡', '🌿', '🔥', '✨', '🚀']

function fmtDuration(secs: number): string {
  if (secs < 60) return `${secs}s`
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return s > 0 ? `${m}m ${s}s` : `${m}m`
}

function totalDuration(steps: RoutineStep[]): number {
  return steps.reduce((sum, s) => sum + s.duration, 0)
}

interface Props {
  onStart: (routine: Routine) => void
}

export default function RoutineBuilder({ onStart }: Props) {
  const [routines, setRoutines] = useLocalStorage<Routine[]>('maxos-routines', [])
  const [creating, setCreating] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [rName, setRName] = useState('')
  const [rEmoji, setREmoji] = useState('🌅')
  const [steps, setSteps] = useState<RoutineStep[]>([])
  const [stepName, setStepName] = useState('')
  const [stepEmoji, setStepEmoji] = useState('🧘')
  const [stepMins, setStepMins] = useState('5')
  const [stepSecs, setStepSecs] = useState('0')

  function addStep() {
    if (!stepName.trim()) return
    const duration = (parseInt(stepMins) || 0) * 60 + (parseInt(stepSecs) || 0)
    if (duration <= 0) return
    setSteps((prev) => [...prev, { id: crypto.randomUUID(), name: stepName.trim(), emoji: stepEmoji, duration }])
    setStepName('')
    setStepMins('5')
    setStepSecs('0')
  }

  function saveRoutine(e: React.FormEvent) {
    e.preventDefault()
    if (!rName.trim() || steps.length === 0) return
    setRoutines((prev) => [...prev, {
      id: crypto.randomUUID(), name: rName.trim(), emoji: rEmoji, steps,
      createdAt: new Date().toISOString(),
    }])
    setCreating(false)
    setRName('')
    setSteps([])
  }

  function deleteRoutine(id: string) { setRoutines((prev) => prev.filter((r) => r.id !== id)) }

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">Routinen</h2>
        <button onClick={() => setCreating(true)}
          className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)] hover:text-[var(--accent)] transition-colors">
          <Plus size={13} /> Neue Routine
        </button>
      </div>

      {creating && (
        <form onSubmit={saveRoutine} className="mb-5 bg-[var(--bg-elevated)] rounded-xl p-4 space-y-4">
          <div className="flex gap-2 flex-wrap">
            {ROUTINE_EMOJIS.map((e) => (
              <button key={e} type="button" onClick={() => setREmoji(e)}
                className={cn('text-xl w-9 h-9 rounded-xl flex items-center justify-center transition-all',
                  rEmoji === e ? 'bg-[var(--bg-border)] ring-1 ring-[var(--accent)]' : 'bg-[var(--bg-surface)] hover:bg-[var(--bg-border)]')}>
                {e}
              </button>
            ))}
          </div>

          <input autoFocus value={rName} onChange={(e) => setRName(e.target.value)}
            placeholder="Name der Routine…"
            className="w-full bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-xl px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] transition-colors" />

          {steps.length > 0 && (
            <div className="space-y-1.5">
              {steps.map((step) => (
                <div key={step.id} className="flex items-center gap-2 bg-[var(--bg-surface)] rounded-xl px-3 py-2">
                  <GripVertical size={13} className="text-[var(--text-tertiary)] shrink-0" />
                  <span className="text-sm">{step.emoji}</span>
                  <span className="text-sm text-[var(--text-primary)] flex-1">{step.name}</span>
                  <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
                    <Clock size={11} />{fmtDuration(step.duration)}
                  </span>
                  <button type="button" onClick={() => setSteps((p) => p.filter((s) => s.id !== step.id))}
                    className="text-[var(--text-tertiary)] hover:text-red-400 transition-colors">
                    <X size={13} />
                  </button>
                </div>
              ))}
              <div className="text-right text-xs text-[var(--text-secondary)] pr-1 pt-1">
                Gesamt: {fmtDuration(totalDuration(steps))}
              </div>
            </div>
          )}

          {/* Add step */}
          <div className="bg-[var(--bg-surface)] rounded-xl p-3 space-y-2.5 border border-[var(--bg-border)]">
            <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">Schritt hinzufügen</p>
            <div className="flex gap-1.5 flex-wrap">
              {STEP_EMOJIS.map((e) => (
                <button key={e} type="button" onClick={() => setStepEmoji(e)}
                  className={cn('text-base w-7 h-7 rounded-lg flex items-center justify-center transition-all',
                    stepEmoji === e ? 'bg-[var(--bg-border)]' : 'hover:bg-[var(--bg-elevated)]')}>
                  {e}
                </button>
              ))}
            </div>
            <input value={stepName} onChange={(e) => setStepName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addStep())}
              placeholder="Schritt-Name…"
              className="w-full bg-[var(--bg-elevated)] border border-[var(--bg-border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] transition-colors" />
            <div className="flex gap-2 items-center">
              <div className="flex items-center gap-1.5 flex-1">
                <input type="number" min="0" max="99" value={stepMins} onChange={(e) => setStepMins(e.target.value)}
                  className="w-14 bg-[var(--bg-elevated)] border border-[var(--bg-border)] rounded-lg px-2 py-1.5 text-sm text-[var(--text-primary)] text-center outline-none focus:border-[var(--accent)]" />
                <span className="text-xs text-[var(--text-secondary)]">min</span>
                <input type="number" min="0" max="59" value={stepSecs} onChange={(e) => setStepSecs(e.target.value)}
                  className="w-14 bg-[var(--bg-elevated)] border border-[var(--bg-border)] rounded-lg px-2 py-1.5 text-sm text-[var(--text-primary)] text-center outline-none focus:border-[var(--accent)]" />
                <span className="text-xs text-[var(--text-secondary)]">sek</span>
              </div>
              <button type="button" onClick={addStep}
                className="px-3 py-1.5 bg-[var(--bg-border)] hover:bg-[var(--accent)] hover:text-[#0A0A0B] text-[var(--text-secondary)] rounded-lg text-sm font-medium transition-colors">
                + Schritt
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <button type="submit" disabled={!rName.trim() || steps.length === 0}
              className="flex-1 bg-[var(--accent)] text-[#0A0A0B] font-semibold rounded-xl py-2.5 text-sm hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed">
              Routine speichern
            </button>
            <button type="button" onClick={() => { setCreating(false); setSteps([]) }}
              className="px-3 rounded-xl border border-[var(--bg-border)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors">
              <X size={14} />
            </button>
          </div>
        </form>
      )}

      {routines.length === 0 && !creating && (
        <p className="text-sm text-[var(--text-tertiary)] text-center py-6">Noch keine Routinen. Erstelle deine erste.</p>
      )}

      <div className="space-y-2">
        {routines.map((routine) => (
          <div key={routine.id} className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--bg-border)] overflow-hidden">
            <div className="flex items-center gap-3 p-3">
              <span className="text-xl">{routine.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)]">{routine.name}</p>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  {routine.steps.length} Schritte · {fmtDuration(totalDuration(routine.steps))}
                </p>
              </div>
              <button onClick={() => setExpanded(expanded === routine.id ? null : routine.id)}
                className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors">
                {expanded === routine.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              <button onClick={() => onStart(routine)}
                className="flex items-center gap-1.5 bg-[var(--accent)] text-[#0A0A0B] font-semibold rounded-lg px-3 py-1.5 text-xs hover:opacity-90 transition-opacity">
                <Play size={11} fill="currentColor" /> Start
              </button>
              <button onClick={() => deleteRoutine(routine.id)}
                className="p-1.5 text-[var(--text-tertiary)] hover:text-red-400 transition-colors">
                <Trash2 size={13} />
              </button>
            </div>

            {expanded === routine.id && (
              <div className="border-t border-[var(--bg-border)] px-3 pb-3 pt-2 space-y-1.5">
                {routine.steps.map((step, i) => (
                  <div key={step.id} className="flex items-center gap-2.5">
                    <span className="text-[11px] text-[var(--text-tertiary)] w-4">{i + 1}.</span>
                    <span className="text-sm">{step.emoji}</span>
                    <span className="text-sm text-[var(--text-secondary)] flex-1">{step.name}</span>
                    <span className="text-xs text-[var(--text-tertiary)]">{fmtDuration(step.duration)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
