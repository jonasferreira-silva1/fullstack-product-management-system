'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { logout, getToken } from '@/lib/auth';
import api from '@/lib/api';
import type { User } from '@/types/auth';

export default function DashboardPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<User | null>(null);

  useEffect(() => {
    if (!getToken()) { router.push('/login'); return; }
    api.get<User>('/auth/me')
      .then((res) => setUsuario(res.data))
      .catch(() => logout());
  }, [router]);

  if (!usuario) return <p>Carregando...</p>;

  return (
    <div>
      <h1 style={{ color: '#1351b4', marginBottom: '1.5rem' }}>Bem-vindo, {usuario.name}!</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        {[
          { label: 'Categorias', href: '/dashboard/categories', icon: '🏷️', desc: 'Gerencie categorias' },
          { label: 'Produtos', href: '/dashboard/products', icon: '📦', desc: 'Gerencie produtos' },
          { label: 'Favoritos', href: '/dashboard/favorites', icon: '⭐', desc: 'Seus favoritos' },
          ...(usuario.role === 'ADMIN' ? [{ label: 'Usuários', href: '/dashboard/users', icon: '👥', desc: 'Gerencie usuários' }] : []),
        ].map((item) => (
          <a key={item.href} href={item.href} style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', textDecoration: 'none', color: 'inherit', display: 'block', transition: 'box-shadow 0.2s' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{item.icon}</div>
            <h3 style={{ margin: '0 0 0.25rem', color: '#1351b4' }}>{item.label}</h3>
            <p style={{ margin: 0, color: '#666', fontSize: '0.875rem' }}>{item.desc}</p>
          </a>
        ))}
      </div>

      <div style={{ marginTop: '1.5rem', backgroundColor: '#fff', borderRadius: '8px', padding: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#555' }}>
          Perfil: <strong>{usuario.role}</strong> · Email: {usuario.email}
        </p>
      </div>
    </div>
  );
}
