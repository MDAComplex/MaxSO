'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const MOCK_MODE = !process.env.NEXT_PUBLIC_SUPABASE_URL

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (MOCK_MODE) {
      // Phase 1 mock login
      await new Promise((r) => setTimeout(r, 600))
      router.push('/')
      return
    }

    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) {
      setError(err.message)
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#111113] border border-[#1F1F23] mb-4">
            <span className="text-lg font-bold text-[#38BDF8]">M</span>
          </div>
          <h1 className="text-2xl font-semibold text-[#F4F4F5] tracking-tight">Max OS</h1>
          <p className="text-sm text-[#52525B] mt-1">Private Productivity Suite</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={MOCK_MODE ? 'demo@example.com' : 'Email'}
              required={!MOCK_MODE}
              className="w-full bg-[#111113] border border-[#1F1F23] rounded-xl px-4 py-3 text-sm text-[#F4F4F5] placeholder-[#3F3F46] outline-none focus:border-[#38BDF8] transition-colors"
            />
          </div>
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={MOCK_MODE ? 'any password' : 'Passwort'}
              required={!MOCK_MODE}
              className="w-full bg-[#111113] border border-[#1F1F23] rounded-xl px-4 py-3 text-sm text-[#F4F4F5] placeholder-[#3F3F46] outline-none focus:border-[#38BDF8] transition-colors"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 px-1">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#38BDF8] text-[#0A0A0B] font-semibold rounded-xl py-3 text-sm transition-all hover:bg-[#7DD3FC] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Einloggen…' : 'Einloggen'}
          </button>
        </form>

        {MOCK_MODE && (
          <p className="text-center text-[10px] text-[#3F3F46] mt-6">
            Mock-Modus — Supabase noch nicht konfiguriert
          </p>
        )}
      </div>
    </div>
  )
}
