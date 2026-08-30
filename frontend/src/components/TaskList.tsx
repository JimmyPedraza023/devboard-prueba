import type { Task } from '@/types'
import { TaskCard } from './TaskCard'

interface TaskListProps {
  tasks: Task[]
  onEdit: (task: Task) => void
  onCreateFirst?: () => void
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
        <div className="flex gap-1">
          <div className="w-7 h-7 bg-gray-100 rounded-lg" />
          <div className="w-7 h-7 bg-gray-100 rounded-lg" />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="h-6 bg-gray-100 rounded-lg w-24" />
        <div className="h-3 bg-gray-100 rounded w-20" />
      </div>
    </div>
  )
}

export function TaskListSkeleton() {
  return (
    <div className="grid gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

function EmptyState({ onCreateFirst }: { onCreateFirst?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
        <svg
          className="w-7 h-7 text-blue-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      </div>
      <h3 className="text-sm font-semibold text-gray-900 mb-1">
        No hay tareas todavía
      </h3>
      <p className="text-sm text-gray-500 mb-5">
        Crea tu primera tarea para empezar a organizar el trabajo.
      </p>
      {onCreateFirst && (
        <button
          onClick={onCreateFirst}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Crear primera tarea
        </button>
      )}
    </div>
  )
}

export function TaskList({ tasks, onEdit, onCreateFirst }: TaskListProps) {
  if (tasks.length === 0) {
    return <EmptyState onCreateFirst={onCreateFirst} />
  }

  return (
    <div className="grid gap-3">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} onEdit={onEdit} />
      ))}
    </div>
  )
}