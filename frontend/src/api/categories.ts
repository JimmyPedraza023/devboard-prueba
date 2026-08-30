import api from './axios'
import type { Category } from '@/types'

export const categoryApi = {
  async getCategories(): Promise<Category[]> {
    const response = await api.get<Category[]>('/categories')

    return response.data
  },
}