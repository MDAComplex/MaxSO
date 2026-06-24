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

  // No Supabase configured → show setup hint
  const notConfigured = !process.env.NEXT_PUBLIC_SUPABASE_URL

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (notConfigured) return
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })

    if (err) {
      setError('Ungültige Zugangsdaten.')
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center px-4">
      <div className="w-full max-w-[360px]">

        {/* Logo mark */}
        <div className="flex flex-col items-center mb-12">
          <div className="w-11 h-11 rounded-2xl bg-[#111113] border border-[#1F1F23] flex items-center justify-center mb-5">
            <span className="text-[#38BDF8] font-bold text-xl tracking-tight">M</span>
          </div>
          <h1 className="text-[22px] font-semibold text-[#F4F4F5] tracking-tight">Max OS</h1>
          <p className="text-sm text-[#3F3F46] mt-1">Privater Bereich</p>
        </div>

        {notConfigured ? (
          <div className="bg-[#111113] border border-[#1F1F23] rounded-2xl p-5 text-center">
            <p className="text-sm text-[#71717A] leading-relaxed">
              Supabase noch nicht konfiguriert.<br />
              Trage <span className="text-[#F4F4F5] font-mono text-xs">NEXT_PUBLIC_SUPABASE_URL</span> und <span className="text-[#F4F4F5] font-mono text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</span> in den Vercel Environment Variables ein.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              autoComplete="email"
              className="w-full bg-[#111113] border border-[#1F1F23] rounded-xl px-4 py-3.5 text-sm text-[#F4F4F5] placeholder-[#3F3F46] outline-none focus:border-[#38BDF8] transition-colors"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Passwort"
              required
              autoComplete="current-password"
              className="w-full bg-[#111113] border border-[#1F1F23] rounded-xl px-4 py-3.5 text-sm text-[#F4F4F5] placeholder-[#3F3F46] outline-none focus:border-[#38BDF8] transition-colors"
            />

            {error && (
              <p className="text-xs text-red-400 px-1">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1 bg-[#38BDF8] hover:bg-[#7DD3FC] text-[#0A0A0B] font-semibold rounded-xl py-3.5 text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Einloggen…' : 'Einloggen'}
            </button>
          </form>
        )}

      </div>
    </div>
  )
}
