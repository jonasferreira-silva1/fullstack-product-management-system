'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Typography, Tag } from '@uigovpe/components';
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

  const cards = [
    { label: 'Categorias', href: '/dashboard/categories', icon: 'pi pi-tag', desc: 'Gerencie categorias de produtos' },
    { label: 'Produtos', href: '/dashboard/products', icon: 'pi pi-box', desc: 'Cadastre e gerencie produtos' },
    { label: 'Favoritos', href: '/dashboard/favorites', icon: 'pi pi-star', desc: 'Seus produtos favoritos' },
    ...(usuario.role === 'ADMIN' ? [
      { label: 'Usuários', href: '/dashboard/users', icon: 'pi pi-users', desc: 'Gerencie usuários do sistema' },
      { label: 'Relatórios', href: '/dashboard/reports', icon: 'pi pi-chart-bar', desc: 'Relatórios e auditoria' },
    ] : []),
  ];

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Typography variant="h1" style={{ color: '#1351b4', margin: '0 0 0.5rem' }}>
          Bem-vindo, {usuario.name}!
        </Typography>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: '#555', fontSize: '0.9rem' }}>Perfil:</span>
          <Tag value={usuario.role} severity={usuario.role === 'ADMIN' ? 'info' : 'secondary'} />
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '1rem',
      }}>
        {cards.map((item) => (
          <a key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
            <Card style={{ padding: '1.5rem', cursor: 'pointer', transition: 'box-shadow 0.2s', height: '100%' }}>
              <i className={item.icon} style={{ fontSize: '2rem', color: '#1351b4', marginBottom: '0.75rem', display: 'block' }} />
              <Typography variant="h3" style={{ margin: '0 0 0.25rem', color: '#1351b4' }}>{item.label}</Typography>
              <p style={{ margin: 0, color: '#666', fontSize: '0.875rem' }}>{item.desc}</p>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
}
