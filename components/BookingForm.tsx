"use client"

import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

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

interface BookingFormProps {
    booking: Booking | null;
    onSave: (booking: Booking) => void;
    onCancel: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ booking, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Booking>({
        id: 0,
        name: '',
        date_from: '',
        date_to: '',
        country: '',
        pax: 0,
        ladies: 0,
        men: 0,
        children: 0,
        teens: 0,
        agent: '',
        consultant: ''
    });
    const [error, setError] = useState<string>('');

    useEffect(() => {
        if (booking) {
            setFormData(booking);
        }
    }, [booking]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        const processedValue = type === 'number' ? parseInt(value) || 0 : value;
        setFormData(prev => ({ ...prev, [name]: processedValue }));
    };

    const validateForm = (): boolean => {
        // Validate dates
        if (new Date(formData.date_to) < new Date(formData.date_from)) {
            setError('Departure date cannot be before arrival date');
            return false;
        }

        // Validate pax numbers
        const totalPax = formData.ladies + formData.men + formData.children + formData.teens;
        if (totalPax !== formData.pax) {
            setError('Total of ladies, men, children, and teens must equal total pax');
            return false;
        }

        setError('');
        return true;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            onSave(formData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="text-xs">
            <h2 className="text-lg font-semibold mb-4 pb-1 border-b">
                {booking ? 'Edit Booking' : 'New Booking'}
            </h2>

            {error && (
                <Alert className="mb-4 bg-red-50 border-red-200">
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
            )}

            <label>
                <span className='flex mb-1'>Name</span>
                <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Name"
                    required
                    className="border p-2 mb-2 w-full uppercase text-xs"
                />
            </label>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-2 text-xs'>
                <label>
                    <span>Arrival</span>
                    <input
                        name="date_from"
                        type="date"
                        value={formData.date_from}
                        onChange={handleChange}
                        required
                        className="border p-2 mb-2 w-full uppercase text-xs"
                    />
                </label>
                <label>
                    <span>Departure</span>
                    <input
                        name="date_to"
                        type="date"
                        value={formData.date_to}
                        onChange={handleChange}
                        required
                        className="border p-2 mb-2 w-full uppercase text-xs"
                    />
                </label>
                <label>
                    <span>Country</span>
                    <input
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        placeholder="Country"
                        required
                        className="border p-2 mb-2 w-full uppercase text-xs"
                    />
                </label>
                <label>
                    <span>Total Pax</span>
                    <input
                        name="pax"
                        type="number"
                        min="0"
                        value={formData.pax}
                        onChange={handleChange}
                        placeholder="Total Pax"
                        required
                        className="border p-2 mb-2 w-full uppercase text-xs"
                    />
                </label>
                <label>
                    <span>Ladies</span>
                    <input
                        name="ladies"
                        type="number"
                        min="0"
                        value={formData.ladies}
                        onChange={handleChange}
                        placeholder="Ladies"
                        required
                        className="border p-2 mb-2 w-full uppercase text-xs"
                    />
                </label>
                <label>
                    <span>Men</span>
                    <input
                        name="men"
                        type="number"
                        min="0"
                        value={formData.men}
                        onChange={handleChange}
                        placeholder="Men"
                        required
                        className="border p-2 mb-2 w-full uppercase text-xs"
                    />
                </label>
                <label>
                    <span>Children</span>
                    <input
                        name="children"
                        type="number"
                        min="0"
                        value={formData.children}
                        onChange={handleChange}
                        placeholder="Children"
                        required
                        className="border p-2 mb-2 w-full uppercase text-xs"
                    />
                </label>
                <label>
                    <span>Teens</span>
                    <input
                        name="teens"
                        type="number"
                        min="0"
                        value={formData.teens}
                        onChange={handleChange}
                        placeholder="Teens"
                        required
                        className="border p-2 mb-2 w-full uppercase text-xs"
                    />
                </label>
                <label>
                    <span>Agent</span>
                    <input
                        name="agent"
                        value={formData.agent}
                        onChange={handleChange}
                        placeholder="Agent"
                        required
                        className="border p-2 mb-2 w-full uppercase text-xs"
                    />
                </label>
                <label>
                    <span>Consultant</span>
                    <input
                        name="consultant"
                        value={formData.consultant}
                        onChange={handleChange}
                        placeholder="Consultant"
                        required
                        className="border p-2 mb-2 w-full uppercase text-xs"
                    />
                </label>
            </div>
            <div className='flex justify-end space-x-2 mt-4'>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 transition-colors uppercase"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 transition-colors text-white uppercase"
                >
                    {booking ? 'Update' : 'Create'} Booking
                </button>
            </div>
        </form>
    );
};

export default BookingForm;