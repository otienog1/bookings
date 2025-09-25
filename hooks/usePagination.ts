'use client'

import { useState, useCallback, useMemo } from 'react'

interface UsePaginationProps {
  initialPage?: number
  initialLimit?: number
  totalItems?: number
}

interface PaginationState {
  page: number
  limit: number
  offset: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

interface UsePaginationReturn extends PaginationState {
  setPage: (page: number) => void
  setLimit: (limit: number) => void
  nextPage: () => void
  prevPage: () => void
  firstPage: () => void
  lastPage: () => void
  setTotalItems: (total: number) => void
  reset: () => void
}

export function usePagination({
  initialPage = 1,
  initialLimit = 20,
  totalItems = 0,
}: UsePaginationProps = {}): UsePaginationReturn {
  const [page, setPageState] = useState(initialPage)
  const [limit, setLimitState] = useState(initialLimit)
  const [total, setTotalItems] = useState(totalItems)

  const paginationState = useMemo((): PaginationState => {
    const totalPages = Math.ceil(total / limit) || 1
    const offset = (page - 1) * limit
    const hasNext = page < totalPages
    const hasPrev = page > 1

    return {
      page,
      limit,
      offset,
      totalPages,
      hasNext,
      hasPrev,
    }
  }, [page, limit, total])

  const setPage = useCallback((newPage: number) => {
    const { totalPages } = paginationState
    const validPage = Math.max(1, Math.min(newPage, totalPages))
    setPageState(validPage)
  }, [paginationState])

  const setLimit = useCallback((newLimit: number) => {
    const validLimit = Math.max(1, Math.min(newLimit, 100)) // Max 100 items per page
    setLimitState(validLimit)

    // Adjust page if current page would be out of bounds with new limit
    const newTotalPages = Math.ceil(total / validLimit) || 1
    if (page > newTotalPages) {
      setPageState(newTotalPages)
    }
  }, [page, total])

  const nextPage = useCallback(() => {
    if (paginationState.hasNext) {
      setPage(page + 1)
    }
  }, [page, paginationState.hasNext, setPage])

  const prevPage = useCallback(() => {
    if (paginationState.hasPrev) {
      setPage(page - 1)
    }
  }, [page, paginationState.hasPrev, setPage])

  const firstPage = useCallback(() => {
    setPage(1)
  }, [setPage])

  const lastPage = useCallback(() => {
    setPage(paginationState.totalPages)
  }, [paginationState.totalPages, setPage])

  const reset = useCallback(() => {
    setPageState(initialPage)
    setLimitState(initialLimit)
    setTotalItems(0)
  }, [initialPage, initialLimit])

  return {
    ...paginationState,
    setPage,
    setLimit,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    setTotalItems,
    reset,
  }
}

export default usePagination