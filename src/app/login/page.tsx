'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const notConfigured = !process.env.NEXT_PUBLIC_SUPABASE_URL

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (notConfigured) return
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) { setError('Ungültige Zugangsdaten.'); setLoading(false) }
    else { router.push('/'); router.refresh() }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center px-4">
      <div className="w-full max-w-[360px]">
        <div className="flex flex-col items-center mb-10">
          <div className="w-12 h-12 rounded-2xl bg-[var(--bg-surface)] border border-[var(--bg-border)] flex items-center justify-center mb-5">
            <span className="text-[var(--accent)] font-bold text-xl">M</span>
          </div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight">Max OS</h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">Privater Bereich</p>
        </div>

        {notConfigured ? (
          <div className="bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-2xl p-5 text-center">
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Supabase noch nicht konfiguriert.<br />
              Trage die Env-Variablen in Vercel ein.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="Email" required autoComplete="email"
              className="w-full bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-xl px-4 py-3.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] transition-colors" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Passwort" required autoComplete="current-password"
              className="w-full bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-xl px-4 py-3.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] transition-colors" />
            {error && <p className="text-xs text-red-400 px-1">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-[var(--accent)] text-[#0A0A0B] font-semibold rounded-xl py-3.5 text-sm hover:opacity-90 transition-opacity disabled:opacity-40">
              {loading ? 'Einloggen…' : 'Einloggen'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
