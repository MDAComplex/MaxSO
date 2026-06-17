import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const WHOOP_API = 'https://api.prod.whoop.com/developer/v1'

async function whoopFetch(path: string, token: string) {
  const res = await fetch(`${WHOOP_API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 300 },
  })
  if (!res.ok) return null
  return res.json()
}

export async function GET() {
  const cookieStore = cookies()
  const token = cookieStore.get('whoop_access_token')?.value

  if (!token) {
    return NextResponse.json({ error: 'Whoop not connected', authUrl: '/api/auth/whoop' }, { status: 401 })
  }

  const [recoveryData, sleepData, workoutData] = await Promise.all([
    whoopFetch('/recovery?limit=1', token),
    whoopFetch('/activity/sleep?limit=1', token),
    whoopFetch('/activity/workout?limit=1', token),
  ])

  const recovery = recoveryData?.records?.[0]
  const sleep = sleepData?.records?.[0]

  const whoop = {
    recovery: Math.round((recovery?.score?.recovery_score ?? 0)),
    hrv: Math.round(recovery?.score?.hrv_rmssd_milli ?? 0),
    restingHr: Math.round(recovery?.score?.resting_heart_rate ?? 0),
    sleep: {
      duration: sleep?.score?.stage_summary
        ? Math.round((sleep.score.stage_summary.total_in_bed_time_milli / 3_600_000) * 10) / 10
        : 0,
      performance: Math.round(sleep?.score?.sleep_performance_percentage ?? 0),
      efficiency: Math.round(sleep?.score?.sleep_efficiency_percentage ?? 0),
    },
    strain: workoutData?.records?.[0]?.score?.strain ?? 0,
  }

  return NextResponse.json({ whoop })
}
