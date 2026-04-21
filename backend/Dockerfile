# ─────────────────────────────────────────
# Stage 1: Build da aplicação
# ─────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Instala OpenSSL necessário para o Prisma gerar o cliente
RUN apk add --no-cache openssl

# Copia manifesto de dependências primeiro (cache de camadas)
COPY package*.json ./
COPY prisma ./prisma/

# Instala todas as dependências (incluindo devDependencies para o build)
RUN npm ci

# Gera o cliente Prisma
RUN npx prisma generate

# Copia o restante do código e compila
COPY . .
RUN npm run build

# ─────────────────────────────────────────
# Stage 2: Imagem de produção enxuta
# ─────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Instala OpenSSL necessário para o Prisma funcionar no Alpine
RUN apk add --no-cache openssl

# Instala apenas dependências de produção
COPY package*.json ./
RUN npm ci --omit=dev

# Copia artefatos do build
COPY --from=builder /app/dist ./dist

# Copia o cliente Prisma gerado e o schema para migrations
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma

# Copia o script de entrypoint
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# Pasta de uploads persistente (mapeada via volume no docker-compose)
RUN mkdir -p uploads

EXPOSE 3001

# Entrypoint: roda migrations, seed e inicia a aplicação
ENTRYPOINT ["./entrypoint.sh"]
