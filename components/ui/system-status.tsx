'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Calendar,
  MapPin,
  Users,
  Globe,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { useOngoingBookings } from '@/hooks/useOngoingBookings';


const formatDate = (dateStr: string): string => {
  try {
    let date: Date;
    if (typeof dateStr === 'object' && (dateStr as { $date: string }).$date) {
      date = new Date((dateStr as { $date: string }).$date);
    } else {
      date = new Date(dateStr);
    }
    
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return 'Invalid Date';
  }
};

const getDaysRemaining = (endDateStr: string): number => {
  try {
    let endDate: Date;
    if (typeof endDateStr === 'object' && (endDateStr as { $date: string }).$date) {
      endDate = new Date((endDateStr as { $date: string }).$date);
    } else {
      endDate = new Date(endDateStr);
    }

    if (isNaN(endDate.getTime())) {
      return 0;
    }

    const today = new Date();
    // Use normalized dates for accurate day comparison
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    const diffTime = endDateOnly.getTime() - todayStart.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  } catch {
    return 0;
  }
};

const getStatusBadge = (daysRemaining: number) => {
  if (daysRemaining === 0) {
    return (
      <Badge variant="destructive" className="h-6">
        <AlertTriangle className="h-3 w-3 mr-1" />
        Ends Today
      </Badge>
    );
  } else if (daysRemaining === 1) {
    return (
      <Badge variant="outline" className="h-6 border-orange-200 text-orange-800 dark:border-orange-800 dark:text-orange-400">
        <Clock className="h-3 w-3 mr-1" />
        1 Day Left
      </Badge>
    );
  } else {
    return (
      <Badge variant="secondary" className="h-6">
        <CheckCircle className="h-3 w-3 mr-1" />
        {daysRemaining} Days Left
      </Badge>
    );
  }
};

export function SystemStatus() {
  const { ongoingBookings, loading, error } = useOngoingBookings();

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Ongoing Bookings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={`skeleton-${index}`} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-5 w-16" />
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <Skeleton className="h-3 w-16" />
                <Users className="h-3 w-3 ml-2" />
                <Skeleton className="h-3 w-12" />
                <Globe className="h-3 w-3 ml-2" />
                <Skeleton className="h-3 w-20" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="w-full bg-muted rounded-full h-1 mr-3">
                    <Skeleton className="h-1 w-1/2 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-24 min-w-fit" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Ongoing Bookings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-red-500">Error: {error}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (ongoingBookings.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Ongoing Bookings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">No ongoing bookings at the moment</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Ongoing Bookings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {ongoingBookings.slice(0, 4).map((booking) => {
          const daysRemaining = getDaysRemaining(booking.date_to);
          
          return (
            <div key={booking.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium truncate max-w-[120px]" title={booking.name}>
                    {booking.name}
                  </span>
                </div>
                {getStatusBadge(daysRemaining)}
              </div>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{booking.country}</span>
                <Users className="h-3 w-3 ml-2" />
                <span>{booking.pax} pax</span>
                <Globe className="h-3 w-3 ml-2" />
                <span className="truncate max-w-[80px]" title={booking.agent_name}>
                  {booking.agent_name}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="w-full bg-muted rounded-full h-1 mr-3">
                    <div
                      className="h-1 rounded-full transition-all duration-700 bg-primary"
                      style={{
                        width: `${Math.max(10, Math.min(95, (7 - daysRemaining) * 12))}%`
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground font-medium min-w-fit">
                    {formatDate(booking.date_from)} - {formatDate(booking.date_to)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        
        {ongoingBookings.length > 4 && (
          <div className="text-center pt-2">
            <span className="text-xs text-muted-foreground">
              +{ongoingBookings.length - 4} more ongoing bookings
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}