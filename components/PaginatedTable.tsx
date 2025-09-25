'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePagination } from '@/hooks/usePagination'
import { useDebouncedSearch } from '@/hooks/useDebounce'
import { Pagination } from '@/components/Pagination'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Search } from 'lucide-react'

interface PaginatedTableProps<T> {
  title: string
  fetchData: (params: {
    page: number
    limit: number
    search?: string
    [key: string]: any
  }) => Promise<{
    items: T[]
    meta: {
      pagination: {
        total: number
        totalPages: number
        page: number
        limit: number
      }
    }
  }>
  renderRow: (item: T, index: number) => React.ReactNode
  columns: string[]
  searchPlaceholder?: string
  itemsPerPageOptions?: number[]
  className?: string
}

export function PaginatedTable<T extends { _id?: string; id?: string }>({
  title,
  fetchData,
  renderRow,
  columns,
  searchPlaceholder = 'Search...',
  itemsPerPageOptions = [10, 20, 50, 100],
  className = '',
}: PaginatedTableProps<T>) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pagination = usePagination({
    initialPage: 1,
    initialLimit: itemsPerPageOptions[1] || 20,
  })

  const { searchTerm, debouncedSearchTerm, setSearchTerm } = useDebouncedSearch({
    delay: 300,
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await fetchData({
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearchTerm || undefined,
      })

      setData(result.items)
      pagination.setTotalItems(result.meta.pagination.total)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data'
      setError(errorMessage)
      setData([])
      pagination.setTotalItems(0)
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, debouncedSearchTerm, fetchData])

  // Load data when pagination or search changes
  useEffect(() => {
    loadData()
  }, [loadData])

  // Reset to first page when search changes
  useEffect(() => {
    if (pagination.page !== 1) {
      pagination.setPage(1)
    }
  }, [debouncedSearchTerm])

  const handlePageChange = (newPage: number) => {
    pagination.setPage(newPage)
  }

  const handleLimitChange = (newLimit: string) => {
    const limit = parseInt(newLimit, 10)
    pagination.setLimit(limit)
  }

  const handleRefresh = () => {
    loadData()
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Refresh'
            )}
          </Button>
        </div>

        {/* Search and filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Show:</span>
            <Select value={pagination.limit.toString()} onValueChange={handleLimitChange}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {itemsPerPageOptions.map((option) => (
                  <SelectItem key={option} value={option.toString()}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {error ? (
          <div className="flex items-center justify-center py-8 text-red-500">
            <p>Error: {error}</p>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    {columns.map((column) => (
                      <th
                        key={column}
                        className="text-left py-3 px-4 font-medium text-muted-foreground"
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={columns.length} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin mr-2" />
                          Loading...
                        </div>
                      </td>
                    </tr>
                  ) : data.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                        {debouncedSearchTerm ? 'No results found' : 'No data available'}
                      </td>
                    </tr>
                  ) : (
                    data.map((item, index) => (
                      <tr key={item._id || item.id || index} className="border-b hover:bg-muted/50">
                        {renderRow(item, index)}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-4">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                  totalItems={pagination.totalPages * pagination.limit}
                  itemsPerPage={pagination.limit}
                />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default PaginatedTable