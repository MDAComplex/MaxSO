'use client'

import type { WhoopDashboard as WhoopData } from '@/types'
import { RefreshCw, Link2, Link2Off, Moon, Zap, Heart, Activity, Clock } from 'lucide-react'

function msToHours(ms: number) {
  return Math.round((ms / 3_600_000) * 10) / 10
}

function msToHHMM(ms: number) {
  const total = Math.round(ms / 60_000)
  const h = Math.floor(total / 60)
  const m = total % 60
  return `${h}h ${m.toString().padStart(2, '0')}m`
}

function RecoveryRing({ score, size = 96 }: { score: number; size?: number }) {
  const r = (size / 2) - 8
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 67 ? '#34D399' : score >= 34 ? '#FBBF24' : '#F87171'

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1F1F23" strokeWidth="6" />
        <circle
          cx={size/2} cy={size/2} r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold" style={{ color }}>{score}%</span>
        <span className="text-[9px] text-[#52525B] uppercase tracking-wider mt-0.5">Recovery</span>
      </div>
    </div>
  )
}

function StrainBar({ strain }: { strain: number }) {
  const max = 21
  const pct = Math.min((strain / max) * 100, 100)
  const color = strain >= 18 ? '#F87171' : strain >= 14 ? '#FB923C' : strain >= 10 ? '#FBBF24' : '#38BDF8'
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs text-[#52525B]">Day Strain</span>
        <span className="text-sm font-semibold text-[#F4F4F5]">{strain.toFixed(1)}</span>
      </div>
      <div className="h-1.5 bg-[#1F1F23] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

function SleepStage({ label, ms, color }: { label: string; ms: number; color: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-[#1A1A1D] last:border-0">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full" style={{ background: color }} />
        <span className="text-xs text-[#71717A]">{label}</span>
      </div>
      <span className="text-xs font-medium text-[#A1A1AA]">{msToHHMM(ms)}</span>
    </div>
  )
}

interface Props {
  data: WhoopData | null
  loading: boolean
  onDisconnect: () => void
  onRefresh: () => void
}

export default function WhoopDashboard({ data, loading, onDisconnect, onRefresh }: Props) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1,2,3].map(i => (
          <div key={i} className="bg-[#111113] border border-[#1F1F23] rounded-2xl p-5 animate-pulse">
            <div className="h-4 bg-[#1F1F23] rounded w-24 mb-3" />
            <div className="h-16 bg-[#1F1F23] rounded" />
          </div>
        ))}
      </div>
    )
  }

  // Not connected
  if (!data?.connected) {
    return (
      <div className="bg-[#111113] border border-[#1F1F23] rounded-2xl p-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#18181B] border border-[#27272A] flex items-center justify-center mx-auto mb-4">
          <Activity size={20} className="text-[#3F3F46]" />
        </div>
        <h2 className="text-[#F4F4F5] font-medium mb-1.5">Whoop verbinden</h2>
        <p className="text-sm text-[#52525B] mb-6 leading-relaxed">
          Verbinde dein Whoop-Konto um Recovery,<br />Schlaf und Strain-Daten zu sehen.
        </p>
        <a
          href="/api/auth/whoop"
          className="inline-flex items-center gap-2 bg-[#38BDF8] hover:bg-[#7DD3FC] text-[#0A0A0B] font-semibold rounded-xl px-5 py-2.5 text-sm transition-colors"
        >
          <Link2 size={14} />
          Whoop verbinden
        </a>
      </div>
    )
  }

  const { recovery, sleep, workouts, strain } = data

  return (
    <div className="space-y-3">

      {/* Toolbar */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-[#3F3F46] uppercase tracking-wider">Whoop</span>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="p-1.5 rounded-lg text-[#3F3F46] hover:text-[#A1A1AA] hover:bg-[#111113] transition-colors"
            title="Aktualisieren"
          >
            <RefreshCw size={13} />
          </button>
          <button
            onClick={onDisconnect}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[#3F3F46] hover:text-red-400 hover:bg-[#111113] transition-colors text-xs"
            title="Trennen"
          >
            <Link2Off size={12} />
            Trennen
          </button>
        </div>
      </div>

      {/* Recovery + Strain */}
      <div className="bg-[#111113] border border-[#1F1F23] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <p className="text-xs text-[#52525B] uppercase tracking-wider">Recovery</p>
          {recovery?.date && (
            <span className="text-[10px] text-[#3F3F46]">{recovery.date}</span>
          )}
        </div>

        {recovery ? (
          <div className="flex items-center gap-6">
            <RecoveryRing score={recovery.recovery_score} />
            <div className="flex-1 space-y-3">
              <StatRow icon={<Heart size={13} />} label="HRV" value={`${recovery.hrv_rmssd_milli} ms`} />
              <StatRow icon={<Heart size={13} />} label="Ruhe-HR" value={`${recovery.resting_heart_rate} bpm`} />
              {strain !== null && (
                <div className="pt-1">
                  <StrainBar strain={strain} />
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-[#52525B]">Keine Recovery-Daten verfügbar.</p>
        )}
      </div>

      {/* Sleep */}
      <div className="bg-[#111113] border border-[#1F1F23] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <p className="text-xs text-[#52525B] uppercase tracking-wider">Schlaf</p>
          {sleep?.date && (
            <span className="text-[10px] text-[#3F3F46]">{sleep.date}</span>
          )}
        </div>

        {sleep ? (
          <div>
            {/* Top metrics */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <MetricBox
                icon={<Moon size={13} />}
                label="Im Bett"
                value={msToHours(sleep.total_in_bed_time_milli) + 'h'}
              />
              <MetricBox
                icon={<Moon size={13} />}
                label="Schlafdauer"
                value={msToHours(sleep.total_sleep_time_milli) + 'h'}
              />
              <MetricBox
                icon={<Clock size={13} />}
                label="Latenz"
                value={Math.round(sleep.latency_milli / 60_000) + ' min'}
              />
            </div>

            {/* Performance bars */}
            <div className="space-y-2.5 mb-5">
              <ScoreBar label="Performance" value={sleep.sleep_performance_percentage} color="#38BDF8" />
              <ScoreBar label="Effizienz" value={sleep.sleep_efficiency_percentage} color="#A78BFA" />
              <ScoreBar label="Konsistenz" value={sleep.sleep_consistency_percentage} color="#34D399" />
            </div>

            {/* Sleep stages */}
            <div className="bg-[#0D0D0F] rounded-xl p-3.5">
              <SleepStage label="Leichtschlaf" ms={sleep.light_sleep_time_milli} color="#6366F1" />
              <SleepStage label="Tiefschlaf (SWS)" ms={sleep.slow_wave_sleep_time_milli} color="#818CF8" />
              <SleepStage label="REM" ms={sleep.rem_sleep_time_milli} color="#A78BFA" />
              <div className="flex items-center justify-between pt-1.5 mt-1.5">
                <span className="text-xs text-[#52525B]">Störungen</span>
                <span className="text-xs font-medium text-[#A1A1AA]">{sleep.disturbances}×</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-[#52525B]">Keine Schlafdaten verfügbar.</p>
        )}
      </div>

      {/* Workouts */}
      {workouts.length > 0 && (
        <div className="bg-[#111113] border border-[#1F1F23] rounded-2xl p-5">
          <p className="text-xs text-[#52525B] uppercase tracking-wider mb-4">Letzte Workouts</p>
          <div className="space-y-2">
            {workouts.slice(0, 5).map((w) => (
              <div key={w.id} className="flex items-center justify-between py-2 border-b border-[#1A1A1D] last:border-0">
                <div>
                  <p className="text-sm text-[#E4E4E7] font-medium">{w.sport_name}</p>
                  <p className="text-[11px] text-[#52525B] mt-0.5">
                    {msToHHMM(w.duration_milli)} · ⌀ {w.average_heart_rate} bpm · {Math.round(w.kilojoule / 4.184)} kcal
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#38BDF8]">{w.strain.toFixed(1)}</p>
                  <p className="text-[10px] text-[#3F3F46]">strain</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}

function StatRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5 text-[#52525B]">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <span className="text-sm font-medium text-[#E4E4E7]">{value}</span>
    </div>
  )
}

function MetricBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-[#0D0D0F] rounded-xl p-3">
      <div className="flex items-center gap-1 text-[#3F3F46] mb-1.5">
        {icon}
        <span className="text-[10px]">{label}</span>
      </div>
      <p className="text-base font-semibold text-[#F4F4F5]">{value}</p>
    </div>
  )
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between">
        <span className="text-[11px] text-[#52525B]">{label}</span>
        <span className="text-[11px] font-medium text-[#71717A]">{value}%</span>
      </div>
      <div className="h-1 bg-[#1F1F23] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}
