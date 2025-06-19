"use client"

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import jwt from 'jsonwebtoken';

interface User {
    id: number;
    username: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    role: string;
    is_active: boolean;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
    error: string | null;
    clearError: () => void;
    isAuthenticated: boolean;
    isAdmin: boolean;
    checkTokenExpiry: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a custom fetch wrapper that handles 401 responses
const createAuthenticatedFetch = (logout: () => void) => {
    const originalFetch = window.fetch;

    return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
        const response = await originalFetch(input, init);

        // Check if the response is 401 (Unauthorized)
        if (response.status === 401) {
            // Check if the error is due to token expiration
            const data = await response.clone().json().catch(() => ({}));
            if (data.error && (data.error.includes('expired') || data.error.includes('Token'))) {
                // Token has expired, logout the user
                logout();
            }
        }

        return response;
    };
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Function to decode JWT and check expiration
    const checkTokenExpiry = (): boolean => {
        if (!token) return false;

        try {
            // Decode token without verification (since we don't have the secret on frontend)
            const decoded = jwt.decode(token) as { exp: number } | null;

            if (!decoded || !decoded.exp) return false;

            // Check if token is expired (exp is in seconds, Date.now() is in milliseconds)
            const isExpired = decoded.exp * 1000 < Date.now();

            return !isExpired;
        } catch (error) {
            console.error('Error decoding token:', error);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        router.push('/'); // Redirect to home/login page
    };

    // Override global fetch with our authenticated version
    useEffect(() => {
        window.fetch = createAuthenticatedFetch(logout);

        // Cleanup: restore original fetch when component unmounts
        return () => {
            window.fetch = window.fetch;
        };
    }, [logout]);

    // Initialize auth state from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            // Check if the stored token is still valid
            setToken(storedToken);

            // Temporarily set token to check expiry
            const tempToken = storedToken;

            try {
                const decoded = jwt.decode(tempToken) as { exp: number } | null;

                if (decoded && decoded.exp) {
                    const isExpired = decoded.exp * 1000 < Date.now();

                    if (isExpired) {
                        // Token is expired, clear storage and don't set state
                        logout();
                    } else {
                        // Token is valid, set the state
                        setUser(JSON.parse(storedUser));
                    }
                } else {
                    // Invalid token format, logout
                    logout();
                }
            } catch (error) {
                console.error('Error checking token on mount:', error);
                logout();
            }
        }
    }, [logout]);

    // Set up interval to check token expiry periodically
    useEffect(() => {
        if (token) {
            // Check token expiry every minute
            const interval = setInterval(() => {
                if (!checkTokenExpiry()) {
                    console.log('Token expired, logging out...');
                    logout();
                }
            }, 60000); // Check every minute

            return () => clearInterval(interval);
        }
    }, [token, checkTokenExpiry, logout]);

    const login = async (username: string, password: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('https://bookingsendpoint.onrender.com/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            setToken(data.token);
            setUser(data.user);

            // Store in localStorage
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const clearError = () => {
        setError(null);
    };

    const value = {
        user,
        token,
        login,
        logout,
        isLoading,
        error,
        clearError,
        isAuthenticated: !!token && checkTokenExpiry(),
        isAdmin: user?.role === 'admin',
        checkTokenExpiry
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};