import { useState } from 'react'
import type { Task, TaskQueryParams } from '@/types'
import { useTasks } from '@/hooks/useTasks'
import { useDebounce } from './hooks/useDebounce'
import { TaskList, TaskListSkeleton } from '@/components/TaskList'
import { TaskForm } from '@/components/TaskForm'
import { SearchInput } from './components/SearchInput'
import { FilterBar, type FilterValue } from './components/FilterBar'
import { Pagination } from './components/Pagination'

const LIMIT = 10

export default function App() {
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState<FilterValue>('all')
  const [page, setPage]         = useState(1)

  const debouncedSearch = useDebounce(search, 300)

  // Modal crear/editar: undefined=cerrado | null=crear | Task=editar
  const [formTask, setFormTask] = useState<Task | null | undefined>(undefined)
  const isFormOpen = formTask !== undefined

  // Construir params solo con valores definidos para no ensuciar la queryKey
  const queryParams: TaskQueryParams = {
    ...(debouncedSearch               && { q: debouncedSearch }),
    ...(filter !== 'all'              && { status: filter }),
    page,
    limit: LIMIT,
  }

  const { data, isLoading, isError, error, isFetching } = useTasks(queryParams)

  // Resetear página cuando cambia cualquier filtro
  function handleSearchChange(value: string) {
    setSearch(value)
    setPage(1)
  }

  function handleFilterChange(value: FilterValue) {
    setFilter(value)
    setPage(1)
  }

  function openCreate() { setFormTask(null) }
  function openEdit(task: Task) { setFormTask(task) }
  function closeForm() { setFormTask(undefined) }

  const hasActiveFilter = filter !== 'all' || debouncedSearch

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900 tracking-tight">
              DevBoard
            </span>
            {data && (
              <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {data.meta.total} {data.meta.total === 1 ? 'tarea' : 'tareas'}
              </span>
            )}
            {isFetching && !isLoading && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            )}
          </div>

          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nueva tarea
          </button>
        </div>
      </header>

      {/* Toolbar: búsqueda + filtros */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-3 flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchInput
              value={search}
              onChange={handleSearchChange}
            />
          </div>
          <FilterBar
            value={filter}
            onChange={handleFilterChange}
          />
        </div>
      </div>

      {/* Main */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        {isLoading && <TaskListSkeleton />}

        {isError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-800">
              No se pudieron cargar las tareas
            </p>
            <p className="text-sm text-red-600 mt-0.5">
              {error instanceof Error ? error.message : 'Error desconocido'}
            </p>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            {/* Mensaje cuando hay filtros activos y no hay resultados */}
            {data?.data.length === 0 && hasActiveFilter && (
              <div className="text-center py-16">
                <p className="text-sm font-medium text-gray-700">
                  No se encontraron tareas
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Intenta con otros términos o cambia el filtro
                </p>
                <button
                  onClick={() => { handleSearchChange(''); handleFilterChange('all') }}
                  className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Limpiar filtros
                </button>
              </div>
            )}

            {/* Lista  */}
            {(data?.data.length ?? 0) > 0 && (
              <>
                <TaskList
                  tasks={data?.data ?? []}
                  onEdit={openEdit}
                  onCreateFirst={openCreate}
                />
                {data?.meta && (
                  <Pagination
                    meta={data.meta}
                    onPageChange={setPage}
                  />
                )}
              </>
            )}

            {/* Empty state sin filtros activos */}
            {data?.data.length === 0 && !hasActiveFilter && (
              <TaskList
                tasks={[]}
                onEdit={openEdit}
                onCreateFirst={openCreate}
              />
            )}
          </>
        )}
      </main>

      {/* Modal crear/editar */}
      <TaskForm
        open={isFormOpen}
        task={formTask}
        onClose={closeForm}
      />
    </div>
  )
}