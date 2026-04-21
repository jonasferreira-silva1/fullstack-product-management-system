'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Pagination from '@/components/Pagination';
import type { Product, Category, PaginatedResponse } from '@/types';

export default function ProductsPage() {
  const [data, setData] = useState<PaginatedResponse<Product> | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [busca, setBusca] = useState('');
  const [filtroCat, setFiltroCat] = useState('');
  const [criando, setCriando] = useState(false);
  const [editando, setEditando] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', description: '', categoryIds: [] as string[] });
  const [erro, setErro] = useState('');

  async function carregar() {
    const params = new URLSearchParams({ page: String(page), limit: '10' });
    if (busca) params.set('name', busca);
    if (filtroCat) params.set('categoryId', filtroCat);
    const res = await api.get<PaginatedResponse<Product>>(`/products?${params}`);
    setData(res.data);
  }

  async function carregarCategorias() {
    const res = await api.get<PaginatedResponse<Category>>('/categories?limit=100');
    setCategories(res.data.data);
  }

  useEffect(() => { carregar(); }, [page, busca, filtroCat]);
  useEffect(() => { carregarCategorias(); }, []);

  async function salvar() {
    try {
      if (editando) {
        await api.patch(`/products/${editando.id}`, form);
        setEditando(null);
      } else {
        await api.post('/products', form);
        setCriando(false);
      }
      setForm({ name: '', description: '', categoryIds: [] });
      carregar();
    } catch { setErro('Erro ao salvar produto'); }
  }

  async function remover(id: string) {
    if (!confirm('Remover este produto?')) return;
    try { await api.delete(`/products/${id}`); carregar(); }
    catch { setErro('Erro ao remover produto'); }
  }

  async function favoritar(id: string) {
    try { await api.post(`/products/${id}/favorite`); alert('Adicionado aos favoritos!'); }
    catch { setErro('Erro ao favoritar'); }
  }

  function abrirEdicao(p: Product) {
    setEditando(p);
    setForm({ name: p.name, description: p.description ?? '', categoryIds: p.categories.map((c) => c.category.id) });
  }

  const modalAberto = criando || !!editando;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, color: '#1351b4' }}>Produtos</h1>
        <button onClick={() => setCriando(true)} style={btnPrimary}>+ Novo Produto</button>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input placeholder="Buscar por nome..." value={busca} onChange={(e) => { setBusca(e.target.value); setPage(1); }} style={{ ...inputStyle, maxWidth: '240px' }} />
        <select value={filtroCat} onChange={(e) => { setFiltroCat(e.target.value); setPage(1); }} style={{ ...inputStyle, maxWidth: '200px' }}>
          <option value="">Todas as categorias</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {erro && <p style={{ color: 'red' }}>{erro}</p>}

      {/* Modal */}
      {modalAberto && (
        <div style={modalOverlay}>
          <div style={modalCard}>
            <h3>{editando ? 'Editar Produto' : 'Novo Produto'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input placeholder="Nome *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
              <textarea placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ ...inputStyle, height: '80px', resize: 'vertical' }} />
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Categorias</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
                  {categories.map((c) => (
                    <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem' }}>
                      <input
                        type="checkbox"
                        checked={form.categoryIds.includes(c.id)}
                        onChange={(e) => {
                          const ids = e.target.checked
                            ? [...form.categoryIds, c.id]
                            : form.categoryIds.filter((id) => id !== c.id);
                          setForm({ ...form, categoryIds: ids });
                        }}
                      />
                      {c.name}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button onClick={salvar} style={btnPrimary}>Salvar</button>
              <button onClick={() => { setCriando(false); setEditando(null); }} style={btnSecondary}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Tabela */}
      <div style={card}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #eee' }}>
              <th style={th}>Nome</th>
              <th style={th}>Categorias</th>
              <th style={th}>Criador</th>
              <th style={th}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {data?.data.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={td}>
                  <strong>{p.name}</strong>
                  {p.description && <p style={{ margin: '0.25rem 0 0', color: '#666', fontSize: '0.8rem' }}>{p.description}</p>}
                </td>
                <td style={td}>
                  {p.categories.map((c) => (
                    <span key={c.category.id} style={tag}>{c.category.name}</span>
                  ))}
                </td>
                <td style={td}>{p.creator.name}</td>
                <td style={td}>
                  <button onClick={() => favoritar(p.id)} style={{ ...btnSmall, marginRight: '0.25rem' }}>⭐</button>
                  <button onClick={() => abrirEdicao(p)} style={{ ...btnSmall, marginRight: '0.25rem' }}>Editar</button>
                  <button onClick={() => remover(p.id)} style={{ ...btnSmall, color: '#e52207' }}>Remover</button>
                </td>
              </tr>
            ))}
            {data?.data.length === 0 && (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>Nenhum produto encontrado</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={data?.totalPages ?? 1} onPageChange={setPage} />
    </div>
  );
}

const btnPrimary: React.CSSProperties = { backgroundColor: '#1351b4', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 600 };
const btnSecondary: React.CSSProperties = { backgroundColor: '#fff', color: '#333', border: '1px solid #ccc', borderRadius: '4px', padding: '0.5rem 1rem', cursor: 'pointer' };
const btnSmall: React.CSSProperties = { backgroundColor: 'transparent', border: '1px solid #1351b4', color: '#1351b4', borderRadius: '4px', padding: '0.25rem 0.5rem', cursor: 'pointer', fontSize: '0.8rem' };
const inputStyle: React.CSSProperties = { padding: '0.5rem 0.75rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.9rem', width: '100%' };
const card: React.CSSProperties = { backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' };
const th: React.CSSProperties = { textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#555', fontWeight: 600 };
const td: React.CSSProperties = { padding: '0.75rem 1rem', fontSize: '0.875rem' };
const tag: React.CSSProperties = { display: 'inline-block', backgroundColor: '#e8f0fe', color: '#1351b4', borderRadius: '12px', padding: '0.1rem 0.5rem', fontSize: '0.75rem', marginRight: '0.25rem' };
const modalOverlay: React.CSSProperties = { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 };
const modalCard: React.CSSProperties = { backgroundColor: '#fff', borderRadius: '8px', padding: '2rem', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' };
