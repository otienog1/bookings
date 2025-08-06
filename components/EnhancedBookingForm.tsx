"use client"

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { Booking, BookingFormProps } from '@/types/BookingTypes';
import { Agent } from '@/types/AgentTypes';
import { api } from '@/utils/api';
import { useAuth } from './auth/AuthContext';
import { API_ENDPOINTS } from '@/config/apiEndpoints';
import { CalendarIcon, UserIcon, MapPinIcon, UsersIcon } from 'lucide-react';

interface ApiError {
    status: number;
    message?: string;
}

const EnhancedBookingForm: React.FC<BookingFormProps> = ({ booking, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Booking>({
        id: 0,
        name: '',
        date_from: new Date(),
        date_to: new Date(),
        country: '',
        pax: 0,
        ladies: 0,
        men: 0,
        children: 0,
        teens: 0,
        agent_id: 0,
        agent_name: '',
        agent_country: '',
        consultant: '',
        user_id: 0,
        created_by: ''
    });

    const [agents, setAgents] = useState<Agent[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        fetchAgents();
        if (booking) {
            setFormData({
                ...booking,
                date_from: new Date(booking.date_from),
                date_to: new Date(booking.date_to)
            });
        }
    }, [booking]);

    const fetchAgents = async () => {
        try {
            const response = await api.get<{ agents: Agent[] }>(API_ENDPOINTS.AGENTS.FETCH);
            setAgents(response.agents);
        } catch (err) {
            console.error('Error fetching agents:', err);
            setError('Failed to fetch agents. Please try again.');
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        if (name === 'agent_id') {
            const selectedAgent = agents.find(agent => agent.id === parseInt(value));
            setFormData(prev => ({
                ...prev,
                [name]: parseInt(value) || 0,
                agent_name: selectedAgent?.name || '',
                agent_country: selectedAgent?.country || ''
            }));
        } else if (['pax', 'ladies', 'men', 'children', 'teens'].includes(name)) {
            setFormData(prev => ({
                ...prev,
                [name]: parseInt(value) || 0
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleDateChange = (name: 'date_from' | 'date_to', value: string) => {
        setFormData(prev => ({
            ...prev,
            [name]: new Date(value)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const submissionData = {
                ...formData,
                date_from: format(formData.date_from, 'MM/dd/yyyy'),
                date_to: format(formData.date_to, 'MM/dd/yyyy'),
            };

            await onSave(submissionData);
            setSuccess('Booking saved successfully!');
            
            setTimeout(() => {
                setSuccess(null);
                onCancel();
            }, 2000);
        } catch (err) {
            const apiError = err as ApiError;
            setError(apiError.message || 'Failed to save booking. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const totalPax = formData.pax || (formData.ladies + formData.men + formData.children + formData.teens);

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl font-bold flex items-center gap-2">
                            <CalendarIcon className="h-6 w-6" />
                            {booking ? 'Edit Booking' : 'New Booking'}
                        </CardTitle>
                        <CardDescription className="mt-2">
                            {booking ? 'Modify booking details' : 'Create a new booking reservation'}
                        </CardDescription>
                    </div>
                    {totalPax > 0 && (
                        <Badge variant="outline" className="flex items-center gap-1">
                            <UsersIcon className="h-3 w-3" />
                            {totalPax} Total PAX
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Alert Messages */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {success && (
                        <Alert className="border-green-200 bg-green-50 text-green-800">
                            <AlertDescription>{success}</AlertDescription>
                        </Alert>
                    )}

                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="flex items-center gap-1">
                                <UserIcon className="h-3 w-3" />
                                Booking Name *
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Enter booking name"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="country" className="flex items-center gap-1">
                                <MapPinIcon className="h-3 w-3" />
                                Country *
                            </Label>
                            <Input
                                id="country"
                                name="country"
                                value={formData.country}
                                onChange={handleInputChange}
                                placeholder="Enter destination country"
                                required
                            />
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="date_from">From Date *</Label>
                            <Input
                                id="date_from"
                                name="date_from"
                                type="date"
                                value={format(formData.date_from, 'yyyy-MM-dd')}
                                onChange={(e) => handleDateChange('date_from', e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="date_to">To Date *</Label>
                            <Input
                                id="date_to"
                                name="date_to"
                                type="date"
                                value={format(formData.date_to, 'yyyy-MM-dd')}
                                onChange={(e) => handleDateChange('date_to', e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* PAX Information */}
                    <Card className="p-4 bg-muted/50">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <UsersIcon className="h-5 w-5" />
                            Passenger Information
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="pax">Total PAX</Label>
                                <Input
                                    id="pax"
                                    name="pax"
                                    type="number"
                                    min="0"
                                    value={formData.pax}
                                    onChange={handleInputChange}
                                    placeholder="0"
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
                                    onChange={handleInputChange}
                                    placeholder="0"
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
                                    onChange={handleInputChange}
                                    placeholder="0"
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
                                    onChange={handleInputChange}
                                    placeholder="0"
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
                                    onChange={handleInputChange}
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Agent and Consultant */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="agent_id">Agent *</Label>
                            <select
                                id="agent_id"
                                name="agent_id"
                                value={formData.agent_id}
                                onChange={handleInputChange}
                                required
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="">Select an agent</option>
                                {agents.map((agent) => (
                                    <option key={agent.id} value={agent.id}>
                                        {agent.name} - {agent.country}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="consultant">Consultant</Label>
                            <Input
                                id="consultant"
                                name="consultant"
                                value={formData.consultant}
                                onChange={handleInputChange}
                                placeholder="Enter consultant name"
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-2 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="min-w-[120px]"
                        >
                            {isLoading ? 'Saving...' : booking ? 'Update Booking' : 'Create Booking'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default EnhancedBookingForm;