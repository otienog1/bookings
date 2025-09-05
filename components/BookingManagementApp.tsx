"use client"

import { useState, useEffect, useMemo, useCallback } from 'react';
import { format, isBefore, isAfter, startOfDay, endOfDay, isValid } from 'date-fns';
import { type DateRange } from 'react-day-picker';
import { useRouter } from 'next/navigation';
import React from 'react';
import BookingForm from './BookingForm';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Combobox } from '@/components/ui/combobox';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { BookingsDataTable } from './BookingsDataTable';
import { DashboardCard } from '@/components/ui/dashboard-card';
import { DashboardHeader } from '@/components/ui/dashboard-header';
import { QuickActions } from '@/components/ui/quick-actions';
import * as XLSX from 'xlsx';
import { api } from '@/utils/api';
import { useAuth } from './auth/AuthContext';
import { Booking, BookingsResponse } from '@/types/BookingTypes';
import { Agent } from '@/types/AgentTypes';
import { ChevronDown, ChevronUp, Filter, X, Download, Upload, Plus, Users, Calendar, TrendingUp, FileText, Activity } from 'lucide-react';
import { config } from '@/config/environment';
import { API_ENDPOINTS } from '@/config/apiEndpoints';

interface ApiError {
    status: number;
    message?: string;
}

interface Filters {
    search: string;
    status: 'all' | 'upcoming' | 'ongoing' | 'completed';
    dateRange: DateRange | undefined;
    agent: string;
    country: string;
    consultant: string;
    minPax: string;
    maxPax: string;
    showOnlyMyBookings: boolean;
}

// Helper function to parse MongoDB date format
const parseMongoDate = (dateValue: any): Date => {
    if (!dateValue) return new Date(0); // Return epoch if null/undefined

    if (dateValue instanceof Date) {
        return dateValue;
    }

    if (typeof dateValue === 'object' && dateValue !== null && '$date' in dateValue) {
        // MongoDB date format: { "$date": "2024-09-02T00:00:00Z" }
        return new Date((dateValue as { $date: string }).$date);
    }

    // Fallback to regular date parsing
    return new Date(dateValue);
};

const BookingManagementApp: React.FC = () => {
    const router = useRouter();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
    const [deleteConfirmBooking, setDeleteConfirmBooking] = useState<Booking | null>(null);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);

    const { token, isAuthenticated, isAdmin, user } = useAuth();

    // Initialize filters
    const [filters, setFilters] = useState<Filters>({
        search: '',
        status: 'all',
        dateRange: undefined,
        agent: 'all',
        country: 'all',
        consultant: 'all',
        minPax: '',
        maxPax: '',
        showOnlyMyBookings: true
    });

    // Fetch agents
    const fetchAgents = useCallback(async () => {
        try {
            const data = await api.get(API_ENDPOINTS.AGENTS.FETCH, token);
            setAgents(data.agents);
        } catch (error) {
            console.error("Error fetching agents:", error);
            if (typeof error === 'object' && error !== null && 'status' in error && (error as ApiError).status !== 401) {
                setError((error as ApiError).message || 'Failed to fetch agents');
            }
        }
    }, [token]);

    // Fetch bookings
    const fetchBookings = useCallback(async () => {
        try {
            setLoading(true);
            setError('');

            const data: BookingsResponse = await api.get(API_ENDPOINTS.BOOKINGS.FETCH, token);
            const sortedBookings = sortBookingsByDate(data.bookings);
            setBookings(sortedBookings);
        } catch (error) {
            if (typeof error === 'object' && error !== null && 'status' in error && (error as ApiError).status !== 401) {
                setError((error as ApiError).message || 'Failed to fetch bookings');
            }
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (isAuthenticated && token) {
            // Fetch both agents and bookings in parallel
            Promise.all([
                fetchAgents(),
                fetchBookings()
            ]);
        }
    }, [isAuthenticated, token, fetchAgents, fetchBookings]);

    // Get unique values for filter dropdowns


    // Prepare options for comboboxes
    const agentOptions = useMemo(() => [
        { value: 'all', label: 'All Agents' },
        ...agents.map(agent => ({
            value: agent.id.toString(),
            label: agent.name
        }))
    ], [agents]);



    // Sort bookings by date
    const sortBookingsByDate = (bookingsToSort: Booking[]): Booking[] => {
        const currentDate = new Date();

        const categorizeBooking = (booking: Booking) => {
            const arrivalDate = parseMongoDate(booking.date_from);
            const departureDate = parseMongoDate(booking.date_to);

            if (arrivalDate <= currentDate && departureDate >= currentDate) return 1; // Ongoing
            if (arrivalDate > currentDate) return 2; // Upcoming
            return 3; // Complete
        };

        return [...bookingsToSort].sort((a, b) => {
            const categoryA = categorizeBooking(a);
            const categoryB = categorizeBooking(b);

            if (categoryA !== categoryB) return categoryA - categoryB;

            const arrivalComparison = parseMongoDate(a.date_from).getTime() - parseMongoDate(b.date_from).getTime();
            if (arrivalComparison !== 0) return arrivalComparison;

            return parseMongoDate(a.date_to).getTime() - parseMongoDate(b.date_to).getTime();
        });
    };

    // Memoize agent lookup for performance
    const agentLookup = useMemo(() => {
        const lookup = new Map();
        agents.forEach(agent => lookup.set(agent.id, agent.name));
        return lookup;
    }, [agents]);

    // Apply all filters
    const filteredBookings = useMemo(() => {
        // Early return if no bookings
        if (bookings.length === 0) return [];

        let filtered = bookings;

        // Search filter - early return if no match
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(booking =>
                booking.name?.toLowerCase().includes(searchLower) ||
                agentLookup.get(booking.agent_id)?.toLowerCase().includes(searchLower) ||
                booking.consultant?.toLowerCase().includes(searchLower) ||
                booking.country?.toLowerCase().includes(searchLower) ||
                booking.created_by?.toLowerCase().includes(searchLower)
            );
        }

        // Status filter
        const today = new Date();
        if (filters.status !== 'all') {
            filtered = filtered.filter(booking => {
                const arrivalDate = parseMongoDate(booking.date_from);
                const departureDate = parseMongoDate(booking.date_to);

                switch (filters.status) {
                    case 'upcoming':
                        return arrivalDate > today;
                    case 'ongoing':
                        return arrivalDate <= today && departureDate >= today;
                    case 'completed':
                        return departureDate < today;
                    default:
                        return true;
                }
            });
        }

        // Date range filter
        if (filters.dateRange?.from || filters.dateRange?.to) {
            filtered = filtered.filter(booking => {
                const bookingStart = parseMongoDate(booking.date_from);
                const bookingEnd = parseMongoDate(booking.date_to);

                if (filters.dateRange?.from && filters.dateRange?.to) {
                    const filterStart = startOfDay(filters.dateRange.from);
                    const filterEnd = endOfDay(filters.dateRange.to);

                    // Check if booking overlaps with filter date range
                    return bookingStart <= filterEnd && bookingEnd >= filterStart;
                } else if (filters.dateRange?.from) {
                    const filterStart = startOfDay(filters.dateRange.from);
                    return bookingEnd >= filterStart;
                } else if (filters.dateRange?.to) {
                    const filterEnd = endOfDay(filters.dateRange.to);
                    return bookingStart <= filterEnd;
                }
                return true;
            });
        }

        // Agent filter
        if (filters.agent && filters.agent !== 'all') {
            filtered = filtered.filter(booking =>
                booking.agent_id.toString() === filters.agent
            );
        }

        // Country filter
        if (filters.country && filters.country !== 'all') {
            filtered = filtered.filter(booking =>
                booking.country === filters.country
            );
        }

        // Consultant filter
        if (filters.consultant && filters.consultant !== 'all') {
            filtered = filtered.filter(booking =>
                booking.consultant === filters.consultant
            );
        }

        // Pax range filter
        if (filters.minPax || filters.maxPax) {
            filtered = filtered.filter(booking => {
                const pax = booking.pax;
                const minPax = filters.minPax ? parseInt(filters.minPax) : 0;
                const maxPax = filters.maxPax ? parseInt(filters.maxPax) : Infinity;
                return pax >= minPax && pax <= maxPax;
            });
        }

        // User bookings filter
        if (filters.showOnlyMyBookings) {
            filtered = filtered.filter(booking => booking.user_id === user?.id);
        }

        // Hide completed bookings by default unless status filter is 'completed' or 'all'
        if (filters.status !== 'completed' && filters.status !== 'all') {
            filtered = filtered.filter(booking => {
                const departureDate = parseMongoDate(booking.date_to);
                return departureDate >= today;
            });
        }

        return filtered;
    }, [bookings, agentLookup, filters, user?.id]);

    // Memoize enhanced bookings with agent names for the data table
    const enhancedBookings = useMemo(() => {
        return filteredBookings.map(booking => ({
            ...booking,
            agent: agentLookup.get(booking.agent_id) || 'Unknown Agent'
        }));
    }, [filteredBookings, agentLookup]);

    // Clear all filters
    const clearFilters = () => {
        setFilters({
            search: '',
            status: 'all',
            dateRange: undefined,
            agent: 'all',
            country: 'all',
            consultant: 'all',
            minPax: '',
            maxPax: '',
            showOnlyMyBookings: true
        });
    };

    // Check if any filters are active
    const hasActiveFilters = useMemo(() => {
        return filters.search !== '' ||
            filters.status !== 'all' ||
            filters.dateRange?.from !== undefined ||
            filters.dateRange?.to !== undefined ||
            filters.agent !== 'all' ||
            filters.country !== 'all' ||
            filters.consultant !== 'all' ||
            filters.minPax !== '' ||
            filters.maxPax !== '';
    }, [filters]);

    // CRUD Operations
    const handleSaveBooking = async (booking: Booking) => {
        try {
            setError('');
            const isEditing = !!booking.id;
            const endpoint = isEditing
                ? API_ENDPOINTS.BOOKINGS.EDIT(booking.id.toString())
                : API_ENDPOINTS.BOOKINGS.CREATE;

            const formattedBooking = {
                ...booking,
                date_from: booking.date_from && isValid(parseMongoDate(booking.date_from))
                    ? format(parseMongoDate(booking.date_from), 'MM/dd/yyyy')
                    : booking.date_from,
                date_to: booking.date_to && isValid(parseMongoDate(booking.date_to))
                    ? format(parseMongoDate(booking.date_to), 'MM/dd/yyyy')
                    : booking.date_to,
                user_id: user?.id
            };

            if (isEditing) {
                await api.put(endpoint, formattedBooking, token);
            } else {
                await api.post(endpoint, formattedBooking, token);
            }

            await fetchBookings();
            closeModal();
        } catch (error) {
            if (typeof error === 'object' && error !== null && 'status' in error && (error as ApiError).status !== 401) {
                setError((error as ApiError).message || 'Failed to save booking');
            }
        }
    };

    const handleDeleteBooking = async (booking: Booking) => {
        try {
            setError('');
            await api.delete(API_ENDPOINTS.BOOKINGS.DELETE(String(booking.id)), token);

            setBookings(prev => prev.filter(b => b.id !== booking.id));
            setDeleteConfirmBooking(null);
        } catch (error) {
            if (typeof error === 'object' && error !== null && 'status' in error && (error as ApiError).status !== 401) {
                setError((error as ApiError).message || 'Failed to delete booking');
            }
        }
    };

    // Modal handlers
    const openModal = (booking?: Booking) => {
        setEditingBooking(booking || null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingBooking(null);
    };

    // Booking status
    const getBookingStatus = (dateFrom: string, dateTo: string): JSX.Element => {
        if (!dateFrom || !dateTo) {
            return <span className="text-gray-400">No dates</span>;
        }

        const today = new Date();
        const startDate = new Date(dateFrom);
        const endDate = new Date(dateTo);

        if (!isValid(startDate) || !isValid(endDate)) {
            return <span className="text-red-400">Invalid dates</span>;
        }

        if (isBefore(today, startDate)) {
            return <span className="text-blue-600 font-medium">Upcoming</span>;
        } else if (isAfter(today, endDate)) {
            return <span className="text-gray-500">Completed</span>;
        } else {
            return <span className="text-green-600 font-medium">Ongoing</span>;
        }
    };

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredBookings.map(booking => ({
            Name: booking.name,
            Arrival: booking.date_from && isValid(parseMongoDate(booking.date_from))
                ? format(parseMongoDate(booking.date_from), 'EEE, d MMM')
                : 'Invalid date',
            Departure: booking.date_to && isValid(parseMongoDate(booking.date_to))
                ? format(parseMongoDate(booking.date_to), 'EEE, d MMM')
                : 'Invalid date',
            Country: booking.country,
            Pax: booking.pax,
            Ladies: booking.ladies,
            Men: booking.men,
            Children: booking.children,
            Teens: booking.teens,
            Agent: agentLookup.get(booking.agent_id) || 'Unknown',
            Consultant: booking.consultant,
            Status: getBookingStatus(booking.date_from, booking.date_to).props.children,
            CreatedBy: booking.created_by || '',
        })));

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Bookings');

        const fileName = `bookings_${format(new Date(), 'yyyy-MM-dd')}_filtered.xlsx`;
        XLSX.writeFile(workbook, fileName);
    };

    const importBookings = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            setError('');
            const response = await fetch(config.getApiUrl(API_ENDPOINTS.BOOKINGS.IMPORT), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                const data = await response.json();
                if (response.status === 401) {
                    return;
                }
                throw new Error(data.error || 'Failed to import bookings');
            }

            fetchBookings();
        } catch (error) {
            if (typeof error === 'object' && error !== null && 'message' in error) {
                setError((error as ApiError).message || 'Failed to import bookings');
            } else {
                setError('Failed to import bookings');
            }
        }
    };

    // Handle dashboard refresh

    // Calculate dashboard stats
    const dashboardStats = useMemo(() => {
        const today = new Date();
        const upcomingBookings = filteredBookings.filter(b => parseMongoDate(b.date_from) > today);
        const ongoingBookings = filteredBookings.filter(b => {
            const start = parseMongoDate(b.date_from);
            const end = parseMongoDate(b.date_to);
            return start <= today && end >= today;
        });
        const totalPax = filteredBookings.reduce((sum, b) => sum + b.pax, 0);

        return [
            {
                title: 'Total Bookings',
                value: filteredBookings.length.toString(),
                change: '+12%',
                changeType: 'positive' as const,
                icon: Calendar,
                color: 'text-blue-500',
                bgColor: 'bg-blue-500/10',
                description: `${bookings.length} total bookings`
            },
            {
                title: 'Total Passengers',
                value: totalPax.toString(),
                change: '+8.2%',
                changeType: 'positive' as const,
                icon: Users,
                color: 'text-green-500',
                bgColor: 'bg-green-500/10',
                description: 'All passengers combined'
            },
            {
                title: 'Active Bookings',
                value: ongoingBookings.length.toString(),
                change: '+15%',
                changeType: 'positive' as const,
                icon: Activity,
                color: 'text-purple-500',
                bgColor: 'bg-purple-500/10',
                description: 'Currently ongoing trips'
            },
            {
                title: 'Upcoming Trips',
                value: upcomingBookings.length.toString(),
                change: upcomingBookings.length > 10 ? '+24%' : '-5%',
                changeType: upcomingBookings.length > 10 ? 'positive' as const : 'negative' as const,
                icon: TrendingUp,
                color: 'text-orange-500',
                bgColor: 'bg-orange-500/10',
                description: 'Future bookings scheduled'
            }
        ];
    }, [filteredBookings, bookings.length]);

    return (
        <div className="flex flex-1 flex-col gap-2 p-2 pt-0 sm:gap-4 sm:p-4">
            <div className="min-h-[calc(100vh-4rem)] flex-1 rounded-md p-3 sm:rounded-xl sm:p-4 md:p-6">
                <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
                    {/* Page Header */}
                    <div className="px-2 sm:px-0">
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                            Bookings
                        </h1>
                        <p className="text-muted-foreground text-sm sm:text-base">
                            Manage and track all your safari bookings.
                        </p>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <Alert variant="destructive" className="mx-2 sm:mx-0">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
                        {dashboardStats.map((stat, index) => (
                            <DashboardCard key={stat.title} stat={stat} index={index} />
                        ))}
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-3">
                        {/* Main Content Section */}
                        <div className="space-y-4 sm:space-y-6 xl:col-span-2">
                            {/* Filters Section */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-lg font-semibold">Bookings Overview</CardTitle>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Showing {filteredBookings.length} of {bookings.length} bookings
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                onClick={() => setShowFilters(!showFilters)}
                                                variant={hasActiveFilters ? "default" : "outline"}
                                                size="sm"
                                                className="flex items-center gap-2"
                                            >
                                                <Filter className="h-4 w-4" />
                                                Filters {hasActiveFilters && `(${Object.values(filters).filter(v => v !== '' && v !== 'all' && v !== false && v !== undefined).length})`}
                                                {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                            </Button>

                                            {hasActiveFilters && (
                                                <Button
                                                    onClick={clearFilters}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="flex items-center gap-1"
                                                >
                                                    <X className="h-3 w-3" />
                                                    Clear All
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>

                                {/* Filters Panel */}
                                {showFilters && (
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
                                            {/* Search */}
                                            <div className="space-y-2">
                                                <Label>Search</Label>
                                                <Input
                                                    placeholder="Name, agent, consultant..."
                                                    value={filters.search}
                                                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                                />
                                            </div>

                                            {/* Status */}
                                            <div className="space-y-2">
                                                <Label>Status</Label>
                                                <Select
                                                    value={filters.status}
                                                    onValueChange={(value) => setFilters({ ...filters, status: value as Filters['status'] })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">All Statuses</SelectItem>
                                                        <SelectItem value="upcoming">Upcoming</SelectItem>
                                                        <SelectItem value="ongoing">Ongoing</SelectItem>
                                                        <SelectItem value="completed">Completed</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Date Range */}
                                            <div className="space-y-2">
                                                <Label>Date Range</Label>
                                                <DateRangePicker
                                                    date={filters.dateRange}
                                                    onDateChange={(dateRange) => setFilters({ ...filters, dateRange })}
                                                    placeholder="Select date range"
                                                />
                                            </div>

                                            {/* Agent */}
                                            <div className="space-y-2">
                                                <Label>Agent</Label>
                                                <Combobox
                                                    options={agentOptions}
                                                    value={filters.agent}
                                                    onValueChange={(value) => setFilters({ ...filters, agent: value })}
                                                    placeholder="All Agents"
                                                    searchPlaceholder="Search agents..."
                                                    emptyText="No agents found."
                                                />
                                            </div>

                                            {/* Show My Bookings Only */}
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="my-bookings"
                                                    checked={filters.showOnlyMyBookings}
                                                    onCheckedChange={(checked) => setFilters({ ...filters, showOnlyMyBookings: checked as boolean })}
                                                />
                                                <Label htmlFor="my-bookings">My Bookings Only</Label>
                                            </div>
                                        </div>
                                    </CardContent>
                                )}

                                {/* Data Table */}
                                <CardContent className="px-4">
                                    {loading ? (
                                        <div className="flex justify-center items-center py-12">
                                            <div className="text-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                                                <p className="text-muted-foreground">Loading bookings...</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <BookingsDataTable
                                            bookings={enhancedBookings}
                                            onEdit={openModal}
                                            onDelete={setDeleteConfirmBooking}
                                            onView={(booking) => console.log('View booking:', booking)}
                                        />
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar Section */}
                        <div className="space-y-4 sm:space-y-6">
                            <QuickActions
                                onAddBooking={() => router.push('/bookings/new')}
                                onExport={exportToExcel}
                                onImport={isAdmin ? undefined : undefined}
                                onGenerateFlyer={() => window.open('/flyer', '_blank')}
                            />

                            {/* Hidden file input for CSV import */}
                            {isAdmin && (
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={(e) => e.target.files && e.target.files[0] && importBookings(e.target.files[0])}
                                    className="sr-only"
                                    id="csvImport"
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirm Delete Dialog */}
            <Dialog open={!!deleteConfirmBooking} onOpenChange={() => setDeleteConfirmBooking(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Confirm Delete</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the booking for <strong>{deleteConfirmBooking?.name}</strong>?
                            This action is irreversible.
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
                            onClick={() => deleteConfirmBooking && handleDeleteBooking(deleteConfirmBooking)}
                        >
                            Delete Booking
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Booking Form Dialog */}
            <Dialog open={isModalOpen} onOpenChange={closeModal}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingBooking ? 'Edit Booking' : 'Create New Booking'}</DialogTitle>
                        <DialogDescription>
                            {editingBooking ? 'Update the booking details below.' : 'Fill in the details to create a new booking.'}
                        </DialogDescription>
                    </DialogHeader>
                    <BookingForm
                        booking={editingBooking}
                        onSave={handleSaveBooking}
                        onCancel={closeModal}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default BookingManagementApp;