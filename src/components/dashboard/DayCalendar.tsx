'use client'

import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import type { CalendarEvent } from '@/types'

const HOUR_START = 6
const HOUR_END = 23
const HOUR_HEIGHT = 64 // px per hour

function timeToOffset(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return (h - HOUR_START) * HOUR_HEIGHT + (m / 60) * HOUR_HEIGHT
}

function eventDurationPx(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  const mins = (eh * 60 + em) - (sh * 60 + sm)
  return (mins / 60) * HOUR_HEIGHT
}

const SOURCE_STYLES: Record<string, string> = {
  calendar: 'bg-[#18181B] border-l-2 border-l-[#38BDF8]',
  todoist: 'bg-[#18181B] border-l-2 border-l-[#A78BFA]',
  routine: 'bg-[#18181B] border-l-2 border-l-[#34D399]',
}

const SOURCE_DOT: Record<string, string> = {
  calendar: 'bg-[#38BDF8]',
  todoist: 'bg-[#A78BFA]',
  routine: 'bg-[#34D399]',
}

const SOURCE_LABEL: Record<string, string> = {
  calendar: 'Calendar',
  todoist: 'Todoist',
  routine: 'Routine',
}

interface DayCalendarProps {
  events: CalendarEvent[]
}

export default function DayCalendar({ events }: DayCalendarProps) {
  const [nowOffset, setNowOffset] = useState<number | null>(null)
  const nowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function updateNow() {
      const now = new Date()
      const h = now.getHours()
      const m = now.getMinutes()
      if (h >= HOUR_START && h <= HOUR_END) {
        setNowOffset((h - HOUR_START) * HOUR_HEIGHT + (m / 60) * HOUR_HEIGHT)
      }
    }
    updateNow()
    const id = setInterval(updateNow, 60_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    nowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [nowOffset])

  const hours = Array.from({ length: HOUR_END - HOUR_START + 1 }, (_, i) => HOUR_START + i)
  const totalHeight = (HOUR_END - HOUR_START + 1) * HOUR_HEIGHT

  return (
    <div className="relative overflow-y-auto max-h-[calc(100vh-12rem)] pr-2 scrollbar-thin">
      <div className="relative" style={{ height: totalHeight }}>
        {/* Hour lines */}
        {hours.map((h) => (
          <div
            key={h}
            className="absolute left-0 right-0 flex items-start"
            style={{ top: (h - HOUR_START) * HOUR_HEIGHT }}
          >
            <span className="text-xs text-[#3F3F46] w-10 shrink-0 -mt-2 select-none">
              {h.toString().padStart(2, '0')}:00
            </span>
            <div className="flex-1 h-px bg-[#1F1F23] mt-0" />
          </div>
        ))}

        {/* Events */}
        <div className="absolute left-12 right-0 top-0">
          {events.map((event) => {
            const top = timeToOffset(event.startTime)
            const height = Math.max(eventDurationPx(event.startTime, event.endTime), 28)
            return (
              <div
                key={event.id}
                className={cn(
                  'absolute left-0 right-1 rounded-lg px-2.5 py-1.5 cursor-pointer',
                  'transition-all duration-150 hover:brightness-110',
                  SOURCE_STYLES[event.source]
                )}
                style={{ top, height }}
              >
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <div className={cn('w-1.5 h-1.5 rounded-full shrink-0', SOURCE_DOT[event.source])} />
                  <span className="text-xs font-medium text-[#F4F4F5] truncate">{event.title}</span>
                </div>
                {height > 40 && (
                  <div className="flex items-center gap-1 mt-0.5 ml-3">
                    <span className="text-[10px] text-[#71717A]">
                      {event.startTime} – {event.endTime}
                    </span>
                    <span className="text-[10px] text-[#3F3F46]">·</span>
                    <span className="text-[10px] text-[#52525B]">{SOURCE_LABEL[event.source]}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Now line */}
        {nowOffset !== null && (
          <div
            ref={nowRef}
            className="absolute left-10 right-0 flex items-center pointer-events-none z-10"
            style={{ top: nowOffset }}
          >
            <div className="w-2 h-2 rounded-full bg-[#38BDF8] -ml-1" />
            <div className="flex-1 h-px bg-[#38BDF8]" />
          </div>
        )}
      </div>
    </div>
  )
}
