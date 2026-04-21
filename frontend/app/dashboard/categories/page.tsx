'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Pagination from '@/components/Pagination';
import type { Category, PaginatedResponse } from '@/types';

export default function CategoriesPage() {
  const [data, setData] = useState<PaginatedResponse<Category> | null>(null);
  const [page, setPage] = useState(1);
  const [busca, setBusca] = useState('');
  const [nome, setNome] = useState('');
  const [editando, setEditando] = useState<Category | null>(null);
  const [criando, setCriando] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [erro, setErro] = useState('');

  async function carregar() {
    const params = new URLSearchParams({ page: String(page), limit: '10' });
    if (busca) params.set('name', busca);
    const res = await api.get<PaginatedResponse<Category>>(`/categories?${params}`);
    setData(res.data);
  }

  useEffect(() => { carregar(); }, [page, busca]);

  async function criar() {
    if (!nome.trim()) return;
    try {
      await api.post('/categories', { name: nome });
      setNome(''); setCriando(false); carregar();
    } catch { setErro('Erro ao criar categoria'); }
  }

  async function atualizar() {
    if (!editando || !novoNome.trim()) return;
    try {
      await api.patch(`/categories/${editando.id}`, { name: novoNome });
      setEditando(null); setNovoNome(''); carregar();
    } catch { setErro('Erro ao atualizar categoria'); }
  }

  async function remover(id: string) {
    if (!confirm('Remover esta categoria?')) return;
    try {
      await api.delete(`/categories/${id}`);
      carregar();
    } catch { setErro('Erro ao remover categoria'); }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, color: '#1351b4' }}>Categorias</h1>
        <button onClick={() => setCriando(true)} style={btnPrimary}>+ Nova Categoria</button>
      </div>

      {/* Busca */}
      <input
        placeholder="Buscar por nome..."
        value={busca}
        onChange={(e) => { setBusca(e.target.value); setPage(1); }}
        style={inputStyle}
      />

      {erro && <p style={{ color: 'red', marginTop: '0.5rem' }}>{erro}</p>}

      {/* Modal criar */}
      {criando && (
        <div style={modalOverlay}>
          <div style={modalCard}>
            <h3>Nova Categoria</h3>
            <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome da categoria" style={inputStyle} />
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button onClick={criar} style={btnPrimary}>Salvar</button>
              <button onClick={() => setCriando(false)} style={btnSecondary}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal editar */}
      {editando && (
        <div style={modalOverlay}>
          <div style={modalCard}>
            <h3>Editar Categoria</h3>
            <input value={novoNome} onChange={(e) => setNovoNome(e.target.value)} placeholder="Novo nome" style={inputStyle} />
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button onClick={atualizar} style={btnPrimary}>Salvar</button>
              <button onClick={() => setEditando(null)} style={btnSecondary}>Cancelar</button>
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
              <th style={th}>Criador</th>
              <th style={th}>Data</th>
              <th style={th}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {data?.data.map((cat) => (
              <tr key={cat.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={td}>{cat.name}</td>
                <td style={td}>{cat.creator.name}</td>
                <td style={td}>{new Date(cat.createdAt).toLocaleDateString('pt-BR')}</td>
                <td style={td}>
                  <button onClick={() => { setEditando(cat); setNovoNome(cat.name); }} style={btnSmall}>Editar</button>
                  <button onClick={() => remover(cat.id)} style={{ ...btnSmall, color: '#e52207', marginLeft: '0.5rem' }}>Remover</button>
                </td>
              </tr>
            ))}
            {data?.data.length === 0 && (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>Nenhuma categoria encontrada</td></tr>
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
const inputStyle: React.CSSProperties = { padding: '0.5rem 0.75rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem', width: '100%', maxWidth: '320px', marginBottom: '1rem' };
const card: React.CSSProperties = { backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' };
const th: React.CSSProperties = { textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#555', fontWeight: 600 };
const td: React.CSSProperties = { padding: '0.75rem 1rem', fontSize: '0.875rem' };
const modalOverlay: React.CSSProperties = { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 };
const modalCard: React.CSSProperties = { backgroundColor: '#fff', borderRadius: '8px', padding: '2rem', width: '100%', maxWidth: '400px' };
