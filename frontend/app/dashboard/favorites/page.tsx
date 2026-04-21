'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, Button, Tag, Toast, ToastRef, Typography } from '@uigovpe/components';
import api from '@/lib/api';
import type { Product } from '@/types';

export default function FavoritesPage() {
  const toast = useRef<ToastRef>(null);
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
    try {
      await api.delete(`/products/${id}/favorite`);
      setProdutos((prev) => prev.filter((p) => p.id !== id));
      toast.current?.show({ severity: 'success', summary: 'Removido', detail: 'Produto removido dos favoritos.', life: 3000 });
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Não foi possível remover.', life: 3000 });
    }
  }

  useEffect(() => { carregar(); }, []);

  if (carregando) return <p>Carregando...</p>;

  return (
    <>
      <Toast ref={toast} />
      <Typography variant="h1" style={{ color: '#1351b4', marginBottom: '1.5rem' }}>⭐ Meus Favoritos</Typography>

      {produtos.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
          <i className="pi pi-star" style={{ fontSize: '2rem', marginBottom: '1rem', display: 'block', color: '#ccc' }} />
          <p>Você ainda não favoritou nenhum produto.</p>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {produtos.map((p) => (
            <Card key={p.id} style={{ padding: '1.25rem' }}>
              <h3 style={{ margin: '0 0 0.5rem', color: '#1351b4' }}>{p.name}</h3>
              {p.description && (
                <p style={{ margin: '0 0 0.75rem', color: '#666', fontSize: '0.875rem' }}>{p.description}</p>
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '1rem' }}>
                {p.categories.map((c) => (
                  <Tag key={c.category.id} value={c.category.name} />
                ))}
              </div>
              <Button
                label="Remover favorito"
                icon="pi pi-star-fill"
                severity="danger"
                outlined
                size="small"
                onClick={() => removerFavorito(p.id)}
              />
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
