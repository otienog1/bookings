"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Eye, Edit, Trash2, MapPin, Users, Clock } from "lucide-react"
import { format, isValid, differenceInDays, isPast, isFuture, isToday } from "date-fns"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { DataTable } from "@/components/ui/data-table"
import { Booking } from "@/types/BookingTypes"
import { useRouter } from "next/navigation"

interface BookingsDataTableProps {
  bookings: Booking[]
  onDelete: (booking: Booking) => void
  onView: (booking: Booking) => void
}

export function BookingsDataTable({
  bookings,
  onDelete,
  onView
}: BookingsDataTableProps) {
  const router = useRouter()
  
  const columns: ColumnDef<Booking>[] = [
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
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
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
          const daysDiff = differenceInDays(date, today)
          
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="space-y-1">
                    <div className="font-medium">{format(date, "MMM dd, yyyy")}</div>
                    <div className="flex items-center gap-1 text-xs">
                      <Clock className="h-3 w-3" />
                      <span className={isUpcoming ? "text-blue-600" : "text-muted-foreground"}>
                        {isToday(date) ? "Today" : 
                         daysDiff === 1 ? "Tomorrow" :
                         daysDiff > 0 ? `In ${daysDiff} days` :
                         daysDiff === -1 ? "Yesterday" :
                         `${Math.abs(daysDiff)} days ago`}
                      </span>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{format(date, "EEEE, MMMM d, yyyy")}</p>
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
          
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="space-y-1">
                    <div className="font-medium">{format(date, "MMM dd, yyyy")}</div>
                    <div className="flex items-center gap-1 text-xs">
                      <Clock className="h-3 w-3" />
                      <span className={isPastDate ? "text-muted-foreground" : "text-blue-600"}>
                        {isToday(date) ? "Today" : 
                         daysDiff === 1 ? "Tomorrow" :
                         daysDiff > 0 ? `In ${daysDiff} days` :
                         daysDiff === -1 ? "Yesterday" :
                         `${Math.abs(daysDiff)} days ago`}
                      </span>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{format(date, "EEEE, MMMM d, yyyy")}</p>
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
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-mono">
                    {totalPax}
                  </Badge>
                  <Users className="h-3 w-3 text-muted-foreground" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {hasBreakdown ? (
                  <div className="space-y-1">
                    <p className="font-medium">PAX Breakdown:</p>
                    <div className="text-xs space-y-0.5">
                      <div>Ladies: {booking.ladies}</div>
                      <div>Men: {booking.men}</div>
                      <div>Children: {booking.children}</div>
                      <div>Teens: {booking.teens}</div>
                    </div>
                  </div>
                ) : (
                  <p>Total passengers: {totalPax}</p>
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
          if (startDate > today) {
            const daysUntil = differenceInDays(startDate, today)
            return (
              <Badge variant="outline" className="text-blue-600 border-blue-200">
                Upcoming {daysUntil <= 7 ? `(${daysUntil}d)` : ''}
              </Badge>
            )
          } else if (startDate <= today && endDate >= today) {
            return (
              <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                Ongoing
              </Badge>
            )
          } else {
            return (
              <Badge variant="secondary" className="text-muted-foreground">
                Completed
              </Badge>
            )
          }
        } catch {
          return <Badge variant="destructive">Error</Badge>
        }
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const booking = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(booking.id?.toString() || "")}
              >
                Copy booking ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onView(booking)}>
                <Eye className="mr-2 h-4 w-4" />
                View details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/bookings/edit/${booking.id}`)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit booking
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(booking)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete booking
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <DataTable 
      columns={columns} 
      data={bookings} 
      searchKey="name"
      searchPlaceholder="Search bookings by name, agent, or destination..."
    />
  )
}