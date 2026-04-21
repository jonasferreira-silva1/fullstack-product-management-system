import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Modo standalone: gera bundle otimizado para Docker
  output: 'standalone',

  // Permite carregar imagens do backend local
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/uploads/**',
      },
      {
        // Dentro do Docker, o backend é acessado pelo nome do serviço
        protocol: 'http',
        hostname: 'backend',
        port: '3001',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;
