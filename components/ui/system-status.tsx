'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  } catch {
    return 0;
  }
};

const getStatusBadge = (daysRemaining: number) => {
  if (daysRemaining === 0) {
    return (
      <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
        <AlertTriangle className="h-3 w-3 mr-1" />
        Ends Today
      </Badge>
    );
  } else if (daysRemaining === 1) {
    return (
      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
        <Clock className="h-3 w-3 mr-1" />
        1 Day Left
      </Badge>
    );
  } else {
    return (
      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
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
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">Loading ongoing bookings...</div>
          </div>
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
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-3">
                    <div
                      className="h-2 rounded-full transition-all duration-700 bg-blue-500"
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