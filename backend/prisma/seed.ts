import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Seed inicial do banco de dados.
 * Cria o usuário ADMIN padrão se não existir.
 */
async function main() {
  const adminEmail = 'admin@desafio.com';

  // Verifica se o admin já existe para evitar duplicatas
  const adminExistente = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (adminExistente) {
    console.log('✅ Usuário admin já existe, pulando seed.');
    return;
  }

  // Cria hash seguro da senha
  const senhaHash = await bcrypt.hash('Admin@123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Administrador',
      email: adminEmail,
      password: senhaHash,
      role: Role.ADMIN,
    },
  });

  console.log(`✅ Usuário admin criado: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
