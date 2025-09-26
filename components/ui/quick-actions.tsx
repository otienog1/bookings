'use client';

import { Users, Calendar, Settings, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

interface QuickActionItem {
  title: string;
  description: string;
  icon: React.ElementType;
  href?: string;
  onClick?: () => void;
  variant?: 'default' | 'secondary' | 'outline';
  disabled?: boolean;
}

interface QuickActionsProps {
  onAddBooking?: () => void;
  onAddAgent?: () => void;
  onSettings?: () => void;
  className?: string;
  isLoading?: boolean;
}

export function QuickActions({
  onAddBooking,
  onAddAgent,
  onSettings,
  className,
  isLoading = false
}: QuickActionsProps) {

  const actionList = [
    // Show New Booking button if onAddBooking is provided
    onAddBooking ? {
      title: 'New Booking',
      description: 'Create a new safari booking',
      icon: Calendar,
      href: '/bookings/new',
      variant: 'outline' as const,
      disabled: false
    } : null,
    // Show New Agent button if onAddAgent is provided
    onAddAgent ? {
      title: 'New Agent',
      description: 'Register a new travel agent',
      icon: Users,
      href: '/agents/new',
      variant: 'outline' as const,
      disabled: false
    } : null,
    // Show Settings button if onSettings is provided
    onSettings ? {
      title: 'Settings',
      description: 'Manage system settings',
      icon: Settings,
      onClick: onSettings,
      variant: 'outline' as const,
      disabled: false
    } : null
  ];

  const actions = actionList.filter((action) => action !== null && !action.disabled) as QuickActionItem[];

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-5 w-24" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="flex items-center space-x-3 p-3 rounded-lg border"
            >
              <div className="flex-shrink-0">
                <Skeleton className="w-10 h-10 rounded-lg" />
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action) => {
          const Icon = action.icon;

          const content = (
            <>
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{action.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {action.description}
                </div>
              </div>
            </>
          );

          return action.href ? (
            <Link
              key={action.title}
              href={action.href}
              className="group flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
            >
              {content}
            </Link>
          ) : (
            <div
              key={action.title}
              className="group flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={action.onClick}
            >
              {content}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}