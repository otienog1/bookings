"use client"

import { useState, useEffect } from 'react';
import { format, isBefore, isAfter } from 'date-fns';
import React from 'react';
import BookingForm from './BookingForm';
import Modal from './Modal';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
// import { DeleteIcon } from 'lucide-react';
import { Loader } from 'lucide-react';
import * as XLSX from 'xlsx';
import UILoader from './UILoader';

interface Booking {
    id: number;
    name: string;
    date_from: string;
    date_to: string;
    country: string;
    pax: number;
    ladies: number;
    men: number;
    children: number;
    teens: number;
    agent: string;
    consultant: string;
}

interface BookingsResponse {
    bookings: Booking[];
}

interface GroupedBookings {
    [key: string]: {
        [key: string]: Booking[];
    };
}

const BookingsTable: React.FC = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [groupedBookings, setGroupedBookings] = useState<GroupedBookings>({});
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
    const [deleteConfirmBooking, setDeleteConfirmBooking] = useState<Booking | null>(null);
    const bookingURL = "http://localhost:3010/booking";

    // Fetch bookings
    const fetchBookings = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await fetch(`${bookingURL}/fetch`);

            if (!response.ok) {
                throw new Error(`Failed to fetch bookings: ${response.statusText}`);
            }

            const data: BookingsResponse = await response.json();
            const sortedBookings = sortBookingsByDate(data.bookings);

            setBookings(sortedBookings);
            setFilteredBookings(sortedBookings);
            groupBookingsByYearMonth(sortedBookings);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to fetch bookings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    // Sort and filter bookings
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

            // Sort by arrival date first
            const arrivalComparison = new Date(a.date_from).getTime() - new Date(b.date_from).getTime();
            if (arrivalComparison !== 0) return arrivalComparison;

            // If arrival dates are the same, sort by departure date
            return new Date(a.date_to).getTime() - new Date(b.date_to).getTime();
        });
    };

    useEffect(() => {
        const filtered = bookings.filter(booking => {
            const searchFields = [
                booking.name,
                booking.agent,
                booking.consultant,
                booking.country
            ].map(field => field?.toLowerCase() || '');

            const isComplete = (new Date(booking.date_from) < new Date() && new Date(booking.date_to) < new Date());
            return !isComplete && searchFields.some(field => field.includes(searchTerm.toLowerCase()));
        });

        setFilteredBookings(filtered);
        groupBookingsByYearMonth(filtered);
    }, [searchTerm, bookings]);

    // Group bookings by year and month
    const groupBookingsByYearMonth = (bookingsToGroup: Booking[]): void => {
        const grouped = bookingsToGroup.reduce<GroupedBookings>((acc, booking) => {
            const date = new Date(booking.date_from);
            const year = date.getFullYear().toString();
            const month = date.getMonth().toString();

            if (!acc[year]) acc[year] = {};
            if (!acc[year][month]) acc[year][month] = [];

            acc[year][month].push(booking);
            return acc;
        }, {});

        setGroupedBookings(grouped);
    };

    // CRUD Operations
    const handleSaveBooking = async (booking: Booking) => {
        try {
            setError('');
            const isEditing = !!booking.id;
            const url = isEditing ? `${bookingURL}/edit/${booking.id}` : `${bookingURL}/create`;
            const method = isEditing ? 'PUT' : 'POST';

            const formattedBooking = {
                ...booking,
                date_from: format(new Date(booking.date_from), 'MM/dd/yyyy'),
                date_to: format(new Date(booking.date_to), 'MM/dd/yyyy')
            };

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formattedBooking)
            });

            if (!response.ok) {
                throw new Error(`Failed to ${isEditing ? 'update' : 'create'} booking`);
            }

            const savedBooking = await response.json();

            setBookings(prev => {
                const newBookings = isEditing
                    ? prev.map(b => b.id === savedBooking.id ? savedBooking : b)
                    : [...prev, savedBooking];
                return sortBookingsByDate(newBookings);
            });

            closeModal();
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to save booking');
        }
    };

    const handleDeleteBooking = async (booking: Booking) => {
        try {
            setError('');
            const response = await fetch(`${bookingURL}/delete/${booking.id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete booking');
            }

            setBookings(prev => prev.filter(b => b.id !== booking.id));
            setDeleteConfirmBooking(null);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to delete booking');
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
            return ''; // Return an empty string or handle the error as needed
        }
        // Format to "DD, D MMM"
        return format(date, 'EEE, d MMM'); // Updated format
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
        })));

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Bookings');

        // Export the workbook
        XLSX.writeFile(workbook, 'bookings.xlsx');
    };

    // Loading and error states
    if (loading) {
        return (
            <UILoader />
        );
    }

    return (
        <div className="p-2 mx-auto">
            <div className="flex justify-between items-center my-4">
                <h1 className="text-xl font-semibold uppercase">Booking Management</h1>
                <div className='text-xs uppercase'>Version 0.1</div>
            </div>

            {error && (
                <Alert className="mb-4 bg-red-50 border-red-200">
                    <AlertTitle>Heads up!</AlertTitle>
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
            )}

            <div className="mb-4 flex justify-between">
                <input
                    type="text"
                    placeholder="Search bookings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border p-2  w-full md:w-64 uppercase text-xs"
                />
                <div className='flex space-x-2'>
                    {/* Add a button to trigger Excel export */}
                    <button
                        onClick={exportToExcel}
                        className="px-4 py-2  bg-green-500 hover:bg-green-600 text-white uppercase text-xs transition-colors"
                    >
                        Export to Excel
                    </button>
                    <button
                        onClick={() => openModal()}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white uppercase text-xs  transition-colors"
                    >
                        New Booking
                    </button>
                </div>
            </div>

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
                            className="px-4 py-2 bg-red-500 hover:`bg-red-600 text-white"
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
            <div id="bookings-table" className="bg-white overflow-hidden">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="border py-2 px-3 text-xs uppercase text-left">Name</th>
                            <th className="border py-2 px-3 text-xs uppercase text-left">Arrival</th>
                            <th className="border py-2 px-3 text-xs uppercase text-left">Departure</th>
                            <th className="border py-2 px-3 text-xs uppercase text-left">Country</th>
                            <th className="border py-2 px-3 text-xs uppercase text-center">Pax</th>
                            <th className="border py-2 px-3 text-xs uppercase text-center">Ladies</th>
                            <th className="border py-2 px-3 text-xs uppercase text-center">Men</th>
                            <th className="border py-2 px-3 text-xs uppercase text-center">Children</th>
                            <th className="border py-2 px-3 text-xs uppercase text-center">Teens</th>
                            <th className="border py-2 px-3 text-xs uppercase text-left">Agent</th>
                            <th className="border py-2 px-3 text-xs uppercase text-left">Consultant</th>
                            <th className="border py-2 px-3 text-xs uppercase text-left">Status</th>
                            <th className="border py-2 px-3 text-xs uppercase text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(groupedBookings).map(([year, months]) => (
                            <React.Fragment key={year}>
                                <tr>
                                    <td colSpan={13} className="py-4 px-3 font-semibold bg-gray-50 uppercase border">
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
                                                <td colSpan={13} className="py-2 px-3 text-sm font-medium bg-gray-50/50 uppercase border">
                                                    {monthName}
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
                                                    <td className="border py-2 px-3 text-xs text-center">
                                                        <div className="flex justify-center space-x-2">
                                                            <button
                                                                onClick={() => openModal(booking)}
                                                                className="text-blue-600 hover:text-blue-800"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => setDeleteConfirmBooking(booking)}
                                                                className="text-red-600 hover:text-red-800"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    )
                                })}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default BookingsTable