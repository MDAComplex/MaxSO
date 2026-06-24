'use client'

import { useEffect, useState } from 'react'
import { differenceInCalendarDays, parseISO } from 'date-fns'

interface Milestone {
  id: string
  key: string
  label: string
  category: string
  target_date: string
}

const CAT_EMOJI: Record<string, string> = {
  p2_ende: '🏁', p3_start: '🚀', p3_checkpoint: '🔍', p4_start: '⚡',
  bm_start: '📚', bm_hs_ende: '❄️', bm_fs_start: '🌱', bm_pruefungen: '📝', bm_abschluss: '🎓',
  fh_frist: '📬', fh_start: '🏛️', fh_abschluss: '🎓',
  yonsei_after_fh: '🇰🇷', yonsei_b_frist_fall: '📬', yonsei_b_frist_spr: '📬',
  yonsei_b_start: '🇰🇷', yonsei_b_abschluss: '🎓',
  exchange_apply: '📮', exchange_start: '✈️', exchange_ende: '🏠',
}

const CAT_COLOR: Record<string, string> = {
  phase: 'text-sky-400',
  bm: 'text-sky-400',
  fh: 'text-emerald-400',
  yonsei: 'text-rose-400',
  exchange: 'text-violet-400',
}

function fmt(days: number): string {
  if (days < 0) return 'Erreicht ✓'
  if (days === 0) return 'Heute!'
  if (days === 1) return '1 Tag'
  if (days < 100) return `${days} Tage`
  const months = Math.round(days / 30.5)
  return `~${months} Monate`
}

export default function CountdownWidget() {
  const [milestones, setMilestones] = useState<Milestone[]>([])

  useEffect(() => {
    fetch('/api/milestones')
      .then(r => r.json())
      .then(d => {
        const all: Milestone[] = d.milestones ?? []
        const future = all
          .filter(m => differenceInCalendarDays(parseISO(m.target_date), new Date()) >= -1)
          .slice(0, 4)
        setMilestones(future)
      })
  }, [])

  if (milestones.length === 0) return null

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-2xl p-4 mb-4">
      <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-widest mb-3">Nächste Meilensteine</p>
      <div className="space-y-2.5">
        {milestones.map((m) => {
          const days = differenceInCalendarDays(parseISO(m.target_date), new Date())
          const color = CAT_COLOR[m.category] ?? 'text-sky-400'
          const emoji = CAT_EMOJI[m.key] ?? '📌'
          return (
            <div key={m.id} className="flex items-center gap-3">
              <span className="text-base w-6 shrink-0">{emoji}</span>
              <p className="text-sm text-[var(--text-primary)] flex-1 leading-tight truncate">{m.label}</p>
              <span className={`text-sm font-mono font-bold shrink-0 ${color}`}>
                {fmt(days)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
