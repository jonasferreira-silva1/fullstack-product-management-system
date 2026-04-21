import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Permite carregar imagens do backend local
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;
