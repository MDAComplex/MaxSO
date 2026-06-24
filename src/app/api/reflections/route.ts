import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const date = req.nextUrl.searchParams.get('date')

  let query = supabase.from('reflections').select('*').order('date', { ascending: false })
  if (date) query = query.eq('date', date)

  const { data, error } = await query.limit(30)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ reflections: data ?? [] })
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const body = await req.json()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const row = { ...body, user_id: user.id }
  const { data, error } = await supabase
    .from('reflections')
    .upsert(row, { onConflict: 'user_id,date' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ reflection: data })
}
