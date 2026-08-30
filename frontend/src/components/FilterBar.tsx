import type { TaskStatus } from '@/types'

type FilterValue = TaskStatus | 'all'

interface FilterBarProps {
  value: FilterValue
  onChange: (value: FilterValue) => void
  counts?: Partial<Record<FilterValue, number>>
}

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: 'all',         label: 'Todas'       },
  { value: 'pending',     label: 'Pendientes'  },
  { value: 'in_progress', label: 'En progreso' },
  { value: 'completed',   label: 'Completadas' },
]

export function FilterBar({ value, onChange, counts }: FilterBarProps) {
  return (
    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg w-fit">
      {FILTERS.map((filter) => {
        const active = filter.value === value
        const count = counts?.[filter.value]

        return (
          <button
            key={filter.value}
            onClick={() => onChange(filter.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
              active
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {filter.label}
            {count !== undefined && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                  active
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export type { FilterValue }