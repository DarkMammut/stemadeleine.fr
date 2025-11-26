import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Autorise les images servies depuis le bucket Supabase (nom de host observé dans l'erreur)
    domains: ['eahwfewbtyndxbqfifuh.supabase.co'],
    // Si nécessaire, vous pouvez décommenter et ajuster `remotePatterns` pour matcher des chemins spécifiques
    // remotePatterns: [
    //   {
    //     protocol: 'https',
    //     hostname: 'eahwfewbtyndxbqfifuh.supabase.co',
    //     pathname: '/**',
    //   },
    // ],
  },
  /* config options here */
};

export default nextConfig;
