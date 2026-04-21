import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { Role } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateCategoryDto, userId: string) {
    return this.prisma.category.create({
      data: { name: dto.name, createdBy: userId },
      include: { creator: { select: { id: true, name: true } } },
    });
  }

  async findAll(query: QueryCategoryDto) {
    const { page = 1, limit = 10, name } = query;
    const skip = (page - 1) * limit;
    const where = name ? { name: { contains: name, mode: 'insensitive' as const } } : {};

    const [data, total] = await this.prisma.$transaction([
      this.prisma.category.findMany({
        where, skip, take: limit,
        include: { creator: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.category.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { creator: { select: { id: true, name: true } } },
    });
    if (!category) throw new NotFoundException('Categoria não encontrada');
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto, userId: string, userRole: Role) {
    const category = await this.findOne(id);

    if (category.createdBy !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('Sem permissão para editar esta categoria');
    }

    // Notifica o dono se outro usuário editou
    await this.notificationsService.notificarDono({
      editorId: userId,
      ownerId: category.createdBy,
      entidade: 'categoria',
      entidadeNome: category.name,
    });

    return this.prisma.category.update({
      where: { id },
      data: dto,
      include: { creator: { select: { id: true, name: true } } },
    });
  }

  async remove(id: string, userId: string, userRole: Role) {
    const category = await this.findOne(id);

    if (category.createdBy !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('Sem permissão para remover esta categoria');
    }

    await this.prisma.category.delete({ where: { id } });
    return { message: 'Categoria removida com sucesso' };
  }
}
