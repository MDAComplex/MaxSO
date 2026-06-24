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
      setTimeLeft((t) => {
        if (t <= 1) {
          advance()
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, done, advance])

  function skip() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    advance()
  }

  function togglePause() {
    setRunning((r) => !r)
  }

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === ' ') togglePause()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Ring progress
  const RADIUS = 110
  const CIRC = 2 * Math.PI * RADIUS
  const stepProgress = currentStep
    ? 1 - timeLeft / currentStep.duration
    : 1
  const ringOffset = CIRC - stepProgress * CIRC

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0B] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 pt-6 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{routine.emoji}</span>
          <span className="text-sm font-medium text-[#71717A]">{routine.name}</span>
        </div>
        <button onClick={onClose}
          className="p-2 rounded-xl text-[#3F3F46] hover:text-[#F4F4F5] hover:bg-[#111113] transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Overall progress bar */}
      <div className="px-6 mb-6">
        <div className="h-0.5 bg-[#1F1F23] rounded-full overflow-hidden">
          <div className="h-full bg-[#38BDF8] rounded-full transition-all duration-1000"
            style={{ width: `${progress * 100}%` }} />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-[#3F3F46]">
            Schritt {stepIndex + 1} / {routine.steps.length}
          </span>
          <span className="text-[10px] text-[#3F3F46]">
            {fmtTime(Math.round((1 - progress) * total))} verbleibend
          </span>
        </div>
      </div>

      {done ? (
        /* ── Done screen ── */
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8">
          <div className="w-24 h-24 rounded-full bg-[#34D399]/10 border border-[#34D399]/30 flex items-center justify-center">
            <Check size={40} className="text-[#34D399]" strokeWidth={2.5} />
          </div>
          <div className="text-center">
            <h2 className="text-3xl font-bold text-[#F4F4F5] mb-2">Fertig! 🎉</h2>
            <p className="text-[#71717A]">
              {routine.name} abgeschlossen · {fmtTime(total)}
            </p>
          </div>
          <button onClick={onClose}
            className="bg-[#38BDF8] text-[#0A0A0B] font-semibold rounded-2xl px-8 py-3.5 text-base hover:bg-[#7DD3FC] transition-colors">
            Schließen
          </button>
        </div>
      ) : (
        /* ── Active step ── */
        <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6">
          {/* Ring timer */}
          <div className="relative">
            <svg width={260} height={260} className="-rotate-90">
              <circle cx={130} cy={130} r={RADIUS} fill="none" stroke="#1F1F23" strokeWidth="8" />
              <circle cx={130} cy={130} r={RADIUS}
                fill="none"
                stroke="#38BDF8"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={CIRC}
                strokeDashoffset={ringOffset}
                style={{ transition: running ? 'stroke-dashoffset 1s linear' : 'none' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl mb-1">{currentStep?.emoji}</span>
              <span className="text-4xl font-bold text-[#F4F4F5] tabular-nums font-mono">
                {fmtTime(timeLeft)}
              </span>
            </div>
          </div>

          {/* Step name */}
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-[#F4F4F5]">{currentStep?.name}</h2>
          </div>

          {/* Next step */}
          {nextStep && (
            <div className="flex items-center gap-2 bg-[#111113] border border-[#1F1F23] rounded-xl px-4 py-2.5">
              <span className="text-[11px] text-[#3F3F46] uppercase tracking-wider">Danach</span>
              <span className="text-sm">{nextStep.emoji}</span>
              <span className="text-sm text-[#71717A]">{nextStep.name}</span>
              <span className="text-xs text-[#3F3F46] ml-1">· {fmtTime(nextStep.duration)}</span>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center gap-4">
            <button onClick={togglePause}
              className={cn(
                'w-16 h-16 rounded-full flex items-center justify-center transition-all',
                'bg-[#38BDF8] text-[#0A0A0B] hover:bg-[#7DD3FC] shadow-lg shadow-[#38BDF8]/20'
              )}>
              {running
                ? <Pause size={24} fill="currentColor" />
                : <Play size={24} fill="currentColor" className="ml-1" />
              }
            </button>
            <button onClick={skip}
              className="w-12 h-12 rounded-full bg-[#18181B] border border-[#27272A] flex items-center justify-center text-[#52525B] hover:text-[#A1A1AA] hover:bg-[#27272A] transition-colors">
              <SkipForward size={18} />
            </button>
          </div>

          <p className="text-[11px] text-[#2A2A2A]">Leertaste = Pause · ESC = Beenden</p>
        </div>
      )}

      {/* Step dots at bottom */}
      <div className="flex justify-center gap-1.5 pb-10">
        {routine.steps.map((_, i) => (
          <div key={i} className={cn(
            'rounded-full transition-all duration-300',
            i < stepIndex ? 'w-1.5 h-1.5 bg-[#38BDF8]' :
            i === stepIndex ? 'w-4 h-1.5 bg-[#38BDF8]' :
            'w-1.5 h-1.5 bg-[#27272A]'
          )} />
        ))}
      </div>
    </div>
  )
}
