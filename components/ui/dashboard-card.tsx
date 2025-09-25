'use client';

import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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

interface DashboardCardSkeletonProps {
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
      <CardContent>
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
                <Badge
                  variant={
                    stat.changeType === 'positive' ? 'secondary' :
                    stat.changeType === 'negative' ? 'destructive' :
                    'outline'
                  }
                  className="h-5 text-xs"
                >
                  {stat.change}
                </Badge>
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

export function DashboardCardSkeleton({ index, className }: DashboardCardSkeletonProps) {
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
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-24" />
            <div className="space-y-1">
              <Skeleton className="h-8 w-16" />
              <div className="flex items-center space-x-1">
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-3 w-32" />
          </div>
          <div className="rounded-md p-3 bg-muted">
            <Skeleton className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}