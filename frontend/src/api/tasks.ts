import api from './axios'
import type {
  CreateTaskPayload,
  PaginatedResponse,
  PatchTaskPayload,
  Task,
  TaskQueryParams,
  UpdateTaskPayload,
} from '@/types'

export const taskApi = {
  async getTasks(
    params?: TaskQueryParams,
  ): Promise<PaginatedResponse<Task>> {
    const response = await api.get<PaginatedResponse<Task>>('/tasks', {
      params,
    })

    return response.data
  },

  async getTaskById(id: number): Promise<Task> {
    const response = await api.get<Task>(`/tasks/${id}`)

    return response.data
  },

  async createTask(payload: CreateTaskPayload): Promise<Task> {
    const response = await api.post<Task>('/tasks', payload)

    return response.data
  },

  async updateTask(
    id: number,
    payload: UpdateTaskPayload,
  ): Promise<Task> {
    const response = await api.put<Task>(`/tasks/${id}`, payload)

    return response.data
  },

  async patchTask(
    id: number,
    payload: PatchTaskPayload,
  ): Promise<Task> {
    const response = await api.patch<Task>(`/tasks/${id}`, payload)

    return response.data
  },

  async deleteTask(id: number): Promise<void> {
    await api.delete(`/tasks/${id}`)
  },
}