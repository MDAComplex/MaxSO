import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const BASE = 'https://api.prod.whoop.com/developer/v1'

async function whoopGet(path: string, token: string) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 300 },
  })
  if (!res.ok) return null
  return res.json()
}

async function refreshToken(refreshTk: string): Promise<string | null> {
  const res = await fetch('https://api.prod.whoop.com/oauth/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshTk,
      client_id: process.env.WHOOP_CLIENT_ID!,
      client_secret: process.env.WHOOP_CLIENT_SECRET!,
    }),
  })
  if (!res.ok) return null
  const data = await res.json()
  return data.access_token ?? null
}

export async function GET() {
  const cookieStore = cookies()
  let token = cookieStore.get('whoop_access_token')?.value
  const refreshTk = cookieStore.get('whoop_refresh_token')?.value

  if (!token && refreshTk) {
    token = (await refreshToken(refreshTk)) ?? undefined
  }

  if (!token) {
    return NextResponse.json(
      { connected: false, authUrl: '/api/auth/whoop' },
      { status: 401 }
    )
  }

  const [recoveryData, sleepData, workoutData, cycleData] = await Promise.all([
    whoopGet('/recovery?limit=1', token),
    whoopGet('/activity/sleep?limit=1', token),
    whoopGet('/activity/workout?limit=7', token),
    whoopGet('/cycle?limit=1', token),
  ])

  const rec = recoveryData?.records?.[0]
  const slp = sleepData?.records?.[0]

  const recovery = rec ? {
    date: rec.created_at?.split('T')[0] ?? '',
    recovery_score: Math.round(rec.score?.recovery_score ?? 0),
    hrv_rmssd_milli: Math.round(rec.score?.hrv_rmssd_milli ?? 0),
    resting_heart_rate: Math.round(rec.score?.resting_heart_rate ?? 0),
    user_calibrating: rec.score?.user_calibrating ?? false,
  } : null

  const sleep = slp?.score ? {
    date: slp.start?.split('T')[0] ?? '',
    total_in_bed_time_milli: slp.score.stage_summary?.total_in_bed_time_milli ?? 0,
    total_sleep_time_milli: slp.score.stage_summary?.total_sleep_time_milli ?? 0,
    sleep_performance_percentage: Math.round(slp.score.sleep_performance_percentage ?? 0),
    sleep_efficiency_percentage: Math.round(slp.score.sleep_efficiency_percentage ?? 0),
    sleep_consistency_percentage: Math.round(slp.score.sleep_consistency_percentage ?? 0),
    disturbances: slp.score.stage_summary?.disturbances ?? 0,
    latency_milli: slp.score.stage_summary?.sleep_latency_milli ?? 0,
    light_sleep_time_milli: slp.score.stage_summary?.total_light_sleep_time_milli ?? 0,
    slow_wave_sleep_time_milli: slp.score.stage_summary?.total_slow_wave_sleep_time_milli ?? 0,
    rem_sleep_time_milli: slp.score.stage_summary?.total_rem_sleep_time_milli ?? 0,
  } : null

  const workouts = (workoutData?.records ?? []).map((w: Record<string, unknown>) => {
    const score = w.score as Record<string, unknown> | null
    const sport = w.sport_id as number
    const sportNames: Record<number, string> = {
      0: 'Aktivität',
      1: 'Laufen',
      16: 'Krafttraining',
      71: 'Radfahren',
      44: 'Schwimmen',
      63: 'Yoga',
      126: 'HIIT',
    }
    return {
      id: w.id,
      sport_name: sportNames[sport] ?? 'Workout',
      strain: score ? Math.round((score.strain as number) * 10) / 10 : 0,
      average_heart_rate: score ? Math.round(score.average_heart_rate as number) : 0,
      max_heart_rate: score ? Math.round(score.max_heart_rate as number) : 0,
      kilojoule: score ? Math.round(score.kilojoule as number) : 0,
      duration_milli: (w.end as number) - (w.start as number),
      start: w.start as string,
    }
  })

  const cycleStrain = cycleData?.records?.[0]?.score?.strain ?? null

  return NextResponse.json({
    connected: true,
    recovery,
    sleep,
    workouts,
    strain: cycleStrain ? Math.round(cycleStrain * 10) / 10 : null,
  })
}

export async function DELETE() {
  const cookieStore = cookies()
  cookieStore.delete('whoop_access_token')
  cookieStore.delete('whoop_refresh_token')
  return NextResponse.json({ success: true })
}
