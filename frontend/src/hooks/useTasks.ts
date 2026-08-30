import { useQuery } from '@tanstack/react-query'
import { taskApi } from '@/api/tasks'
import type { TaskQueryParams } from '@/types'

export function useTasks(params?: TaskQueryParams) {
  return useQuery({
    queryKey: ['tasks', params],
    queryFn: () => taskApi.getTasks(params),
  })
}