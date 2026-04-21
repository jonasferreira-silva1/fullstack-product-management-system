import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { Role } from '@prisma/client';

// Include padrão para produtos
const PRODUCT_INCLUDE = {
  creator: { select: { id: true, name: true } },
  categories: { include: { category: { select: { id: true, name: true } } } },
};

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProductDto, userId: string) {
    const { categoryIds = [], ...data } = dto;

    return this.prisma.product.create({
      data: {
        ...data,
        createdBy: userId,
        // Cria as relações N:N com categorias
        categories: {
          create: categoryIds.map((categoryId) => ({ categoryId })),
        },
      },
      include: PRODUCT_INCLUDE,
    });
  }

  async findAll(query: QueryProductDto) {
    const { page = 1, limit = 10, name, categoryId, createdBy } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (name) where.name = { contains: name, mode: 'insensitive' };
    if (createdBy) where.createdBy = createdBy;
    if (categoryId) {
      where.categories = { some: { categoryId } };
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where, skip, take: limit,
        include: PRODUCT_INCLUDE,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: PRODUCT_INCLUDE,
    });
    if (!product) throw new NotFoundException('Produto não encontrado');
    return product;
  }

  async update(id: string, dto: UpdateProductDto, userId: string, userRole: Role) {
    const product = await this.findOne(id);

    if (product.createdBy !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('Sem permissão para editar este produto');
    }

    const { categoryIds, ...data } = dto;

    return this.prisma.product.update({
      where: { id },
      data: {
        ...data,
        // Se categoryIds foi enviado, recria as relações
        ...(categoryIds !== undefined && {
          categories: {
            deleteMany: {},
            create: categoryIds.map((categoryId) => ({ categoryId })),
          },
        }),
      },
      include: PRODUCT_INCLUDE,
    });
  }

  async remove(id: string, userId: string, userRole: Role) {
    const product = await this.findOne(id);

    if (product.createdBy !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('Sem permissão para remover este produto');
    }

    await this.prisma.product.delete({ where: { id } });
    return { message: 'Produto removido com sucesso' };
  }

  // ─── Favoritos ───────────────────────────────────────────────

  async addFavorite(productId: string, userId: string) {
    await this.findOne(productId);

    // upsert evita erro se já favoritou
    await this.prisma.favorite.upsert({
      where: { userId_productId: { userId, productId } },
      create: { userId, productId },
      update: {},
    });

    return { message: 'Produto adicionado aos favoritos' };
  }

  async removeFavorite(productId: string, userId: string) {
    await this.findOne(productId);

    await this.prisma.favorite.deleteMany({
      where: { userId, productId },
    });

    return { message: 'Produto removido dos favoritos' };
  }

  async findFavorites(userId: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      include: { product: { include: PRODUCT_INCLUDE } },
      orderBy: { createdAt: 'desc' },
    });

    return favorites.map((f) => f.product);
  }
}
