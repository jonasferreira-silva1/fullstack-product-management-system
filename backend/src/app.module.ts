import { Module } from '@nestjs/common';
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
})
export class AppModule {}
