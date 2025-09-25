'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Trash2 } from 'lucide-react';
import { api } from '@/utils/api';
import { useAuth } from '@/components/auth/AuthContext';
import { Booking } from '@/types/BookingTypes';
import { API_ENDPOINTS } from '@/config/apiEndpoints';
import { TrashDataTable } from '@/components/TrashDataTable';

interface ApiError {
  status: number;
  message?: string;
}

export default function TrashPage() {
  const [trashedBookings, setTrashedBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [restoreConfirmBooking, setRestoreConfirmBooking] = useState<Booking | null>(null);
  const [deleteConfirmBooking, setDeleteConfirmBooking] = useState<Booking | null>(null);
  const [emptyTrashConfirm, setEmptyTrashConfirm] = useState(false);
  const { token, isAuthenticated } = useAuth();

  const fetchTrashedBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.get(API_ENDPOINTS.BOOKINGS.FETCH_TRASH, token);
      setTrashedBookings(data.bookings || []);
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'status' in error && (error as ApiError).status !== 401) {
        setError((error as ApiError).message || 'Failed to fetch trashed bookings');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (booking: Booking) => {
    try {
      setError('');
      await api.put(API_ENDPOINTS.BOOKINGS.RESTORE(String(booking.id)), {}, token);
      setTrashedBookings(prev => prev.filter(b => b.id !== booking.id));
      setRestoreConfirmBooking(null);
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'status' in error && (error as ApiError).status !== 401) {
        setError((error as ApiError).message || 'Failed to restore booking');
      }
    }
  };

  const handlePermanentDelete = async (booking: Booking) => {
    try {
      setError('');
      await api.delete(API_ENDPOINTS.BOOKINGS.DELETE(String(booking.id)), token);
      setTrashedBookings(prev => prev.filter(b => b.id !== booking.id));
      setDeleteConfirmBooking(null);
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'status' in error && (error as ApiError).status !== 401) {
        setError((error as ApiError).message || 'Failed to permanently delete booking');
      }
    }
  };

  const handleEmptyTrash = async () => {
    try {
      setError('');
      await api.delete(API_ENDPOINTS.BOOKINGS.EMPTY_TRASH, token);
      setTrashedBookings([]);
      setEmptyTrashConfirm(false);
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'status' in error && (error as ApiError).status !== 401) {
        setError((error as ApiError).message || 'Failed to empty trash');
      }
    }
  };

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchTrashedBookings();
    }
  }, [isAuthenticated, token]);


  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-2 p-2 pt-0 sm:gap-4 sm:p-4">
        <div className="min-h-[calc(100vh-4rem)] flex-1 rounded-md p-3 sm:rounded-xl sm:p-4 md:p-6 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-lg font-semibold">Loading...</h2>
            <p className="text-sm text-muted-foreground mt-2">Fetching trashed bookings</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-2 p-2 pt-0 sm:gap-4 sm:p-4">
        <div className="min-h-[calc(100vh-4rem)] flex-1 rounded-md p-3 sm:rounded-xl sm:p-4 md:p-6">
          <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
            {/* Page Title */}
            <div className="flex items-center justify-between px-2 sm:px-0">
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Trash ({trashedBookings.length})
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Bookings that have been moved to trash. You can restore or permanently delete them.
                </p>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="mx-2 sm:mx-0">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Trash Content */}
            <Card>
              <CardHeader>
                <CardTitle>Trashed Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {trashedBookings.length === 0 && !loading ? (
                  <div className="text-center py-8">
                    <Trash2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold text-lg mb-2">Trash is empty</h3>
                    <p className="text-muted-foreground">
                      No bookings in trash. Deleted bookings will appear here.
                    </p>
                  </div>
                ) : (
                  <TrashDataTable
                    bookings={trashedBookings}
                    onRestore={setRestoreConfirmBooking}
                    onPermanentDelete={setDeleteConfirmBooking}
                    onEmptyTrash={() => setEmptyTrashConfirm(true)}
                    isLoading={loading}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Restore Confirmation Dialog */}
      <Dialog open={!!restoreConfirmBooking} onOpenChange={() => setRestoreConfirmBooking(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Restore Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to restore the booking for <strong>{restoreConfirmBooking?.name}</strong>?
              This will move it back to the active bookings list.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRestoreConfirmBooking(null)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => restoreConfirmBooking && handleRestore(restoreConfirmBooking)}
            >
              Restore Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permanent Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmBooking} onOpenChange={() => setDeleteConfirmBooking(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Permanently Delete Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete the booking for <strong>{deleteConfirmBooking?.name}</strong>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmBooking(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmBooking && handlePermanentDelete(deleteConfirmBooking)}
            >
              Delete Forever
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Empty Trash Confirmation Dialog */}
      <Dialog open={emptyTrashConfirm} onOpenChange={setEmptyTrashConfirm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Empty Trash</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete all {trashedBookings.length} bookings in trash?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEmptyTrashConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleEmptyTrash}
            >
              Empty Trash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}