# ─────────────────────────────────────────
# Stage 1: Build da aplicação
# ─────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copia manifesto de dependências (cache de camadas)
COPY package*.json ./
RUN npm ci

# Copia o código e compila
COPY . .
RUN npm run build

# ─────────────────────────────────────────
# Stage 2: Imagem de produção enxuta
# ─────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Copia o output standalone gerado pelo Next.js
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copia arquivos públicos se existirem
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
