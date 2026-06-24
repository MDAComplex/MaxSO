'use client'

import { differenceInCalendarDays, parseISO, format } from 'date-fns'
import { de } from 'date-fns/locale'
import { MILESTONES_SEED } from '@/lib/milestones-seed'

// The key milestones to always show
const HIGHLIGHT_KEYS = [
  'bm_start',
  'bm_abschluss',
  'fh_start',
  'fh_abschluss',
  'yonsei_b_start',
  'yonsei_after_fh',
]

const CAT_EMOJI: Record<string, string> = {
  bm_start: '📚',
  bm_abschluss: '🎓',
  fh_start: '🏛️',
  fh_abschluss: '🎓',
  yonsei_b_start: '🇰🇷',
  yonsei_after_fh: '🇰🇷',
}

const CAT_COLOR: Record<string, string> = {
  phase: '#38BDF8', bm: '#38BDF8', fh: '#34D399', yonsei: '#F87171', exchange: '#A78BFA',
}

const seedMap = Object.fromEntries(MILESTONES_SEED.map(m => [m.key, m]))

function fmt(days: number) {
  if (days === 0) return { main: 'Heute!', sub: '' }
  if (days < 0) return { main: 'Erreicht', sub: '' }
  if (days < 100) return { main: `${days}`, sub: 'Tage' }
  if (days < 365) return { main: `${Math.round(days / 30.5)}`, sub: 'Monate' }
  const y = Math.floor(days / 365)
  const m = Math.round((days % 365) / 30.5)
  return { main: `${y}J ${m}M`, sub: '' }
}

export default function CountdownWidget() {
  const milestones = HIGHLIGHT_KEYS.map(k => seedMap[k]).filter(Boolean)

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-2xl p-5 mb-2">
      <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-widest mb-4">Countdown</p>
      <div className="grid grid-cols-2 gap-3">
        {milestones.map((m) => {
          const days = differenceInCalendarDays(parseISO(m.target_date), new Date())
          const color = CAT_COLOR[m.category] ?? '#38BDF8'
          const emoji = CAT_EMOJI[m.key] ?? '📌'
          const { main, sub } = fmt(days)
          const past = days < 0

          return (
            <div key={m.key} className="bg-[var(--bg-elevated)] rounded-xl p-3.5 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-xl">{emoji}</span>
                {past && <span className="text-[10px] text-emerald-400 font-medium">✓</span>}
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold font-mono tabular-nums leading-none" style={{ color: past ? 'var(--text-tertiary)' : color }}>
                  {main}
                </span>
                {sub && <span className="text-xs font-medium" style={{ color: past ? 'var(--text-tertiary)' : color }}>{sub}</span>}
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] leading-tight mt-0.5">{m.label}</p>
              <p className="text-[10px] text-[var(--text-tertiary)]">
                {format(parseISO(m.target_date), 'dd.MM.yyyy', { locale: de })}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
