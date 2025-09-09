"use client"

import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Save } from 'lucide-react';
import { Agent, AgentFormProps } from '@/types/AgentTypes';
import RichTextEditor from '@/components/blocks/editor/rich-text-editor';

const AgentForm: React.FC<AgentFormProps> = ({ agent, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Agent>({
        id: 0,
        name: '',
        company: '',
        email: '',
        phone: '',
        country: '',
        address: '',
        notes: '',
        is_active: true,
        user_id: 0
    });
    const [error, setError] = useState<string>('');

    useEffect(() => {
        if (agent) {
            setFormData({
                ...agent,
                name: agent.name || '',
                company: agent.company || '',
                email: agent.email || '',
                phone: agent.phone || '',
                country: agent.country || '',
                address: agent.address || '',
                notes: agent.notes || ''
            });
        }
    }, [agent]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleNotesChange = (html: string) => {
        setFormData(prev => ({ ...prev, notes: html }));
    };

    const handleCountryChange = (value: string) => {
        setFormData(prev => ({ ...prev, country: value }));
    };

    const validateForm = (): boolean => {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
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
        <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-3 pt-6">
            {/* Form Section */}
            <div className="space-y-4 sm:space-y-6 xl:col-span-2">
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-semibold">
                            Agent Information
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Fill in the details below to {agent ? 'update the' : 'create a new'} agent profile.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            {/* Basic Information */}
                            <div className="space-y-4">
                                <h3 className="text-base font-medium text-foreground border-b pb-2">Basic Information</h3>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-sm font-medium">Full Name *</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Enter agent's full name"
                                            required
                                            className="h-10 text-sm focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="company" className="text-sm font-medium">Company</Label>
                                        <Input
                                            id="company"
                                            name="company"
                                            value={formData.company}
                                            onChange={handleChange}
                                            placeholder="Company or organization"
                                            className="h-10 text-sm focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="space-y-4">
                                <h3 className="text-base font-medium text-foreground border-b pb-2">Contact Information</h3>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-medium">Email Address *</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="agent@example.com"
                                            required
                                            className="h-10 text-sm focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="+1 (555) 123-4567"
                                            className="h-10 text-sm focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Location Information */}
                            <div className="space-y-4">
                                <h3 className="text-base font-medium text-foreground border-b pb-2">Location</h3>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                    <div className="space-y-2">
                                        <Label htmlFor="country" className="text-sm font-medium">Country *</Label>
                                        <Select
                                            value={formData.country}
                                            onValueChange={handleCountryChange}
                                            required
                                        >
                                            <SelectTrigger className="h-10 text-sm focus:ring-2 focus:ring-primary/20">
                                                <SelectValue placeholder="Select a country" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="spain">Spain</SelectItem>
                                                <SelectItem value="brazil">Brazil</SelectItem>
                                                <SelectItem value="colombia">Colombia</SelectItem>
                                                <SelectItem value="chile">Chile</SelectItem>
                                                <SelectItem value="usa">USA</SelectItem>
                                                <SelectItem value="uk">UK</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="address" className="text-sm font-medium">Address</Label>
                                        <Input
                                            id="address"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            placeholder="Street address"
                                            className="h-10 text-sm focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Additional Information */}
                            <div className="space-y-4">
                                <h3 className="text-base font-medium text-foreground border-b pb-2">Additional Information</h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
                                        <RichTextEditor
                                            value={formData.notes}
                                            onChange={handleNotesChange}
                                            placeholder="Any additional notes or comments about this agent..."
                                            className="text-sm"
                                        />
                                    </div>

                                    <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-md">
                                        <Checkbox
                                            id="is_active"
                                            checked={formData.is_active}
                                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked as boolean }))}
                                        />
                                        <div>
                                            <Label htmlFor="is_active" className="text-sm font-medium">Active Agent</Label>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Active agents can create bookings and receive notifications
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* Actions Sidebar */}
            <div className="space-y-4 sm:space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="flex gap-2 pt-6">
                        <Button
                            onClick={handleSubmit}
                            className="flex-1 justify-center"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {agent ? 'Update' : 'Save'} Agent
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            className="flex-1 justify-center"
                        >
                            Cancel
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AgentForm;