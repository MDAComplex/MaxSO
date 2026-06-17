'use client'

import { useEffect, useState } from 'react'
import { formatDate } from '@/lib/utils'
import { LogOut } from 'lucide-react'

interface HeaderProps {
  onLogout?: () => void
  userName?: string
  isAuthenticated?: boolean
}

export default function Header({ onLogout, userName, isAuthenticated }: HeaderProps) {
  const [dateStr, setDateStr] = useState('')
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    const now = new Date()
    setDateStr(formatDate(now))
    const h = now.getHours()
    if (h < 12) setGreeting('Guten Morgen')
    else if (h < 18) setGreeting('Guten Tag')
    else setGreeting('Guten Abend')
  }, [])

  return (
    <header className="flex items-center justify-between py-6 px-4 md:px-6">
      <div>
        <p className="text-xs text-[#52525B] uppercase tracking-widest mb-0.5">Max OS</p>
        <h1 className="text-2xl font-semibold text-[#F4F4F5] tracking-tight">{dateStr}</h1>
        {userName && (
          <p className="text-sm text-[#71717A] mt-0.5">{greeting}, {userName}</p>
        )}
        {!userName && (
          <p className="text-sm text-[#71717A] mt-0.5">{greeting}</p>
        )}
      </div>

      {isAuthenticated && onLogout && (
        <button
          onClick={onLogout}
          className="flex items-center gap-2 text-[#52525B] hover:text-[#F4F4F5] transition-colors text-sm"
        >
          <LogOut size={14} />
          <span className="hidden md:inline">Logout</span>
        </button>
      )}
    </header>
  )
}
