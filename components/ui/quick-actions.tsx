'use client';

import { Users, Calendar, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface QuickActionItem {
  title: string;
  description: string;
  icon: React.ElementType;
  onClick: () => void;
  variant?: 'default' | 'secondary' | 'outline';
  disabled?: boolean;
}

interface QuickActionsProps {
  onAddBooking?: () => void;
  onAddAgent?: () => void;
  onSettings?: () => void;
  className?: string;
}

export function QuickActions({
  onAddBooking,
  onAddAgent,
  onSettings,
  className
}: QuickActionsProps) {

  const actionList = [
    // Show New Booking button if onAddBooking is provided
    onAddBooking ? {
      title: 'New Booking',
      description: 'Create a new safari booking',
      icon: Calendar,
      onClick: onAddBooking,
      variant: 'outline' as const,
      disabled: false
    } : null,
    // Show New Agent button if onAddAgent is provided
    onAddAgent ? {
      title: 'New Agent',
      description: 'Register a new travel agent',
      icon: Users,
      onClick: onAddAgent,
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

  return (
    <Card className={cn("bg-gradient-to-br from-primary/5 to-primary/10", className)}>
      <CardHeader className="pb-3 bg-gradient-to-r from-primary/10 to-primary/15 rounded-t-lg">
        <CardTitle className="text-lg font-bold text-primary flex items-center gap-2">
          ⚡ Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.title}
              variant={action.variant || 'default'}
              className="w-full justify-start h-auto px-4 py-3 transition-colors duration-200 hover:shadow-md cursor-pointer"
              onClick={action.onClick}
              disabled={action.disabled}
            >
              <div className="flex items-center space-x-3">
                <div className="p-1 rounded-full bg-primary/10">
                  <Icon className="h-4 w-4 flex-shrink-0 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold">{action.title}</div>
                  <div className={`text-xs mt-0.5 ${action.variant === 'outline' ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                    {action.description}
                  </div>
                </div>
              </div>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}