import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cria uma notificação para o dono da entidade quando outro usuário a edita.
   * Regra: se userId (quem editou) !== ownerId (dono), notifica o dono.
   */
  async notificarDono(params: {
    editorId: string;
    ownerId: string;
    entidade: string;
    entidadeNome: string;
  }) {
    const { editorId, ownerId, entidade, entidadeNome } = params;

    // Não notifica se o próprio dono editou
    if (editorId === ownerId) return;

    const editor = await this.prisma.user.findUnique({
      where: { id: editorId },
      select: { name: true },
    });

    const mensagem = `${editor?.name ?? 'Um usuário'} editou seu(sua) ${entidade} "${entidadeNome}".`;

    return this.prisma.notification.create({
      data: { userId: ownerId, message: mensagem },
    });
  }

  async findAll(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUnreadCount(userId: string) {
    const total = await this.prisma.notification.count({
      where: { userId, read: false },
    });
    return { total };
  }

  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true },
    });
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    return { message: 'Todas as notificações marcadas como lidas' };
  }
}
