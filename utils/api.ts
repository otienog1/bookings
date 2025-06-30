import { config } from '@/config/environment';

interface ApiOptions extends RequestInit {
    token?: string | null;
}

class ApiError extends Error {
    status: number;
    data: any;

    constructor(message: string, status: number, data: any) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

export const apiCall = async (url: string, options: ApiOptions = {}): Promise<any> => {
    const { token, ...fetchOptions } = options;

    // Determine if the URL is absolute or relative
    const fullUrl = url.startsWith('http') ? url : config.getApiUrl(url);

    // Add authorization header if token is provided
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(fetchOptions.headers as Record<string, string>),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        if (config.isDevelopment) {
            console.log(`🌐 API Call: ${fetchOptions.method || 'GET'} ${fullUrl}`);
        }

        const response = await fetch(fullUrl, {
            ...fetchOptions,
            headers,
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            // Check for specific authentication errors
            if (response.status === 401) {
                const errorMessage = data?.error || 'Unauthorized';

                // Check if it's a token expiration error
                if (errorMessage.includes('expired') || errorMessage.includes('Token')) {
                    // The AuthContext will handle the logout via the fetch wrapper
                    throw new ApiError('Session expired. Please login again.', 401, data);
                }
            }

            throw new ApiError(
                data?.error || `Request failed with status ${response.status}`,
                response.status,
                data
            );
        }

        return data;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        // Network error or other fetch error
        throw new Error('Network error. Please check your connection and try again.');
    }
};

// Convenience methods for common HTTP verbs
export const api = {
    get: (url: string, token?: string | null) =>
        apiCall(url, { method: 'GET', token }),

    post: (url: string, body: any, token?: string | null) =>
        apiCall(url, {
            method: 'POST',
            body: JSON.stringify(body),
            token
        }),

    put: (url: string, body: any, token?: string | null) =>
        apiCall(url, {
            method: 'PUT',
            body: JSON.stringify(body),
            token
        }),

    delete: (url: string, token?: string | null) =>
        apiCall(url, { method: 'DELETE', token }),
};

// Legacy support - you can remove this once you update all components
export { apiCall as default };