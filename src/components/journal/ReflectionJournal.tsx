'use client'

import { useState, useEffect, useCallback } from 'react'
import { format, parseISO, subDays } from 'date-fns'
import { de } from 'date-fns/locale'
import { Save, ChevronLeft, ChevronRight, BookOpen, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Reflection {
  id?: string
  date: string
  mood: number
  energy: number
  wins: string
  challenges: string
  tomorrow: string
  gratitude: string
  free_text: string
}

const MOOD_EMOJI = ['', '😫', '😔', '😐', '😊', '🔥']
const MOOD_LABEL = ['', 'Schlecht', 'Okay', 'Neutral', 'Gut', 'Sehr gut']
const ENERGY_EMOJI = ['', '🪫', '😴', '⚡', '💪', '🚀']

const EMPTY: Omit<Reflection, 'date'> = { mood: 0, energy: 0, wins: '', challenges: '', tomorrow: '', gratitude: '', free_text: '' }

const PROMPTS = {
  wins: '🏆 Was lief heute gut?',
  challenges: '🌊 Was war herausfordernd?',
  tomorrow: '🎯 Mein Fokus morgen',
  gratitude: '🙏 Wofür bin ich dankbar?',
  free_text: '📝 Freie Gedanken',
}

function todayStr() { return new Date().toISOString().split('T')[0] }

function MoodPicker({ value, onChange, emojis, label }: {
  value: number; onChange: (v: number) => void; emojis: string[]; label: string
}) {
  return (
    <div>
      <p className="text-xs text-[var(--text-tertiary)] mb-2">{label}</p>
      <div className="flex gap-2">
        {[1,2,3,4,5].map((v) => (
          <button key={v} type="button" onClick={() => onChange(v)}
            className={cn(
              'flex-1 py-2 rounded-xl border text-lg transition-all',
              value === v
                ? 'border-[var(--accent)] bg-[var(--accent)]/10 scale-105'
                : 'border-[var(--bg-border)] bg-[var(--bg-elevated)] hover:border-[var(--bg-border-hover)]'
            )}>
            {emojis[v]}
          </button>
        ))}
      </div>
    </div>
  )
}

function TextArea({ label, value, onChange, rows = 3 }: {
  label: string; value: string; onChange: (v: string) => void; rows?: number
}) {
  return (
    <div>
      <p className="text-xs text-[var(--text-tertiary)] mb-2">{label}</p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full bg-[var(--bg-elevated)] border border-[var(--bg-border)] rounded-xl px-3.5 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] resize-none transition-colors leading-relaxed"
        placeholder="…"
      />
    </div>
  )
}

function PastEntry({ entry }: { entry: Reflection }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-[var(--bg-border)] rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[var(--bg-elevated)] transition-colors text-left">
        <div className="flex items-center gap-3">
          <span className="text-base">{MOOD_EMOJI[entry.mood] || '—'}</span>
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {format(parseISO(entry.date), 'EEEE, d. MMMM', { locale: de })}
            </p>
            {entry.wins && (
              <p className="text-xs text-[var(--text-secondary)] truncate max-w-[200px]">{entry.wins}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {entry.energy > 0 && <span className="text-base">{ENERGY_EMOJI[entry.energy]}</span>}
          <ChevronRight size={14} className={cn('text-[var(--text-tertiary)] transition-transform', open && 'rotate-90')} />
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-[var(--bg-border)]">
          {entry.wins && <div className="pt-3"><p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Wins</p><p className="text-sm text-[var(--text-primary)] leading-relaxed">{entry.wins}</p></div>}
          {entry.challenges && <div><p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Challenges</p><p className="text-sm text-[var(--text-primary)] leading-relaxed">{entry.challenges}</p></div>}
          {entry.tomorrow && <div><p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Morgen</p><p className="text-sm text-[var(--text-primary)] leading-relaxed">{entry.tomorrow}</p></div>}
          {entry.gratitude && <div><p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Dankbarkeit</p><p className="text-sm text-[var(--text-primary)] leading-relaxed">{entry.gratitude}</p></div>}
          {entry.free_text && <div><p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Freie Gedanken</p><p className="text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">{entry.free_text}</p></div>}
        </div>
      )}
    </div>
  )
}

const NO_SUPABASE = !process.env.NEXT_PUBLIC_SUPABASE_URL

export default function ReflectionJournal() {
  const [today] = useState(todayStr)
  const [form, setForm] = useState<Omit<Reflection, 'date'>>(EMPTY)
  const [past, setPast] = useState<Reflection[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const load = useCallback(async () => {
    if (NO_SUPABASE) return
    const res = await fetch('/api/reflections')
    const data = await res.json()
    const entries: Reflection[] = data.reflections ?? []
    const todayEntry = entries.find((e) => e.date === today)
    if (todayEntry) setForm({ mood: todayEntry.mood, energy: todayEntry.energy, wins: todayEntry.wins, challenges: todayEntry.challenges, tomorrow: todayEntry.tomorrow, gratitude: todayEntry.gratitude, free_text: todayEntry.free_text })
    setPast(entries.filter((e) => e.date !== today))
  }, [today])

  useEffect(() => { load() }, [load])

  async function save() {
    if (NO_SUPABASE) { setSaved(true); setTimeout(() => setSaved(false), 2000); return }
    setSaving(true)
    await fetch('/api/reflections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: today, ...form }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function setField(field: keyof typeof EMPTY) {
    return (v: string | number) => setForm((prev) => ({ ...prev, [field]: v }))
  }

  const hour = new Date().getHours()
  const greeting = hour >= 20 ? 'Guten Abend' : hour >= 17 ? 'Guten Abend' : 'Reflexion'

  return (
    <div>
      {/* Today's entry */}
      <div className="bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-2 mb-5">
          <Moon size={15} className="text-[var(--accent)]" />
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">{greeting} — Tagesreflexion</h2>
            <p className="text-xs text-[var(--text-tertiary)]">{format(parseISO(today), 'EEEE, d. MMMM yyyy', { locale: de })}</p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <MoodPicker value={form.mood} onChange={setField('mood') as (v: number) => void} emojis={MOOD_EMOJI} label="Stimmung" />
            <MoodPicker value={form.energy} onChange={setField('energy') as (v: number) => void} emojis={ENERGY_EMOJI} label="Energie" />
          </div>

          <TextArea label={PROMPTS.wins} value={form.wins} onChange={setField('wins') as (v: string) => void} />
          <TextArea label={PROMPTS.challenges} value={form.challenges} onChange={setField('challenges') as (v: string) => void} />
          <TextArea label={PROMPTS.tomorrow} value={form.tomorrow} onChange={setField('tomorrow') as (v: string) => void} rows={2} />
          <TextArea label={PROMPTS.gratitude} value={form.gratitude} onChange={setField('gratitude') as (v: string) => void} rows={2} />
          <TextArea label={PROMPTS.free_text} value={form.free_text} onChange={setField('free_text') as (v: string) => void} rows={4} />

          <button onClick={save} disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-[var(--accent)] text-[#0A0A0B] font-semibold rounded-xl py-3 text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
            {saved ? '✓ Gespeichert' : saving ? 'Speichert…' : <><Save size={14} /> Speichern</>}
          </button>
        </div>
      </div>

      {/* Past entries */}
      {past.length > 0 && (
        <div className="bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={14} className="text-[var(--text-tertiary)]" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Vergangene Einträge</h3>
          </div>
          <div className="space-y-2">
            {past.slice(0, 10).map((entry) => (
              <PastEntry key={entry.date} entry={entry} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
