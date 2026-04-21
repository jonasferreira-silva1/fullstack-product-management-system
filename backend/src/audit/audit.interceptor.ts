import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditService } from './audit.service';
import { AuditAction } from '@prisma/client';

/**
 * Interceptor global de auditoria.
 * Grava automaticamente em audit_logs toda ação CREATE/UPDATE/DELETE
 * com: userId, action, entity, entityId e timestamp.
 *
 * Detecta a entidade pelo path da URL e a ação pelo método HTTP.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const method = req.method as string;

    // Apenas audita mutações
    const auditMethods = ['POST', 'PATCH', 'PUT', 'DELETE'];
    if (!auditMethods.includes(method)) {
      return next.handle();
    }

    // Ignora rotas de auth, health e upload (sem entidade de negócio)
    const path: string = req.path || '';
    const ignoredPaths = ['/api/auth', '/api/health', '/api/upload'];
    if (ignoredPaths.some((p) => path.startsWith(p))) {
      return next.handle();
    }

    return next.handle().pipe(
      tap((responseBody) => {
        // Só audita se o usuário estiver autenticado
        const user = req.user;
        if (!user?.id) return;

        const action = this.resolveAction(method, path);
        if (!action) return;

        const entity = this.resolveEntity(path);
        const entityId = this.resolveEntityId(req, responseBody);

        if (!entityId) return;

        // Grava o log de forma assíncrona sem bloquear a resposta
        this.auditService
          .log({ userId: user.id, action, entity, entityId })
          .catch(() => {/* silencioso — não deve quebrar a requisição */});
      }),
    );
  }

  private resolveAction(method: string, path: string): AuditAction | null {
    if (method === 'DELETE') return AuditAction.DELETE;
    if (method === 'PATCH' || method === 'PUT') return AuditAction.UPDATE;
    // POST para favoritar não é CREATE de entidade principal
    if (method === 'POST' && path.includes('/favorite')) return null;
    if (method === 'POST') return AuditAction.CREATE;
    return null;
  }

  private resolveEntity(path: string): string {
    // Extrai o nome da entidade do path: /api/products/123 → Product
    const segments = path.split('/').filter(Boolean);
    const resource = segments[1] || 'unknown';

    // Mapeamento explícito para evitar erros de singularização
    const mapa: Record<string, string> = {
      products: 'Product',
      categories: 'Category',
      users: 'User',
      notifications: 'Notification',
    };

    return mapa[resource] ?? (resource.charAt(0).toUpperCase() + resource.slice(1));
  }

  private resolveEntityId(req: any, body: any): string | null {
    // Para DELETE/PATCH, o ID vem na URL
    if (req.params?.id) return req.params.id;
    // Para POST (CREATE), o ID vem no corpo da resposta
    if (body?.id) return body.id;
    return null;
  }
}
