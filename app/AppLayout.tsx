"use client"

import React from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { usePathname } from 'next/navigation';
import { SessionExpiryWarning } from '@/components/auth/SessionExpiryWarning';
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardHeader } from "@/components/ui/dashboard-header"

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  

  const getPageInfo = () => {
    // Handle booking routes
    if (pathname === '/bookings/new') {
      return {
        title: 'Create New Booking',
        description: 'Add a new safari booking to the system',
        breadcrumbs: [
          { label: 'Home', href: '/dashboard' },
          { label: 'Bookings', href: '/bookings' },
          { label: 'New' }
        ]
      }
    }
    
    if (pathname.startsWith('/bookings/edit/')) {
      return {
        title: 'Edit Booking',
        description: 'Update booking details',
        breadcrumbs: [
          { label: 'Home', href: '/dashboard' },
          { label: 'Bookings', href: '/bookings' },
          { label: 'Edit' }
        ]
      }
    }
    
    // Handle agent routes
    if (pathname === '/agents/new') {
      return {
        title: 'Create New Agent',
        description: 'Register a new travel agent in the system',
        breadcrumbs: [
          { label: 'Home', href: '/dashboard' },
          { label: 'Agents', href: '/agents' },
          { label: 'New' }
        ]
      }
    }
    
    if (pathname.startsWith('/agents/edit/')) {
      return {
        title: 'Edit Agent',
        description: 'Update agent details',
        breadcrumbs: [
          { label: 'Home', href: '/dashboard' },
          { label: 'Agents', href: '/agents' },
          { label: 'Edit' }
        ]
      }
    }

    // Handle standard routes with switch
    switch (pathname) {
      case '/dashboard':
        return {
          title: 'Dashboard',
          description: 'Platform overview and analytics',
          breadcrumbs: [
            { label: 'Home', href: '/dashboard' },
            { label: 'Dashboard' }
          ]
        }
      case '/bookings':
        return {
          title: 'Bookings Management',
          description: 'Manage and track travel bookings',
          breadcrumbs: [
            { label: 'Home', href: '/dashboard' },
            { label: 'Bookings' }
          ]
        }
      case '/agents':
        return {
          title: 'Agent Management',
          description: 'Manage travel agents and representatives',
          breadcrumbs: [
            { label: 'Home', href: '/dashboard' },
            { label: 'Agents' }
          ]
        }
      case '/flyer':
        return {
          title: 'Flyer Generator',
          description: 'Create promotional flyers',
          breadcrumbs: [
            { label: 'Home', href: '/dashboard' },
            { label: 'Tools', href: '/flyer' },
            { label: 'Flyer Generator' }
          ]
        }
      case '/settings':
        return {
          title: 'Settings',
          description: 'Manage your account and application preferences',
          breadcrumbs: [
            { label: 'Home', href: '/dashboard' },
            { label: 'Settings' }
          ]
        }
      case '/shadcn-demo':
        return {
          title: 'Component Demo',
          description: 'shadcn/ui component showcase',
          breadcrumbs: [
            { label: 'Home', href: '/dashboard' },
            { label: 'Demo' }
          ]
        }
      default:
        return {
          title: 'Booking Management',
          description: 'Travel management system',
          breadcrumbs: [
            { label: 'Home', href: '/dashboard' }
          ]
        }
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <SessionExpiryWarning />
        <main className="flex-grow flex items-center justify-center">
          {children}
        </main>
        <footer className="border-t p-4 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Booking Management System | All rights reserved | Version 1.0.
        </footer>
      </div>
    );
  }

  const pageInfo = getPageInfo();

  return (
    <SidebarProvider>
      <SessionExpiryWarning />
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <main className="flex flex-1 flex-col overflow-hidden">
          <DashboardHeader
            breadcrumbs={pageInfo.breadcrumbs}
            onRefresh={() => window.location.reload()}
          />
          <div className="flex-1 overflow-auto">
            <div className="flex flex-1 flex-col gap-2 p-2 pt-2 sm:gap-4 sm:p-4">
              {children}
            </div>
          </div>
          <footer className="border-t p-4 text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Booking Management System | All rights reserved | Version 1.0.
          </footer>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;