'use client';

import { Users, Calendar, CalendarCheck, Building2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DashboardCard, DashboardCardSkeleton } from '@/components/ui/dashboard-card';
import { BookingTrendsChart } from '@/components/ui/revenue-chart';
import { UsersTable } from '@/components/ui/users-table';
import { QuickActions } from '@/components/ui/quick-actions';
import { SystemStatus } from '@/components/ui/system-status';
import { UpcomingBookings } from '@/components/ui/upcoming-bookings';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useAuth } from '@/components/auth/AuthContext';
import { useRefresh } from '@/contexts/RefreshContext';
import UILoader from '@/components/UILoader';

export default function AdminDashboard() {
  const { dashboardRefreshTrigger } = useRefresh();
  const { 
    stats: dashboardStats, 
    bookingTrends, 
    dailyTrends, 
    upcomingBookings,
    loading, 
    error 
  } = useDashboardData(dashboardRefreshTrigger);
  const { user } = useAuth();
  const router = useRouter();


  // These handlers are no longer needed since QuickActions uses Links

  const handleSettings = () => {
    console.log('Opening settings...');
  };


  if (error) {
    return (
      <div className="flex flex-1 flex-col gap-2 p-2 pt-0 sm:gap-4 sm:p-4">
        <div className="min-h-[calc(100vh-4rem)] flex-1 rounded-md p-3 sm:rounded-xl sm:p-4 md:p-6 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-red-500">Error Loading Dashboard</h2>
            <p className="text-sm text-muted-foreground mt-2">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard stats data - using the most relevant booking metrics
  const stats = [
    {
      title: 'Total Bookings',
      value: dashboardStats?.totalBookings.value.toLocaleString() || '0',
      change: dashboardStats?.totalBookings.change || '+0%',
      changeType: dashboardStats?.totalBookings.changeType || 'positive' as const,
      icon: Building2,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Completed Bookings',
      value: dashboardStats?.completedBookings.value.toLocaleString() || '0',
      change: dashboardStats?.completedBookings.change || '+0%',
      changeType: dashboardStats?.completedBookings.changeType || 'positive' as const,
      icon: CalendarCheck,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: 'Upcoming Bookings',
      value: dashboardStats?.upcomingBookings.value.toLocaleString() || '0',
      change: dashboardStats?.upcomingBookings.change || '+0%',
      changeType: dashboardStats?.upcomingBookings.changeType || 'positive' as const,
      icon: Calendar,
      color: 'text-violet-600 dark:text-violet-400',
      bgColor: 'bg-violet-500/10',
    },
    {
      title: 'Total Travelers',
      value: dashboardStats?.totalPax.value.toLocaleString() || '0',
      change: dashboardStats?.totalPax.change || '+0%',
      changeType: dashboardStats?.totalPax.changeType || 'positive' as const,
      icon: Users,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-500/10',
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-2 p-2 pt-0 sm:gap-4 sm:p-4">
      <div className="min-h-[calc(100vh-4rem)] flex-1 rounded-md p-3 sm:rounded-xl sm:p-4 md:p-6">
        <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
          <div className="px-2 sm:px-0">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Welcome {user?.first_name || user?.username || 'User'}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Here&apos;s what&apos;s happening with your platform today.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <DashboardCardSkeleton key={`skeleton-${index}`} index={index} />
              ))
            ) : (
              stats.map((stat, index) => (
                <DashboardCard key={stat.title} stat={stat} index={index} />
              ))
            )}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-3">
            {/* Charts Section */}
            <div className="space-y-4 sm:space-y-6 xl:col-span-2">
              <BookingTrendsChart data={bookingTrends} dailyData={dailyTrends} loading={loading} />
              <UsersTable isLoading={loading} />
            </div>

            {/* Sidebar Section */}
            <div className="space-y-4 sm:space-y-6">
              <QuickActions
                onAddBooking={() => {}} // Will use Link instead
                onAddAgent={() => {}} // Will use Link instead
                onSettings={handleSettings}
                isLoading={loading}
              />
              <SystemStatus />
              <UpcomingBookings data={upcomingBookings} loading={loading} error={error} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}