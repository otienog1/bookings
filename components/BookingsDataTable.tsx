"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MapPin, Users, Clock, AlertTriangle, Activity, Calendar, CheckCircle } from "lucide-react"
import { format, isValid, differenceInDays, differenceInHours, isPast, isFuture, isToday } from "date-fns"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { DataTable } from "@/components/ui/data-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Booking } from "@/types/BookingTypes"
import { useRouter } from "next/navigation"

interface BookingsDataTableProps {
  bookings: Booking[]
  onDelete: (booking: Booking) => void
  onView: (booking: Booking) => void
  isLoading?: boolean
  viewFilter?: string
  onViewFilterChange?: (value: string) => void
}

export function BookingsDataTable({
  bookings,
  onDelete,
  onView,
  isLoading = false,
  viewFilter,
  onViewFilterChange
}: BookingsDataTableProps) {
  const router = useRouter()
  
  const handleRowDoubleClick = (booking: Booking) => {
    router.push(`/bookings/view/${booking.id}`)
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
          <div className="space-y-1">
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
            Arrival
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const rawValue = row.getValue("date_from")
        if (!rawValue) return <span className="text-muted-foreground">—</span>
        
        try {
          let date: Date
          
          if (rawValue instanceof Date) {
            date = rawValue
          } else if (typeof rawValue === 'object' && rawValue !== null && '$date' in rawValue) {
            date = new Date((rawValue as { $date: string | number | Date }).$date)
          } else {
            const dateStr = String(rawValue)
            date = new Date(dateStr)
            
            if (!isValid(date) && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
              date = new Date(dateStr + 'T00:00:00')
            }
          }
          
          if (!isValid(date)) {
            return <span className="text-destructive">Invalid date</span>
          }

          const today = new Date()
          const isUpcoming = isFuture(date)

          // Use start of day for accurate day comparison
          const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
          const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
          const daysDiff = differenceInDays(dateStart, todayStart)

          // For same day calculations, use a normalized time (12 PM) to avoid midnight issues
          const todayNoon = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0)
          const dateNoon = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0)
          const hoursDiff = differenceInHours(dateNoon, todayNoon)

          const getTimeText = () => {
            // Check if the date is today by comparing just the date part
            const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
            const bookingDateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
            const isSameDay = todayDateOnly.getTime() === bookingDateOnly.getTime()

            if (isSameDay) {
              // For same day, show relative to current time if we have time info, otherwise show "Today"
              if (date.getHours() !== 0 || date.getMinutes() !== 0) {
                const actualHoursDiff = differenceInHours(date, today)
                if (actualHoursDiff > 0) {
                  return `In ${actualHoursDiff} hours`
                } else if (actualHoursDiff === 0) {
                  return "Now"
                } else {
                  return `${Math.abs(actualHoursDiff)} hours ago`
                }
              } else {
                return "Today"
              }
            } else if (daysDiff === 1) {
              return "Tomorrow"
            } else if (daysDiff > 0) {
              return `In ${daysDiff} days`
            } else if (daysDiff === -1) {
              return "Yesterday"
            } else if (daysDiff === 0) {
              return "Today"
            } else {
              return `${Math.abs(daysDiff)} days ago`
            }
          }

          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="space-y-1">
                    <div className="font-medium">{format(date, "MMM dd, yyyy")}</div>
                    <div className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors border-transparent bg-muted text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {getTimeText()}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-card border border-border text-card-foreground shadow-md px-3 py-2 rounded-md">
                  <p className="text-xs text-foreground">{format(date, "EEEE, MMMM d, yyyy 'at' h:mm a")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        } catch {
          return <span className="text-destructive">Invalid date</span>
        }
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
            Departure
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const rawValue = row.getValue("date_to")
        if (!rawValue) return <span className="text-muted-foreground">—</span>
        
        try {
          let date: Date
          
          if (rawValue instanceof Date) {
            date = rawValue
          } else if (typeof rawValue === 'object' && rawValue !== null && '$date' in rawValue) {
            date = new Date((rawValue as { $date: string | number | Date }).$date)
          } else {
            const dateStr = String(rawValue)
            date = new Date(dateStr)
            
            if (!isValid(date) && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
              date = new Date(dateStr + 'T00:00:00')
            }
          }
          
          if (!isValid(date)) {
            return <span className="text-destructive">Invalid date</span>
          }

          const today = new Date()
          const isPastDate = isPast(date)
          const daysDiff = differenceInDays(date, today)
          const hoursDiff = differenceInHours(date, today)

          const getTimeText = () => {
            // Check if the date is today by comparing just the date part
            const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
            const bookingDateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
            const isSameDay = todayDateOnly.getTime() === bookingDateOnly.getTime()

            if (isSameDay) {
              if (hoursDiff > 0) {
                return `In ${hoursDiff} hours`
              } else if (hoursDiff === 0) {
                return "Now"
              } else {
                return `${Math.abs(hoursDiff)} hours ago`
              }
            } else if (daysDiff === 1) {
              return "Tomorrow"
            } else if (daysDiff > 0) {
              return `In ${daysDiff} days`
            } else if (daysDiff === -1) {
              return "Yesterday"
            } else if (daysDiff === 0) {
              // Fallback for same day edge case
              return `${Math.abs(hoursDiff)} hours ago`
            } else {
              return `${Math.abs(daysDiff)} days ago`
            }
          }

          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="space-y-1">
                    <div className="font-medium">{format(date, "MMM dd, yyyy")}</div>
                    <div className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors border-transparent bg-muted text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {getTimeText()}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-card border border-border text-card-foreground shadow-md px-3 py-2 rounded-md">
                  <p className="text-xs text-foreground">{format(date, "EEEE, MMMM d, yyyy 'at' h:mm a")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        } catch {
          return <span className="text-destructive">Invalid date</span>
        }
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
            Total PAX
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
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const booking = row.original
        const today = new Date()
        
        // Parse dates
        let startDate: Date
        let endDate: Date
        
        try {
          const rawStart = booking.date_from
          const rawEnd = booking.date_to
          
          if (typeof rawStart === 'object' && rawStart !== null && '$date' in rawStart) {
            startDate = new Date((rawStart as { $date: string | number | Date }).$date)
          } else {
            startDate = new Date(String(rawStart))
          }
          
          if (typeof rawEnd === 'object' && rawEnd !== null && '$date' in rawEnd) {
            endDate = new Date((rawEnd as { $date: string | number | Date }).$date)
          } else {
            endDate = new Date(String(rawEnd))
          }
          
          if (!isValid(startDate) || !isValid(endDate)) {
            return <Badge variant="destructive">Invalid Dates</Badge>
          }
          
          // Determine status
          if (isToday(startDate)) {
            return (
              <Badge className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 h-5 text-[10px]">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Arriving
              </Badge>
            )
          } else if (isToday(endDate)) {
            return (
              <Badge className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 h-5 text-[10px]">
                <Clock className="h-3 w-3 mr-1" />
                Departing
              </Badge>
            )
          } else if (startDate > today) {
            return (
              <Badge className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 h-5 text-[10px]">
                <Calendar className="h-3 w-3 mr-1" />
                Upcoming
              </Badge>
            )
          } else if (startDate <= today && endDate >= today) {
            return (
              <Badge className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 h-5 text-[10px]">
                <Activity className="h-3 w-3 mr-1" />
                Ongoing
              </Badge>
            )
          } else {
            return (
              <Badge className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 h-5 text-[10px]">
                <CheckCircle className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            )
          }
        } catch {
          return <Badge variant="destructive">Error</Badge>
        }
      },
    },
  ]

  const filterOptions = [
    { value: "all-bookings", label: "All Bookings" },
    { value: "my-bookings", label: "My Bookings Only" },
  ]

  return (
    <DataTable
      columns={columns}
      data={bookings}
      onRowDoubleClick={handleRowDoubleClick}
      onDelete={onDelete}
      isLoading={isLoading}
      filterOptions={filterOptions}
      filterValue={viewFilter}
      onFilterChange={onViewFilterChange}
      filterLabel="View"
    />
  )
}