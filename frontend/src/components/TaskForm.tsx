import { useEffect, useRef, useState } from 'react'
import type { Task, CreateTaskPayload, UpdateTaskPayload, TaskStatus } from '@/types'
import { useCreateTask, useUpdateTask } from '@/hooks/useTaskMutations'
import { useCategories } from '@/hooks/useCategories'
import { STATUS_CONFIG } from './StatusBadge'

interface TaskFormProps {
  open: boolean
  task?: Task | null  
  onClose: () => void
}

const STATUS_OPTIONS: TaskStatus[] = ['pending', 'in_progress', 'completed']

export function TaskForm({ open, task, onClose }: TaskFormProps) {
  const isEditing = !!task
  const panelRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLInputElement>(null)

  const { data: categories = [] } = useCategories()
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()

  const isPending = createTask.isPending || updateTask.isPending

  // Estado del formulario
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<TaskStatus>('pending')
  const [categoryId, setCategoryId] = useState<string>('')
  const [titleError, setTitleError] = useState('')

  // Poblar campos al abrir en modo edición
  useEffect(() => {
    if (open) {
      setTitle(task?.title ?? '')
      setDescription(task?.description ?? '')
      setStatus(task?.status ?? 'pending')
      setCategoryId(task?.category?.id?.toString() ?? '')
      setTitleError('')
      // Focus al primer campo al abrir
      setTimeout(() => titleRef.current?.focus(), 50)
    }
  }, [open, task])

  // Cerrar con Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isPending) onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, isPending, onClose])

  function validate(): boolean {
    const trimmed = title.trim()
    if (!trimmed) {
      setTitleError('El título es obligatorio')
      titleRef.current?.focus()
      return false
    }
    if (trimmed.length > 120) {
      setTitleError('El título no puede superar los 120 caracteres')
      titleRef.current?.focus()
      return false
    }
    setTitleError('')
    return true
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    if (isEditing && task) {
      const payload: UpdateTaskPayload = {
        title: title.trim(),
        description: description.trim() || null,
        status,
        categoryId: categoryId ? Number(categoryId) : null,
      }
      updateTask.mutate(
        { id: task.id, payload },
        { onSuccess: onClose },
      )
    } else {
      const payload: CreateTaskPayload = {
        title: title.trim(),
        description: description.trim() || null,
        categoryId: categoryId ? Number(categoryId) : null, 
      }
      createTask.mutate(payload, { onSuccess: onClose })
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="form-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => !isPending && onClose()}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="relative z-10 w-full max-w-md bg-white rounded-xl shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 id="form-title" className="text-base font-semibold text-gray-900">
            {isEditing ? 'Editar tarea' : 'Nueva tarea'}
          </h2>
          <button
            onClick={() => !isPending && onClose()}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Cerrar"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="px-5 py-4 flex flex-col gap-4">
          {/* Título */}
          <div>
            <label
              htmlFor="task-title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Título <span className="text-red-500">*</span>
            </label>
            <input
              ref={titleRef}
              id="task-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (titleError) setTitleError('')
              }}
              maxLength={120}
              placeholder="Ej: Corregir validación del formulario"
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                titleError
                  ? 'border-red-400 focus:ring-red-400'
                  : 'border-gray-300'
              }`}
            />
            <div className="flex items-start justify-between mt-1">
              {titleError ? (
                <p className="text-xs text-red-600">{titleError}</p>
              ) : (
                <span />
              )}
              <span className="text-xs text-gray-400 ml-auto">
                {title.length}/120
              </span>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label
              htmlFor="task-desc"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Descripción
              <span className="text-gray-400 font-normal ml-1">(opcional)</span>
            </label>
            <textarea
              id="task-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
              rows={3}
              placeholder="Describe el problema o contexto…"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-colors"
            />
          </div>

          {/* Estado — solo en edición */}
          {isEditing && (
            <div>
              <label
                htmlFor="task-status"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Estado
              </label>
              <select
                id="task-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_CONFIG[s].label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Categoría — solo si hay categorías cargadas */}
          {categories.length > 0 && (
            <div>
              <label
                htmlFor="task-category"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Categoría
                <span className="text-gray-400 font-normal ml-1">(opcional)</span>
              </label>
              <select
                id="task-category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sin categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Footer */}
          <div className="flex gap-3 justify-end pt-1">
            <button
              type="button"
              onClick={() => !isPending && onClose()}
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isPending
                ? isEditing
                  ? 'Guardando…'
                  : 'Creando…'
                : isEditing
                  ? 'Guardar cambios'
                  : 'Crear tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}