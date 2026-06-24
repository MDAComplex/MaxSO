'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { WhoopDashboard } from '@/types'
import WhoopPanel from './WhoopDashboard'
import { LogOut } from 'lucide-react'
import { Suspense } from 'react'

function formatDate() {
  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())
}

function Inner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [whoop, setWhoop] = useState<WhoopDashboard | null>(null)
  const [loadingWhoop, setLoadingWhoop] = useState(true)
  const [whoopBanner, setWhoopBanner] = useState<'connected' | 'error' | null>(null)

  const fetchWhoop = useCallback(async () => {
    setLoadingWhoop(true)
    try {
      const res = await fetch('/api/whoop')
      const data = await res.json()
      setWhoop(data)
    } catch {
      setWhoop({ connected: false, recovery: null, sleep: null, workouts: [], strain: null })
    } finally {
      setLoadingWhoop(false)
    }
  }, [])

  useEffect(() => {
    fetchWhoop()
  }, [fetchWhoop])

  useEffect(() => {
    const status = searchParams.get('whoop')
    if (status === 'connected') {
      setWhoopBanner('connected')
      fetchWhoop()
      setTimeout(() => setWhoopBanner(null), 4000)
    } else if (status === 'error') {
      setWhoopBanner('error')
      setTimeout(() => setWhoopBanner(null), 4000)
    }
  }, [searchParams, fetchWhoop])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  async function handleWhoopDisconnect() {
    await fetch('/api/whoop', { method: 'DELETE' })
    fetchWhoop()
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      {/* Banner */}
      {whoopBanner && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-lg transition-all ${
          whoopBanner === 'connected'
            ? 'bg-[#34D399]/10 border border-[#34D399]/30 text-[#34D399]'
            : 'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}>
          {whoopBanner === 'connected' ? '✓ Whoop verbunden' : '✗ Whoop-Verbindung fehlgeschlagen'}
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 pb-16">
        {/* Header */}
        <header className="flex items-start justify-between pt-10 pb-8">
          <div>
            <p className="text-[11px] text-[#3F3F46] uppercase tracking-[0.15em] mb-1">Max OS</p>
            <h1 className="text-2xl font-semibold text-[#F4F4F5] tracking-tight leading-tight">
              {formatDate()}
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="mt-1 p-2 rounded-lg text-[#3F3F46] hover:text-[#A1A1AA] hover:bg-[#111113] transition-colors"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </header>

        {/* Whoop Section */}
        <WhoopPanel
          data={whoop}
          loading={loadingWhoop}
          onDisconnect={handleWhoopDisconnect}
          onRefresh={fetchWhoop}
        />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense>
      <Inner />
    </Suspense>
  )
}
