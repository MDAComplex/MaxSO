'use client'

import { cn } from '@/lib/utils'

interface WeekDay {
  day: string
  load: number
  isToday: boolean
}

interface WeekOverviewProps {
  days: WeekDay[]
}

export default function WeekOverview({ days }: WeekOverviewProps) {
  return (
    <div className="flex gap-1.5 items-end h-12">
      {days.map(({ day, load, isToday }) => (
        <div key={day} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full flex items-end justify-center" style={{ height: '36px' }}>
            <div
              className={cn(
                'w-full rounded-sm transition-all duration-300',
                isToday ? 'bg-[#38BDF8]' : 'bg-[#27272A]'
              )}
              style={{ height: `${Math.max(load * 36, 4)}px` }}
            />
          </div>
          <span
            className={cn(
              'text-[10px] tabular-nums',
              isToday ? 'text-[#38BDF8]' : 'text-[#52525B]'
            )}
          >
            {day}
          </span>
        </div>
      ))}
    </div>
  )
}
