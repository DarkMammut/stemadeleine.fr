/** @type {import('next').NextConfig} */
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

const nextConfig = {
    output: 'standalone', // Pour optimiser le build Docker
    async rewrites() {
        return [
            {
                source: '/api/:path((?!auth).*)', // Exclude /api/auth/* routes
                destination: `${BACKEND_URL}/api/:path*`,
            },
        ];
    },
};

export default nextConfig;
