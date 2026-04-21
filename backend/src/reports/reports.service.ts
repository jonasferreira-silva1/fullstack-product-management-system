import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Resumo geral do sistema — totais de usuários, produtos e categorias.
   * Usado no dashboard do ADMIN.
   */
  async getSummary() {
    const [totalUsuarios, totalProdutos, totalCategorias, totalFavoritos] =
      await this.prisma.$transaction([
        this.prisma.user.count(),
        this.prisma.product.count(),
        this.prisma.category.count(),
        this.prisma.favorite.count(),
      ]);

    return { totalUsuarios, totalProdutos, totalCategorias, totalFavoritos };
  }

  /**
   * Relatório detalhado com filtros por período, usuário e entidade.
   * Retorna logs de auditoria paginados.
   */
  async getDetailed(query: {
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

  /**
   * Relatório de produtos mais favoritados.
   */
  async getTopFavorited(limit = 10) {
    const result = await this.prisma.favorite.groupBy({
      by: ['productId'],
      _count: { productId: true },
      orderBy: { _count: { productId: 'desc' } },
      take: limit,
    });

    const produtos = await Promise.all(
      result.map(async (r) => {
        const produto = await this.prisma.product.findUnique({
          where: { id: r.productId },
          select: { id: true, name: true },
        });
        return { ...produto, totalFavoritos: r._count.productId };
      }),
    );

    return produtos;
  }
}
