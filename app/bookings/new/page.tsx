"use client"

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BookingForm from '@/components/BookingForm';

export default function NewBookingPage() {
  const router = useRouter();

  const handleBookingSubmit = (bookingData: any) => {
    console.log('New booking data:', bookingData);
    // Handle booking creation here
    // Redirect to bookings list after successful creation
    router.push('/bookings');
  };

  const handleCancel = () => {
    router.push('/bookings');
  };

  return (
    <div className="flex flex-1 flex-col gap-2 p-2 pt-0 sm:gap-4 sm:p-4">
      <div className="min-h-[calc(100vh-4rem)] flex-1 rounded-md p-3 pt-1 sm:rounded-xl sm:p-4 sm:pt-2 md:p-6 md:pt-2">
        <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
          {/* Page Title */}
          <div className="px-2 sm:px-0">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              New Booking
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Create a new safari booking in the system.
            </p>
          </div>

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