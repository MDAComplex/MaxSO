'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

/**
 * Like useLocalStorage, but also syncs to Supabase (user_data table)
 * via /api/userdata. localStorage is the fast cache, server is the
 * source of truth across devices. Fails silently if offline/table missing.
 */
export function useSyncedStorage<T>(
  key: string,
  initial: T
): [T, (v: T | ((p: T) => T)) => void, boolean] {
  const [value, setValue] = useState<T>(initial)
  const [loaded, setLoaded] = useState(false)
  const canPush = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let cancelled = false
    try {
      const raw = localStorage.getItem(key)
      if (raw) setValue(JSON.parse(raw))
    } catch {}

    fetch(`/api/userdata?key=${encodeURIComponent(key)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d && d.data !== undefined && d.data !== null) {
          setValue(d.data)
          try { localStorage.setItem(key, JSON.stringify(d.data)) } catch {}
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) { setLoaded(true); canPush.current = true }
      })

    return () => { cancelled = true }
  }, [key])

  const set = useCallback((v: T | ((p: T) => T)) => {
    setValue((prev) => {
      const next = typeof v === 'function' ? (v as (p: T) => T)(prev) : v
      try { localStorage.setItem(key, JSON.stringify(next)) } catch {}
      if (canPush.current) {
        if (timer.current) clearTimeout(timer.current)
        timer.current = setTimeout(() => {
          fetch('/api/userdata', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key, data: next }),
          }).catch(() => {})
        }, 800)
      }
      return next
    })
  }, [key])

  return [value, set, loaded]
}
