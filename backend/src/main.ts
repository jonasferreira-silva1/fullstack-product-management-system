import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

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

  // Habilita CORS — aceita requisições do frontend
  app.enableCors({
    origin: true, // Aceita qualquer origem (seguro para desenvolvimento)
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Serve arquivos estáticos de uploads (avatars e imagens de produtos)
  app.useStaticAssets(join(__dirname, '..', '..', 'uploads'), {
    prefix: '/uploads',
  });

  // ─────────────────────────────────────────
  // Configuração do Swagger (documentação da API)
  // Acessível em: /api/docs
  // ─────────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('Desafio Técnico API')
    .setDescription(`
## API REST — Sistema de Gerenciamento de Produtos

### Autenticação
Use **POST /api/auth/login** para obter o \`access_token\` e clique em **Authorize** (cadeado) para autenticar.

### Credenciais de teste
- **Email:** admin@desafio.com
- **Senha:** Admin@123

### Perfis
- **ADMIN** — acesso total: usuários, relatórios, auditoria
- **USER** — cadastra produtos/categorias, favorita produtos

### Módulos
- \`/auth\` — Login e dados do usuário autenticado
- \`/users\` — CRUD de usuários (ADMIN)
- \`/categories\` — CRUD de categorias
- \`/products\` — CRUD de produtos + favoritos
- \`/notifications\` — Notificações do usuário
- \`/audit\` — Logs de auditoria (ADMIN)
- \`/reports\` — Relatórios e dashboard (ADMIN)
- \`/upload\` — Upload de avatar e imagem de produto
    `)
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Cole o access_token retornado pelo login',
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
