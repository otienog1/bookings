'use client';

import { useState, useEffect } from 'react';
import { config } from '@/config/environment';
import { useAuth } from '@/components/auth/AuthContext';
import { API_ENDPOINTS } from '@/config/apiEndpoints';

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

interface UseOngoingBookingsReturn {
  ongoingBookings: OngoingBooking[];
  loading: boolean;
  error: string | null;
}

export function useOngoingBookings(): UseOngoingBookingsReturn {
  const [ongoingBookings, setOngoingBookings] = useState<OngoingBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchOngoingBookings = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${config.getApiUrl(API_ENDPOINTS.BOOKINGS.FETCH)}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
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

          // Filter for ongoing bookings (started but not finished)
          const currentDate = new Date();
          const ongoing = bookingsArray.filter((booking: any) => {
            try {
              let startDate: Date, endDate: Date;
              
              // Handle different date formats from backend
              if (booking.date_from && typeof booking.date_from === 'object' && booking.date_from.$date) {
                startDate = new Date(booking.date_from.$date);
              } else if (booking.date_from) {
                startDate = new Date(booking.date_from);
              } else {
                return false;
              }

              if (booking.date_to && typeof booking.date_to === 'object' && booking.date_to.$date) {
                endDate = new Date(booking.date_to.$date);
              } else if (booking.date_to) {
                endDate = new Date(booking.date_to);
              } else {
                return false;
              }

              // Check if dates are valid
              if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                return false;
              }

              // Use normalized dates for accurate comparison
              const todayStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
              const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
              const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

              // Booking is ongoing if it has started but not ended (inclusive of today)
              return startDateOnly <= todayStart && endDateOnly >= todayStart;
            } catch {
              return false;
            }
          });

          // Map to the expected format
          const mappedBookings: OngoingBooking[] = ongoing.map((booking: any) => ({
            id: booking.id || booking._id?.$oid || booking._id,
            name: booking.name,
            date_from: booking.date_from,
            date_to: booking.date_to,
            country: booking.country,
            pax: booking.pax || 0,
            agent_name: booking.agent_name || 'Unknown Agent',
            agent_country: booking.agent_country || 'Unknown'
          }));

          setOngoingBookings(mappedBookings);
        } else {
          throw new Error(`Failed to fetch bookings: ${response.status}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch ongoing bookings');
        console.error('Error fetching ongoing bookings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOngoingBookings();
  }, [token]);

  return {
    ongoingBookings,
    loading,
    error,
  };
}