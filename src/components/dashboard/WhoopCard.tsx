'use client'

import { cn } from '@/lib/utils'
import type { WhoopData } from '@/types'
import { Heart, Moon, Zap } from 'lucide-react'

function RecoveryRing({ value }: { value: number }) {
  const color = value >= 67 ? '#34D399' : value >= 34 ? '#FBBF24' : '#F87171'
  const r = 22
  const circ = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ

  return (
    <div className="relative w-14 h-14 shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r={r} fill="none" stroke="#27272A" strokeWidth="4" />
        <circle
          cx="28" cy="28" r={r}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-semibold" style={{ color }}>{value}%</span>
      </div>
    </div>
  )
}

interface WhoopCardProps {
  data: WhoopData
}

export default function WhoopCard({ data }: WhoopCardProps) {
  return (
    <div className="flex items-center gap-4">
      <RecoveryRing value={data.recovery} />
      <div className="grid grid-cols-3 gap-3 flex-1">
        <Metric icon={<Heart size={12} />} label="HRV" value={`${data.hrv}ms`} />
        <Metric icon={<Heart size={12} />} label="RHR" value={`${data.restingHr}bpm`} />
        <Metric icon={<Zap size={12} />} label="Strain" value={data.strain.toFixed(1)} />
        <Metric icon={<Moon size={12} />} label="Schlaf" value={`${data.sleep.duration}h`} />
        <Metric icon={<Moon size={12} />} label="Perf." value={`${data.sleep.performance}%`} />
        <Metric icon={<Moon size={12} />} label="Effiz." value={`${data.sleep.efficiency}%`} />
      </div>
    </div>
  )
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-1 text-[#52525B]">
        {icon}
        <span className="text-[10px]">{label}</span>
      </div>
      <span className="text-sm font-medium text-[#E4E4E7]">{value}</span>
    </div>
  )
}
