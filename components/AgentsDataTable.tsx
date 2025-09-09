"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Eye, Edit, Trash2, UserCheck, Mail, MapPin } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTable } from "@/components/ui/data-table"
import { Agent } from "@/types/AgentTypes"
import { useRouter } from "next/navigation"

interface AgentsDataTableProps {
  agents: Agent[]
  onDelete: (agent: Agent) => void
  onView?: (agent: Agent) => void
  isAdmin?: boolean
  currentUserId?: number
}

export function AgentsDataTable({
  agents,
  onDelete,
  onView,
  isAdmin = false,
  currentUserId
}: AgentsDataTableProps) {
  const router = useRouter()

  const columns: ColumnDef<Agent>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Agent Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const agent = row.original
        return (
          <div className="font-medium">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-muted-foreground" />
              <span className="uppercase">{agent.name}</span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => {
        const email = row.getValue("email") as string
        return (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-sm">{email}</span>
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
            Country
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const country = row.getValue("country") as string
        return (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="uppercase font-medium">{country}</span>
          </div>
        )
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const agent = row.original
        const canEdit = isAdmin || agent.user_id === currentUserId
        const canDelete = isAdmin || agent.user_id === currentUserId

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
                onClick={() => navigator.clipboard.writeText(agent.email)}
              >
                Copy email
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(agent.id?.toString() || "")}
              >
                Copy agent ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {onView && (
                <DropdownMenuItem onClick={() => onView(agent)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View details
                </DropdownMenuItem>
              )}
              {canEdit && (
                <DropdownMenuItem onClick={() => router.push(`/agents/edit/${agent.id}`)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit agent
                </DropdownMenuItem>
              )}
              {canDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(agent)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete agent
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={agents}
      searchKey="name"
      searchPlaceholder="Filter by agent name..."
    />
  )
}