'use client';

import { useState, useEffect } from 'react';
import { config } from '@/config/environment';

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

interface UseUpcomingBookingsReturn {
  upcomingBookings: UpcomingBooking[];
  loading: boolean;
  error: string | null;
}

export function useUpcomingBookings(): UseUpcomingBookingsReturn {
  const [upcomingBookings, setUpcomingBookings] = useState<UpcomingBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUpcomingBookings = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${config.getApiUrl('/booking/fetch')}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          
          // Handle different possible response structures
          let bookingsArray: any[] = [];
          if (Array.isArray(data)) {
            bookingsArray = data;
          } else if (data.bookings && Array.isArray(data.bookings)) {
            bookingsArray = data.bookings;
          } else if (data.data && Array.isArray(data.data)) {
            bookingsArray = data.data;
          }

          // Filter for upcoming bookings (start date is in the future)
          const currentDate = new Date();
          const upcoming = bookingsArray.filter((booking: any) => {
            try {
              let startDate: Date;
              
              // Handle different date formats from backend
              if (booking.date_from && typeof booking.date_from === 'object' && booking.date_from.$date) {
                startDate = new Date(booking.date_from.$date);
              } else if (booking.date_from) {
                startDate = new Date(booking.date_from);
              } else {
                return false;
              }

              // Check if date is valid and in the future
              return !isNaN(startDate.getTime()) && startDate > currentDate;
            } catch {
              return false;
            }
          });

          // Map to the expected format and calculate additional fields
          const mappedBookings: UpcomingBooking[] = upcoming.map((booking: any) => {
            let startDate: Date, endDate: Date;
            
            // Parse start date
            if (booking.date_from && typeof booking.date_from === 'object' && booking.date_from.$date) {
              startDate = new Date(booking.date_from.$date);
            } else {
              startDate = new Date(booking.date_from);
            }

            // Parse end date
            if (booking.date_to && typeof booking.date_to === 'object' && booking.date_to.$date) {
              endDate = new Date(booking.date_to.$date);
            } else {
              endDate = new Date(booking.date_to);
            }

            // Calculate days until start
            const diffTime = startDate.getTime() - currentDate.getTime();
            const daysUntilStart = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // Calculate duration in days
            const durationTime = endDate.getTime() - startDate.getTime();
            const duration = Math.ceil(durationTime / (1000 * 60 * 60 * 24));

            // Determine status based on how far in the future
            const status: 'upcoming' | 'confirmed' = daysUntilStart > 30 ? 'confirmed' : 'upcoming';

            return {
              id: booking.id || booking._id?.$oid || booking._id,
              name: booking.name,
              date_from: booking.date_from,
              date_to: booking.date_to,
              country: booking.country,
              pax: booking.pax || 0,
              agent_name: booking.agent_name || 'Unknown Agent',
              agent_country: booking.agent_country || 'Unknown',
              created_by: booking.created_by || 'Unknown User',
              status,
              daysUntilStart,
              duration
            };
          });

          // Sort by start date (closest first)
          mappedBookings.sort((a, b) => a.daysUntilStart - b.daysUntilStart);

          setUpcomingBookings(mappedBookings);
        } else {
          throw new Error(`Failed to fetch bookings: ${response.status}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch upcoming bookings');
        console.error('Error fetching upcoming bookings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingBookings();
  }, []);

  return {
    upcomingBookings,
    loading,
    error,
  };
}