"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, RotateCcw, Trash2, MapPin, Users } from "lucide-react"
import { format, isValid } from "date-fns"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { DataTable } from "@/components/ui/data-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Booking } from "@/types/BookingTypes"

interface TrashDataTableProps {
  bookings: Booking[]
  onRestore: (booking: Booking) => void
  onPermanentDelete: (booking: Booking) => void
  onEmptyTrash: () => void
  isLoading?: boolean
}

export function TrashDataTable({
  bookings,
  onRestore,
  onPermanentDelete,
  onEmptyTrash,
  isLoading = false,
}: TrashDataTableProps) {

  const formatDate = (dateValue: any) => {
    try {
      let date: Date
      if (dateValue instanceof Date) {
        date = dateValue
      } else if (typeof dateValue === 'object' && dateValue !== null && '$date' in dateValue) {
        date = new Date((dateValue as { $date: string | number | Date }).$date)
      } else {
        date = new Date(String(dateValue))
      }

      if (!isValid(date)) {
        return 'Invalid date'
      }

      return format(date, 'MMM dd, yyyy')
    } catch {
      return 'Invalid date'
    }
  }

  const columns: ColumnDef<Booking>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          onClick={(e) => e.stopPropagation()}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Booking Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const booking = row.original
        return (
          <div className="flex items-center gap-2">
            <div className="font-medium">{booking.name}</div>
            {booking.country && (
              <div className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors border-transparent bg-muted text-muted-foreground">
                <MapPin className="h-3 w-3 mr-1" />
                {booking.country}
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "date_from",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Arrival Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const booking = row.original
        return (
          <div className="font-medium">{formatDate(booking.date_from)}</div>
        )
      },
    },
    {
      accessorKey: "date_to",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Departure Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const booking = row.original
        return (
          <div className="font-medium">{formatDate(booking.date_to)}</div>
        )
      },
    },
    {
      accessorKey: "pax",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            PAX
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const booking = row.original
        const totalPax = booking.pax || (booking.ladies + booking.men + booking.children + booking.teens)
        const breakdown = [booking.ladies, booking.men, booking.children, booking.teens]
        const hasBreakdown = breakdown.some(count => count > 0)

        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors border-transparent bg-muted text-muted-foreground">
                  <Users className="h-3 w-3 mr-1" />
                  {totalPax} pax
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-card border border-border text-card-foreground shadow-md px-3 py-2 rounded-md">
                {hasBreakdown ? (
                  <div className="space-y-1.5">
                    <p className="font-medium text-xs text-muted-foreground">PAX Breakdown</p>
                    <div className="text-xs space-y-0.5 text-foreground">
                      <div>Ladies: {booking.ladies}</div>
                      <div>Men: {booking.men}</div>
                      <div>Children: {booking.children}</div>
                      <div>Teens: {booking.teens}</div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-foreground">Total passengers: {totalPax}</p>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      },
    },
    {
      accessorKey: "deleted_at",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Deleted At
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const booking = row.original
        if (!booking.deleted_at) return <span className="text-muted-foreground">—</span>

        return (
          <div className="font-medium">{formatDate(booking.deleted_at)}</div>
        )
      },
    },
  ]

  const emptyTrashButton = bookings.length > 0 ? (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-red-600 hover:bg-muted/50 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          onClick={onEmptyTrash}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Empty Trash
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Permanently delete all trashed bookings</p>
      </TooltipContent>
    </Tooltip>
  ) : null

  return (
    <TooltipProvider>
      <DataTable
        columns={columns}
        data={bookings}
        searchKey="name"
        searchPlaceholder="Search trashed bookings..."
        isLoading={isLoading}
        onRestore={onRestore}
        onPermanentDelete={onPermanentDelete}
        extraButton={emptyTrashButton}
      />
    </TooltipProvider>
  )
}