import { NextResponse } from 'next/server'

export async function GET() {
  const clientId = process.env.WHOOP_CLIENT_ID
  const redirectUri = process.env.WHOOP_REDIRECT_URI

  if (!clientId || !redirectUri) {
    return NextResponse.json({ error: 'Whoop OAuth not configured' }, { status: 503 })
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'read:recovery read:sleep read:workout read:profile',
  })

  return NextResponse.redirect(`https://api.prod.whoop.com/oauth/oauth2/auth?${params}`)
}
