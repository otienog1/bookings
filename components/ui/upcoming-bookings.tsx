'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  MapPin, 
  Users,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useUpcomingBookings } from '@/hooks/useUpcomingBookings';

interface UpcomingBooking {
  id: string;
  name: string;
  date_from: string;
  date_to: string;
  country: string;
  pax: number;
  agent_name: string;
  agent_country: string;
  created_by: string;
  status: 'upcoming' | 'confirmed';
  daysUntilStart: number;
  duration: number;
}

const formatDate = (dateStr: string): string => {
  try {
    let date: Date;
    if (typeof dateStr === 'object' && (dateStr as any).$date) {
      date = new Date((dateStr as any).$date);
    } else {
      date = new Date(dateStr);
    }
    
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return 'Invalid Date';
  }
};

const getDurationText = (days: number): string => {
  if (days === 1) return '1 day';
  return `${days} days`;
};

const getTimeUntilStart = (daysUntilStart: number): string => {
  if (daysUntilStart === 0) return 'Today';
  if (daysUntilStart === 1) return 'Tomorrow';
  if (daysUntilStart <= 7) return `In ${daysUntilStart} days`;
  if (daysUntilStart <= 30) return `In ${Math.ceil(daysUntilStart / 7)} weeks`;
  return `In ${Math.ceil(daysUntilStart / 30)} months`;
};

const getStatusBadge = (daysUntilStart: number) => {
  if (daysUntilStart <= 3) {
    return (
      <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
        <AlertTriangle className="h-3 w-3 mr-1" />
        Starting Soon
      </Badge>
    );
  } else if (daysUntilStart <= 7) {
    return (
      <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
        <Clock className="h-3 w-3 mr-1" />
        This Week
      </Badge>
    );
  } else {
    return (
      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
        <CheckCircle className="h-3 w-3 mr-1" />
        Scheduled
      </Badge>
    );
  }
};

export function UpcomingBookings() {
  const { upcomingBookings, loading, error } = useUpcomingBookings();

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-500" />
            Upcoming Bookings
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Scheduled safari bookings
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">Loading upcoming bookings...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-500" />
            Upcoming Bookings
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Scheduled safari bookings
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-red-500">Error: {error}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (upcomingBookings.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-500" />
            Upcoming Bookings
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Scheduled safari bookings
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">No upcoming bookings scheduled</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-4 w-4 text-blue-500" />
          Upcoming Bookings
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Scheduled safari bookings ({upcomingBookings.length})
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingBookings.slice(0, 4).map((booking) => {
            const progress = Math.max(10, Math.min(95, 100 - (booking.daysUntilStart * 2))); // Progress based on proximity
            
            return (
              <div key={booking.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium truncate max-w-[120px]" title={booking.name}>
                      {booking.name}
                    </span>
                  </div>
                  {getStatusBadge(booking.daysUntilStart)}
                </div>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{booking.country}</span>
                  <Users className="h-3 w-3 ml-2" />
                  <span>{booking.pax} pax</span>
                  <Clock className="h-3 w-3 ml-2" />
                  <span className="truncate max-w-[80px]" title={booking.agent_name}>
                    {booking.agent_name}
                  </span>
                </div>
                
                <div className="flex justify-end">
                  <span className="text-xs text-muted-foreground font-medium">
                    {getTimeUntilStart(booking.daysUntilStart)}
                  </span>
                </div>
              </div>
            );
          })}
          
          {upcomingBookings.length > 4 && (
            <div className="text-center pt-2">
              <span className="text-xs text-muted-foreground">
                +{upcomingBookings.length - 4} more upcoming bookings
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}