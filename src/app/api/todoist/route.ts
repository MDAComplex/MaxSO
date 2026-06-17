import { NextResponse } from 'next/server'

const TODOIST_API = 'https://api.todoist.com/rest/v2'

async function fetchTodoist(path: string) {
  const token = process.env.TODOIST_API_TOKEN
  if (!token) return null
  const res = await fetch(`${TODOIST_API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 60 },
  })
  if (!res.ok) return null
  return res.json()
}

export async function GET() {
  const [tasks, projects] = await Promise.all([
    fetchTodoist('/tasks?filter=today'),
    fetchTodoist('/projects'),
  ])

  if (!tasks) {
    return NextResponse.json({ error: 'Todoist not configured' }, { status: 503 })
  }

  const projectMap: Record<string, string> = {}
  if (projects) {
    for (const p of projects) {
      projectMap[p.id] = p.name
    }
  }

  const todos = tasks.map((t: Record<string, unknown>) => ({
    id: `todoist-${t.id}`,
    todoistId: t.id,
    title: t.content,
    completed: false,
    priority: (5 - (t.priority as number)) as 1 | 2 | 3 | 4,
    project: projectMap[(t.project_id as string) ?? ''] ?? '',
    dueTime: (t.due as Record<string, string> | null)?.datetime
      ? new Date((t.due as Record<string, string>).datetime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
      : undefined,
    source: 'todoist' as const,
  }))

  return NextResponse.json({ todos })
}

export async function POST(req: Request) {
  const token = process.env.TODOIST_API_TOKEN
  if (!token) return NextResponse.json({ error: 'Not configured' }, { status: 503 })

  const body = await req.json()
  const res = await fetch(`${TODOIST_API}/tasks`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content: body.title, due_string: 'today' }),
  })

  const task = await res.json()
  return NextResponse.json({ task })
}

export async function PATCH(req: Request) {
  const token = process.env.TODOIST_API_TOKEN
  if (!token) return NextResponse.json({ error: 'Not configured' }, { status: 503 })

  const { todoistId } = await req.json()
  await fetch(`${TODOIST_API}/tasks/${todoistId}/close`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })

  return NextResponse.json({ success: true })
}
