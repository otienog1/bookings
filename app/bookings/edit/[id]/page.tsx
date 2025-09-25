"use client"

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import BookingForm from '@/components/BookingForm';
import UILoader from '@/components/UILoader';
import { useAuth } from '@/components/auth/AuthContext';
import { useRefresh } from '@/contexts/RefreshContext';
import { api } from '@/utils/api';
import { API_ENDPOINTS } from '@/config/apiEndpoints';
import { Booking } from '@/types/BookingTypes';

export default function EditBookingPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;
  const { token } = useAuth();
  const { refreshDashboard } = useRefresh();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId || !token) return;

      try {
        setLoading(true);
        const response = await api.get(API_ENDPOINTS.BOOKINGS.GET(bookingId), token);
        setBooking(response.booking);
      } catch (err) {
        setError('Failed to load booking details');
        console.error('Error fetching booking:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, token]);

  const handleBookingSubmit = async (bookingData: Booking) => {
    try {
      await api.put(API_ENDPOINTS.BOOKINGS.EDIT(bookingId), bookingData, token);
      console.log('Booking updated:', bookingData);

      // Trigger dashboard refresh
      refreshDashboard();

      // Redirect to bookings list after successful update
      router.push('/bookings');
    } catch (err) {
      console.error('Error updating booking:', err);
      setError('Failed to update booking');
    }
  };

  const handleCancel = () => {
    window.location.href = '/bookings';
  };

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-2 p-2 pt-0 sm:gap-4 sm:p-4">
        <div className="min-h-[calc(100vh-4rem)] flex-1 rounded-md p-3 sm:rounded-xl sm:p-4 md:p-6 flex items-center justify-center">
          <UILoader text="Loading booking details..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col gap-2 p-2 pt-0 sm:gap-4 sm:p-4">
        <div className="min-h-[calc(100vh-4rem)] flex-1 rounded-md p-3 sm:rounded-xl sm:p-4 md:p-6 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-red-500">Error Loading Booking</h2>
            <p className="text-sm text-muted-foreground mt-2">{error}</p>
            <Button className="mt-4" asChild>
              <Link href="/bookings">Back to Bookings</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-2 p-2 pt-0 sm:gap-4 sm:p-4">
      <div className="min-h-[calc(100vh-4rem)] flex-1 rounded-md p-3 pt-1 sm:rounded-xl sm:p-4 sm:pt-2 md:p-6 md:pt-2">
        <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">

          {/* Back Button */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/bookings" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Bookings
              </Link>
            </Button>
          </div>

          <BookingForm
            booking={booking}
            onSave={handleBookingSubmit}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
}