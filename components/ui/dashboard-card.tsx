'use client';

import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatData {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  color: string;
  bgColor: string;
  description?: string;
}

interface DashboardCardProps {
  stat: StatData;
  index: number;
  className?: string;
}

export function DashboardCard({ stat, index, className }: DashboardCardProps) {
  const Icon = stat.icon;
  
  return (
    <Card 
      className={cn(
        "relative overflow-hidden transition-all duration-200 hover:shadow-md border bg-gradient-to-br from-background to-muted/20",
        className
      )}
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </p>
            <div className="space-y-1">
              <p className="text-2xl font-bold tracking-tight sm:text-3xl">
                {stat.value}
              </p>
              <div className="flex items-center space-x-1 text-xs sm:text-sm">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 font-medium",
                    stat.changeType === 'positive' && "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
                    stat.changeType === 'negative' && "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
                    stat.changeType === 'neutral' && "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                  )}
                >
                  {stat.change}
                </span>
                <span className="text-muted-foreground text-xs">
                  vs last month
                </span>
              </div>
            </div>
            {stat.description && (
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            )}
          </div>
          <div className={cn("rounded-md p-3", stat.bgColor)}>
            <Icon className={cn("h-6 w-6", stat.color)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}