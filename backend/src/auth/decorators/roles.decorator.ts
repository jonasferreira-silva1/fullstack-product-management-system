import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

// Chave usada para armazenar os roles nos metadados da rota
export const ROLES_KEY = 'roles';

/**
 * Decorator que define quais perfis têm acesso à rota.
 * Uso: @Roles(Role.ADMIN) ou @Roles(Role.USER, Role.ADMIN)
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
