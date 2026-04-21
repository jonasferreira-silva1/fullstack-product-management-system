# Desafio Técnico — Sistema de Gerenciamento de Produtos

Sistema fullstack com NestJS (backend) e Next.js (frontend), banco PostgreSQL, autenticação JWT e Docker.

## Pré-requisitos

- [Docker](https://www.docker.com/) e Docker Compose
- [Node.js](https://nodejs.org/) v20+
- [npm](https://www.npmjs.com/) v9+

## Estrutura do Projeto

```
DESAF-TEC/
├── backend/          # API REST com NestJS + Prisma
│   ├── prisma/       # Schema e migrations do banco
│   ├── src/
│   │   ├── auth/         # Autenticação JWT
│   │   ├── users/        # CRUD de usuários
│   │   ├── products/     # CRUD de produtos
│   │   ├── categories/   # CRUD de categorias
│   │   ├── audit/        # Logs de auditoria
│   │   ├── notifications/# Notificações
│   │   ├── upload/       # Upload de arquivos
│   │   └── prisma/       # Serviço do Prisma
│   └── uploads/      # Arquivos enviados pelos usuários
├── frontend/         # Interface com Next.js + TypeScript
│   ├── app/          # App Router do Next.js
│   ├── components/   # Componentes reutilizáveis
│   ├── lib/          # Utilitários (api, auth)
│   └── types/        # Tipos TypeScript
└── docker-compose.yml
```

## Rodando com Docker

```bash
# 1. Clone o repositório
git clone <url-do-repositorio>
cd DESAF-TEC

# 2. Configure as variáveis de ambiente
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# 3. Suba todos os serviços
docker-compose up --build

# Serviços disponíveis:
# - Frontend:  http://localhost:3000
# - Backend:   http://localhost:3001
# - Swagger:   http://localhost:3001/api/docs
```

## Rodando Localmente (sem Docker)

```bash
# Backend
cd backend
npm install
npx prisma migrate dev
npm run start:dev

# Frontend (em outro terminal)
cd frontend
npm install
npm run dev
```

## Variáveis de Ambiente

### Backend (`backend/.env`)

| Variável        | Descrição                        | Padrão                    |
|-----------------|----------------------------------|---------------------------|
| DATABASE_URL    | URL de conexão com o PostgreSQL  | postgresql://...          |
| JWT_SECRET      | Chave secreta para tokens JWT    | —                         |
| JWT_EXPIRES_IN  | Tempo de expiração do token      | 7d                        |
| PORT            | Porta do servidor                | 3001                      |

### Frontend (`frontend/.env.local`)

| Variável              | Descrição           | Padrão                      |
|-----------------------|---------------------|-----------------------------|
| NEXT_PUBLIC_API_URL   | URL da API backend  | http://localhost:3001/api   |

## Credenciais de Teste

Após rodar as migrations, um usuário ADMIN é criado automaticamente:

| Campo  | Valor              |
|--------|--------------------|
| Email  | admin@desafio.com  |
| Senha  | Admin@123          |

## Documentação da API

Acesse o Swagger em: `http://localhost:3001/api/docs`

## Fases de Desenvolvimento

- [x] Fase 1 — Banco de dados, estrutura e Docker
- [ ] Fase 2 — Auth & Segurança (JWT, perfis, rotas protegidas)
- [ ] Fase 3 — CRUD Principal (Usuários, Categorias, Produtos)
- [ ] Fase 4 — Funcionalidades Avançadas (Auditoria, Notificações, Upload)
- [ ] Fase 5 — Qualidade e Entrega (Swagger, Responsividade, README)
