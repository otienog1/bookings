"use client"

import * as React from "react"
import Link from "next/link"
import { Calendar, Users, Building2, FileText, BarChart3, Activity } from "lucide-react"
import { useAuth } from "@/components/auth/AuthContext"
import { ThemeToggle } from "@/components/ui/theme-toggle"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: BarChart3,
    },
    {
      title: "Bookings",
      url: "/bookings",
      icon: Calendar,
    },
    {
      title: "Agents",
      url: "/agents",
      icon: Users,
    },
  ],
  navSecondary: [
    {
      title: "Flyer Generator",
      url: "/flyer",
      icon: FileText,
    },
    {
      title: "Activity",
      url: "/activity",
      icon: Activity,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, isAdmin } = useAuth()

  return (
    <Sidebar {...props}>
      <SidebarHeader className="gap-3 border-b p-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary" />
          <span className="font-semibold text-lg">Bookings</span>
          <Badge variant="secondary" className="ml-auto text-xs">
            v1.0
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground">
          Travel Management System
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-0">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Secondary Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navSecondary.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>
      <div className="p-4">
        <ThemeToggle />
      </div>
      <SidebarFooter className="border-t p-4 space-y-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" />
            <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {user?.username?.substring(0, 2).toUpperCase() || "UN"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium truncate">
              {user?.first_name || user?.username || "User"}
            </span>
            <span className="text-xs text-muted-foreground">
              {isAdmin ? "Administrator" : "User"}
            </span>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}