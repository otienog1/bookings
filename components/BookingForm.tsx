"use client"

import React, { useEffect, useState, useMemo } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Combobox } from "@/components/ui/combobox";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Badge } from "@/components/ui/badge";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { format, isValid } from 'date-fns';
import { CalendarDays, AlertCircle, X, ArrowLeft } from 'lucide-react';
import { Booking, BookingFormProps } from '@/types/BookingTypes';
import { Agent } from '@/types/AgentTypes';
import { api } from '@/utils/api';
import { useAuth } from './auth/AuthContext';
import { API_ENDPOINTS } from '@/config/apiEndpoints';
import Link from 'next/link';

interface ApiError {
    status: number;
    message?: string;
}

const formSchema = z.object({
    name: z.string().min(2, "Booking name must be at least 2 characters"),
    country: z.string().min(2, "Country must be at least 2 characters"),
    dateRange: z.object({
        from: z.date({ message: "Arrival date is required" }),
        to: z.date({ message: "Departure date is required" })
    }).refine(data => data.to >= data.from, {
        message: "Departure date must be after arrival date",
        path: ["to"]
    }),
    ladies: z.number().min(0, "Must be 0 or greater"),
    men: z.number().min(0, "Must be 0 or greater"),
    children: z.number().min(0, "Must be 0 or greater"),
    teens: z.number().min(0, "Must be 0 or greater"),
    agent_id: z.union([z.string().min(1, "Please select an agent"), z.number().min(1, "Please select an agent")]),
    consultant: z.string().min(1, "Consultant is required"),
})

type FormData = z.infer<typeof formSchema>

const BookingForm: React.FC<BookingFormProps> = ({ booking, onSave, onCancel }) => {
    const [error, setError] = useState<string>('');
    const [agents, setAgents] = useState<Agent[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { token, user } = useAuth();

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            country: '',
            dateRange: {
                from: new Date(),
                to: new Date(),
            },
            ladies: 0,
            men: 0,
            children: 0,
            teens: 0,
            agent_id: "",
            consultant: user?.first_name || user?.username || 'Unknown',
        },
    });

    // Updated fetch agents with API utility
    useEffect(() => {
        const fetchAgents = async () => {
            try {
                const data = await api.get(API_ENDPOINTS.AGENTS.FETCH, token);
                if (data && data.agents && Array.isArray(data.agents)) {
                    setAgents(data.agents);
                } else {
                    setError('Invalid agents data received');
                }
            } catch (error) {
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
            // Helper function to safely parse dates
            const parseDate = (dateValue: any): Date | undefined => {
                if (!dateValue) return undefined;

                let date: Date;
                if (dateValue instanceof Date) {
                    date = dateValue;
                } else if (typeof dateValue === 'object' && dateValue !== null && '$date' in dateValue) {
                    // MongoDB date format
                    date = new Date((dateValue as any).$date);
                } else {
                    date = new Date(dateValue);
                }

                return isValid(date) ? date : undefined;
            };

            const fromDate = parseDate(booking.date_from);
            const toDate = parseDate(booking.date_to);

            form.reset({
                name: booking.name,
                country: booking.country,
                dateRange: {
                    from: fromDate,
                    to: toDate
                },
                ladies: booking.ladies,
                men: booking.men,
                children: booking.children,
                teens: booking.teens,
                agent_id: booking.agent_id,
                consultant: booking.consultant || (user?.first_name || user?.username || 'Unknown'),
            });
        }
    }, [booking, form, user?.first_name, user?.username]);

    const totalPax = form.watch(['ladies', 'men', 'children', 'teens']).reduce((sum, val) => sum + val, 0);

    const agentOptions = useMemo(() =>
        agents.filter(agent => agent.id && agent.name).map(agent => ({
            value: agent.id.toString(),
            label: agent.name,
            description: `${agent.country} • ${agent.company || 'No company'}`
        })),
        [agents]
    );

    const handleSubmit = async (values: FormData) => {
        try {
            setIsSubmitting(true);
            setError('');

            const bookingData: Booking = {
                id: booking?.id || 0,
                name: values.name,
                country: values.country,
                date_from: format(values.dateRange.from, 'yyyy-MM-dd'),
                date_to: format(values.dateRange.to, 'yyyy-MM-dd'),
                ladies: values.ladies,
                men: values.men,
                children: values.children,
                teens: values.teens,
                pax: totalPax,
                agent_id: values.agent_id,
                agent: agents.find(a => a.id.toString() === values.agent_id.toString())?.name || '',
                consultant: values.consultant,
                user_id: user?.id,
                created_by: user?.username || '',
            };

            await onSave(bookingData);
        } catch (error) {
            setError('Failed to save booking. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Page Title */}
            <div className="px-2 sm:px-0">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    {booking ? 'Edit Booking' : 'New Booking'}
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                    {booking ? 'Update booking details and information.' : 'Create a new safari booking in the system.'}
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-3">
                {/* Form Section */}
                <div className="space-y-4 sm:space-y-6 xl:col-span-2">
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-semibold">
                            Booking Information
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Fill in the details below to {booking ? 'update the' : 'create a new'} booking.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form id="booking-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">

                                {/* Basic Information */}
                                <div className="space-y-4">
                                    <h3 className="text-base font-medium text-foreground border-b pb-2">Basic Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel className="text-sm font-medium">Booking Name *</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Enter booking name"
                                                            className="h-10 text-sm focus:ring-2 focus:ring-primary/20"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="country"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel className="text-sm font-medium">Destination Country *</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Enter destination country"
                                                            className="h-10 text-sm focus:ring-2 focus:ring-primary/20"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Travel Dates */}
                                <div className="space-y-4">
                                    <h3 className="text-base font-medium text-foreground border-b pb-2">Travel Dates</h3>
                                    <FormField
                                        control={form.control}
                                        name="dateRange"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-sm font-medium">Travel Period *</FormLabel>
                                                <FormControl>
                                                    <DateRangePicker
                                                        date={field.value}
                                                        onDateChange={field.onChange}
                                                        placeholder="Pick arrival and departure dates"
                                                        className="h-10"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Passenger Information */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-base font-medium text-foreground border-b pb-2 flex-1">Passenger Information</h3>
                                        {totalPax > 0 && (
                                            <Badge variant="secondary" className="ml-2">
                                                Total: {totalPax} pax
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="ladies"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel className="text-sm font-medium">Ladies</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            className="h-10 text-sm text-center focus:ring-2 focus:ring-primary/20"
                                                            {...field}
                                                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="men"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel className="text-sm font-medium">Men</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            className="h-10 text-sm text-center focus:ring-2 focus:ring-primary/20"
                                                            {...field}
                                                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="children"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel className="text-sm font-medium">Children</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            className="h-10 text-sm text-center focus:ring-2 focus:ring-primary/20"
                                                            {...field}
                                                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="teens"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel className="text-sm font-medium">Teens</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            className="h-10 text-sm text-center focus:ring-2 focus:ring-primary/20"
                                                            {...field}
                                                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Agent & Consultant Details */}
                                <div className="space-y-4">
                                    <h3 className="text-base font-medium text-foreground border-b pb-2">Agent & Consultant Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="agent_id"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel className="text-sm font-medium">Travel Agent</FormLabel>
                                                    <FormControl>
                                                        <Combobox
                                                            options={agentOptions}
                                                            value={field.value && field.value !== "" ? field.value.toString() : ""}
                                                            onValueChange={(value) => {
                                                                if (value && value.trim() !== "") {
                                                                    field.onChange(value);
                                                                } else {
                                                                    field.onChange("");
                                                                }
                                                            }}
                                                            placeholder="Select an agent"
                                                            searchPlaceholder="Search agents..."
                                                            emptyText={agents.length === 0 ? "Loading agents..." : "No agents found."}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="consultant"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel className="text-sm font-medium">Consultant</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            placeholder="Consultant name"
                                                            className="h-10 text-sm bg-muted focus:ring-2 focus:ring-primary/20"
                                                            readOnly
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>

            {/* Actions Sidebar */}
            <div className="space-y-4 sm:space-y-6">
                <Card>
                    <CardHeader className="py-3 border-b">
                        <CardTitle className="text-base font-semibold">Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="flex gap-2 pt-6">
                        <Button
                            type="submit"
                            form="booking-form"
                            disabled={isSubmitting}
                            className="flex-1 justify-center"
                        >
                            <CalendarDays className="h-4 w-4 mr-2" />
                            {booking ? 'Update' : 'Create'} Booking
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={isSubmitting}
                            className="flex-1 justify-center"
                        >
                            Cancel
                        </Button>
                    </CardContent>
                </Card>
                </div>
            </div>
        </div>
    );
};

export default BookingForm;