import { config } from './environment';

// Define all API endpoints in one place
export const API_ENDPOINTS = {
    // Authentication endpoints
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        REFRESH: '/auth/refresh',
        VERIFY: '/auth/verify',
        LOGOUT: '/auth/logout',
        PROFILE: '/auth/profile'
    },

    // Booking endpoints
    BOOKINGS: {
        FETCH: '/booking/fetch',
        GET: (id: string) => `/booking/${id}`,
        CREATE: '/booking/create',
        EDIT: (id: string) => `/booking/edit/${id}`,
        DELETE: (id: string) => `/booking/delete/${id}`,
        IMPORT: '/booking/import'
    },

    // Agent endpoints
    AGENTS: {
        FETCH: '/agent/fetch',
        GET: (id: string) => `/agent/${id}`,
        CREATE: '/agent/create',
        EDIT: (id: string) => `/agent/edit/${id}`,
        DELETE: (id: string) => `/agent/delete/${id}`,
        IMPORT: '/agent/import'
    },

    // Payment endpoints
    PAYMENTS: {
        CREATE_INVOICE: '/payment/create-invoice',
        GET_INVOICE: (id: string) => `/payment/invoice/${id}`,
        INITIALIZE: '/payment/initialize',
        VERIFY: (reference: string) => `/payment/verify/${reference}`,
        INVOICES: '/payment/invoices',
        CANCEL_INVOICE: (id: string) => `/payment/invoice/${id}/cancel`,
        WEBHOOK: '/payment/webhook'
    },

    // Dashboard/Analytics endpoints
    DASHBOARD: {
        STATS: '/dashboard/stats',
        REVENUE_CHART: '/dashboard/revenue-chart',
        RECENT_BOOKINGS: '/dashboard/recent-bookings',
        RECENT_USERS: '/dashboard/recent-users'
    }
} as const;

// Helper function to get full API URL for any endpoint
export const getFullApiUrl = (endpoint: string): string => {
    return config.getApiUrl(endpoint);
};

// Specific helper functions for each module
export const authApiUrl = (endpoint: keyof typeof API_ENDPOINTS.AUTH): string => {
    return getFullApiUrl(API_ENDPOINTS.AUTH[endpoint]);
};

export const bookingsApiUrl = (endpoint: keyof typeof API_ENDPOINTS.BOOKINGS | string): string => {
    const url = typeof endpoint === 'string' ? endpoint : API_ENDPOINTS.BOOKINGS[endpoint];
    return getFullApiUrl(url);
};

export const agentsApiUrl = (endpoint: keyof typeof API_ENDPOINTS.AGENTS | string): string => {
    const url = typeof endpoint === 'string' ? endpoint : API_ENDPOINTS.AGENTS[endpoint];
    return getFullApiUrl(url);
};

export const paymentsApiUrl = (endpoint: keyof typeof API_ENDPOINTS.PAYMENTS | string): string => {
    const url = typeof endpoint === 'string' ? endpoint : API_ENDPOINTS.PAYMENTS[endpoint];
    return getFullApiUrl(url);
};

export const dashboardApiUrl = (endpoint: keyof typeof API_ENDPOINTS.DASHBOARD): string => {
    return getFullApiUrl(API_ENDPOINTS.DASHBOARD[endpoint]);
};