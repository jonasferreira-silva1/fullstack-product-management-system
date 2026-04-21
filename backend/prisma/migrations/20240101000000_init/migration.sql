-- Migration inicial: criação de todas as tabelas do sistema
-- Gerada manualmente baseada no schema.prisma

-- Enum de perfis de usuário
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- Enum de ações de auditoria
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE');

-- Tabela de usuários
CREATE TABLE "users" (
    "id"         TEXT NOT NULL,
    "name"       TEXT NOT NULL,
    "email"      TEXT NOT NULL,
    "password"   TEXT NOT NULL,
    "role"       "Role" NOT NULL DEFAULT 'USER',
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Índice único no email do usuário
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- Tabela de categorias
CREATE TABLE "categories" (
    "id"         TEXT NOT NULL,
    "name"       TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- Tabela de produtos
CREATE TABLE "products" (
    "id"          TEXT NOT NULL,
    "name"        TEXT NOT NULL,
    "description" TEXT,
    "image_url"   TEXT,
    "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"  TIMESTAMP(3) NOT NULL,
    "created_by"  TEXT NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- Tabela de junção produto-categoria (N:N)
CREATE TABLE "product_categories" (
    "product_id"  TEXT NOT NULL,
    "category_id" TEXT NOT NULL,

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("product_id", "category_id")
);

-- Tabela de favoritos
CREATE TABLE "favorites" (
    "user_id"    TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("user_id", "product_id")
);

-- Tabela de logs de auditoria
CREATE TABLE "audit_logs" (
    "id"         TEXT NOT NULL,
    "action"     "AuditAction" NOT NULL,
    "entity"     TEXT NOT NULL,
    "entity_id"  TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id"    TEXT NOT NULL,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- Tabela de notificações
CREATE TABLE "notifications" (
    "id"         TEXT NOT NULL,
    "message"    TEXT NOT NULL,
    "read"       BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id"    TEXT NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- Foreign keys: categorias -> usuários
ALTER TABLE "categories"
    ADD CONSTRAINT "categories_created_by_fkey"
    FOREIGN KEY ("created_by") REFERENCES "users"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- Foreign keys: produtos -> usuários
ALTER TABLE "products"
    ADD CONSTRAINT "products_created_by_fkey"
    FOREIGN KEY ("created_by") REFERENCES "users"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- Foreign keys: product_categories -> produtos e categorias
ALTER TABLE "product_categories"
    ADD CONSTRAINT "product_categories_product_id_fkey"
    FOREIGN KEY ("product_id") REFERENCES "products"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "product_categories"
    ADD CONSTRAINT "product_categories_category_id_fkey"
    FOREIGN KEY ("category_id") REFERENCES "categories"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Foreign keys: favorites -> usuários e produtos
ALTER TABLE "favorites"
    ADD CONSTRAINT "favorites_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "favorites"
    ADD CONSTRAINT "favorites_product_id_fkey"
    FOREIGN KEY ("product_id") REFERENCES "products"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Foreign keys: audit_logs -> usuários
ALTER TABLE "audit_logs"
    ADD CONSTRAINT "audit_logs_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- Foreign keys: notifications -> usuários
ALTER TABLE "notifications"
    ADD CONSTRAINT "notifications_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
