'use client'

import { useState } from 'react'
import { useSyncedStorage } from '@/hooks/useSyncedStorage'
import { cn } from '@/lib/utils'
import { Plus, X, Trash2 } from 'lucide-react'

// Swiss grading: 6 best, 4 pass
interface Grade { id: string; value: number; label: string }
interface Subject { id: string; name: string; grades: Grade[] }

const TARGET_AVG = 5.0

function avg(grades: Grade[]): number | null {
  if (!grades.length) return null
  return grades.reduce((a, g) => a + g.value, 0) / grades.length
}

function gradeColor(v: number): string {
  if (v >= 5) return '#34D399'
  if (v >= 4) return '#FBBF24'
  return '#F87171'
}

export default function GradeTracker() {
  const [subjects, setSubjects] = useSyncedStorage<Subject[]>('maxos-grades', [])
  const [adding, setAdding] = useState(false)
  const [subjectName, setSubjectName] = useState('')
  const [gradeInput, setGradeInput] = useState<{ [id: string]: string }>({})

  function addSubject(e: React.FormEvent) {
    e.preventDefault()
    if (!subjectName.trim()) return
    setSubjects((p) => [...p, { id: crypto.randomUUID(), name: subjectName.trim(), grades: [] }])
    setSubjectName('')
    setAdding(false)
  }

  function addGrade(subjectId: string) {
    const raw = (gradeInput[subjectId] ?? '').replace(',', '.')
    const v = parseFloat(raw)
    if (isNaN(v) || v < 1 || v > 6) return
    setSubjects((p) => p.map((s) => s.id === subjectId
      ? { ...s, grades: [...s.grades, { id: crypto.randomUUID(), value: v, label: '' }] }
      : s))
    setGradeInput((g) => ({ ...g, [subjectId]: '' }))
  }

  function removeGrade(subjectId: string, gradeId: string) {
    setSubjects((p) => p.map((s) => s.id === subjectId
      ? { ...s, grades: s.grades.filter((g) => g.id !== gradeId) }
      : s))
  }

  const allAvgs = subjects.map((s) => avg(s.grades)).filter((a): a is number => a !== null)
  const overall = allAvgs.length ? allAvgs.reduce((a, b) => a + b, 0) / allAvgs.length : null

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">🎓 Noten (BM)</h2>
        <button onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)] hover:text-[var(--accent)] transition-colors">
          <Plus size={13} /> Fach
        </button>
      </div>

      {overall !== null && (
        <div className="flex items-center gap-3 bg-[var(--bg-elevated)] rounded-xl p-3.5 mb-4">
          <span className="font-mono text-3xl font-bold" style={{ color: gradeColor(overall) }}>
            {overall.toFixed(2)}
          </span>
          <div className="flex-1">
            <p className="text-xs text-[var(--text-secondary)]">Gesamtschnitt</p>
            <p className="text-[10px] text-[var(--text-tertiary)]">
              Ziel: {TARGET_AVG.toFixed(1)} {overall >= TARGET_AVG ? '· erreicht ✓' : `· noch ${(TARGET_AVG - overall).toFixed(2)} fehlen`}
            </p>
          </div>
        </div>
      )}

      {adding && (
        <form onSubmit={addSubject} className="flex gap-2 mb-4">
          <input autoFocus value={subjectName} onChange={(e) => setSubjectName(e.target.value)}
            placeholder="Fach (z.B. Mathematik)…"
            className="flex-1 bg-[var(--bg-elevated)] border border-[var(--bg-border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--accent)]" />
          <button type="submit" className="px-3 bg-[var(--accent)] text-[#0A0A0B] font-semibold rounded-xl text-sm">OK</button>
          <button type="button" onClick={() => setAdding(false)}
            className="px-2.5 rounded-xl border border-[var(--bg-border)] text-[var(--text-tertiary)]"><X size={13} /></button>
        </form>
      )}

      {subjects.length === 0 && !adding && (
        <p className="text-sm text-[var(--text-tertiary)] text-center py-5">
          Füge deine BM-Fächer hinzu sobald es losgeht.
        </p>
      )}

      <div className="space-y-3">
        {subjects.map((s) => {
          const a = avg(s.grades)
          return (
            <div key={s.id} className="bg-[var(--bg-elevated)] rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-sm font-medium text-[var(--text-primary)] flex-1">{s.name}</p>
                {a !== null && (
                  <span className="font-mono text-sm font-bold" style={{ color: gradeColor(a) }}>
                    Ø {a.toFixed(2)}
                  </span>
                )}
                <button onClick={() => setSubjects((p) => p.filter((x) => x.id !== s.id))}
                  className="p-1 text-[var(--text-tertiary)] hover:text-red-400 transition-colors">
                  <Trash2 size={12} />
                </button>
              </div>
              <div className="flex gap-1.5 flex-wrap items-center">
                {s.grades.map((g) => (
                  <button key={g.id} onClick={() => removeGrade(s.id, g.id)}
                    title="Tippen zum Löschen"
                    className="px-2 py-0.5 rounded-lg text-xs font-mono font-semibold border border-transparent hover:border-red-400/50 transition-colors"
                    style={{ color: gradeColor(g.value), background: gradeColor(g.value) + '15' }}>
                    {g.value.toFixed(1)}
                  </button>
                ))}
                <input value={gradeInput[s.id] ?? ''} inputMode="decimal"
                  onChange={(e) => setGradeInput((gi) => ({ ...gi, [s.id]: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && addGrade(s.id)}
                  placeholder="+ Note"
                  className="w-16 bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-lg px-2 py-1 text-xs text-[var(--text-primary)] text-center outline-none focus:border-[var(--accent)]" />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
