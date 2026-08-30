import type { TaskStatus } from '@/types'

interface StatusBadgeProps {
  status: TaskStatus
  className?: string
}

const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; className: string }
> = {
  pending: {
    label: 'Pendiente',
    className: 'bg-amber-100 text-amber-800 border border-amber-200',
  },
  in_progress: {
    label: 'En progreso',
    className: 'bg-blue-100 text-blue-800 border border-blue-200',
  },
  completed: {
    label: 'Completada',
    className: 'bg-green-100 text-green-800 border border-green-200',
  },
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status]

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.className} ${className}`}
    >
      {config.label}
    </span>
  )
}

export { STATUS_CONFIG }