"use client"

import { AuthProvider } from '@/components/auth/AuthContext';
import AgentManagementApp from '@/components/AgentManagementApp';
import LoginForm from '@/components/auth/LoginForm';
import AppLayout from '../AppLayout';
import { useAuth } from '@/components/auth/AuthContext';
import React from 'react';

// Separate component to handle authentication state
function AgentManagementContent() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    return (
        <div className="container mx-auto p-6">
            {isAuthenticated ? <AgentManagementApp /> : <LoginForm />}
        </div>
    );
}


const AgentsPage: React.FC = () => {
    return (
        <AuthProvider>
            <AppLayout>
                <AgentManagementContent />
            </AppLayout>
        </AuthProvider>
    );
}

export default AgentsPage;