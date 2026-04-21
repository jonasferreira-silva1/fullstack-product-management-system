import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditAction } from '@prisma/client';

export interface CreateAuditLogDto {
  userId: string;
  action: AuditAction;
  entity: string;
  entityId: string;
}

/**
 * Serviço de auditoria — grava logs de ações no banco.
 * Chamado pelo AuditInterceptor automaticamente.
 */
@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(data: CreateAuditLogDto) {
    return this.prisma.auditLog.create({ data });
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    userId?: string;
    entity?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const { page = 1, limit = 10, userId, entity, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;
    if (entity) where.entity = { contains: entity, mode: 'insensitive' };
    if (startDate || endDate) {
      where.createdAt = {
        ...(startDate && { gte: new Date(startDate) }),
        ...(endDate && { lte: new Date(endDate) }),
      };
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
