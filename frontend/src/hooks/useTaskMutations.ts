import { useMutation, useQueryClient } from '@tanstack/react-query'
import { taskApi } from '@/api/tasks'
import type {
  CreateTaskPayload,
  PatchTaskPayload,
  UpdateTaskPayload,
} from '@/types'

// Invalida todas las queries de tasks para refrescar la lista
function useInvalidateTasks() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['tasks'] })
}

export function useCreateTask() {
  const invalidate = useInvalidateTasks()

  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => taskApi.createTask(payload),
    onSuccess: invalidate,
  })
}

export function useUpdateTask() {
  const invalidate = useInvalidateTasks()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateTaskPayload }) =>
      taskApi.updateTask(id, payload),
    onSuccess: invalidate,
  })
}

export function usePatchTask() {
  const invalidate = useInvalidateTasks()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: PatchTaskPayload }) =>
      taskApi.patchTask(id, payload),
    onSuccess: invalidate,
  })
}

export function useDeleteTask() {
  const invalidate = useInvalidateTasks()

  return useMutation({
    mutationFn: (id: number) => taskApi.deleteTask(id),
    onSuccess: invalidate,
  })
}