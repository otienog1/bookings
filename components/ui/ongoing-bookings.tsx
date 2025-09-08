'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  MapPin, 
  Users,
  Clock,
  Activity,
  CheckCircle
} from 'lucide-react';
interface OngoingBooking {
  id: string;
  name: string;
  date_from: string;
  date_to: string;
  country: string;
  pax: number;
  agent_name: string;
  agent_country: string;
}

interface OngoingBookingsProps {
  data: OngoingBooking[] | null;
  loading: boolean;
  error: string | null;
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

const getDaysRemaining = (endDateStr: string): number => {
  try {
    let endDate: Date;
    if (typeof endDateStr === 'object' && (endDateStr as any).$date) {
      endDate = new Date((endDateStr as any).$date);
    } else {
      endDate = new Date(endDateStr);
    }
    
    if (isNaN(endDate.getTime())) {
      return 0;
    }
    
    const currentDate = new Date();
    const diffTime = endDate.getTime() - currentDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
};

const getProgressText = (daysRemaining: number): string => {
  if (daysRemaining <= 0) return 'Ending today';
  if (daysRemaining === 1) return '1 day remaining';
  if (daysRemaining <= 7) return `${daysRemaining} days remaining`;
  if (daysRemaining <= 30) return `${Math.ceil(daysRemaining / 7)} weeks remaining`;
  return `${Math.ceil(daysRemaining / 30)} months remaining`;
};

const getStatusBadge = (daysRemaining: number) => {
  if (daysRemaining <= 1) {
    return (
      <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
        <Clock className="h-3 w-3 mr-1" />
        Ending Soon
      </Badge>
    );
  } else if (daysRemaining <= 3) {
    return (
      <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
        <Activity className="h-3 w-3 mr-1" />
        Active
      </Badge>
    );
  } else {
    return (
      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
        <CheckCircle className="h-3 w-3 mr-1" />
        In Progress
      </Badge>
    );
  }
};

export function OngoingBookings({ data, loading, error }: OngoingBookingsProps) {
  const ongoingBookings = data || [];

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Activity className="h-4 w-4 text-green-500" />
            Ongoing Bookings
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Currently active safari bookings
          </p>
        </CardHeader>
        <CardContent>
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
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Activity className="h-4 w-4 text-green-500" />
            Ongoing Bookings
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Currently active safari bookings
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

  if (ongoingBookings.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Activity className="h-4 w-4 text-green-500" />
            Ongoing Bookings
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Currently active safari bookings
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">No bookings currently in progress</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Activity className="h-4 w-4 text-green-500" />
          Ongoing Bookings
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Currently active safari bookings ({ongoingBookings.length})
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {ongoingBookings.slice(0, 4).map((booking) => {
            const daysRemaining = getDaysRemaining(booking.date_to);
            
            return (
              <div key={booking.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-green-600" />
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
                  <Clock className="h-3 w-3 ml-2" />
                  <span className="truncate max-w-[80px]" title={booking.agent_name}>
                    {booking.agent_name}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">
                    Ends: {formatDate(booking.date_to)}
                  </span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">
                    {getProgressText(daysRemaining)}
                  </span>
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
        </div>
      </CardContent>
    </Card>
  );
}