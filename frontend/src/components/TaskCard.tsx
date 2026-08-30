import { useState } from 'react'
import type { Task, TaskStatus } from '@/types'
import { STATUS_CONFIG } from './StatusBadge'
import { ConfirmDialog } from './ConfirmDialog'
import { usePatchTask, useDeleteTask } from '@/hooks/useTaskMutations'

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
}

const STATUS_ORDER: TaskStatus[] = ['pending', 'in_progress', 'completed']

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function TaskCard({ task, onEdit }: TaskCardProps) {
  const [showConfirm, setShowConfirm] = useState(false)

  const patchTask = usePatchTask()
  const deleteTask = useDeleteTask()

  function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    patchTask.mutate({
      id: task.id,
      payload: { status: e.target.value as TaskStatus },
    })
  }

  function handleDelete() {
    deleteTask.mutate(task.id, {
      onSuccess: () => setShowConfirm(false),
    })
  }

  return (
    <>
      <article className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3 hover:border-gray-300 hover:shadow-sm transition-all">
        {/* Header: título + acciones */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 truncate">
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onEdit(task)}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Editar tarea"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
                />
              </svg>
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              aria-label="Eliminar tarea"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* estado + categoría + fecha */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            {/* Selector de estado inline */}
            <select
              value={task.status}
              onChange={handleStatusChange}
              disabled={patchTask.isPending}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
              aria-label="Cambiar estado"
            >
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {STATUS_CONFIG[s].label}
                </option>
              ))}
            </select>

            {task.category && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border"
                style={{
                  backgroundColor: `${task.category.color}18`,
                  borderColor: `${task.category.color}40`,
                  color: task.category.color,
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: task.category.color }}
                />
                {task.category.name}
              </span>
            )}
          </div>

          <time className="text-xs text-gray-400" dateTime={task.createdAt}>
            {formatDate(task.createdAt)}
          </time>
        </div>
      </article>

      <ConfirmDialog
        open={showConfirm}
        title="¿Eliminar esta tarea?"
        description={`"${task.title}" se eliminará permanentemente y no se puede deshacer.`}
        confirmLabel="Eliminar"
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
        isLoading={deleteTask.isPending}
      />
    </>
  )
}