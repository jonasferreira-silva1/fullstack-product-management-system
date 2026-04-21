#!/bin/sh
set -e

# O postgres já está healthy quando chegamos aqui (garantido pelo depends_on do docker-compose)
# Mesmo assim, aguardamos 2s como margem de segurança para conexões TCP estabilizarem
echo "⏳ Aguardando estabilização do banco..."
sleep 2

echo "🔄 Executando migrations..."
npx prisma migrate deploy

echo "🌱 Executando seed (usuário admin)..."
node dist/prisma/seed.js || echo "⚠️  Seed já executado ou falhou (ignorando)"

echo "🚀 Iniciando aplicação NestJS..."
exec node dist/src/main
