import type { PaginationMeta } from '@/types'

interface PaginationProps {
  meta: PaginationMeta
  onPageChange: (page: number) => void
}

export function Pagination({ meta, onPageChange }: PaginationProps) {
  const { page, totalPages, total, limit } = meta

  // No renderizar si solo hay una página
  if (totalPages <= 1) return null

  const from = (page - 1) * limit + 1
  const to = Math.min(page * limit, total)

  function PageButton({
    pageNum,
    children,
    disabled = false,
    active = false,
    ariaLabel,
  }: {
    pageNum: number
    children: React.ReactNode
    disabled?: boolean
    active?: boolean
    ariaLabel?: string
  }) {
    return (
      <button
        onClick={() => onPageChange(pageNum)}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-current={active ? 'page' : undefined}
        className={`min-w-[36px] h-9 px-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
          active
            ? 'bg-blue-600 text-white'
            : 'text-gray-600 hover:bg-gray-100 bg-white border border-gray-200'
        }`}
      >
        {children}
      </button>
    )
  }

  // Genera el rango de páginas visible con elipsis
  function getPageNumbers(): (number | '…')[] {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    const pages: (number | '…')[] = [1]
    if (page > 3) pages.push('…')
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i)
    }
    if (page < totalPages - 2) pages.push('…')
    pages.push(totalPages)
    return pages
  }

  return (
    <div className="flex flex-col items-center gap-3 mt-6">
      {/* Contador */}
      <p className="text-xs text-gray-500">
        Mostrando <span className="font-medium text-gray-700">{from}–{to}</span> de{' '}
        <span className="font-medium text-gray-700">{total}</span> tareas
      </p>

      {/* Controles */}
      <div className="flex items-center gap-1">
        {/* Anterior */}
        <PageButton
          pageNum={page - 1}
          disabled={page === 1}
          ariaLabel="Página anterior"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </PageButton>

        {/* Números */}
        {getPageNumbers().map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} className="px-1 text-gray-400 text-sm select-none">
              …
            </span>
          ) : (
            <PageButton
              key={p}
              pageNum={p}
              active={p === page}
              ariaLabel={`Página ${p}`}
            >
              {p}
            </PageButton>
          ),
        )}

        {/* Siguiente */}
        <PageButton
          pageNum={page + 1}
          disabled={page === totalPages}
          ariaLabel="Página siguiente"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </PageButton>
      </div>
    </div>
  )
}