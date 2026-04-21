import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { AuditModule } from './audit/audit.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UploadModule } from './upload/upload.module';
import { HealthController } from './health/health.controller';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';

@Module({
  imports: [
    // Carrega variáveis de ambiente globalmente
    ConfigModule.forRoot({ isGlobal: true }),

    // Módulo global do banco de dados
    PrismaModule,

    // Módulos de funcionalidades
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    AuditModule,
    NotificationsModule,
    UploadModule,
  ],
  controllers: [HealthController],
  providers: [
    // Guard JWT aplicado globalmente em todas as rotas
    // Rotas públicas usam @Public() para ignorar
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Guard de perfis aplicado globalmente após o JWT
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
