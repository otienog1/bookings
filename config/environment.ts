interface EnvironmentConfig {
    API_BASE_URL: string;
    FRONTEND_URL: string;
    ENVIRONMENT: 'development' | 'production' | 'staging';
    IS_DEVELOPMENT: boolean;
    IS_PRODUCTION: boolean;
    PAYSTACK_PUBLIC_KEY?: string;
}

class ConfigManager {
    private config: EnvironmentConfig;

    constructor() {
        this.config = this.initializeConfig();
    }

    private initializeConfig(): EnvironmentConfig {
        // Detect environment
        const isDevelopment = process.env.NODE_ENV === 'development' ||
            typeof window !== 'undefined' &&
            (window.location.hostname === 'localhost' ||
                window.location.hostname === '127.0.0.1');

        const isProduction = process.env.NODE_ENV === 'production' && !isDevelopment;

        // Determine environment type
        let environment: 'development' | 'production' | 'staging' = 'development';
        if (isProduction) {
            environment = 'production';
        }

        // Set API base URL based on environment
        let apiBaseUrl: string;
        let frontendUrl: string;

        if (isDevelopment) {
            // Development environment - use proxy to avoid CORS issues
            if (typeof window !== 'undefined') {
                // Client-side: use the proxy route
                apiBaseUrl = '/api';
                frontendUrl = window.location.origin;
            } else {
                // Server-side: use direct API URL
                apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
                frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
            }
        } else {
            // Production/Staging environment
            apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://bookingsendpoint.onrender.com';
            frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://your-frontend-domain.com';
        }

        return {
            API_BASE_URL: apiBaseUrl,
            FRONTEND_URL: frontendUrl,
            ENVIRONMENT: environment,
            IS_DEVELOPMENT: isDevelopment,
            IS_PRODUCTION: isProduction,
            PAYSTACK_PUBLIC_KEY: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
        };
    }

    // Getter methods for easy access
    get apiBaseUrl(): string {
        return this.config.API_BASE_URL;
    }

    get frontendUrl(): string {
        return this.config.FRONTEND_URL;
    }

    get environment(): string {
        return this.config.ENVIRONMENT;
    }

    get isDevelopment(): boolean {
        return this.config.IS_DEVELOPMENT;
    }

    get isProduction(): boolean {
        return this.config.IS_PRODUCTION;
    }

    get paystackPublicKey(): string | undefined {
        return this.config.PAYSTACK_PUBLIC_KEY;
    }

    // Method to get full API endpoint URL
    getApiUrl(endpoint: string): string {
        // Remove leading slash if present to avoid double slashes
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
        return `${this.config.API_BASE_URL}/${cleanEndpoint}`;
    }

    // Method to get full frontend URL
    getFrontendUrl(path: string): string {
        const cleanPath = path.startsWith('/') ? path.slice(1) : path;
        return `${this.config.FRONTEND_URL}/${cleanPath}`;
    }

    // Debug method to log current configuration
    logConfig(): void {
        if (this.isDevelopment) {
            console.log('🔧 Environment Configuration:', {
                environment: this.environment,
                apiBaseUrl: this.apiBaseUrl,
                frontendUrl: this.frontendUrl,
                isDevelopment: this.isDevelopment,
                isProduction: this.isProduction
            });
        }
    }

    // Get all config (useful for debugging)
    getAllConfig(): EnvironmentConfig {
        return { ...this.config };
    }
}

// Create and export a singleton instance
export const config = new ConfigManager();

// Export the configuration for direct access if needed
export default config;

// Helper function for quick API URL generation
export const getApiUrl = (endpoint: string): string => config.getApiUrl(endpoint);

// Helper function for quick frontend URL generation  
export const getFrontendUrl = (path: string): string => config.getFrontendUrl(path);