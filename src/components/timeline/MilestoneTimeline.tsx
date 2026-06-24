'use client'

import { useEffect, useState, useCallback } from 'react'
import { differenceInCalendarDays, format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Check, Database, ChevronRight } from 'lucide-react'

type Confidence = 'fixed' | 'estimate'
type Category = 'phase' | 'bm' | 'fh' | 'yonsei' | 'exchange'
type Scenario = 'A' | 'B' | 'C' | null

interface Milestone {
  id: string
  key: string
  label: string
  category: Category
  scenario: Scenario
  target_date: string
  phase_start: string | null
  confidence: Confidence
  note: string | null
  sort_order: number
}

const CAT_EMOJI: Record<string, string> = {
  p2_ende: '🏁', p3_start: '🚀', p3_checkpoint: '🔍', p4_start: '⚡',
  bm_start: '📚', bm_hs_ende: '❄️', bm_fs_start: '🌱', bm_pruefungen: '📝', bm_abschluss: '🎓',
  fh_frist: '📬', fh_start: '🏛️', fh_abschluss: '🎓',
  yonsei_after_fh: '🇰🇷', yonsei_b_frist_fall: '📬', yonsei_b_frist_spr: '📬', yonsei_b_start: '🇰🇷', yonsei_b_abschluss: '🎓',
  exchange_apply: '📮', exchange_start: '✈️', exchange_ende: '🏠',
}

const CAT_COLOR: Record<Category, { line: string; node: string; badge: string; text: string }> = {
  phase:    { line: 'bg-sky-500/30',   node: 'border-sky-400 bg-sky-400/10',    badge: 'bg-sky-500/10 text-sky-400 border-sky-500/20',    text: 'text-sky-400' },
  bm:       { line: 'bg-sky-500/30',   node: 'border-sky-500 bg-sky-500/10',    badge: 'bg-sky-500/10 text-sky-300 border-sky-500/20',    text: 'text-sky-300' },
  fh:       { line: 'bg-emerald-500/30', node: 'border-emerald-400 bg-emerald-400/10', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', text: 'text-emerald-400' },
  yonsei:   { line: 'bg-rose-500/30',  node: 'border-rose-400 bg-rose-400/10',  badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',  text: 'text-rose-400' },
  exchange: { line: 'bg-violet-500/30', node: 'border-violet-400 bg-violet-400/10', badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20', text: 'text-violet-400' },
}

const SCENARIO_LABEL: Record<string, string> = { A: 'BM → FH → Yonsei', B: 'BM → direkt Yonsei', C: 'Austausch (setzt A voraus)' }
const SCENARIO_COLOR: Record<string, string> = {
  A: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20',
  B: 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20',
  C: 'bg-violet-500/10 text-violet-400 border-violet-500/30 hover:bg-violet-500/20',
}
const SCENARIO_COLOR_ACTIVE: Record<string, string> = {
  A: 'bg-emerald-500/20 text-emerald-300 border-emerald-400',
  B: 'bg-rose-500/20 text-rose-300 border-rose-400',
  C: 'bg-violet-500/20 text-violet-300 border-violet-400',
}

function countdown(targetDate: string): { label: string; past: boolean; isToday: boolean } {
  const days = differenceInCalendarDays(parseISO(targetDate), new Date())
  if (days < 0) return { label: 'Erreicht ✓', past: true, isToday: false }
  if (days === 0) return { label: 'Heute', past: false, isToday: true }
  if (days === 1) return { label: 'Morgen', past: false, isToday: false }
  if (days < 14) return { label: `in ${days} Tagen`, past: false, isToday: false }
  const weeks = Math.floor(days / 7)
  const rem = days % 7
  return { label: rem > 0 ? `in ${weeks} Wo ${rem} T` : `in ${weeks} Wochen`, past: false, isToday: false }
}

function progressPct(phaseStart: string | null, targetDate: string): number {
  if (!phaseStart) return 0
  const total = differenceInCalendarDays(parseISO(targetDate), parseISO(phaseStart))
  const elapsed = differenceInCalendarDays(new Date(), parseISO(phaseStart))
  if (total <= 0) return 100
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)))
}

function HeroCard({ milestone }: { milestone: Milestone }) {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000)
    return () => clearInterval(id)
  }, [])
  const { label } = countdown(milestone.target_date)
  const c = CAT_COLOR[milestone.category]
  const days = differenceInCalendarDays(parseISO(milestone.target_date), new Date())

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--bg-border)] bg-[var(--bg-surface)] p-6 mb-6">
      <div className="absolute inset-0 opacity-5" style={{ background: `radial-gradient(ellipse at top left, ${milestone.category === 'phase' || milestone.category === 'bm' ? '#38BDF8' : milestone.category === 'fh' ? '#34D399' : milestone.category === 'yonsei' ? '#F87171' : '#A78BFA'}, transparent 70%)` }} />
      <p className="text-[11px] text-[var(--text-tertiary)] uppercase tracking-widest mb-3">Nächster Meilenstein</p>
      <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-1 leading-tight">{milestone.label}</h2>
      <div className="flex items-baseline gap-3 mt-3">
        <span className={cn('font-mono text-4xl font-bold', c.text)}>{label}</span>
      </div>
      <p className="text-sm text-[var(--text-secondary)] mt-1">
        {format(parseISO(milestone.target_date), 'EEEE, d. MMMM yyyy', { locale: de })}
        {milestone.confidence === 'estimate' && <span className="ml-2 text-[var(--text-tertiary)] text-xs">ca.</span>}
      </p>
      {milestone.phase_start && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-[var(--text-tertiary)] mb-1">
            <span>{format(parseISO(milestone.phase_start), 'dd.MM.', { locale: de })}</span>
            <span className={c.text}>{progressPct(milestone.phase_start, milestone.target_date)}%</span>
            <span>{format(parseISO(milestone.target_date), 'dd.MM.', { locale: de })}</span>
          </div>
          <div className="h-1.5 rounded-full bg-[var(--bg-border)] overflow-hidden">
            <div className={cn('h-full rounded-full transition-all duration-700', milestone.category === 'phase' || milestone.category === 'bm' ? 'bg-sky-400' : milestone.category === 'fh' ? 'bg-emerald-400' : milestone.category === 'yonsei' ? 'bg-rose-400' : 'bg-violet-400')}
              style={{ width: `${progressPct(milestone.phase_start, milestone.target_date)}%` }} />
          </div>
        </div>
      )}
      {/* Pulsing dot */}
      <div className="absolute top-5 right-5 flex items-center justify-center">
        <div className={cn('w-2.5 h-2.5 rounded-full', milestone.category === 'bm' || milestone.category === 'phase' ? 'bg-sky-400' : milestone.category === 'fh' ? 'bg-emerald-400' : milestone.category === 'yonsei' ? 'bg-rose-400' : 'bg-violet-400')} />
        <div className={cn('absolute w-2.5 h-2.5 rounded-full animate-pulse-ring', milestone.category === 'bm' || milestone.category === 'phase' ? 'bg-sky-400/50' : milestone.category === 'fh' ? 'bg-emerald-400/50' : milestone.category === 'yonsei' ? 'bg-rose-400/50' : 'bg-violet-400/50')} />
      </div>
    </div>
  )
}

function MilestoneNode({ milestone, isNext }: { milestone: Milestone; isNext: boolean }) {
  const { label, past, isToday } = countdown(milestone.target_date)
  const c = CAT_COLOR[milestone.category]
  const pct = progressPct(milestone.phase_start, milestone.target_date)
  const emoji = CAT_EMOJI[milestone.key] ?? '📌'

  return (
    <div className={cn('pl-8 pb-4 relative', past && 'opacity-45')}>
      {/* Node */}
      <div className={cn(
        'absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 flex items-center justify-center -translate-x-[7px] z-10',
        past ? 'bg-[var(--bg-surface)] border-[var(--bg-border)]' : c.node,
        isNext && 'border-[var(--accent)] bg-[var(--accent)]/20'
      )}>
        {past && <Check size={8} className="text-[var(--text-tertiary)]" />}
      </div>

      {/* Card */}
      <div className={cn(
        'rounded-xl border p-3.5',
        'border-[var(--bg-border)] bg-[var(--bg-surface)]',
        isNext && 'border-[var(--accent)]/40',
        milestone.confidence === 'estimate' && !past && 'border-dashed'
      )}>
        <div className="flex items-center gap-3">
          {/* Emoji */}
          <span className="text-xl shrink-0">{emoji}</span>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--text-primary)] leading-tight">{milestone.label}</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
              {format(parseISO(milestone.target_date), 'dd.MM.yyyy', { locale: de })}
              {milestone.confidence === 'estimate' && <span className="ml-1">ca.</span>}
            </p>
            {milestone.note && (
              <p className="text-[11px] text-[var(--text-tertiary)] mt-1 leading-relaxed">{milestone.note}</p>
            )}
          </div>

          {/* Countdown pill */}
          <div className={cn(
            'shrink-0 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold',
            past ? 'bg-[var(--bg-elevated)] text-[var(--text-tertiary)]' :
            isToday ? 'bg-amber-400/15 text-amber-300' :
            c.badge
          )}>
            {label}
          </div>
        </div>

        {milestone.phase_start && !past && (
          <div className="mt-2.5 pl-8">
            <div className="h-1 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
              <div className={cn('h-full rounded-full',
                milestone.category === 'phase' || milestone.category === 'bm' ? 'bg-sky-400' :
                milestone.category === 'fh' ? 'bg-emerald-400' :
                milestone.category === 'yonsei' ? 'bg-rose-400' : 'bg-violet-400'
              )} style={{ width: `${pct}%` }} />
            </div>
            <div className="flex justify-end mt-0.5">
              <span className={cn('text-[10px]', c.text)}>{pct}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


export default function MilestoneTimeline() {
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [scenario, setScenario] = useState<'A' | 'B' | 'C'>('A')
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)

  const load = useCallback(async () => {
    const res = await fetch('/api/milestones')
    const data = await res.json()
    setMilestones(data.milestones ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function seed() {
    setSeeding(true)
    await fetch('/api/milestones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seed: true }),
    })
    await load()
    setSeeding(false)
  }

  const visible = milestones.filter((m) => m.scenario === null || m.scenario === scenario)
  const future = visible.filter((m) => differenceInCalendarDays(parseISO(m.target_date), new Date()) >= 0)
  const nextMilestone = future[0] ?? null

  // Group: base (phase+bm) and scenario branch
  const base = visible.filter((m) => m.scenario === null)
  const branch = visible.filter((m) => m.scenario === scenario)
  const all = [...base, ...branch].sort((a, b) => a.sort_order - b.sort_order)

  if (loading) return (
    <div className="space-y-3">
      {[1,2,3,4].map(i => (
        <div key={i} className="h-20 rounded-xl bg-[var(--bg-surface)] border border-[var(--bg-border)] animate-pulse" />
      ))}
    </div>
  )

  if (milestones.length === 0) return (
    <div className="bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-2xl p-8 text-center">
      <Database size={28} className="text-[var(--text-tertiary)] mx-auto mb-3" />
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Noch keine Meilensteine</h3>
      <p className="text-sm text-[var(--text-secondary)] mb-5">Lade deine vorbereiteten Daten mit einem Klick.</p>
      <p className="text-xs text-[var(--text-tertiary)] mb-4">Stelle sicher dass du vorher die Supabase-Tabelle angelegt hast (SQL in <code className="bg-[var(--bg-elevated)] px-1 rounded">supabase/migrations.sql</code>).</p>
      <button onClick={seed} disabled={seeding}
        className="inline-flex items-center gap-2 bg-[var(--accent)] text-[#0A0A0B] font-semibold rounded-xl px-5 py-2.5 text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
        {seeding ? 'Lädt…' : 'Meilensteine laden'}
      </button>
    </div>
  )

  return (
    <div>
      {/* Hero */}
      {nextMilestone && <HeroCard milestone={nextMilestone} />}

      {/* Szenario switcher */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(['A', 'B', 'C'] as const).map((s) => (
          <button key={s} onClick={() => setScenario(s)}
            className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all',
              scenario === s ? SCENARIO_COLOR_ACTIVE[s] : SCENARIO_COLOR[s]
            )}>
            <span className="font-mono font-bold">{s}</span>
            <span>{SCENARIO_LABEL[s]}</span>
            {scenario === s && <ChevronRight size={11} />}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-2 top-0 bottom-0 w-px bg-[var(--bg-border)]" />

        {/* Base milestones (phase + bm) */}
        <div className="mb-2">
          <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-widest mb-3 pl-8">Phase & BM</p>
          {base.map((m) => (
            <MilestoneNode key={m.id} milestone={m} isNext={nextMilestone?.id === m.id} />
          ))}
        </div>

        {/* Branch label */}
        {branch.length > 0 && (
          <>
            <div className="pl-8 mb-3 flex items-center gap-3">
              <div className="h-px flex-1 bg-[var(--bg-border)] border-dashed" />
              <span className={cn('text-[10px] font-mono font-bold px-2 py-0.5 rounded border',
                SCENARIO_COLOR_ACTIVE[scenario]
              )}>
                Szenario {scenario}
              </span>
              <div className="h-px flex-1 bg-[var(--bg-border)]" />
            </div>
            {branch.map((m) => (
              <MilestoneNode key={m.id} milestone={m} isNext={nextMilestone?.id === m.id} />
            ))}
          </>
        )}
      </div>

    </div>
  )
}
