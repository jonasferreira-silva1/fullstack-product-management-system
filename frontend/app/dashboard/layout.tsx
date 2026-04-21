'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/lib/auth';

/**
 * Layout compartilhado do dashboard com navegação lateral.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const links = [
    { href: '/dashboard', label: '🏠 Início' },
    { href: '/dashboard/categories', label: '🏷️ Categorias' },
    { href: '/dashboard/products', label: '📦 Produtos' },
    { href: '/dashboard/favorites', label: '⭐ Favoritos' },
    { href: '/dashboard/users', label: '👥 Usuários' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* Sidebar */}
      <aside style={{ width: '220px', backgroundColor: '#1351b4', color: '#fff', padding: '1.5rem 0', flexShrink: 0 }}>
        <div style={{ padding: '0 1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Desafio Técnico</h2>
        </div>
        <nav style={{ marginTop: '1rem' }}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                display: 'block',
                padding: '0.625rem 1rem',
                color: '#fff',
                textDecoration: 'none',
                backgroundColor: pathname === link.href ? 'rgba(255,255,255,0.15)' : 'transparent',
                fontWeight: pathname === link.href ? 600 : 400,
                fontSize: '0.9rem',
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div style={{ position: 'absolute', bottom: '1rem', left: 0, width: '220px', padding: '0 1rem' }}>
          <button
            onClick={logout}
            style={{ width: '100%', padding: '0.5rem', backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.875rem' }}
          >
            Sair
          </button>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <main style={{ flex: 1, padding: '2rem', backgroundColor: '#f5f5f5', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
