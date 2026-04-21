import { SetMetadata } from '@nestjs/common';

// Chave usada para marcar rotas públicas (sem autenticação)
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator que marca uma rota como pública.
 * Rotas públicas ignoram o JwtAuthGuard global.
 * Uso: @Public()
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
