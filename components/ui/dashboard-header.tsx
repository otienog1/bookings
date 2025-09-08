'use client';

import { Search, RefreshCw, Download, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ThemeToggleIcon } from '@/components/ui/theme-toggle-icon';

interface DashboardHeaderProps {
  title?: string;
  description?: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
  onExport?: () => void;
  onAdd?: () => void;
  isRefreshing?: boolean;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
  addButtonText?: string;
  searchPlaceholder?: string;
}

export function DashboardHeader({
  title = "Dashboard",
  description,
  searchQuery,
  onSearchChange,
  onRefresh,
  onExport,
  onAdd,
  isRefreshing = false,
  breadcrumbs,
  addButtonText = "Add New",
  searchPlaceholder = "Search..."
}: DashboardHeaderProps) {

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        
        {breadcrumbs && breadcrumbs.length > 0 && (
          <>
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((item, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <BreadcrumbItem className="hidden md:block">
                      {item.href ? (
                        <BreadcrumbLink asChild>
                          <Link href={item.href}>
                            {item.label}
                          </Link>
                        </BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage>{item.label}</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                    {index < breadcrumbs.length - 1 && (
                      <BreadcrumbSeparator className="hidden md:block" />
                    )}
                  </div>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
            <Separator orientation="vertical" className="mx-2 h-4" />
          </>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2 px-4">
        
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="hidden sm:flex"
        >
          <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          <span className="ml-2">Refresh</span>
        </Button>

        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport} className="hidden sm:flex">
            <Download className="h-4 w-4" />
            <span className="ml-2">Export</span>
          </Button>
        )}

        {onAdd && (
          <Button size="sm" onClick={onAdd}>
            <Plus className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">{addButtonText}</span>
          </Button>
        )}

        <ThemeToggleIcon />

      </div>
    </header>
  );
}