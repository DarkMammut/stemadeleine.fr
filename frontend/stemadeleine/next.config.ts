import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
    output: 'standalone', // Pour optimiser le build Docker
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'eahwfewbtyndxbqfifuh.supabase.co',
                pathname: '/storage/v1/object/public/**',
            },
        ],
        // Favorise AVIF/WebP pour réduire la taille transférée au navigateur.
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1600, 2000],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 60,
    },
};

export default nextConfig;
