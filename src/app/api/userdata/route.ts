import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('key')
  if (!key) return NextResponse.json({ error: 'key required' }, { status: 400 })

  const supabase = createClient()
  const { data, error } = await supabase
    .from('user_data')
    .select('data')
    .eq('key', key)
    .maybeSingle()

  // Table missing or not logged in — behave like "no data yet"
  if (error) return NextResponse.json({ data: null })
  return NextResponse.json({ data: data?.data ?? null })
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { key, data } = await req.json()
  if (!key) return NextResponse.json({ error: 'key required' }, { status: 400 })

  const { error } = await supabase
    .from('user_data')
    .upsert({ user_id: user.id, key, data, updated_at: new Date().toISOString() }, { onConflict: 'user_id,key' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
