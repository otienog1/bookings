"use client"

import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { format } from 'date-fns';
import { Booking, BookingFormProps } from '@/types/BookingTypes';
import { Agent } from '@/types/AgentTypes';
import { Select } from '@headlessui/react';
import { api } from '@/utils/api'; // Add this import
import { useAuth } from './auth/AuthContext'; // Add this import

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
        agent_id: 0,
        consultant: ''
    });
    const [error, setError] = useState<string>('');
    const [agents, setAgents] = useState<Agent[]>([]);
    const { token } = useAuth(); // Add this

    // Updated fetch agents with API utility
    useEffect(() => {
        const fetchAgents = async () => {
            try {
                const data = await api.get('https://bookingsendpoint.onrender.com/agent/fetch', token);
                setAgents(data.agents);
            } catch (error: any) {
                console.error('Failed to fetch agents:', error);
                if (error.status !== 401) {
                    setError('Failed to load agents');
                }
            }
        };

        if (token) {
            fetchAgents();
        }
    }, [token]);

    useEffect(() => {
        if (booking) {
            // Handle both agent_id and agent string for backward compatibility
            setFormData({
                ...booking,
                date_from: format(new Date(booking.date_from), 'yyyy-MM-dd'),
                date_to: format(new Date(booking.date_to), 'yyyy-MM-dd')
            });
        }
    }, [booking]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const processedValue = (type === 'number' || name === 'agent_id')
            ? parseInt(value) || 0
            : value;
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

        // Validate agent
        if (!formData.agent_id) {
            setError('Please select an agent');
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
                    <AlertTitle>Heads Up!</AlertTitle>
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
                    <span>Destination</span>
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
                <label className='flex flex-col'>
                    <span>Agent</span>
                    <Select
                        name="agent_id"
                        value={formData.agent_id}
                        onChange={handleChange}
                        required
                        aria-label='Select Agent'
                        className="border p-2 mb-2 w-full uppercase text-xs"
                    >
                        <option value="">Select Agent</option>
                        {agents.map(agent => (
                            <option key={agent.id} value={agent.id}>
                                {agent.name}
                            </option>
                        ))}
                    </Select>
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