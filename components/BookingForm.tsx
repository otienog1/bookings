"use client"

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from 'date-fns';
import { Booking, BookingFormProps } from '@/types/BookingTypes';
import { Agent } from '@/types/AgentTypes';
import { api } from '@/utils/api';
import { useAuth } from './auth/AuthContext';
import { API_ENDPOINTS } from '@/config/apiEndpoints';

interface ApiError {
    status: number;
    message?: string;
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
                const data = await api.get(API_ENDPOINTS.AGENTS.FETCH, token);
                setAgents(data.agents);
            } catch (error) {
                console.error('Failed to fetch agents:', error);
                if (typeof error === 'object' && error !== null && 'status' in error && (error as ApiError).status !== 401) {
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
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="text-xl font-bold">
                    {booking ? 'Edit Booking' : 'New Booking'}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter booking name"
                            required
                        />
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div className="space-y-2">
                            <Label htmlFor="date_from">Arrival Date</Label>
                            <Input
                                id="date_from"
                                name="date_from"
                                type="date"
                                value={formData.date_from}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="date_to">Departure Date</Label>
                            <Input
                                id="date_to"
                                name="date_to"
                                type="date"
                                value={formData.date_to}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="country">Destination</Label>
                            <Input
                                id="country"
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                placeholder="Enter country"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pax">Total PAX</Label>
                            <Input
                                id="pax"
                                name="pax"
                                type="number"
                                min="0"
                                value={formData.pax}
                                onChange={handleChange}
                                placeholder="0"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ladies">Ladies</Label>
                            <Input
                                id="ladies"
                                name="ladies"
                                type="number"
                                min="0"
                                value={formData.ladies}
                                onChange={handleChange}
                                placeholder="0"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="men">Men</Label>
                            <Input
                                id="men"
                                name="men"
                                type="number"
                                min="0"
                                value={formData.men}
                                onChange={handleChange}
                                placeholder="0"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="children">Children</Label>
                            <Input
                                id="children"
                                name="children"
                                type="number"
                                min="0"
                                value={formData.children}
                                onChange={handleChange}
                                placeholder="0"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="teens">Teens</Label>
                            <Input
                                id="teens"
                                name="teens"
                                type="number"
                                min="0"
                                value={formData.teens}
                                onChange={handleChange}
                                placeholder="0"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="agent_id">Agent</Label>
                            <Select
                                value={formData.agent_id?.toString() || ""}
                                onValueChange={(value) => {
                                    const selectedAgent = agents.find(agent => agent.id === parseInt(value));
                                    setFormData(prev => ({
                                        ...prev,
                                        agent_id: parseInt(value) || 0,
                                        agent_name: selectedAgent?.name || '',
                                        agent_country: selectedAgent?.country || ''
                                    }));
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select an agent" />
                                </SelectTrigger>
                                <SelectContent>
                                    {agents.map(agent => (
                                        <SelectItem key={agent.id} value={agent.id.toString()}>
                                            {agent.name} - {agent.country}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="consultant">Consultant</Label>
                            <Input
                                id="consultant"
                                name="consultant"
                                value={formData.consultant}
                                onChange={handleChange}
                                placeholder="Enter consultant name"
                                required
                            />
                        </div>
                    </div>
                    <div className='flex justify-end space-x-2 pt-4 border-t'>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                        >
                            {booking ? 'Update' : 'Create'} Booking
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default BookingForm;