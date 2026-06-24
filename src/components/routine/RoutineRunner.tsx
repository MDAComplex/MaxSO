'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import type { Routine, RoutineStep } from '@/types'
import { X, SkipForward, Pause, Play, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

function fmtTime(secs: number): string {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function totalDuration(steps: RoutineStep[]): number {
  return steps.reduce((sum, s) => sum + s.duration, 0)
}

interface Props {
  routine: Routine
  onClose: () => void
}

export default function RoutineRunner({ routine, onClose }: Props) {
  const [stepIndex, setStepIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(routine.steps[0]?.duration ?? 0)
  const [running, setRunning] = useState(true)
  const [done, setDone] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const currentStep = routine.steps[stepIndex]
  const nextStep = routine.steps[stepIndex + 1] ?? null
  const total = totalDuration(routine.steps)
  const elapsed = routine.steps.slice(0, stepIndex).reduce((s, st) => s + st.duration, 0)
    + (currentStep ? currentStep.duration - timeLeft : 0)
  const progress = total > 0 ? elapsed / total : 0

  const advance = useCallback(() => {
    if (stepIndex + 1 < routine.steps.length) {
      setStepIndex((i) => i + 1)
      setTimeLeft(routine.steps[stepIndex + 1].duration)
    } else {
      setRunning(false)
      setDone(true)
    }
  }, [stepIndex, routine.steps])

  useEffect(() => {
    if (!running || done) return
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => { if (t <= 1) { advance(); return 0 } return t - 1 })
    }, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, done, advance])

  function skip() { if (intervalRef.current) clearInterval(intervalRef.current); advance() }
  function togglePause() { setRunning((r) => !r) }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === ' ') { e.preventDefault(); togglePause() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const RADIUS = 110
  const CIRC = 2 * Math.PI * RADIUS
  const stepProgress = currentStep ? 1 - timeLeft / currentStep.duration : 1
  const ringOffset = CIRC - stepProgress * CIRC

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0B] flex flex-col">
      {/* Top */}
      <div className="flex items-center justify-between px-6 pt-6 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{routine.emoji}</span>
          <span className="text-sm font-medium text-zinc-400">{routine.name}</span>
        </div>
        <button onClick={onClose} className="p-2 rounded-xl text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="px-6 mb-6">
        <div className="h-0.5 bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-sky-400 rounded-full transition-all duration-1000" style={{ width: `${progress * 100}%` }} />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-zinc-600">Schritt {stepIndex + 1} / {routine.steps.length}</span>
          <span className="text-[10px] text-zinc-600">{fmtTime(Math.round((1 - progress) * total))} verbleibend</span>
        </div>
      </div>

      {done ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8">
          <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <Check size={40} className="text-emerald-400" strokeWidth={2.5} />
          </div>
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-2">Fertig! 🎉</h2>
            <p className="text-zinc-400">{routine.name} · {fmtTime(total)}</p>
          </div>
          <button onClick={onClose} className="bg-sky-400 text-zinc-900 font-semibold rounded-2xl px-8 py-3.5 text-base hover:bg-sky-300 transition-colors">
            Schließen
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6">
          {/* Ring */}
          <div className="relative">
            <svg width={260} height={260} className="-rotate-90">
              <circle cx={130} cy={130} r={RADIUS} fill="none" stroke="#27272A" strokeWidth="8" />
              <circle cx={130} cy={130} r={RADIUS} fill="none" stroke="#38BDF8" strokeWidth="8"
                strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={ringOffset}
                style={{ transition: running ? 'stroke-dashoffset 1s linear' : 'none' }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl mb-1">{currentStep?.emoji}</span>
              <span className="text-4xl font-bold text-white font-mono tabular-nums">{fmtTime(timeLeft)}</span>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-white">{currentStep?.name}</h2>

          {nextStep && (
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5">
              <span className="text-[11px] text-zinc-500 uppercase tracking-wider">Danach</span>
              <span className="text-sm">{nextStep.emoji}</span>
              <span className="text-sm text-zinc-400">{nextStep.name}</span>
              <span className="text-xs text-zinc-600 ml-1">· {fmtTime(nextStep.duration)}</span>
            </div>
          )}

          <div className="flex items-center gap-4">
            <button onClick={togglePause}
              className="w-16 h-16 rounded-full bg-sky-400 text-zinc-900 flex items-center justify-center hover:bg-sky-300 transition-colors shadow-lg shadow-sky-400/20">
              {running ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
            </button>
            <button onClick={skip}
              className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 transition-colors">
              <SkipForward size={18} />
            </button>
          </div>
          <p className="text-[11px] text-zinc-700">Leertaste = Pause · ESC = Beenden</p>
        </div>
      )}

      <div className="flex justify-center gap-1.5 pb-10">
        {routine.steps.map((_, i) => (
          <div key={i} className={cn('rounded-full transition-all duration-300',
            i < stepIndex ? 'w-1.5 h-1.5 bg-sky-400' :
            i === stepIndex ? 'w-4 h-1.5 bg-sky-400' : 'w-1.5 h-1.5 bg-zinc-800'
          )} />
        ))}
      </div>
    </div>
  )
}
