"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"
import { format } from "date-fns"

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
import { DataTable } from "@/components/ui/data-table"
import { Booking } from "@/types/BookingTypes"

interface BookingsDataTableProps {
  bookings: Booking[]
  onEdit: (booking: Booking) => void
  onDelete: (booking: Booking) => void
  onView: (booking: Booking) => void
}

export function BookingsDataTable({
  bookings,
  onEdit,
  onDelete,
  onView
}: BookingsDataTableProps) {
  
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
          <div className="font-medium">
            {booking.name}
          </div>
        )
      },
    },
    {
      accessorKey: "country",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Destination
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
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
        const date = new Date(row.getValue("date_from"))
        return format(date, "MMM dd, yyyy")
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
        const date = new Date(row.getValue("date_to"))
        return format(date, "MMM dd, yyyy")
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
        return (
          <Badge variant="secondary" className="font-mono">
            {totalPax}
          </Badge>
        )
      },
    },
    {
      accessorKey: "agent_name",
      header: "Agent",
      cell: ({ row }) => {
        const booking = row.original
        return (
          <div className="text-sm">
            <div className="font-medium">{booking.agent || 'N/A'}</div>
          </div>
        )
      },
    },
    {
      accessorKey: "consultant",
      header: "Consultant",
      cell: ({ row }) => {
        return (
          <div className="text-sm font-medium">
            {row.getValue("consultant") || 'N/A'}
          </div>
        )
      },
    },
    {
      id: "breakdown",
      header: "PAX Breakdown",
      cell: ({ row }) => {
        const booking = row.original
        return (
          <div className="text-xs space-y-1">
            <div className="flex space-x-2">
              <Badge variant="outline" className="text-xs">L: {booking.ladies}</Badge>
              <Badge variant="outline" className="text-xs">M: {booking.men}</Badge>
            </div>
            <div className="flex space-x-2">
              <Badge variant="outline" className="text-xs">C: {booking.children}</Badge>
              <Badge variant="outline" className="text-xs">T: {booking.teens}</Badge>
            </div>
          </div>
        )
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
              <DropdownMenuItem onClick={() => onEdit(booking)}>
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
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Bookings Management</h2>
        <p className="text-muted-foreground">
          Manage your bookings with advanced filtering, sorting, and actions.
        </p>
      </div>
      <DataTable 
        columns={columns} 
        data={bookings} 
        searchKey="name"
        searchPlaceholder="Filter by booking name..."
      />
    </div>
  )
}