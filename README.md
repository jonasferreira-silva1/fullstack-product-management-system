# Desafio Técnico — Sistema de Gerenciamento de Produtos

Sistema fullstack com **NestJS** (backend), **Next.js** (frontend), **PostgreSQL** e **Docker**.

## Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Backend | NestJS + Prisma ORM |
| Frontend | Next.js 16 + TypeScript |
| UI Components | [UIGovPE](https://www.npmjs.com/package/@uigovpe/components) (design system do Governo de Pernambuco) |
| Banco de dados | PostgreSQL 15 |
| Autenticação | JWT (passport-jwt) |
| Upload | Multer (armazenamento local) |
| Documentação | Swagger (@nestjs/swagger) |
| Containerização | Docker + Docker Compose |

---

## Pré-requisitos

- [Docker](https://www.docker.com/) e Docker Compose instalados
- Portas **3000**, **3001** e **5432** disponíveis

---

## Como rodar do zero

### 1. Clone o repositório

```bash
git clone https://github.com/jonasferreira-silva1/fullstack-product-management-system
cd fullstack-product-management-system
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

> O arquivo `.env` já vem com valores padrão para desenvolvimento local. Não é necessário alterar nada para rodar.

### 3. Suba todos os serviços

```bash
docker-compose up --build
```

Aguarde até ver no terminal:

```
desafio_backend   | 🚀 Backend rodando em: http://localhost:3001
desafio_backend   | 📚 Swagger disponível em: http://localhost:3001/api/docs
```

### 4. Acesse a aplicação

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend (API) | http://localhost:3001/api |
| Swagger (docs) | http://localhost:3001/api/docs |

---

## Credenciais de teste

Um usuário **ADMIN** é criado automaticamente na primeira inicialização:

| Campo | Valor |
|-------|-------|
| Email | admin@desafio.com |
| Senha | Admin@123 |

---

## Perfis de usuário e regras de acesso

### ADMIN
- Cadastra, edita e remove **usuários**
- Visualiza **todos** os produtos, categorias e usuários do sistema
- Acessa **relatórios** detalhados e dashboard geral (totais do sistema)
- Consulta **logs de auditoria** com filtros por período, usuário e entidade
- Todas as permissões do perfil USER

### USER
- Cadastra **produtos** e cria **categorias**
- Visualiza todos os produtos e categorias cadastrados no sistema
- Favorita **N produtos** (adicionar e remover)
- Recebe **notificações** quando outro usuário edita seus produtos ou categorias

> Rotas exclusivas do ADMIN retornam `403 Forbidden` para usuários com perfil USER.

---

## Interface — UIGovPE e Mobile First

A interface foi construída com a biblioteca de componentes **UIGovPE** (`@uigovpe/components`), o design system oficial do Governo de Pernambuco, que fornece:

- `Button`, `InputText`, `InputPassword`, `InputSearch` — formulários
- `Table`, `Column`, `Paginator` — listagens com paginação
- `Dialog` — modais de criação e edição
- `Card` — cards de conteúdo
- `Toast` — feedback de ações
- `GovBar`, `AdminUserBar` — barras institucionais
- `Tag`, `Badge`, `MultiSelect`, `Dropdown` — elementos visuais

A aplicação segue o princípio **Mobile First** — todas as telas são responsivas e funcionam em dispositivos móveis (320px), tablets (768px) e desktops (1280px+).

---

## Estrutura do projeto

```
fullstack-product-management-system/
├── backend/                  # API REST — NestJS + Prisma
│   ├── prisma/
│   │   ├── schema.prisma     # Modelagem do banco de dados
│   │   ├── seed.ts           # Seed do usuário admin
│   │   └── migrations/       # Migrations SQL
│   ├── src/
│   │   ├── auth/             # JWT, guards, decorators
│   │   ├── users/            # CRUD de usuários (ADMIN)
│   │   ├── products/         # CRUD de produtos + favoritos
│   │   ├── categories/       # CRUD de categorias
│   │   ├── audit/            # Interceptor + logs de auditoria
│   │   ├── notifications/    # Mensageria entre usuários
│   │   ├── upload/           # Upload de avatar e imagem
│   │   ├── reports/          # Relatórios e dashboard (ADMIN)
│   │   └── prisma/           # PrismaService global
│   ├── uploads/              # Arquivos enviados (volume Docker)
│   ├── Dockerfile
│   └── entrypoint.sh         # Migrations + seed + start
│
├── frontend/                 # Interface — Next.js + UIGovPE
│   ├── app/
│   │   ├── login/            # Tela de login (UIGovPE)
│   │   └── dashboard/
│   │       ├── categories/   # Listagem e CRUD de categorias
│   │       ├── products/     # Listagem e CRUD de produtos
│   │       ├── favorites/    # Produtos favoritos
│   │       ├── users/        # Gerenciamento de usuários (ADMIN)
│   │       ├── notifications/# Notificações do usuário
│   │       └── reports/      # Relatórios e auditoria (ADMIN)
│   ├── components/           # Componentes reutilizáveis
│   ├── lib/                  # api.ts (Axios) + auth.ts
│   ├── types/                # Tipos TypeScript
│   └── Dockerfile
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Variáveis de ambiente

### Raiz (`.env`) — usada pelo docker-compose

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `POSTGRES_USER` | Usuário do PostgreSQL | `postgres` |
| `POSTGRES_PASSWORD` | Senha do PostgreSQL | `postgres` |
| `POSTGRES_DB` | Nome do banco | `desafio_db` |
| `JWT_SECRET` | Chave secreta do JWT | `chave_secreta_dev_...` |
| `JWT_EXPIRES_IN` | Expiração do token | `7d` |

### Backend (`backend/.env`) — para desenvolvimento local

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | URL de conexão com o PostgreSQL |
| `JWT_SECRET` | Chave secreta do JWT |
| `PORT` | Porta do servidor (padrão: 3001) |

### Frontend (`frontend/.env.local`) — para desenvolvimento local

| Variável | Descrição |
|----------|-----------|
| `NEXT_PUBLIC_API_URL` | URL da API backend |

---

## Funcionalidades implementadas

### Autenticação e Segurança
- Login com JWT — `POST /api/auth/login`
- Guard global protege todas as rotas automaticamente
- Decorator `@Roles()` diferencia USER e ADMIN
- Rotas públicas marcadas com `@Public()`
- Middleware Next.js redireciona rotas não autenticadas para o login

### CRUD de Usuários (ADMIN)
- Listagem paginada com filtro por nome
- Criação, edição e remoção
- Upload de foto de perfil

### CRUD de Categorias
- Qualquer usuário autenticado pode criar
- Categoria pertence ao criador
- Paginação e filtro por nome

### CRUD de Produtos
- Produto pertence ao criador
- Associação N:N com categorias
- Filtros por nome, categoria e criador
- Upload de imagem do produto
- Favoritar/desfavoritar produtos

### Auditoria
- Interceptor global grava automaticamente toda ação CREATE/UPDATE/DELETE
- Campos: userId, action, entity, entityId, timestamp
- Consulta paginada com filtros por período, usuário e entidade (ADMIN)

### Notificações/Mensageria
- Quando usuário A edita produto/categoria de B, B é notificado automaticamente
- Badge de notificações não lidas no layout com polling a cada 30 segundos
- Marcar como lida individualmente ou todas de uma vez

### Upload de Arquivos
- Avatar do usuário: `POST /api/upload/avatar`
- Imagem de produto: `POST /api/upload/product/:id`
- Validação de tipo (JPG, PNG, WebP) e tamanho (máx. 5MB)
- Arquivos servidos estaticamente em `/uploads`

### Relatórios (ADMIN)
- Dashboard com totais: usuários, produtos, categorias, favoritos
- Relatório detalhado com filtros por período, usuário e entidade
- Produtos mais favoritados

---

## Documentação da API

Acesse o Swagger em: **http://localhost:3001/api/docs**

Para autenticar no Swagger:
1. Execute `POST /api/auth/login` com as credenciais de teste
2. Copie o `access_token` da resposta
3. Clique em **Authorize** (cadeado no topo da página)
4. Cole o token no campo e confirme

---

## Modelagem do banco de dados

```
users              — id, name, email, password, role, avatar_url
categories         — id, name, created_by (FK users)
products           — id, name, description, image_url, created_by (FK users)
product_categories — product_id + category_id  (N:N)
favorites          — user_id + product_id       (N:N)
audit_logs         — id, action, entity, entity_id, user_id, created_at
notifications      — id, message, read, user_id, created_at
```

---

## Comandos úteis

```bash
# Subir em background
docker-compose up -d --build

# Ver logs do backend
docker logs desafio_backend -f

# Ver logs do frontend
docker logs desafio_frontend -f

# Parar todos os serviços
docker-compose down

# Parar e remover volumes (limpa o banco — perde os dados)
docker-compose down -v
```
