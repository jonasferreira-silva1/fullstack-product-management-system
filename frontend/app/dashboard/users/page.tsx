'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Pagination from '@/components/Pagination';
import type { User, PaginatedResponse } from '@/types';

export default function UsersPage() {
  const [data, setData] = useState<PaginatedResponse<User> | null>(null);
  const [page, setPage] = useState(1);
  const [busca, setBusca] = useState('');
  const [criando, setCriando] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'USER' });
  const [erro, setErro] = useState('');

  async function carregar() {
    const params = new URLSearchParams({ page: String(page), limit: '10' });
    if (busca) params.set('name', busca);
    const res = await api.get<PaginatedResponse<User>>(`/users?${params}`);
    setData(res.data);
  }

  useEffect(() => { carregar(); }, [page, busca]);

  async function criar() {
    try {
      await api.post('/users', form);
      setCriando(false);
      setForm({ name: '', email: '', password: '', role: 'USER' });
      carregar();
    } catch { setErro('Erro ao criar usuário. Verifique se o email já existe.'); }
  }

  async function remover(id: string) {
    if (!confirm('Remover este usuário?')) return;
    try { await api.delete(`/users/${id}`); carregar(); }
    catch { setErro('Erro ao remover usuário'); }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, color: '#1351b4' }}>Usuários</h1>
        <button onClick={() => setCriando(true)} style={btnPrimary}>+ Novo Usuário</button>
      </div>

      <input placeholder="Buscar por nome..." value={busca} onChange={(e) => { setBusca(e.target.value); setPage(1); }} style={inputStyle} />

      {erro && <p style={{ color: 'red' }}>{erro}</p>}

      {/* Modal criar */}
      {criando && (
        <div style={modalOverlay}>
          <div style={modalCard}>
            <h3>Novo Usuário</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input placeholder="Nome *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
              <input placeholder="Email *" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle} />
              <input placeholder="Senha *" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} style={inputStyle} />
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} style={inputStyle}>
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button onClick={criar} style={btnPrimary}>Salvar</button>
              <button onClick={() => setCriando(false)} style={btnSecondary}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <div style={card}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #eee' }}>
              <th style={th}>Nome</th>
              <th style={th}>Email</th>
              <th style={th}>Perfil</th>
              <th style={th}>Criado em</th>
              <th style={th}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {data?.data.map((u) => (
              <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={td}>{u.name}</td>
                <td style={td}>{u.email}</td>
                <td style={td}>
                  <span style={{ ...badge, backgroundColor: u.role === 'ADMIN' ? '#1351b4' : '#555' }}>{u.role}</span>
                </td>
                <td style={td}>{new Date(u.createdAt).toLocaleDateString('pt-BR')}</td>
                <td style={td}>
                  <button onClick={() => remover(u.id)} style={{ ...btnSmall, color: '#e52207' }}>Remover</button>
                </td>
              </tr>
            ))}
            {data?.data.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>Nenhum usuário encontrado</td></tr>
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
const btnSmall: React.CSSProperties = { backgroundColor: 'transparent', border: '1px solid currentColor', borderRadius: '4px', padding: '0.25rem 0.5rem', cursor: 'pointer', fontSize: '0.8rem' };
const inputStyle: React.CSSProperties = { padding: '0.5rem 0.75rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.9rem', width: '100%', maxWidth: '320px', marginBottom: '1rem' };
const card: React.CSSProperties = { backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' };
const th: React.CSSProperties = { textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#555', fontWeight: 600 };
const td: React.CSSProperties = { padding: '0.75rem 1rem', fontSize: '0.875rem' };
const badge: React.CSSProperties = { color: '#fff', borderRadius: '12px', padding: '0.1rem 0.5rem', fontSize: '0.75rem', fontWeight: 600 };
const modalOverlay: React.CSSProperties = { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 };
const modalCard: React.CSSProperties = { backgroundColor: '#fff', borderRadius: '8px', padding: '2rem', width: '100%', maxWidth: '400px' };
