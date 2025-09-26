"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Users, 
  User, 
  Building2, 
  Clock, 
  Edit
} from 'lucide-react';
import Link from 'next/link';
// import UILoader from '@/components/UILoader';
import { useAuth } from '@/components/auth/AuthContext';
import { api } from '@/utils/api';
import { API_ENDPOINTS } from '@/config/apiEndpoints';
import { Booking } from '@/types/BookingTypes';
import { Agent } from '@/types/AgentTypes';
import { format, isValid, differenceInDays } from 'date-fns';
import { BookingDocuments } from '@/components/BookingDocuments';

export default function ViewBookingPage() {
  const params = useParams();
  const bookingId = params.id as string;
  const { token } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [bookingOwner, setBookingOwner] = useState<{ name: string; id: string | number; first_name?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!bookingId || !token) return;

      try {
        setLoading(true);

        // Fetch both booking and agents data in parallel
        const [bookingResponse, agentsResponse] = await Promise.allSettled([
          api.get(API_ENDPOINTS.BOOKINGS.GET(bookingId), token),
          api.get(API_ENDPOINTS.AGENTS.FETCH, token)
        ]);

        // Handle booking response
        if (bookingResponse.status === 'fulfilled') {
          const bookingData = bookingResponse.value.booking;
          setBooking(bookingData);

          // Fetch booking owner information if user_id exists
          if (bookingData.user_id) {
            try {
              const ownerResponse = await api.get(API_ENDPOINTS.AUTH.USER(String(bookingData.user_id)), token);
              setBookingOwner(ownerResponse.user);
            } catch (ownerError) {
              console.error('Error fetching booking owner:', ownerError);
            }
          }
        } else {
          setError('Failed to load booking details');
          console.error('Error fetching booking:', bookingResponse.reason);
        }

        // Handle agents response
        if (agentsResponse.status === 'fulfilled' && agentsResponse.value?.agents) {
          setAgents(agentsResponse.value.agents);
        }
      } catch (err) {
        setError('Failed to load booking details');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [bookingId, token]);

  // Create agent lookup for getting agent names
  const agentLookup = useMemo(() => {
    const lookup = new Map();
    agents.forEach(agent => lookup.set(agent.id, agent.name));
    return lookup;
  }, [agents]);

  // Helper function to get agent name
  const getAgentName = (): string => {
    if (!booking) return 'Not specified';

    // Try different agent name fields in order of preference
    if (booking.agent_name && booking.agent_name !== 'Unknown Agent') {
      return booking.agent_name;
    }

    if (booking.agent && booking.agent !== 'Unknown Agent') {
      return booking.agent;
    }

    if (booking.agent_id) {
      const agentName = agentLookup.get(booking.agent_id);
      if (agentName) return agentName;
    }

    return 'Not specified';
  };

  // Helper function to get consultant name
  const getConsultantName = (): string => {
    if (!booking) return 'Not specified';

    // If consultant is specified, return it
    if (booking.consultant) {
      return booking.consultant;
    }

    // If no consultant specified, return first name of booking owner
    if (bookingOwner?.first_name) {
      return bookingOwner.first_name;
    }

    return 'Not specified';
  };

  const parseDate = (dateValue: unknown): Date | null => {
    if (!dateValue) return null;
    
    try {
      let date: Date;
      
      if (dateValue instanceof Date) {
        date = dateValue;
      } else if (typeof dateValue === 'object' && dateValue !== null && '$date' in dateValue) {
        date = new Date((dateValue as { $date: string | number | Date }).$date);
      } else {
        const dateStr = String(dateValue);
        date = new Date(dateStr);
        
        if (!isValid(date) && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
          date = new Date(dateStr + 'T00:00:00');
        }
      }
      
      return isValid(date) ? date : null;
    } catch {
      return null;
    }
  };

  const getBookingStatus = () => {
    if (!booking) return null;
    
    const startDate = parseDate(booking.date_from);
    const endDate = parseDate(booking.date_to);
    const today = new Date();
    
    if (!startDate || !endDate) {
      return <Badge variant="destructive">Invalid Dates</Badge>;
    }
    
    if (startDate > today) {
      const daysUntil = differenceInDays(startDate, today);
      return (
        <Badge variant="outline" className="text-blue-600 border-blue-200">
          Upcoming {daysUntil <= 7 ? `(${daysUntil} days)` : ''}
        </Badge>
      );
    } else if (startDate <= today && endDate >= today) {
      return (
        <Badge variant="default" className="bg-green-600 hover:bg-green-700">
          Ongoing
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary" className="text-muted-foreground">
          Completed
        </Badge>
      );
    }
  };

  const formatDateDisplay = (dateValue: unknown): string => {
    const date = parseDate(dateValue);
    return date ? format(date, "EEEE, MMMM d, yyyy") : 'Invalid Date';
  };

  const getDuration = (): string => {
    if (!booking) return '';
    
    const startDate = parseDate(booking.date_from);
    const endDate = parseDate(booking.date_to);
    
    if (!startDate || !endDate) return '';
    
    const days = differenceInDays(endDate, startDate) + 1;
    return `${days} day${days !== 1 ? 's' : ''}`;
  };

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-2 p-2 pt-0 sm:gap-4 sm:p-4">
        <div className="min-h-[calc(100vh-4rem)] flex-1 rounded-md p-3 pt-1 sm:rounded-xl sm:p-4 sm:pt-2 md:p-6 md:pt-2">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-24" />
          </div>

          {/* Main Content Skeleton */}
          <div className="space-y-6">
            {/* Booking Overview Skeleton */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Travel Details Skeleton */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      <Skeleton className="h-6 w-28" />
                    </div>
                    <div className="space-y-3">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <Skeleton className="h-4 w-4 mt-1" />
                          <div>
                            <Skeleton className="h-4 w-20 mb-1" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Passenger Information Skeleton */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      <Skeleton className="h-6 w-36" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-6 w-8" />
                      </div>
                      <Separator />
                      <div className="grid grid-cols-2 gap-3">
                        {Array.from({ length: 4 }).map((_, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <Skeleton className="h-3 w-12" />
                            <Skeleton className="h-3 w-4" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking Management Skeleton */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  <Skeleton className="h-6 w-36" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    {Array.from({ length: 2 }).map((_, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <User className="h-4 w-4 mt-1 text-muted-foreground" />
                        <div>
                          <Skeleton className="h-4 w-16 mb-1" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    {Array.from({ length: 2 }).map((_, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Building2 className="h-4 w-4 mt-1 text-muted-foreground" />
                        <div>
                          <Skeleton className="h-4 w-20 mb-1" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes Section Skeleton */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Edit className="h-5 w-5" />
                  <Skeleton className="h-6 w-12" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="flex flex-1 flex-col gap-2 p-2 pt-0 sm:gap-4 sm:p-4">
        <div className="min-h-[calc(100vh-4rem)] flex-1 rounded-md p-3 pt-1 sm:rounded-xl sm:p-4 sm:pt-2 md:p-6 md:pt-2">
          <div className="mb-6">
            <Link href="/bookings">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Bookings
              </Button>
            </Link>
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-red-500">Error Loading Booking</h2>
            <p className="text-sm text-muted-foreground mt-2">{error || 'Booking not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-2 p-2 pt-0 sm:gap-4 sm:p-4">
      <div className="min-h-[calc(100vh-4rem)] flex-1 rounded-md p-3 pt-1 sm:rounded-xl sm:p-4 sm:pt-2 md:p-6 md:pt-2">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/bookings">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Bookings
            </Button>
          </Link>
          <Link href={`/bookings/edit/${booking.id}`}>
            <Button size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit Booking
            </Button>
          </Link>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Booking Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{booking.name}</CardTitle>
                  <p className="text-muted-foreground mt-1">Booking ID: {booking.id}</p>
                </div>
                {getBookingStatus()}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Travel Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Travel Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Clock className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Duration</p>
                        <p className="text-sm text-muted-foreground">{getDuration()}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Arrival Date</p>
                        <p className="text-sm text-muted-foreground">{formatDateDisplay(booking.date_from)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Departure Date</p>
                        <p className="text-sm text-muted-foreground">{formatDateDisplay(booking.date_to)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Destination</p>
                        <p className="text-sm text-muted-foreground">{booking.country}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Passenger Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Passenger Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Passengers</span>
                      <Badge variant="secondary" className="font-mono">
                        {booking.pax || (booking.ladies + booking.men + booking.children + booking.teens)}
                      </Badge>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Ladies</span>
                        <span className="text-sm font-mono">{booking.ladies || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Men</span>
                        <span className="text-sm font-mono">{booking.men || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Children</span>
                        <span className="text-sm font-mono">{booking.children || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Teens</span>
                        <span className="text-sm font-mono">{booking.teens || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Booking Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <User className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Agent</p>
                      <p className="text-sm text-muted-foreground">{getAgentName()}</p>
                      {booking.agent_country && booking.agent_country !== 'Unknown' && (
                        <p className="text-xs text-muted-foreground">({booking.agent_country})</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <User className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Consultant</p>
                      <p className="text-sm text-muted-foreground">{getConsultantName()}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <User className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Created By</p>
                      <p className="text-sm text-muted-foreground">{booking.created_by || 'System'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Building2 className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Agent ID</p>
                      <p className="text-sm text-muted-foreground">{booking.agent_id || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes Section */}
          {booking.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit className="h-5 w-5" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="text-sm prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: booking.notes }}
                />
              </CardContent>
            </Card>
          )}

          {/* Documents Section */}
          <BookingDocuments
            bookingId={String(booking.id)}
            bookingName={booking.name}
          />
        </div>
      </div>
    </div>
  );
}