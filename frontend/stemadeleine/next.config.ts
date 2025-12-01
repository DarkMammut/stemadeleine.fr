import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Autorise les images servies depuis le bucket Supabase (nom de host observé dans l'erreur)
    // Remplacement de `domains` (déprécié) par `remotePatterns` pour limiter précisément
    // les sources d'images et empêcher des hôtes malveillants.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'eahwfewbtyndxbqfifuh.supabase.co',
        pathname: '/:path*',
      },
    ],
    // Si nécessaire, vous pouvez ajouter d'autres patterns ici.
  },
  /* config options here */
};

export default nextConfig;
