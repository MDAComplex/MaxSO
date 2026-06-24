'use client'

import { differenceInCalendarDays, parseISO } from 'date-fns'
import { MILESTONES_SEED } from '@/lib/milestones-seed'

const CAT_EMOJI: Record<string, string> = {
  p2_ende: '🏁', p3_start: '🚀', p3_checkpoint: '🔍', p4_start: '⚡',
  bm_start: '📚', bm_hs_ende: '❄️', bm_fs_start: '🌱', bm_pruefungen: '📝', bm_abschluss: '🎓',
  fh_frist: '📬', fh_start: '🏛️', fh_abschluss: '🎓',
  yonsei_after_fh: '🇰🇷', yonsei_b_frist_fall: '📬', yonsei_b_frist_spr: '📬',
  yonsei_b_start: '🇰🇷', yonsei_b_abschluss: '🎓',
  exchange_apply: '📮', exchange_start: '✈️', exchange_ende: '🏠',
}

const CAT_COLOR: Record<string, string> = {
  phase: '#38BDF8', bm: '#38BDF8', fh: '#34D399', yonsei: '#F87171', exchange: '#A78BFA',
}

function fmt(days: number): string {
  if (days === 0) return 'Heute!'
  if (days === 1) return '1 Tag'
  if (days < 100) return `${days} Tage`
  const months = Math.round(days / 30.5)
  return `~${months} Mo.`
}

const upcoming = MILESTONES_SEED
  .filter(m => differenceInCalendarDays(parseISO(m.target_date), new Date()) >= 0)
  .slice(0, 5)

export default function CountdownWidget() {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-2xl p-4 mb-1">
      <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-widest mb-3">Nächste Meilensteine</p>
      <div className="space-y-3">
        {upcoming.map((m) => {
          const days = differenceInCalendarDays(parseISO(m.target_date), new Date())
          const color = CAT_COLOR[m.category] ?? '#38BDF8'
          const emoji = CAT_EMOJI[m.key] ?? '📌'
          return (
            <div key={m.key} className="flex items-center gap-3">
              <span className="text-lg w-7 shrink-0 text-center">{emoji}</span>
              <p className="text-sm text-[var(--text-primary)] flex-1 leading-tight">{m.label}</p>
              <span className="text-sm font-mono font-bold shrink-0 tabular-nums" style={{ color }}>
                {fmt(days)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
