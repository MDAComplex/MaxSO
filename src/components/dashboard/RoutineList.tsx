'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { Routine } from '@/types'
import { Flame } from 'lucide-react'

interface RoutineListProps {
  routines: Routine[]
}

export default function RoutineList({ routines: initial }: RoutineListProps) {
  const [routines, setRoutines] = useState(initial)

  function toggle(id: string) {
    setRoutines((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, completed: !r.completed } : r
      )
    )
  }

  return (
    <div className="space-y-1">
      {routines.map((routine) => (
        <button
          key={routine.id}
          onClick={() => toggle(routine.id)}
          className="w-full flex items-center gap-3 py-2.5 px-1 rounded-lg hover:bg-[#18181B] transition-colors group text-left"
        >
          <span className="text-base leading-none">{routine.emoji}</span>
          <span
            className={cn(
              'text-sm flex-1 transition-all duration-200',
              routine.completed
                ? 'line-through text-[#52525B]'
                : 'text-[#E4E4E7] group-hover:text-[#F4F4F5]'
            )}
          >
            {routine.title}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            <Flame
              size={12}
              className={cn(
                routine.completed ? 'text-[#F97316]' : 'text-[#3F3F46]',
                'transition-colors'
              )}
            />
            <span
              className={cn(
                'text-xs tabular-nums',
                routine.completed ? 'text-[#F97316]' : 'text-[#52525B]'
              )}
            >
              {routine.streak}
            </span>
          </div>
          <div
            className={cn(
              'w-4 h-4 rounded border transition-all duration-200 shrink-0',
              routine.completed
                ? 'bg-[#34D399] border-[#34D399]'
                : 'border-[#2A2A30] group-hover:border-[#34D399]'
            )}
          />
        </button>
      ))}
    </div>
  )
}
