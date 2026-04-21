import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Serviço responsável pela conexão com o banco de dados via Prisma.
 * Implementa os hooks de ciclo de vida do NestJS para conectar
 * e desconectar automaticamente.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  // Conecta ao banco quando o módulo é inicializado
  async onModuleInit() {
    await this.$connect();
  }

  // Desconecta do banco quando a aplicação é encerrada
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
