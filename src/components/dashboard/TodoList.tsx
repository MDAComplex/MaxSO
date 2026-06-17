'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { Todo } from '@/types'
import { Plus, Circle, CheckCircle2 } from 'lucide-react'

const PRIORITY_COLOR: Record<number, string> = {
  1: 'text-red-400',
  2: 'text-orange-400',
  3: 'text-blue-400',
  4: 'text-[#52525B]',
}

interface TodoListProps {
  todos: Todo[]
}

export default function TodoList({ todos: initial }: TodoListProps) {
  const [todos, setTodos] = useState(initial)
  const [newTask, setNewTask] = useState('')
  const [adding, setAdding] = useState(false)

  function toggle(id: string) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    )
  }

  function addTask(e: React.FormEvent) {
    e.preventDefault()
    if (!newTask.trim()) return
    const t: Todo = {
      id: `local-${Date.now()}`,
      title: newTask.trim(),
      completed: false,
      priority: 4,
      source: 'local',
    }
    setTodos((prev) => [t, ...prev])
    setNewTask('')
    setAdding(false)
  }

  const open = todos.filter((t) => !t.completed)
  const done = todos.filter((t) => t.completed)

  return (
    <div className="space-y-1">
      {/* Quick Add */}
      {adding ? (
        <form onSubmit={addTask} className="mb-3">
          <input
            autoFocus
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && setAdding(false)}
            placeholder="Neuer Task…"
            className="w-full bg-[#18181B] border border-[#2A2A30] rounded-lg px-3 py-2 text-sm text-[#F4F4F5] placeholder-[#52525B] outline-none focus:border-[#38BDF8] transition-colors"
          />
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 text-sm text-[#52525B] hover:text-[#38BDF8] transition-colors mb-3"
        >
          <Plus size={14} />
          Neuer Task
        </button>
      )}

      {open.map((todo) => (
        <TodoItem key={todo.id} todo={todo} onToggle={toggle} />
      ))}

      {done.length > 0 && (
        <>
          <div className="pt-3 pb-1">
            <span className="text-xs text-[#3F3F46] uppercase tracking-wider">Erledigt ({done.length})</span>
          </div>
          {done.map((todo) => (
            <TodoItem key={todo.id} todo={todo} onToggle={toggle} />
          ))}
        </>
      )}
    </div>
  )
}

function TodoItem({ todo, onToggle }: { todo: Todo; onToggle: (id: string) => void }) {
  return (
    <button
      onClick={() => onToggle(todo.id)}
      className="w-full flex items-center gap-3 py-2 px-1 rounded-lg hover:bg-[#18181B] transition-colors group text-left"
    >
      {todo.completed ? (
        <CheckCircle2 size={16} className="text-[#38BDF8] shrink-0" />
      ) : (
        <Circle
          size={16}
          className={cn('shrink-0 transition-colors', PRIORITY_COLOR[todo.priority ?? 4])}
        />
      )}
      <span
        className={cn(
          'text-sm flex-1 transition-all duration-200',
          todo.completed
            ? 'line-through text-[#52525B]'
            : 'text-[#E4E4E7] group-hover:text-[#F4F4F5]'
        )}
      >
        {todo.title}
      </span>
      {todo.project && (
        <span className="text-[10px] text-[#3F3F46] shrink-0">{todo.project}</span>
      )}
    </button>
  )
}
