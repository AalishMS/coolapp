export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface FilterOptions {
  search?: string
  category?: string
  status?: string
  dateRange?: {
    start: Date
    end: Date
  }
}

export interface SortOptions {
  field: string
  direction: 'asc' | 'desc'
}