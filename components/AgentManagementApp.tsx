"use client"

import { useState, useEffect, useCallback } from 'react';
import React from 'react';
import AgentForm from './AgentForm';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { AgentsDataTable } from './AgentsDataTable';
import { QuickActions } from '@/components/ui/quick-actions';
import { api } from '@/utils/api';

import { useAuth } from './auth/AuthContext';
import { Agent } from '@/types/AgentTypes';
import { useRouter } from 'next/navigation';

import { config } from '@/config/environment';
import { API_ENDPOINTS } from '@/config/apiEndpoints';

interface ApiError {
    status: number;
    message?: string;
}

const AgentManagementApp: React.FC = () => {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
    const [deleteConfirmAgent, setDeleteConfirmAgent] = useState<Agent | null>(null);
    const [showInactive, setShowInactive] = useState(false);
    const { token, isAuthenticated, isAdmin, user } = useAuth();
    const router = useRouter();


    // Apply filters based on inactive filter
    const applyFilters = useCallback((agentList: Agent[]) => {
        setFilteredAgents(agentList);
    }, []);


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



    useEffect(() => {
        applyFilters(agents);
    }, [agents, applyFilters]);

    // Updated CRUD Operations with API utility
    const handleSaveAgent = async (agent: Agent) => {
        try {
            setError('');
            const isEditing = !!agent.id;
            const endpoint = isEditing
                ? API_ENDPOINTS.AGENTS.EDIT(String(agent.id))
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
            await api.delete(API_ENDPOINTS.AGENTS.DELETE(String(agent.id)), token);

            setAgents(prev => prev.filter(a => a.id !== agent.id));
            setDeleteConfirmAgent(null);
        } catch (error) {
            if (typeof error === 'object' && error !== null && 'status' in error && (error as ApiError).status !== 401) {
                setError((error as ApiError).message || 'Failed to delete agent');
            }
        }
    };

    // Modal handlers

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingAgent(null);
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
        <>
            <div className="flex flex-1 flex-col gap-2 p-2 pt-0 sm:gap-4 sm:p-4">
                <div className="min-h-[calc(100vh-4rem)] flex-1 rounded-md p-3 sm:rounded-xl sm:p-4 md:p-6">
                    <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
                        {/* Page Title */}
                        <div className="px-2 sm:px-0">
                            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                Agent Management
                            </h1>
                            <p className="text-muted-foreground text-sm sm:text-base">
                                Manage your travel agents and their information.
                            </p>
                        </div>

                        {/* Error Alert */}
                        {error && (
                            <Alert variant="destructive" className="mx-2 sm:mx-0">
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {/* Main Content Grid */}
                        <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-3">
                            {/* Main Content Section */}
                            <div className="space-y-4 sm:space-y-6 xl:col-span-2">
                                {/* Agents Overview Card */}
                                <Card>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="text-lg font-semibold">Agents Overview</CardTitle>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Showing {filteredAgents.length} of {agents.length} agents
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {isAdmin && (
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id="show-inactive"
                                                            checked={showInactive}
                                                            onCheckedChange={(checked: boolean) => setShowInactive(checked as boolean)}
                                                        />
                                                        <Label htmlFor="show-inactive" className="text-sm font-medium">
                                                            Show Inactive
                                                        </Label>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>

                                    {/* Data Table */}
                                    <CardContent className="px-0 pt-0">
                                        <AgentsDataTable
                                            agents={filteredAgents}
                                            onDelete={setDeleteConfirmAgent}
                                            isAdmin={isAdmin}
                                            currentUserId={user?.id}
                                            isLoading={loading}
                                        />
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Sidebar Section */}
                            <div className="space-y-4 sm:space-y-6">
                                <QuickActions
                                    onAddAgent={() => {}} // Will use Link instead
                                    className=""
                                    isLoading={loading}
                                />

                                {/* Hidden file input for CSV import */}
                                {isAdmin && (
                                    <input
                                        type="file"
                                        accept=".csv"
                                        onChange={(e) => e.target.files && e.target.files[0] && importAgents(e.target.files[0])}
                                        className="sr-only"
                                        id="csvImport"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirm Delete Dialog */}
            <Dialog open={!!deleteConfirmAgent} onOpenChange={() => setDeleteConfirmAgent(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Confirm Delete</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the agent <strong>{deleteConfirmAgent?.name}</strong>?
                            This action is irreversible.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteConfirmAgent(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => deleteConfirmAgent && handleDeleteAgent(deleteConfirmAgent)}
                        >
                            Delete Agent
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Agent Form Dialog */}
            <Dialog open={isModalOpen} onOpenChange={closeModal}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingAgent ? 'Edit Agent' : 'Create New Agent'}</DialogTitle>
                        <DialogDescription>
                            {editingAgent ? 'Update agent information below.' : 'Fill in the details to create a new agent.'}
                        </DialogDescription>
                    </DialogHeader>
                    <AgentForm
                        agent={editingAgent}
                        onSave={handleSaveAgent}
                        onCancel={closeModal}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
};

export default AgentManagementApp;