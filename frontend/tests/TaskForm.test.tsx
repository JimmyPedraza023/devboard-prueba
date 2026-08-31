import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'
import { TaskForm } from '@/components/TaskForm'
import type { Task } from '@/types'

// Mock de los hooks de mutación para no depender del API
vi.mock('@/hooks/useTaskMutations', () => ({
  useCreateTask: () => ({ mutate: vi.fn(), isPending: false }),
  useUpdateTask: () => ({ mutate: vi.fn(), isPending: false }),
}))

// Mock de categorías — devuelve lista vacía para simplificar
vi.mock('@/hooks/useCategories', () => ({
  useCategories: () => ({ data: [] }),
}))

function renderWithQuery(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>,
  )
}

const mockTask: Task = {
  id: 1,
  title: 'Tarea existente',
  description: 'Descripción de prueba',
  status: 'in_progress',
  category: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

describe('TaskForm', () => {
  //MODO CREACIÓN 

  describe('modo creación', () => {
    it('muestra el título "Nueva tarea"', () => {
      renderWithQuery(
        <TaskForm open={true} task={null} onClose={vi.fn()} />,
      )
      expect(screen.getByText('Nueva tarea')).toBeInTheDocument()
    })

    it('muestra el botón "Crear tarea"', () => {
      renderWithQuery(
        <TaskForm open={true} task={null} onClose={vi.fn()} />,
      )
      expect(screen.getByRole('button', { name: 'Crear tarea' })).toBeInTheDocument()
    })

    it('muestra error si se intenta enviar con el título vacío', async () => {
      const user = userEvent.setup()
      renderWithQuery(
        <TaskForm open={true} task={null} onClose={vi.fn()} />,
      )

      await user.click(screen.getByRole('button', { name: 'Crear tarea' }))

      expect(
        await screen.findByText('El título es obligatorio'),
      ).toBeInTheDocument()
    })

    it('no muestra el selector de estado en modo creación', () => {
      renderWithQuery(
        <TaskForm open={true} task={null} onClose={vi.fn()} />,
      )
      expect(screen.queryByLabelText('Estado')).not.toBeInTheDocument()
    })
  })

  //MODO EDICIÓN 

  describe('modo edición', () => {
    it('muestra el título "Editar tarea"', () => {
      renderWithQuery(
        <TaskForm open={true} task={mockTask} onClose={vi.fn()} />,
      )
      expect(screen.getByText('Editar tarea')).toBeInTheDocument()
    })

    it('muestra el botón "Guardar cambios"', () => {
      renderWithQuery(
        <TaskForm open={true} task={mockTask} onClose={vi.fn()} />,
      )
      expect(
        screen.getByRole('button', { name: 'Guardar cambios' }),
      ).toBeInTheDocument()
    })

    it('precarga el título de la tarea en el input', async () => {
      renderWithQuery(
        <TaskForm open={true} task={mockTask} onClose={vi.fn()} />,
      )
      const input = screen.getByLabelText(/título/i) as HTMLInputElement
      await waitFor(() => expect(input.value).toBe('Tarea existente'))
    })

    it('muestra el selector de estado en modo edición', () => {
      renderWithQuery(
        <TaskForm open={true} task={mockTask} onClose={vi.fn()} />,
      )
      expect(screen.getByLabelText('Estado')).toBeInTheDocument()
    })
  })

  //COMPORTAMIENTO GENERAL 

  describe('comportamiento general', () => {
    it('llama onClose al hacer click en Cancelar', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      renderWithQuery(
        <TaskForm open={true} task={null} onClose={onClose} />,
      )

      await user.click(screen.getByRole('button', { name: 'Cancelar' }))

      expect(onClose).toHaveBeenCalledOnce()
    })

    it('no renderiza nada cuando open es false', () => {
      renderWithQuery(
        <TaskForm open={false} task={null} onClose={vi.fn()} />,
      )
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })
})