'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import type { Product } from '@/types';

export default function FavoritesPage() {
  const [produtos, setProdutos] = useState<Product[]>([]);
  const [carregando, setCarregando] = useState(true);

  async function carregar() {
    try {
      const res = await api.get<Product[]>('/products/favorites');
      setProdutos(res.data);
    } finally {
      setCarregando(false);
    }
  }

  async function removerFavorito(id: string) {
    await api.delete(`/products/${id}/favorite`);
    setProdutos((prev) => prev.filter((p) => p.id !== id));
  }

  useEffect(() => { carregar(); }, []);

  if (carregando) return <p>Carregando...</p>;

  return (
    <div>
      <h1 style={{ color: '#1351b4', marginBottom: '1.5rem' }}>⭐ Meus Favoritos</h1>

      {produtos.length === 0 ? (
        <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '3rem', textAlign: 'center', color: '#888' }}>
          <p>Você ainda não favoritou nenhum produto.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {produtos.map((p) => (
            <div key={p.id} style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
              <h3 style={{ margin: '0 0 0.5rem', color: '#1351b4' }}>{p.name}</h3>
              {p.description && <p style={{ margin: '0 0 0.75rem', color: '#666', fontSize: '0.875rem' }}>{p.description}</p>}
              <div style={{ marginBottom: '0.75rem' }}>
                {p.categories.map((c) => (
                  <span key={c.category.id} style={{ display: 'inline-block', backgroundColor: '#e8f0fe', color: '#1351b4', borderRadius: '12px', padding: '0.1rem 0.5rem', fontSize: '0.75rem', marginRight: '0.25rem' }}>
                    {c.category.name}
                  </span>
                ))}
              </div>
              <button
                onClick={() => removerFavorito(p.id)}
                style={{ backgroundColor: 'transparent', border: '1px solid #e52207', color: '#e52207', borderRadius: '4px', padding: '0.25rem 0.75rem', cursor: 'pointer', fontSize: '0.8rem' }}
              >
                Remover favorito
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
