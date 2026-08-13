import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
    output: 'standalone', // Pour optimiser le build Docker
    images: {
        // Compatibilité maximale: `domains` + `remotePatterns`
        domains: ['eahwfewbtyndxbqfifuh.supabase.co'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'eahwfewbtyndxbqfifuh.supabase.co',
                pathname: '/storage/v1/object/public/**',
            },
        ],
    },
    /* config options here */
};

export default nextConfig;
