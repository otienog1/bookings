"use client"

import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import jwt from 'jsonwebtoken';
import { config } from '@/config/environment';
import { API_ENDPOINTS } from '@/config/apiEndpoints';

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
    login: (username: string, password: string, rememberMe?: boolean) => Promise<void>;
    logout: () => void;
    refreshToken: () => Promise<boolean>;
    isLoading: boolean;
    isInitializing: boolean;
    error: string | null;
    clearError: () => void;
    isAuthenticated: boolean;
    isAdmin: boolean;
    checkTokenExpiry: () => boolean;
    rememberMe: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a custom fetch wrapper that handles 401 responses and token refresh
const createAuthenticatedFetch = (logout: () => void, refreshToken: () => Promise<boolean>) => {
    const originalFetch = window.fetch;
    let isRefreshing = false;
    let refreshPromise: Promise<boolean> | null = null;

    return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
        // Skip authentication for share API routes (public access)
        const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

        // Check for share routes - handle both absolute and relative URLs
        const isShareRoute = url && (
            url.includes('/api/share/') ||
            url.match(/\/api\/share\/[^\/]+$/) ||
            url.match(/\/api\/share\/[^\/]+\//)
        );

        if (isShareRoute) {
            console.log('🚫 Bypassing authentication for share route:', url);
            return await originalFetch(input, init);
        }

        let response = await originalFetch(input, init);

        // Check if the response is 401 (Unauthorized)
        if (response.status === 401) {
            const data = await response.clone().json().catch(() => ({}));

            if (data.error && data.error.includes('expired')) {
                // Avoid multiple simultaneous refresh attempts
                if (!isRefreshing) {
                    isRefreshing = true;
                    refreshPromise = refreshToken();
                }

                // Wait for the refresh to complete
                const refreshed = await refreshPromise;
                isRefreshing = false;
                refreshPromise = null;

                if (refreshed) {
                    // Retry the original request with the new token
                    const newToken = localStorage.getItem('authToken');
                    if (newToken && init?.headers) {
                        const headers = new Headers(init.headers);
                        headers.set('Authorization', `Bearer ${newToken}`);
                        response = await originalFetch(input, { ...init, headers });
                    }
                } else {
                    // Refresh failed, logout
                    logout();
                }
            } else {
                // Other auth error, logout
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
    const [isInitializing, setIsInitializing] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [rememberMe, setRememberMe] = useState(false);
    const router = useRouter();

    // Function to decode JWT and check expiration
    const checkTokenExpiry = (): boolean => {
        if (!token) return false;

        try {
            const decoded = jwt.decode(token) as { exp: number } | null;

            if (!decoded || !decoded.exp) return false;

            const isExpired = decoded.exp * 1000 < Date.now();

            return !isExpired;
        } catch (error) {
            console.error('Error decoding token:', error);
            return false;
        }
    };

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        setRememberMe(false);
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('rememberMe');
        router.push('/');
    }, [router]);

    // Refresh token function
    const refreshToken = useCallback(async (): Promise<boolean> => {
        const currentRefreshToken = localStorage.getItem('refreshToken');

        if (!currentRefreshToken) return false;

        try {
            const response = await fetch(config.getApiUrl(API_ENDPOINTS.AUTH.REFRESH), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${currentRefreshToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ remember_me: rememberMe })
            });

            if (response.ok) {
                const data = await response.json();

                setToken(data.token);
                setUser(data.user);

                // Update stored values
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                return true;
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
        }

        return false;
    }, [rememberMe]);

    // Override global fetch with our authenticated version
    useEffect(() => {
        window.fetch = createAuthenticatedFetch(logout, refreshToken);

        return () => {
            window.fetch = window.fetch;
        };
    }, [logout, refreshToken]);

    // Initialize auth state from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user');
        const storedRememberMe = localStorage.getItem('rememberMe') === 'true';

        if (storedToken && storedUser) {
            setRememberMe(storedRememberMe);

            try {
                const decoded = jwt.decode(storedToken) as { exp: number } | null;

                if (decoded && decoded.exp) {
                    const isExpired = decoded.exp * 1000 < Date.now();

                    if (!isExpired) {
                        // Token is still valid, set auth state
                        setToken(storedToken);
                        setUser(JSON.parse(storedUser));
                    } else {
                        // Token expired, clear auth state
                        logout();
                    }
                } else {
                    logout();
                }
            } catch (error) {
                console.error('Error checking token on mount:', error);
                logout();
            }
        }
        
        setIsInitializing(false);
    }, [logout]);

    // Set up interval to refresh token before expiry
    useEffect(() => {
        if (token) {
            const checkAndRefresh = () => {
                try {
                    const decoded = jwt.decode(token) as { exp: number } | null;

                    if (decoded && decoded.exp) {
                        const expiryTime = decoded.exp * 1000;
                        const currentTime = Date.now();
                        const timeUntilExpiry = expiryTime - currentTime;

                        // Refresh token when less than 5 minutes remaining
                        if (timeUntilExpiry > 0 && timeUntilExpiry < 5 * 60 * 1000) {
                            refreshToken();
                        } else if (timeUntilExpiry <= 0) {
                            // Token already expired, try to refresh
                            refreshToken().then(success => {
                                if (!success) {
                                    logout();
                                }
                            });
                        }
                    }
                } catch (error) {
                    console.error('Error in token refresh check:', error);
                }
            };

            // Check every minute
            const interval = setInterval(checkAndRefresh, 60000);

            // Also check immediately
            checkAndRefresh();

            return () => clearInterval(interval);
        }
    }, [token, logout, refreshToken]);

    const login = async (username: string, password: string, rememberMe: boolean = false) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(config.getApiUrl(API_ENDPOINTS.AUTH.LOGIN), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password, remember_me: rememberMe }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            setToken(data.token);
            setUser(data.user);
            setRememberMe(rememberMe);

            // Store in localStorage
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('rememberMe', rememberMe.toString());

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
        refreshToken,
        isLoading,
        isInitializing,
        error,
        clearError,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'admin',
        checkTokenExpiry,
        rememberMe
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