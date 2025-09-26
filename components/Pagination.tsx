'use client'

import { Button } from '@/components/ui/button'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  totalItems?: number
  itemsPerPage?: number
  showInfo?: boolean
  className?: string
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  showInfo = true,
  className = '',
}: PaginationProps) {
  const getVisiblePages = () => {
    const delta = 2
    const rangeWithDots = []

    // Always include first page
    if (totalPages <= 1) return [1]

    // Calculate range around current page
    const start = Math.max(2, currentPage - delta)
    const end = Math.min(totalPages - 1, currentPage + delta)

    // Add first page
    rangeWithDots.push(1)

    // Add dots if gap between 1 and start
    if (start > 2) {
      rangeWithDots.push('...')
    }

    // Add pages around current
    for (let i = start; i <= end; i++) {
      rangeWithDots.push(i)
    }

    // Add dots if gap between end and last page
    if (end < totalPages - 1) {
      rangeWithDots.push('...')
    }

    // Add last page if not already included
    if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  const visiblePages = getVisiblePages()

  const getItemRange = () => {
    if (!totalItems || !itemsPerPage) return null

    const start = (currentPage - 1) * itemsPerPage + 1
    const end = Math.min(currentPage * itemsPerPage, totalItems)
    return { start, end }
  }

  const itemRange = getItemRange()

  if (totalPages <= 1) return null

  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      {/* Info section */}
      {showInfo && itemRange && (
        <div className="text-sm text-muted-foreground">
          Showing {itemRange.start} to {itemRange.end} of {totalItems} results
        </div>
      )}

      {/* Pagination controls */}
      <div className="flex items-center gap-1">
        {/* First page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="h-8 w-8 p-0"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Previous page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {visiblePages.map((page, index) => {
            if (page === '...') {
              return (
                <span key={`dots-${index}`} className="px-2 text-muted-foreground">
                  ...
                </span>
              )
            }

            return (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page as number)}
                className="h-8 min-w-[32px]"
              >
                {page}
              </Button>
            )
          })}
        </div>

        {/* Next page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="h-8 w-8 p-0"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default Pagination