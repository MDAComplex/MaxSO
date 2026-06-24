import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const origin = request.nextUrl.origin

  if (!code) {
    return NextResponse.redirect(`${origin}/?whoop=error`)
  }

  const res = await fetch('https://api.prod.whoop.com/oauth/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.WHOOP_CLIENT_ID!,
      client_secret: process.env.WHOOP_CLIENT_SECRET!,
      redirect_uri: process.env.WHOOP_REDIRECT_URI!,
      grant_type: 'authorization_code',
    }),
  })

  if (!res.ok) {
    return NextResponse.redirect(`${origin}/?whoop=error`)
  }

  const tokens = await res.json()
  const cookieStore = cookies()
  const secure = process.env.NODE_ENV === 'production'

  cookieStore.set('whoop_access_token', tokens.access_token, {
    httpOnly: true,
    secure,
    maxAge: tokens.expires_in ?? 3600,
    path: '/',
    sameSite: 'lax',
  })

  if (tokens.refresh_token) {
    cookieStore.set('whoop_refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure,
      maxAge: 60 * 60 * 24 * 60, // 60 days
      path: '/',
      sameSite: 'lax',
    })
  }

  return NextResponse.redirect(`${origin}/?whoop=connected`)
}
