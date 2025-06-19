"use client"

import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import jwt from 'jsonwebtoken';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export const SessionExpiryWarning: React.FC = () => {
    const { token, logout, refreshToken, rememberMe } = useAuth();
    const [showWarning, setShowWarning] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState<number>(0);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        if (!token) {
            setShowWarning(false);
            return;
        }

        const checkExpiry = () => {
            try {
                const decoded = jwt.decode(token) as { exp: number } | null;

                if (!decoded || !decoded.exp) return;

                const expiryTime = decoded.exp * 1000; // Convert to milliseconds
                const currentTime = Date.now();
                const timeLeft = expiryTime - currentTime;

                // Show warning when less than 5 minutes remaining
                const fiveMinutes = 5 * 60 * 1000;

                if (timeLeft > 0 && timeLeft <= fiveMinutes) {
                    setShowWarning(true);
                    setTimeRemaining(Math.floor(timeLeft / 1000)); // Convert to seconds
                } else {
                    setShowWarning(false);
                }

                // If token is expired, logout
                if (timeLeft <= 0) {
                    logout();
                }
            } catch (error) {
                console.error('Error checking token expiry:', error);
            }
        };

        // Check immediately
        checkExpiry();

        // Check every 30 seconds
        const interval = setInterval(checkExpiry, 30000);

        // Update countdown every second when warning is shown
        let countdownInterval: NodeJS.Timeout;
        if (showWarning && !isRefreshing) {
            countdownInterval = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        // Try to auto-refresh if remember me is enabled
                        if (rememberMe) {
                            handleExtendSession();
                        } else {
                            logout();
                        }
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            clearInterval(interval);
            if (countdownInterval) clearInterval(countdownInterval);
        };
    }, [token, logout, showWarning, isRefreshing, rememberMe]);

    const handleExtendSession = async () => {
        setIsRefreshing(true);
        try {
            const success = await refreshToken();
            if (success) {
                setShowWarning(false);
                setTimeRemaining(0);
            } else {
                // Refresh failed, will logout
                logout();
            }
        } catch (error) {
            console.error('Failed to extend session:', error);
            logout();
        } finally {
            setIsRefreshing(false);
        }
    };

    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    if (!showWarning) return null;

    return (
        <div className="fixed top-4 right-4 z-50 max-w-md">
            <Alert className="bg-yellow-50 border-yellow-200 shadow-lg">
                <AlertTitle className="text-yellow-800">Session Expiring Soon</AlertTitle>
                <AlertDescription className="text-yellow-700">
                    <p className="mb-3">
                        Your session will expire in <strong>{formatTime(timeRemaining)}</strong>.
                        {rememberMe && <span className="block text-xs mt-1">Auto-refresh enabled with &quot;Remember Me&quot;</span>}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={handleExtendSession}
                            disabled={isRefreshing}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white text-sm rounded transition-colors"
                        >
                            {isRefreshing ? 'Extending...' : 'Extend Session'}
                        </button>
                        <button
                            onClick={logout}
                            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm rounded transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </AlertDescription>
            </Alert>
        </div>
    );
};