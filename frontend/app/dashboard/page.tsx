'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { logout, getToken } from '@/lib/auth';
import api from '@/lib/api';
import type { User } from '@/types/auth';

/**
 * Página de dashboard — área protegida.
 * Será expandida nas próximas fases com CRUD de produtos e categorias.
 */
export default function DashboardPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<User | null>(null);

  useEffect(() => {
    // Redireciona para login se não houver token
    if (!getToken()) {
      router.push('/login');
      return;
    }

    // Busca os dados do usuário autenticado
    api
      .get<User>('/auth/me')
      .then((res) => setUsuario(res.data))
      .catch(() => {
        logout();
      });
  }, [router]);

  if (!usuario) {
    return (
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Carregando...</p>
      </main>
    );
  }

  return (
    <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: '#1351b4', margin: 0 }}>Dashboard</h1>
        <button
          onClick={logout}
          style={{
            backgroundColor: '#e52207',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Sair
        </button>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <p>Bem-vindo, <strong>{usuario.name}</strong>!</p>
        <p>Email: {usuario.email}</p>
        <p>Perfil: <strong>{usuario.role}</strong></p>
      </div>
    </main>
  );
}
