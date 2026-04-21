import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Guard de perfis — verifica se o usuário autenticado tem o perfil necessário.
 * Deve ser usado após o JwtAuthGuard.
 * Uso: @Roles(Role.ADMIN)
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Busca os roles exigidos pela rota
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Se a rota não exige role específico, qualquer usuário autenticado pode acessar
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        `Acesso negado. Perfil necessário: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
