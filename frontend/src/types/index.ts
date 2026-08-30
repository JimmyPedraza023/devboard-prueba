export type TaskStatus = 'pending' | 'in_progress' | 'completed'

export type TaskSort = 'createdAt' | 'updatedAt' | 'title'

export type SortOrder = 'asc' | 'desc'

export interface Category {
  id: number
  name: string
  color: string
}

export interface Task {
  id: number
  title: string
  description: string | null
  status: TaskStatus
  category: Category | null
  createdAt: string
  updatedAt: string
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

export interface ApiErrorDetail {
  field: string
  issue: string
}

export interface ApiErrorResponse {
  error: {
    code: string
    message: string
    details?: ApiErrorDetail[]
  }
}

export interface TaskQueryParams {
  status?: TaskStatus
  q?: string
  categoryId?: number
  page?: number
  limit?: number
  sort?: TaskSort
  order?: SortOrder
}

export interface CreateTaskPayload {
  title: string
  description?: string | null
  categoryId?: number | null
}

export interface UpdateTaskPayload {
  title: string
  description?: string | null
  status: TaskStatus
  categoryId?: number | null
}

export interface PatchTaskPayload {
  title?: string
  description?: string | null
  status?: TaskStatus
  categoryId?: number | null
}