/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // Handle backend API routes (preserve /api prefix)
      {
        source: '/api/bookings/:path*',
        destination: (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000') + '/api/bookings/:path*',
      },
      {
        source: '/api/auth/:path*',
        destination: (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000') + '/api/auth/:path*',
      },
      // Handle auth routes (without /api prefix) - these are the legacy auth routes
      {
        source: '/auth/:path*',
        destination: (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000') + '/auth/:path*',
      },
      // Handle booking routes (without /api prefix) - these are the legacy booking routes
      {
        source: '/booking/:path*',
        destination: (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000') + '/booking/:path*',
      },
      // Handle agent routes (without /api prefix) - these are the legacy agent routes
      {
        source: '/agent/:path*',
        destination: (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000') + '/agent/:path*',
      },
      // Handle payment routes (without /api prefix) - these are the legacy payment routes
      {
        source: '/payment/:path*',
        destination: (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000') + '/payment/:path*',
      },
      // Handle dashboard routes (without /api prefix) - these are the legacy dashboard routes
      {
        source: '/dashboard/:path*',
        destination: (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000') + '/dashboard/:path*',
      },
    ];
  },
}

export default nextConfig;
