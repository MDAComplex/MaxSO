import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { MILESTONES_SEED } from '@/lib/milestones-seed'

export async function GET() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('milestones')
    .select('*')
    .order('sort_order')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ milestones: data ?? [] })
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const body = await req.json()

  if (body.seed) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const rows = MILESTONES_SEED.map((m) => ({ ...m, user_id: user.id }))
    const { error } = await supabase
      .from('milestones')
      .upsert(rows, { onConflict: 'user_id,key' })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ seeded: rows.length })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}

export async function PATCH(req: NextRequest) {
  const supabase = createClient()
  const { id, target_date } = await req.json()

  const { error } = await supabase
    .from('milestones')
    .update({ target_date })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
