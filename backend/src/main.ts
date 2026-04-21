import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefixo global para todas as rotas da API
  app.setGlobalPrefix('api');

  // Pipe de validação global — valida todos os DTOs automaticamente
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,        // Remove campos não declarados no DTO
      forbidNonWhitelisted: true, // Lança erro se campos extras forem enviados
      transform: true,        // Transforma tipos automaticamente (string -> number, etc.)
    }),
  );

  // Habilita CORS para o frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // ─────────────────────────────────────────
  // Configuração do Swagger (documentação da API)
  // Acessível em: /api/docs
  // ─────────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('Desafio Técnico API')
    .setDescription('API REST completa com autenticação JWT, CRUD de usuários, produtos e categorias')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Insira o token JWT aqui',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`🚀 Backend rodando em: http://localhost:${port}`);
  console.log(`📚 Swagger disponível em: http://localhost:${port}/api/docs`);
}

bootstrap();
