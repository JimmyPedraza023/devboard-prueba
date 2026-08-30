import { useQuery } from '@tanstack/react-query'
import { categoryApi } from '@/api/categories'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getCategories(),
    staleTime: Infinity,
  })
}