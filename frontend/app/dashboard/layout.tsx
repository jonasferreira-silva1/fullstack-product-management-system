'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { GovBar, AdminUserBar, Toast, ToastRef, Badge } from '@uigovpe/components';
import { logout, getToken } from '@/lib/auth';
import api from '@/lib/api';
import type { User } from '@/types/auth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const toast = useRef<ToastRef>(null);
  const [usuario, setUsuario] = useState<User | null>(null);
  const [notificacoes, setNotificacoes] = useState(0);

  useEffect(() => {
    if (!getToken()) { router.push('/login'); return; }
    api.get<User>('/auth/me')
      .then((res) => setUsuario(res.data))
      .catch(() => logout());
  }, [router]);

  // Polling de notificações a cada 30s
  useEffect(() => {
    if (!getToken()) return;
    async function buscarNotificacoes() {
      try {
        const res = await api.get<{ total: number }>('/notifications/unread-count');
        setNotificacoes(res.data.total);
      } catch { /* silencioso */ }
    }
    buscarNotificacoes();
    const interval = setInterval(buscarNotificacoes, 30000);
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { label: 'Início', href: '/dashboard', icon: 'pi pi-home' },
    { label: 'Categorias', href: '/dashboard/categories', icon: 'pi pi-tag' },
    { label: 'Produtos', href: '/dashboard/products', icon: 'pi pi-box' },
    { label: 'Favoritos', href: '/dashboard/favorites', icon: 'pi pi-star' },
    { label: 'Notificações', href: '/dashboard/notifications', icon: 'pi pi-bell' },
    { label: 'Meu Perfil', href: '/dashboard/profile', icon: 'pi pi-user' },
    ...(usuario?.role === 'ADMIN' ? [
      { label: 'Usuários', href: '/dashboard/users', icon: 'pi pi-users' },
      { label: 'Relatórios', href: '/dashboard/reports', icon: 'pi pi-chart-bar' },
    ] : []),
  ];

  // Menu do AdminUserBar inclui navegação + separador + sair
  const adminBarActions = [
    ...menuItems.map((item) => ({
      label: item.label,
      icon: <i className={item.icon} />,
      command: () => router.push(item.href),
    })),
    // Separador visual
    {
      label: '─────────────',
      icon: <></>,
      command: () => {},
    },
    // Botão de logout
    {
      label: 'Sair',
      icon: <i className="pi pi-sign-out" style={{ color: '#e52207' }} />,
      command: logout,
    },
  ];

  return (
    <>
      <Toast ref={toast} />
      <GovBar />

      <AdminUserBar
        user={usuario ? { name: usuario.name, profile: usuario.role } : { name: '', profile: '' }}
        menuActions={adminBarActions}
      />

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 112px)' }}>
        {/* Sidebar */}
        <aside style={{
          width: '220px',
          backgroundColor: '#1351b4',
          flexShrink: 0,
          padding: '1rem 0',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          {/* Links de navegação */}
          <nav>
            {menuItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  color: '#fff',
                  textDecoration: 'none',
                  backgroundColor: pathname === item.href ? 'rgba(255,255,255,0.2)' : 'transparent',
                  fontWeight: pathname === item.href ? 600 : 400,
                  fontSize: '0.9rem',
                  borderLeft: pathname === item.href ? '3px solid #fff' : '3px solid transparent',
                }}
              >
                <i className={item.icon} style={{ fontSize: '1rem' }} />
                {item.label}
                {item.label === 'Notificações' && notificacoes > 0 && (
                  <Badge value={notificacoes} severity="danger" style={{ marginLeft: 'auto' }} />
                )}
              </a>
            ))}
          </nav>

          {/* Botão de logout na parte inferior da sidebar */}
          <button
            onClick={logout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              color: '#fff',
              background: 'rgba(229,34,7,0.25)',
              border: 'none',
              borderTop: '1px solid rgba(255,255,255,0.2)',
              cursor: 'pointer',
              fontSize: '0.9rem',
              width: '100%',
              textAlign: 'left',
            }}
          >
            <i className="pi pi-sign-out" style={{ fontSize: '1rem' }} />
            Sair
          </button>
        </aside>

        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', backgroundColor: '#f5f5f5' }}>
          {children}
        </main>
      </div>
    </>
  );
}
