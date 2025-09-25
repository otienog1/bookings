"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BookingForm from '@/components/BookingForm';
import { api } from '@/utils/api';
import { API_ENDPOINTS } from '@/config/apiEndpoints';
import { useAuth } from '@/components/auth/AuthContext';
import { useRefresh } from '@/contexts/RefreshContext';
import { Booking } from '@/types/BookingTypes';

export default function NewBookingPage() {
  const router = useRouter();
  const { token } = useAuth();
  const { refreshDashboard } = useRefresh();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBookingSubmit = async (bookingData: Booking) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      console.log('Creating new booking:', bookingData);

      const response = await api.post(API_ENDPOINTS.BOOKINGS.CREATE, bookingData, token);
      console.log('Booking created successfully:', response);

      // Trigger dashboard refresh
      refreshDashboard();

      // Redirect to bookings list after successful creation
      router.push('/bookings');
    } catch (error) {
      console.error('Error creating booking:', error);
      // TODO: Show error message to user
      alert('Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/bookings');
  };

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
            booking={null}
            onSave={handleBookingSubmit}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
}