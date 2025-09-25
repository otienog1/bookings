import { config } from '@/config/environment';
import { AppError, handleApiError } from './errorHandler';

interface ApiOptions extends RequestInit {
    token?: string | null;
}

interface ApiResponse<T = any> {
    data: T;
    message?: string;
    success: boolean;
}

class ApiError extends AppError {
    constructor(message: string, status: number, data: any) {
        const code = getErrorCode(status);
        super(message, code, status, { response: data });
        this.name = 'ApiError';
    }
}

function getErrorCode(status: number): string {
    switch (status) {
        case 400: return 'BAD_REQUEST';
        case 401: return 'UNAUTHORIZED';
        case 403: return 'FORBIDDEN';
        case 404: return 'NOT_FOUND';
        case 422: return 'VALIDATION_ERROR';
        case 429: return 'RATE_LIMITED';
        case 500: return 'SERVER_ERROR';
        case 502: return 'BAD_GATEWAY';
        case 503: return 'SERVICE_UNAVAILABLE';
        default: return 'HTTP_ERROR';
    }
}

export const apiCall = async (url: string, options: ApiOptions = {}): Promise<any> => {
    const { token, ...fetchOptions } = options;

    // Determine if the URL is absolute or relative
    const fullUrl = url.startsWith('http') ? url : config.getApiUrl(url);

    // Add authorization header if token is provided
    const headers: Record<string, string> = {
        ...(fetchOptions.headers as Record<string, string>),
    };

    // Only set Content-Type to application/json if body is not FormData
    if (!(fetchOptions.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

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
        throw new AppError(
            'Network error. Please check your connection and try again.',
            'NETWORK_ERROR',
            0,
            { originalError: error }
        );
    }
};

// Convenience methods for common HTTP verbs
export const api = {
    get: (url: string, token?: string | null) =>
        apiCall(url, { method: 'GET', token }),

    post: (url: string, body: any, token?: string | null) =>
        apiCall(url, {
            method: 'POST',
            body: body instanceof FormData ? body : JSON.stringify(body),
            token
        }),

    put: (url: string, body: any, token?: string | null) =>
        apiCall(url, {
            method: 'PUT',
            body: body instanceof FormData ? body : JSON.stringify(body),
            token
        }),

    delete: (url: string, token?: string | null) =>
        apiCall(url, { method: 'DELETE', token }),
};

// Legacy support - you can remove this once you update all components
export { apiCall as default };