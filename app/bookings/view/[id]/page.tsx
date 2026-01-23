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
  Briefcase,
  Edit,
  Map as MapIcon,
  ChevronDown,
  ChevronUp,
  FileText,
  Plane,
  FolderOpen,
  Eye,
  EyeOff,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthContext';
import { api } from '@/utils/api';
import { API_ENDPOINTS } from '@/config/apiEndpoints';
import { Booking } from '@/types/BookingTypes';
import { Agent } from '@/types/AgentTypes';
import { format, isValid, differenceInDays } from 'date-fns';
import { BookingDocuments } from '@/components/BookingDocuments';
import { ItineraryDisplay } from '@/components/itinerary/ItineraryDisplay';
import ItineraryAgent from '@/components/itinerary/ItineraryAgent';
import { config } from '@/config/environment';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function ViewBookingPage() {
  const params = useParams();
  const bookingId = params.id as string;
  const { token } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [bookingOwner, setBookingOwner] = useState<{ name: string; id: string | number; first_name?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [itinerary, setItinerary] = useState<any | null>(null);
  const [itineraryLoading, setItineraryLoading] = useState(false);
  const [showItinerary, setShowItinerary] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showDocuments, setShowDocuments] = useState(false);
  const [documentsFetched, setDocumentsFetched] = useState(false);
  const [itineraryFetched, setItineraryFetched] = useState(false);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [nextBookingId, setNextBookingId] = useState<string | null>(null);
  const [prevBookingId, setPrevBookingId] = useState<string | null>(null);

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

  // Fetch all bookings to determine next/previous booking by arrival date
  useEffect(() => {
    const fetchAllBookings = async () => {
      if (!token || !bookingId) return;

      try {
        const response = await api.get(API_ENDPOINTS.BOOKINGS.FETCH, token);
        if (response?.bookings) {
          setAllBookings(response.bookings);

          // Find current booking
          const currentBooking = response.bookings.find(
            (b: Booking) => String(b.id) === String(bookingId)
          );

          if (currentBooking && currentBooking.date_from) {
            const currentDate = new Date(currentBooking.date_from);

            // Filter and sort bookings by arrival date
            const sortedBookings = response.bookings
              .filter((b: Booking) => b.date_from) // Only bookings with valid dates
              .sort((a: Booking, b: Booking) => {
                const dateA = new Date(a.date_from);
                const dateB = new Date(b.date_from);
                return dateA.getTime() - dateB.getTime();
              });

            // Find next booking (closest upcoming arrival date after current)
            const nextBooking = sortedBookings.find((b: Booking) => {
              const bookingDate = new Date(b.date_from);
              return bookingDate > currentDate && String(b.id) !== String(bookingId);
            });

            // Find previous booking (closest past arrival date before current)
            const prevBooking = sortedBookings
              .reverse()
              .find((b: Booking) => {
                const bookingDate = new Date(b.date_from);
                return bookingDate < currentDate && String(b.id) !== String(bookingId);
              });

            setNextBookingId(nextBooking ? String(nextBooking.id) : null);
            setPrevBookingId(prevBooking ? String(prevBooking.id) : null);
          }
        }
      } catch (err) {
        console.error('Error fetching all bookings:', err);
      }
    };

    fetchAllBookings();
  }, [bookingId, token]);

  // Fetch itinerary data
  const fetchItinerary = async () => {
    if (!token || !bookingId) return;

    setItineraryLoading(true);
    try {
      // Fetch itineraries for this booking using the new endpoint
      const response = await fetch(
        config.getApiUrl(`/api/bookings/${bookingId}/itineraries`),
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.items.length > 0) {
          // Get the first active itinerary
          const activeItinerary = data.data.items[0];
          console.log('Itinerary data received:', activeItinerary);
          console.log('Has daily_itinerary:', !!activeItinerary?.daily_itinerary);
          console.log('daily_itinerary length:', activeItinerary?.daily_itinerary?.length);
          setItinerary(activeItinerary);
        } else {
          console.log('No itineraries found for this booking');
          setItinerary(null);
        }
      } else {
        console.error('Failed to fetch itineraries:', response.status);
        setItinerary(null);
      }
    } catch (err) {
      console.error('Error fetching itinerary:', err);
      setItinerary(null);
    } finally {
      setItineraryLoading(false);
    }
  };


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
      return <Badge variant="destructive" className="text-sm px-3 py-1">Invalid Dates</Badge>;
    }

    if (startDate > today) {
      const daysUntil = differenceInDays(startDate, today);
      return (
        <Badge className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1">
          Upcoming {daysUntil <= 30 ? `in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}` : ''}
        </Badge>
      );
    } else if (startDate <= today && endDate >= today) {
      const daysRemaining = differenceInDays(endDate, today);
      return (
        <Badge className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1">
          Ongoing {daysRemaining > 0 ? `(${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left)` : '(Last day)'}
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary" className="text-muted-foreground text-sm px-3 py-1">
          Completed
        </Badge>
      );
    }
  };

  // Get compact passenger display
  const getPassengerSummary = (): string => {
    if (!booking) return '';
    const parts: string[] = [];
    if (booking.ladies > 0) parts.push(`${booking.ladies}W`);
    if (booking.men > 0) parts.push(`${booking.men}M`);
    if (booking.teens > 0) parts.push(`${booking.teens}T`);
    if (booking.children > 0) parts.push(`${booking.children}C`);
    return parts.length > 0 ? parts.join(' ') : 'Not specified';
  };

  // Get total passengers - prefer itinerary data if available
  const getTotalPassengers = (): number => {
    // Use itinerary group_size if available
    if (itinerary?.trip_overview?.group_size) {
      return itinerary.trip_overview.group_size;
    }
    if (!booking) return 0;
    return booking.pax || (booking.ladies + booking.men + booking.children + booking.teens);
  };

  // Get countries/destinations from itinerary or booking
  const getDestinations = (): string[] => {
    // Always prioritize booking country if available (primary source of truth)
    if (booking?.country && booking.country.trim() !== '') {
      // Parse booking country - it might be formatted as "KE + TZ + SA"
      const bookingCountries = booking.country
        .split('+')
        .map(c => c.trim())
        .filter(c => c.length > 0);

      // If we have itinerary data with countries, use that for multi-country trips (more detailed)
      if (itinerary?.trip_overview?.countries_visited?.length > 1) {
        return itinerary.trip_overview.countries_visited;
      }
      // Otherwise use parsed booking countries
      return bookingCountries;
    }
    // Fallback to itinerary if booking country is not set
    if (itinerary?.trip_overview?.countries_visited?.length > 0) {
      return itinerary.trip_overview.countries_visited;
    }
    return [];
  };

  // Country code mapping for common safari destinations
  const getCountryCode = (country: string): string => {
    const codes: Record<string, string> = {
      'Kenya': 'KE',
      'Tanzania': 'TZ',
      'Uganda': 'UG',
      'Rwanda': 'RW',
      'South Africa': 'ZA',
      'Botswana': 'BW',
      'Namibia': 'NA',
      'Zimbabwe': 'ZW',
      'Zambia': 'ZM',
      'Mozambique': 'MZ',
      'Malawi': 'MW',
      'Ethiopia': 'ET',
      'Madagascar': 'MG',
      'Mauritius': 'MU',
      'Seychelles': 'SC',
      'Egypt': 'EG',
      'Morocco': 'MA',
      'Ghana': 'GH',
      'Senegal': 'SN',
      'Democratic Republic of Congo': 'CD',
      'DRC': 'CD',
      'Congo': 'CG',
    };
    return codes[country] || country.substring(0, 2).toUpperCase();
  };

  // Get destination display string (short codes)
  const getDestinationDisplay = (): string => {
    const destinations = getDestinations();
    if (destinations.length === 0) return 'Not specified';
    if (destinations.length === 1) return getCountryCode(destinations[0]);
    return destinations.map(getCountryCode).join(' / ');
  };

  // Get duration from itinerary or calculate from booking dates
  const getDurationFromItinerary = (): string => {
    // Prefer itinerary duration
    if (itinerary?.trip_overview?.duration) {
      return itinerary.trip_overview.duration;
    }
    // Fallback to calculated duration
    return getDuration();
  };

  // Get tour name from itinerary
  const getTourName = (): string => {
    if (itinerary?.trip_overview?.tour_name) {
      return itinerary.trip_overview.tour_name;
    }
    return booking?.name || '';
  };

  // Format date range for header
  const getDateRange = (): string => {
    // Prefer itinerary dates if available
    if (itinerary?.trip_overview?.dates) {
      return itinerary.trip_overview.dates;
    }
    if (!booking) return '';
    const startDate = parseDate(booking.date_from);
    const endDate = parseDate(booking.date_to);
    if (!startDate || !endDate) return 'Invalid dates';
    return `${format(startDate, "MMM d")} - ${format(endDate, "MMM d, yyyy")}`;
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
          {/* Quick Glance Header Skeleton */}
          <Card className="mb-6">
            <CardContent className="py-4">
              <div className="flex items-center justify-between mb-3">
                <Skeleton className="h-8 w-40 rounded-md" />
                <div className="flex items-center gap-1.5">
                  <Skeleton className="h-8 w-24 rounded-md" />
                  <Skeleton className="h-8 w-28 rounded-md" />
                  <Skeleton className="h-8 w-24 rounded-md" />
                  <Skeleton className="h-8 w-16 rounded-md" />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="space-y-1.5">
                  <Skeleton className="h-7 w-80" />
                  <Skeleton className="h-5 w-32 rounded-full" />
                </div>
                <Skeleton className="h-16 w-48 rounded-lg" />
              </div>
            </CardContent>
          </Card>

          {/* Main Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Trip Details Skeleton */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <Skeleton className="h-6 w-28" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-5 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Notes Skeleton */}
            <Card className="h-full">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
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

        {/* ===== QUICK GLANCE HEADER ===== */}
        <Card className="mb-6">
          <CardContent className="py-4">
            {/* Top row: Back button and Edit button */}
            <div className="flex items-center justify-between mb-3">
              <Link href="/bookings">
                <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs px-2.5">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Back to Bookings</span>
                </Button>
              </Link>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className={`gap-1.5 h-8 text-xs px-2.5 ${!showDocuments && !showItinerary ? 'bg-secondary' : ''}`}
                  onClick={() => {
                    setShowDocuments(false);
                    setShowItinerary(false);
                  }}
                  title="Show trip overview"
                >
                  <Plane className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Overview</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={`gap-1.5 h-8 text-xs px-2.5 ${showDocuments ? 'bg-secondary' : ''}`}
                  onClick={() => {
                    setShowDocuments(true);
                    setShowItinerary(false);
                    setDocumentsFetched(true);
                  }}
                >
                  <FolderOpen className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Documents</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={`gap-1.5 h-8 text-xs px-2.5 ${showItinerary ? 'bg-secondary' : ''}`}
                  onClick={() => {
                    setShowItinerary(true);
                    setShowDocuments(false);
                    if (!itineraryFetched) {
                      setItineraryFetched(true);
                      fetchItinerary();
                    }
                  }}
                >
                  <MapIcon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Itinerary</span>
                </Button>
                <Link href={`/bookings/edit/${booking.id}`}>
                  <Button size="sm" className="gap-1.5 h-8 text-xs px-2.5">
                    <Edit className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                </Link>
              </div>
            </div>

            {/* Main header content */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="space-y-1.5">
                {/* Booking Name */}
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{booking.name}</h1>
                {/* Status Badge */}
                <div>
                  {getBookingStatus()}
                </div>
              </div>

              {/* Date & Duration Box */}
              <div className="flex items-center gap-2.5 p-2.5 bg-muted/50 rounded-lg">
                <Calendar className="h-6 w-6 text-muted-foreground" />
                <div>
                  <p className="text-sm font-semibold">{getDateRange()}</p>
                  <p className="text-xs text-muted-foreground">{getDurationFromItinerary()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="space-y-6">

          {/* ===== TRIP DETAILS AND NOTES SIDE BY SIDE ===== */}
          {!showDocuments && !showItinerary && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* ===== CONSOLIDATED TRIP DETAILS CARD ===== */}
              <Card className="lg:col-span-2">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Plane className="h-5 w-5" />
                    Trip Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Dates */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Dates
                      </h4>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Arrival</p>
                          <p className="font-medium">{formatDateDisplay(booking.date_from)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Departure</p>
                          <p className="font-medium">{formatDateDisplay(booking.date_to)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Travelers */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Travelers
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold">{getTotalPassengers()}</span>
                          <span className="text-muted-foreground">total</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {booking.ladies > 0 && (
                            <Badge variant="outline" className="text-xs">{booking.ladies} Women</Badge>
                          )}
                          {booking.men > 0 && (
                            <Badge variant="outline" className="text-xs">{booking.men} Men</Badge>
                          )}
                          {booking.teens > 0 && (
                            <Badge variant="outline" className="text-xs">{booking.teens} Teens</Badge>
                          )}
                          {booking.children > 0 && (
                            <Badge variant="outline" className="text-xs">{booking.children} Children</Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Management */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        Managed By
                      </h4>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Agent</p>
                          <p className="font-medium">
                            {getAgentName()}
                            {booking.agent_country && booking.agent_country !== 'Unknown' && (
                              <span className="text-muted-foreground font-normal"> ({booking.agent_country})</span>
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Consultant</p>
                          <p className="font-medium">{getConsultantName()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Destination */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Destination{getDestinations().length > 1 ? 's' : ''}
                      </h4>
                      <div>
                        {getDestinations().length > 1 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {getDestinations().map((country, idx) => (
                              <Badge key={idx} variant="secondary" className="text-sm" title={country}>
                                {getCountryCode(country)}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-lg font-medium" title={getDestinations()[0] || ''}>
                            {getDestinationDisplay()}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground mt-1">{getDurationFromItinerary()}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ===== NOTES SECTION ===== */}
              {booking.notes && (
                <Card className="h-full">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
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
            </div>
          )}

          {/* ===== DOCUMENTS SECTION (Toggleable) ===== */}
          {documentsFetched && (
            <div style={{ display: showDocuments ? 'block' : 'none' }}>
              <BookingDocuments
                bookingId={String(booking.id)}
                bookingName={booking.name}
              />
            </div>
          )}

          {/* ===== ITINERARY SECTION (Toggleable) ===== */}
          {itineraryFetched && showItinerary && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Itinerary Display */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapIcon className="h-5 w-5" />
                    Itinerary
                    {itinerary && (
                      <Badge variant="outline" className="ml-2 font-normal">
                        {itinerary.itinerary?.length || 0} days
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {itineraryLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-8 w-64" />
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-32 w-full" />
                    </div>
                  ) : itinerary ? (
                    <ItineraryDisplay data={itinerary} />
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <MapIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No itinerary found for this booking.</p>
                      <p className="text-sm mt-2">
                        You can scrape an itinerary from Safari Portal using the scraper tool.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Itinerary Assistant */}
              {itinerary && (
                <div className="h-full">
                  <ItineraryAgent itineraryId={itinerary._id} token={token} />
                </div>
              )}
            </div>
          )}

          {/* ===== BOOKING NAVIGATION BUTTONS ===== */}
          {(prevBookingId || nextBookingId) && (
            <div className="mt-6 flex justify-between">
              {prevBookingId ? (
                <Link href={`/bookings/view/${prevBookingId}`}>
                  <Button size="lg" variant="outline" className="gap-2">
                    <ChevronLeft className="h-4 w-4" />
                    Previous Booking
                  </Button>
                </Link>
              ) : (
                <div></div>
              )}
              {nextBookingId ? (
                <Link href={`/bookings/view/${nextBookingId}`}>
                  <Button size="lg" variant="outline" className="gap-2">
                    Next Booking
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <div></div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}