"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';
import UILoader from '@/components/UILoader';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requireAdmin = false
}) => {
    const { isAuthenticated, isAdmin, isInitializing } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Don't redirect during initialization
        if (isInitializing) return;
        
        // Only redirect if we're sure the user is not authenticated
        if (!isAuthenticated) {
            router.replace('/');
            return;
        }

        // Check admin access if required
        if (isAuthenticated && requireAdmin && !isAdmin) {
            router.replace('/');
        }
    }, [isAuthenticated, isAdmin, isInitializing, requireAdmin, router]);

    // Show loading while initializing authentication
    if (isInitializing) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <UILoader text="Checking authentication..." />
            </div>
        );
    }
    
    // If not authenticated, don't render children (redirect will happen in useEffect)
    if (!isAuthenticated) {
        return null;
    }

    // Check admin access
    if (requireAdmin && !isAdmin) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
                    <p>You don&apos;t have permission to access this page.</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};