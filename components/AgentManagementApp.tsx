"use client"

import { useState, useEffect, useCallback } from 'react';
import React from 'react';
import AgentForm from './AgentForm';
import Modal from './Modal';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import * as XLSX from 'xlsx';
import UILoader from './UILoader';
import { api } from '@/utils/api'; // Add this import

import { useAuth } from './auth/AuthContext';
import { Agent } from '@/types/AgentTypes';
import { UserPlus } from 'lucide-react';

import { config } from '@/config/environment';
import { API_ENDPOINTS } from '@/config/apiEndpoints';

interface ApiError {
    status: number;
    message?: string;
}

const AgentManagementApp: React.FC = () => {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
    const [deleteConfirmAgent, setDeleteConfirmAgent] = useState<Agent | null>(null);
    const [showInactive, setShowInactive] = useState(false);
    const { token, isAuthenticated, isAdmin, user } = useAuth();

    // const baseURL = "https://bookingsendpoint.onrender.com";
    const baseURL = "localhost:5000";

    // Updated fetch agents with API utility
    const fetchAgents = useCallback(async () => {
        try {
            setLoading(true);
            setError('');

            const data = await api.get(API_ENDPOINTS.AGENTS.FETCH + `?show_inactive=${showInactive}`, token);

            // Sort agents alphabetically by name
            const sortedAgents = data.agents.sort((a: Agent, b: Agent) =>
                a.name.localeCompare(b.name)
            );

            setAgents(sortedAgents);
            applyFilters(sortedAgents);
        } catch (error) {
            if (typeof error === 'object' && error !== null && 'status' in error && (error as ApiError).status !== 401) {
                setError((error as ApiError).message || 'Failed to fetch agents');
            }
        } finally {
            setLoading(false);
        }
    }, [showInactive, token, applyFilters]);

    useEffect(() => {
        if (isAuthenticated && token) {
            fetchAgents();
        }
    }, [isAuthenticated, token, showInactive, fetchAgents]);

    // Apply filters based on search term
    const applyFilters = useCallback((agentList: Agent[]) => {
        const filtered = agentList.filter(agent => {
            const searchFields = [
                agent.name,
                agent.company,
                agent.email,
                agent.country,
                agent.phone
            ].map(field => field?.toLowerCase() || '');

            return searchFields.some(field => field.includes(searchTerm.toLowerCase()));
        });

        setFilteredAgents(filtered);
    }, [searchTerm]);

    useEffect(() => {
        applyFilters(agents);
    }, [searchTerm, agents, applyFilters]);

    // Updated CRUD Operations with API utility
    const handleSaveAgent = async (agent: Agent) => {
        try {
            setError('');
            const isEditing = !!agent.id;
            const endpoint = isEditing
                ? API_ENDPOINTS.AGENTS.EDIT(agent.id)
                : API_ENDPOINTS.AGENTS.CREATE;

            // Remove response variable since it's not being used
            if (isEditing) {
                await api.put(endpoint, agent, token);
            } else {
                await api.post(endpoint, agent, token);
            }

            await fetchAgents();
            closeModal();
        } catch (error) {
            if (typeof error === 'object' && error !== null && 'status' in error && (error as ApiError).status !== 401) {
                setError((error as ApiError).message || 'Failed to save agent');
            }
        }
    };

    const handleDeleteAgent = async (agent: Agent) => {
        try {
            setError('');
            await api.delete(API_ENDPOINTS.AGENTS.DELETE(agent.id), token);

            setAgents(prev => prev.filter(a => a.id !== agent.id));
            setDeleteConfirmAgent(null);
        } catch (error) {
            if (typeof error === 'object' && error !== null && 'status' in error && (error as ApiError).status !== 401) {
                setError((error as ApiError).message || 'Failed to delete agent');
            }
        }
    };

    // Modal handlers
    const openModal = (agent?: Agent) => {
        setEditingAgent(agent || null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingAgent(null);
    };

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredAgents.map(agent => ({
            Name: agent.name,
            Company: agent.company || '',
            Email: agent.email,
            Phone: agent.phone || '',
            Country: agent.country,
            Address: agent.address || '',
            Notes: agent.notes || '',
            Status: agent.is_active ? 'Active' : 'Inactive'
        })));

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Agents');

        XLSX.writeFile(workbook, 'agents.xlsx');
    };

    const importAgents = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            setError('');
            const response = await fetch(config.getApiUrl(API_ENDPOINTS.AGENTS.IMPORT), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                const data = await response.json();
                if (response.status === 401) {
                    return; // Let AuthContext handle the redirect
                }
                throw new Error(data.error || 'Failed to import agents');
            }

            const result = await response.json();

            if (result.errors > 0) {
                setError(`Imported ${result.imported} agents, but encountered ${result.errors} errors.`);
            }

            fetchAgents();
        } catch (error: unknown) {
            if (error instanceof Error) {
                setError(error.message);
            } else if (typeof error === 'object' && error !== null && 'message' in error) {
                setError((error as { message: string }).message);
            } else {
                setError('Failed to import agents');
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

            <h1 className="text-2xl font-bold mb-6">Agent Management</h1>

            <div className="my-4 flex flex-col md:flex-row justify-between gap-2">
                <div className="flex flex-col md:flex-row gap-2 items-center">
                    <input
                        type="text"
                        placeholder="Search agents..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border p-2 w-full md:w-64 text-xs rounded"
                    />

                    {isAdmin && (
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={showInactive}
                                onChange={(e) => setShowInactive(e.target.checked)}
                            />
                            <span className="text-xs">Show Inactive Agents</span>
                        </label>
                    )}
                </div>
                <div className='flex space-x-2'>
                    <button
                        onClick={() => openModal()}
                        className="flex items-center rounded px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white uppercase text-xs transition-colors"
                    >
                        <UserPlus className="h-4 w-4 mr-2" />
                        <span>New Agent</span>
                    </button>
                    <button
                        onClick={exportToExcel}
                        className="rounded px-3 py-1 bg-green-500 hover:bg-green-600 text-white uppercase text-xs transition-colors"
                    >
                        Export to Excel
                    </button>
                    {isAdmin && (
                        <>
                            <input
                                type="file"
                                accept=".csv"
                                onChange={(e) => e.target.files && e.target.files[0] && importAgents(e.target.files[0])}
                                className="sr-only"
                                id="csvImport"
                            />
                            <label
                                htmlFor="csvImport"
                                className="rounded px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white uppercase text-xs transition-colors cursor-pointer"
                            >
                                Import CSV
                            </label>
                        </>
                    )}
                </div>
            </div>

            {/* Confirm Delete Modal */}
            <Modal
                isOpen={!!deleteConfirmAgent}
                onClose={() => setDeleteConfirmAgent(null)}
                backdropClick={true}
            >
                <div className="px-4 py-2">
                    <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
                    <p className="mb-4 normal-case">Are you sure you want to delete the agent <u>{deleteConfirmAgent?.name}</u>?<br />This action is irreversible.</p>
                    <div className="flex justify-end space-x-2">
                        <button
                            onClick={() => setDeleteConfirmAgent(null)}
                            className="px-4 py-2 bg-gray-300 hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => deleteConfirmAgent && handleDeleteAgent(deleteConfirmAgent)}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Agent Form Modal */}
            <Modal isOpen={isModalOpen} onClose={closeModal} backdropClick={false}>
                <AgentForm
                    agent={editingAgent}
                    onSave={handleSaveAgent}
                    onCancel={closeModal}
                />
            </Modal>

            {/* Agents Table */}
            <div id="agents-table" className="bg-white overflow-hidden">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="border py-2 px-3 text-xs uppercase text-left">Name</th>
                            <th className="border py-2 px-3 text-xs uppercase text-left">Company</th>
                            <th className="border py-2 px-3 text-xs uppercase text-left">Email</th>
                            <th className="border py-2 px-3 text-xs uppercase text-left">Phone</th>
                            <th className="border py-2 px-3 text-xs uppercase text-left">Country</th>
                            <th className="border py-2 px-3 text-xs uppercase text-center">Status</th>

                            {isAdmin && (
                                <th className="border py-2 px-3 text-xs uppercase text-center">Actions</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="py-8 px-3 text-center border">
                                    <div className="flex justify-center items-center">
                                        <UILoader text='Loading data...' />
                                    </div>
                                </td>
                            </tr>
                        ) : filteredAgents.length > 0 ? (
                            filteredAgents.map((agent) => (
                                <tr key={agent.id} className="hover:bg-gray-50/50">
                                    <td className="border py-2 px-3 text-xs uppercase">{agent.name}</td>
                                    <td className="border py-2 px-3 text-xs uppercase">{agent.company || '—'}</td>
                                    <td className="border py-2 px-3 text-xs">{agent.email}</td>
                                    <td className="border py-2 px-3 text-xs">{agent.phone || '—'}</td>
                                    <td className="border py-2 px-3 text-xs uppercase">{agent.country}</td>
                                    <td className="border py-2 px-3 text-xs text-center">
                                        <span className={`px-2 py-1 rounded text-xs ${agent.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {agent.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    {isAdmin && (
                                        <td className="border py-2 px-3 text-xs text-center">
                                            <div className="flex justify-center space-x-2">
                                                {(isAdmin || agent.user_id === user?.id) && (
                                                    <button
                                                        onClick={() => openModal(agent)}
                                                        className="text-blue-600 hover:text-blue-800"
                                                    >
                                                        Edit
                                                    </button>
                                                )}
                                                {(isAdmin || agent.user_id === user?.id) && (
                                                    <button
                                                        onClick={() => setDeleteConfirmAgent(agent)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="py-4 px-3 text-center border">
                                    No agents found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AgentManagementApp;