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
    const { isAuthenticated, isAdmin, checkTokenExpiry } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Check if token is valid
        if (!isAuthenticated || !checkTokenExpiry()) {
            router.push('/');
            return;
        }

        // Check admin access if required
        if (requireAdmin && !isAdmin) {
            router.push('/');
        }
    }, [isAuthenticated, isAdmin, requireAdmin, checkTokenExpiry, router]);

    // Show loading while checking authentication
    if (!isAuthenticated) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <UILoader text="Checking authentication..." />
            </div>
        );
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