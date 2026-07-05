'use client'

import { useEffect, useState } from 'react'
import { Bell, BellOff } from 'lucide-react'

const REMINDER_HOUR = 21 // 21:00 journal reminder

export default function NotificationCard() {
  const [status, setStatus] = useState<'unsupported' | 'default' | 'granted' | 'denied'>('default')

  useEffect(() => {
    if (typeof Notification === 'undefined') { setStatus('unsupported'); return }
    setStatus(Notification.permission as 'default' | 'granted' | 'denied')
  }, [])

  // While the app is open, fire the 21:00 journal reminder once per day
  useEffect(() => {
    if (status !== 'granted') return
    const id = setInterval(() => {
      const now = new Date()
      const key = 'maxos-last-journal-reminder'
      const today = now.toISOString().split('T')[0]
      if (now.getHours() === REMINDER_HOUR && localStorage.getItem(key) !== today) {
        localStorage.setItem(key, today)
        new Notification('Max OS 📓', { body: 'Zeit für dein Abend-Journal. Wie war dein Tag?' })
      }
    }, 60_000)
    return () => clearInterval(id)
  }, [status])

  if (status === 'unsupported' || status === 'granted' || status === 'denied') return null

  return (
    <button
      onClick={() => Notification.requestPermission().then((p) => setStatus(p as 'granted' | 'denied'))}
      className="w-full flex items-center gap-3 bg-[var(--bg-surface)] border border-dashed border-[var(--bg-border)] rounded-2xl p-4 text-left hover:border-[var(--accent)] transition-colors">
      <Bell size={16} className="text-[var(--accent)] shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium text-[var(--text-primary)]">Erinnerungen aktivieren</p>
        <p className="text-[11px] text-[var(--text-tertiary)]">Journal-Reminder um 21:00 Uhr</p>
      </div>
    </button>
  )
}
