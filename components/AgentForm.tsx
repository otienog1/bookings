"use client"

import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Agent, AgentFormProps } from '@/types/AgentTypes';

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
                ...agent
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
        <form onSubmit={handleSubmit} className="text-xs">
            <h2 className="text-lg font-semibold mb-4 pb-1 border-b">
                {agent ? 'Edit Agent' : 'New Agent'}
            </h2>

            {error && (
                <Alert className="mb-4 bg-red-50 border-red-200">
                    <AlertTitle>Heads Up!</AlertTitle>
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
            )}

            <div className='grid grid-cols-1 md:grid-cols-2 gap-2 text-xs'>
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
                
                <label>
                    <span className='flex mb-1'>Company</span>
                    <input
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="Company"
                        className="border p-2 mb-2 w-full uppercase text-xs"
                    />
                </label>
                
                <label>
                    <span className='flex mb-1'>Email</span>
                    <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Email"
                        required
                        className="border p-2 mb-2 w-full text-xs"
                    />
                </label>
                
                <label>
                    <span className='flex mb-1'>Phone</span>
                    <input
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Phone"
                        className="border p-2 mb-2 w-full text-xs"
                    />
                </label>
                
                <label>
                    <span className='flex mb-1'>Country</span>
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
                    <span className='flex mb-1'>Address</span>
                    <input
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Address"
                        className="border p-2 mb-2 w-full uppercase text-xs"
                    />
                </label>
                
                <label className="col-span-2">
                    <span className='flex mb-1'>Notes</span>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="Notes"
                        className="border p-2 mb-2 w-full text-xs h-24"
                    />
                </label>
                
                <label className="flex items-center">
                    <input
                        name="is_active"
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={handleChange}
                        className="mr-2"
                    />
                    <span>Active</span>
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
                    {agent ? 'Update' : 'Create'} Agent
                </button>
            </div>
        </form>
    );
};

export default AgentForm;