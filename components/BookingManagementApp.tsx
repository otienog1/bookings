"use client"

import { useState, useEffect, useMemo } from 'react';
import { format, isBefore, isAfter, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import React from 'react';
import BookingForm from './BookingForm';
import Modal from './Modal';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import * as XLSX from 'xlsx';
import UILoader from './UILoader';
import { api } from '@/utils/api';
import { useAuth } from './auth/AuthContext';
import { Booking, BookingsResponse, GroupedBookings } from '@/types/BookingTypes';
import { Agent } from '@/types/AgentTypes';
import { ChevronDown, ChevronUp, Filter, X, Download, Upload, Plus } from 'lucide-react';

interface ApiError {
    status: number;
    message?: string;
}

interface Filters {
    search: string;
    status: 'all' | 'upcoming' | 'ongoing' | 'completed';
    dateFrom: string;
    dateTo: string;
    agent: string;
    country: string;
    consultant: string;
    minPax: string;
    maxPax: string;
    showOnlyMyBookings: boolean;
}

interface SortConfig {
    key: keyof Booking | null;
    direction: 'asc' | 'desc';
}

const BookingsTable: React.FC = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [groupedBookings, setGroupedBookings] = useState<GroupedBookings>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
    const [deleteConfirmBooking, setDeleteConfirmBooking] = useState<Booking | null>(null);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });

    const { token, isAuthenticated, isAdmin, user } = useAuth();

    // Initialize filters
    const [filters, setFilters] = useState<Filters>({
        search: '',
        status: 'all',
        dateFrom: '',
        dateTo: '',
        agent: '',
        country: '',
        consultant: '',
        minPax: '',
        maxPax: '',
        showOnlyMyBookings: true
    });

    const baseURL = "https://bookingsendpoint.onrender.com";
    const bookingURL = `${baseURL}/booking`;
    const agentURL = `${baseURL}/agent`;

    // Fetch agents
    const fetchAgents = async () => {
        try {
            const data = await api.get(`${agentURL}/fetch`, token);
            setAgents(data.agents);
        } catch (error) {
            console.error("Error fetching agents:", error);
            if (typeof error === 'object' && error !== null && 'status' in error && (error as ApiError).status !== 401) {
                setError((error as ApiError).message || 'Failed to fetch agents');
            }
        }
    };

    // Fetch bookings
    const fetchBookings = async () => {
        try {
            setLoading(true);
            setError('');

            const data: BookingsResponse = await api.get(`${bookingURL}/fetch`, token);

            // Process bookings to add agent names from the agents array
            const processedBookings = data.bookings.map(booking => {
                const agent = agents.find(a => a.id === booking.agent_id);
                return {
                    ...booking,
                    agent: agent ? agent.name : 'Unknown Agent'
                };
            });

            const sortedBookings = sortBookingsByDate(processedBookings);
            setBookings(sortedBookings);
        } catch (error) {
            if (typeof error === 'object' && error !== null && 'status' in error && (error as ApiError).status !== 401) {
                setError((error as ApiError).message || 'Failed to fetch bookings');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated && token) {
            fetchAgents();
        }
    }, [isAuthenticated, token]);

    useEffect(() => {
        if (isAuthenticated && token && agents.length > 0) {
            fetchBookings();
        }
    }, [isAuthenticated, token, agents]);

    // Get unique values for filter dropdowns
    const uniqueCountries = useMemo(() =>
        Array.from(new Set(bookings.map(b => b.country))).sort(),
        [bookings]
    );

    const uniqueConsultants = useMemo(() =>
        Array.from(new Set(bookings.map(b => b.consultant))).sort(),
        [bookings]
    );

    // Sort bookings by date
    const sortBookingsByDate = (bookingsToSort: Booking[]): Booking[] => {
        const currentDate = new Date();

        const categorizeBooking = (booking: Booking) => {
            const arrivalDate = new Date(booking.date_from);
            const departureDate = new Date(booking.date_to);

            if (arrivalDate <= currentDate && departureDate >= currentDate) return 1; // Ongoing
            if (arrivalDate > currentDate) return 2; // Upcoming
            return 3; // Complete
        };

        return [...bookingsToSort].sort((a, b) => {
            const categoryA = categorizeBooking(a);
            const categoryB = categorizeBooking(b);

            if (categoryA !== categoryB) return categoryA - categoryB;

            const arrivalComparison = new Date(a.date_from).getTime() - new Date(b.date_from).getTime();
            if (arrivalComparison !== 0) return arrivalComparison;

            return new Date(a.date_to).getTime() - new Date(b.date_to).getTime();
        });
    };

    // Apply all filters
    const filteredBookings = useMemo(() => {
        let filtered = [...bookings];

        // Search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(booking => {
                const searchFields = [
                    booking.name,
                    booking.agent,
                    booking.consultant,
                    booking.country,
                    booking.created_by
                ].map(field => field?.toLowerCase() || '');

                return searchFields.some(field => field.includes(searchLower));
            });
        }

        // Status filter
        const today = new Date();
        if (filters.status !== 'all') {
            filtered = filtered.filter(booking => {
                const arrivalDate = new Date(booking.date_from);
                const departureDate = new Date(booking.date_to);

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
        if (filters.dateFrom || filters.dateTo) {
            filtered = filtered.filter(booking => {
                const bookingStart = new Date(booking.date_from);
                const bookingEnd = new Date(booking.date_to);

                if (filters.dateFrom && filters.dateTo) {
                    const filterStart = startOfDay(new Date(filters.dateFrom));
                    const filterEnd = endOfDay(new Date(filters.dateTo));

                    // Check if booking overlaps with filter date range
                    return bookingStart <= filterEnd && bookingEnd >= filterStart;
                } else if (filters.dateFrom) {
                    const filterStart = startOfDay(new Date(filters.dateFrom));
                    return bookingEnd >= filterStart;
                } else if (filters.dateTo) {
                    const filterEnd = endOfDay(new Date(filters.dateTo));
                    return bookingStart <= filterEnd;
                }
                return true;
            });
        }

        // Agent filter
        if (filters.agent) {
            filtered = filtered.filter(booking =>
                booking.agent_id === parseInt(filters.agent)
            );
        }

        // Country filter
        if (filters.country) {
            filtered = filtered.filter(booking =>
                booking.country === filters.country
            );
        }

        // Consultant filter
        if (filters.consultant) {
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
                const departureDate = new Date(booking.date_to);
                return departureDate >= today;
            });
        }

        // Apply sorting
        if (sortConfig.key) {
            filtered.sort((a, b) => {
                const aValue = a[sortConfig.key!];
                const bValue = b[sortConfig.key!];

                if (aValue === null || aValue === undefined) return 1;
                if (bValue === null || bValue === undefined) return -1;

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        return filtered;
    }, [bookings, filters, sortConfig, user?.id]);

    // Group bookings by year and month
    useEffect(() => {
        const grouped = filteredBookings.reduce<GroupedBookings>((acc, booking) => {
            const date = new Date(booking.date_from);
            const year = date.getFullYear().toString();
            const month = date.getMonth().toString();

            if (!acc[year]) acc[year] = {};
            if (!acc[year][month]) acc[year][month] = [];

            acc[year][month].push(booking);
            return acc;
        }, {});

        setGroupedBookings(grouped);
    }, [filteredBookings]);

    // Handle sort
    const handleSort = (key: keyof Booking) => {
        setSortConfig(prevConfig => ({
            key,
            direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    // Clear all filters
    const clearFilters = () => {
        setFilters({
            search: '',
            status: 'all',
            dateFrom: '',
            dateTo: '',
            agent: '',
            country: '',
            consultant: '',
            minPax: '',
            maxPax: '',
            showOnlyMyBookings: true
        });
        setSortConfig({ key: null, direction: 'asc' });
    };

    // Check if any filters are active
    const hasActiveFilters = useMemo(() => {
        return filters.search !== '' ||
            filters.status !== 'all' ||
            filters.dateFrom !== '' ||
            filters.dateTo !== '' ||
            filters.agent !== '' ||
            filters.country !== '' ||
            filters.consultant !== '' ||
            filters.minPax !== '' ||
            filters.maxPax !== '';
    }, [filters]);

    // CRUD Operations
    const handleSaveBooking = async (booking: Booking) => {
        try {
            setError('');
            const isEditing = !!booking.id;
            const url = isEditing ? `${bookingURL}/edit/${booking.id}` : `${bookingURL}/create`;

            const formattedBooking = {
                ...booking,
                date_from: format(new Date(booking.date_from), 'MM/dd/yyyy'),
                date_to: format(new Date(booking.date_to), 'MM/dd/yyyy'),
                user_id: user?.id
            };

            if (isEditing) {
                await api.put(url, formattedBooking, token);
            } else {
                await api.post(url, formattedBooking, token);
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
            await api.delete(`${bookingURL}/delete/${booking.id}`, token);

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
        const today = new Date();
        const startDate = new Date(dateFrom);
        const endDate = new Date(dateTo);

        if (isBefore(today, startDate)) {
            return <span className="text-blue-600 font-medium">Upcoming</span>;
        } else if (isAfter(today, endDate)) {
            return <span className="text-gray-500">Completed</span>;
        } else {
            return <span className="text-green-600 font-medium">Ongoing</span>;
        }
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            console.error(`Invalid date string: ${dateString}`);
            return '';
        }
        return format(date, 'EEE, d MMM');
    };

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredBookings.map(booking => ({
            Name: booking.name,
            Arrival: formatDate(booking.date_from),
            Departure: formatDate(booking.date_to),
            Country: booking.country,
            Pax: booking.pax,
            Ladies: booking.ladies,
            Men: booking.men,
            Children: booking.children,
            Teens: booking.teens,
            Agent: booking.agent,
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
            const response = await fetch(`${bookingURL}/import`, {
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

    return (
        <div className="px-4 mx-auto">
            {error && (
                <Alert className="mb-4 bg-red-50 border-red-200">
                    <AlertTitle>Heads up!</AlertTitle>
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
            )}

            {/* Actions Bar */}
            <div className="mb-4 mt-4">
                <div className="flex flex-col lg:flex-row justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center rounded px-3 py-2 text-xs uppercase transition-colors ${hasActiveFilters
                                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                : 'bg-gray-100 hover:bg-gray-200'
                                }`}
                        >
                            <Filter className="h-4 w-4 mr-1" />
                            Filters {hasActiveFilters && `(Active)`}
                            {showFilters ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
                        </button>

                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="flex items-center rounded px-3 py-2 bg-gray-100 hover:bg-gray-200 text-xs uppercase transition-colors"
                            >
                                <X className="h-4 w-4 mr-1" />
                                Clear Filters
                            </button>
                        )}

                        <div className="text-xs text-gray-600">
                            Showing {filteredBookings.length} of {bookings.length} bookings
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => openModal()}
                            className="flex items-center rounded px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white uppercase text-xs transition-colors"
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            New Booking
                        </button>
                        <button
                            onClick={exportToExcel}
                            className="flex items-center rounded px-4 py-2 bg-green-500 hover:bg-green-600 text-white uppercase text-xs transition-colors"
                        >
                            <Download className="h-4 w-4 mr-1" />
                            Export
                        </button>
                        {isAdmin && (
                            <>
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={(e) => e.target.files && e.target.files[0] && importBookings(e.target.files[0])}
                                    className="sr-only"
                                    id="csvImport"
                                />
                                <label
                                    htmlFor="csvImport"
                                    className="flex items-center rounded px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white uppercase text-xs transition-colors cursor-pointer"
                                >
                                    <Upload className="h-4 w-4 mr-1" />
                                    Import CSV
                                </label>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {/* Search */}
                        <div>
                            <label className="block text-xs font-medium mb-1 uppercase">Search</label>
                            <input
                                type="text"
                                placeholder="Name, agent, consultant..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                className="w-full border rounded p-2 text-xs"
                            />
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-xs font-medium mb-1 uppercase">Status</label>
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value as Filters['status'] })}
                                className="w-full border rounded p-2 text-xs uppercase"
                            >
                                <option value="all">All Statuses</option>
                                <option value="upcoming">Upcoming</option>
                                <option value="ongoing">Ongoing</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>

                        {/* Date From */}
                        <div>
                            <label className="block text-xs font-medium mb-1 uppercase">Date From</label>
                            <input
                                type="date"
                                value={filters.dateFrom}
                                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                                className="w-full border rounded p-2 text-xs"
                            />
                        </div>

                        {/* Date To */}
                        <div>
                            <label className="block text-xs font-medium mb-1 uppercase">Date To</label>
                            <input
                                type="date"
                                value={filters.dateTo}
                                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                                className="w-full border rounded p-2 text-xs"
                            />
                        </div>

                        {/* Agent */}
                        <div>
                            <label className="block text-xs font-medium mb-1 uppercase">Agent</label>
                            <select
                                value={filters.agent}
                                onChange={(e) => setFilters({ ...filters, agent: e.target.value })}
                                className="w-full border rounded p-2 text-xs uppercase"
                            >
                                <option value="">All Agents</option>
                                {agents.map(agent => (
                                    <option key={agent.id} value={agent.id}>
                                        {agent.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Country */}
                        <div>
                            <label className="block text-xs font-medium mb-1 uppercase">Country</label>
                            <select
                                value={filters.country}
                                onChange={(e) => setFilters({ ...filters, country: e.target.value })}
                                className="w-full border rounded p-2 text-xs uppercase"
                            >
                                <option value="">All Countries</option>
                                {uniqueCountries.map(country => (
                                    <option key={country} value={country}>
                                        {country}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Consultant */}
                        <div>
                            <label className="block text-xs font-medium mb-1 uppercase">Consultant</label>
                            <select
                                value={filters.consultant}
                                onChange={(e) => setFilters({ ...filters, consultant: e.target.value })}
                                className="w-full border rounded p-2 text-xs uppercase"
                            >
                                <option value="">All Consultants</option>
                                {uniqueConsultants.map(consultant => (
                                    <option key={consultant} value={consultant}>
                                        {consultant}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Pax Range */}
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs font-medium mb-1 uppercase">Min Pax</label>
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value={filters.minPax}
                                    onChange={(e) => setFilters({ ...filters, minPax: e.target.value })}
                                    className="w-full border rounded p-2 text-xs"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1 uppercase">Max Pax</label>
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="∞"
                                    value={filters.maxPax}
                                    onChange={(e) => setFilters({ ...filters, maxPax: e.target.value })}
                                    className="w-full border rounded p-2 text-xs"
                                />
                            </div>
                        </div>

                        {/* Show My Bookings Only */}
                        <div className="flex items-end">
                            <label className="flex items-center space-x-2 text-xs">
                                <input
                                    type="checkbox"
                                    checked={filters.showOnlyMyBookings}
                                    onChange={(e) => setFilters({ ...filters, showOnlyMyBookings: e.target.checked })}
                                    className="rounded"
                                />
                                <span className="uppercase">My Bookings Only</span>
                            </label>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Delete Modal */}
            <Modal
                isOpen={!!deleteConfirmBooking}
                onClose={() => setDeleteConfirmBooking(null)}
                backdropClick={true}
            >
                <div className="px-4 py-2">
                    <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
                    <p className="mb-4 normal-case">Are you sure you want to delete the booking for <u>{deleteConfirmBooking?.name}</u>?&nbsp;This action is irreversible.</p>
                    <div className="flex justify-end space-x-2">
                        <button
                            onClick={() => setDeleteConfirmBooking(null)}
                            className="px-4 py-2 bg-gray-300 hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => deleteConfirmBooking && handleDeleteBooking(deleteConfirmBooking)}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Booking Form Modal */}
            <Modal isOpen={isModalOpen} onClose={closeModal} backdropClick={false}>
                <BookingForm
                    booking={editingBooking}
                    onSave={handleSaveBooking}
                    onCancel={closeModal}
                />
            </Modal>

            {/* Bookings Table */}
            <div id="bookings-table" className="bg-white overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-50">
                            <th
                                className="border py-2 px-3 text-xs uppercase text-left cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('name')}
                            >
                                Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th
                                className="border py-2 px-3 text-xs uppercase text-left cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('date_from')}
                            >
                                Arrival {sortConfig.key === 'date_from' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th
                                className="border py-2 px-3 text-xs uppercase text-left cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('date_to')}
                            >
                                Departure {sortConfig.key === 'date_to' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th
                                className="border py-2 px-3 text-xs uppercase text-left cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('country')}
                            >
                                Country {sortConfig.key === 'country' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th
                                className="border py-2 px-3 text-xs uppercase text-center cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('pax')}
                            >
                                Pax {sortConfig.key === 'pax' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="border py-2 px-3 text-xs uppercase text-center">Ladies</th>
                            <th className="border py-2 px-3 text-xs uppercase text-center">Men</th>
                            <th className="border py-2 px-3 text-xs uppercase text-center">Children</th>
                            <th className="border py-2 px-3 text-xs uppercase text-center">Teens</th>
                            <th
                                className="border py-2 px-3 text-xs uppercase text-left cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('agent')}
                            >
                                Agent {sortConfig.key === 'agent' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th
                                className="border py-2 px-3 text-xs uppercase text-left cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('consultant')}
                            >
                                Consultant {sortConfig.key === 'consultant' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="border py-2 px-3 text-xs uppercase text-left">Status</th>
                            {isAdmin && (
                                <th className="border py-2 px-3 text-xs uppercase text-left">Created By</th>
                            )}
                            <th className="border py-2 px-3 text-xs uppercase text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={isAdmin ? 14 : 13} className="py-8 px-3 text-center border">
                                    <div className="flex justify-center items-center">
                                        <UILoader text='Loading data...' />
                                    </div>
                                </td>
                            </tr>
                        ) : Object.entries(groupedBookings).length > 0 ? (
                            Object.entries(groupedBookings).map(([year, months]) => (
                                <React.Fragment key={year}>
                                    <tr>
                                        <td colSpan={isAdmin ? 14 : 13} className="py-4 px-3 font-semibold bg-gray-50 uppercase border">
                                            {year}
                                        </td>
                                    </tr>
                                    {Object.entries(months).map(([month, monthBookings]) => {
                                        const monthName = new Date(parseInt(year), parseInt(month))
                                            .toLocaleString('default', { month: 'long' })
                                            .toUpperCase();
                                        return (
                                            <React.Fragment key={`${year}-${month}`}>
                                                <tr>
                                                    <td colSpan={isAdmin ? 14 : 13} className="py-2 px-3 text-sm font-medium bg-gray-50/50 uppercase border">
                                                        {monthName} ({monthBookings.length} bookings)
                                                    </td>
                                                </tr>
                                                {monthBookings.map((booking: Booking) => (
                                                    <tr key={booking.id} className="hover:bg-gray-50/50">
                                                        <td className="border py-2 px-3 text-xs uppercase">{booking.name}</td>
                                                        <td className="border py-2 px-3 text-xs uppercase">{formatDate(booking.date_from)}</td>
                                                        <td className="border py-2 px-3 text-xs uppercase">{formatDate(booking.date_to)}</td>
                                                        <td className="border py-2 px-3 text-xs uppercase">{booking.country}</td>
                                                        <td className="border py-2 px-3 text-xs text-center">{booking.pax}</td>
                                                        <td className="border py-2 px-3 text-xs text-center">{booking.ladies}</td>
                                                        <td className="border py-2 px-3 text-xs text-center">{booking.men}</td>
                                                        <td className="border py-2 px-3 text-xs text-center">{booking.children}</td>
                                                        <td className="border py-2 px-3 text-xs text-center">{booking.teens}</td>
                                                        <td className="border py-2 px-3 text-xs uppercase">{booking.agent}</td>
                                                        <td className="border py-2 px-3 text-xs uppercase">{booking.consultant}</td>
                                                        <td className="border py-2 px-3 text-xs">
                                                            {getBookingStatus(booking.date_from, booking.date_to)}
                                                        </td>
                                                        {isAdmin && (
                                                            <td className="border py-2 px-3 text-xs uppercase">{booking.created_by || '—'}</td>
                                                        )}
                                                        <td className="border py-2 px-3 text-xs text-center">
                                                            <div className="flex justify-center space-x-2">
                                                                {(isAdmin || booking.user_id === user?.id) && (
                                                                    <button
                                                                        onClick={() => openModal(booking)}
                                                                        className="text-blue-600 hover:text-blue-800"
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                )}
                                                                {(isAdmin || booking.user_id === user?.id) && (
                                                                    <button
                                                                        onClick={() => setDeleteConfirmBooking(booking)}
                                                                        className="text-red-600 hover:text-red-800"
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </React.Fragment>
                                        )
                                    })}
                                </React.Fragment>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={isAdmin ? 14 : 13} className="py-4 px-3 text-center border">
                                    {filters.showOnlyMyBookings
                                        ? 'No bookings found matching your filters.'
                                        : 'No bookings found matching the filters.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Summary Stats */}
            {filteredBookings.length > 0 && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg text-xs">
                    <div className="flex flex-wrap gap-4">
                        <div>
                            <span className="font-medium uppercase">Total Bookings:</span> {filteredBookings.length}
                        </div>
                        <div>
                            <span className="font-medium uppercase">Total Pax:</span> {filteredBookings.reduce((sum, b) => sum + b.pax, 0)}
                        </div>
                        <div>
                            <span className="font-medium uppercase">Upcoming:</span> {filteredBookings.filter(b => new Date(b.date_from) > new Date()).length}
                        </div>
                        <div>
                            <span className="font-medium uppercase">Ongoing:</span> {filteredBookings.filter(b => {
                                const today = new Date();
                                return new Date(b.date_from) <= today && new Date(b.date_to) >= today;
                            }).length}
                        </div>
                        <div>
                            <span className="font-medium uppercase">Completed:</span> {filteredBookings.filter(b => new Date(b.date_to) < new Date()).length}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingsTable;