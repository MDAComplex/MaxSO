import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const GOOGLE_API = 'https://www.googleapis.com/calendar/v3'

async function getAccessToken(): Promise<string | null> {
  const cookieStore = cookies()
  const token = cookieStore.get('google_access_token')?.value
  return token ?? null
}

export async function GET() {
  const accessToken = await getAccessToken()
  if (!accessToken) {
    return NextResponse.json({ error: 'Google not connected', authUrl: '/api/auth/google' }, { status: 401 })
  }

  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()

  const res = await fetch(
    `${GOOGLE_API}/calendars/primary/events?timeMin=${startOfDay}&timeMax=${endOfDay}&singleEvents=true&orderBy=startTime`,
    { headers: { Authorization: `Bearer ${accessToken}` }, next: { revalidate: 120 } }
  )

  if (!res.ok) {
    return NextResponse.json({ error: 'Google API error', authUrl: '/api/auth/google' }, { status: res.status })
  }

  const data = await res.json()
  const events = (data.items ?? [])
    .filter((e: Record<string, unknown>) => e.start && (e.start as Record<string, string>).dateTime)
    .map((e: Record<string, unknown>) => {
      const start = new Date((e.start as Record<string, string>).dateTime)
      const end = new Date((e.end as Record<string, string>).dateTime)
      return {
        id: `gcal-${e.id}`,
        title: e.summary,
        startTime: `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}`,
        endTime: `${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`,
        source: 'calendar',
        location: e.location,
        description: e.description,
      }
    })

  return NextResponse.json({ events })
}
