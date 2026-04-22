'use client';

import { useEffect, useState, useRef } from 'react';
import {
  Button, InputSearch, InputText, InputPassword,
  Card, Table, Column, Paginator, Dialog,
  Toast, ToastRef, Tag, Dropdown, Typography,
} from '@uigovpe/components';
import api from '@/lib/api';
import type { User, PaginatedResponse } from '@/types';

const roleOptions = [
  { label: 'USER', value: 'USER' },
  { label: 'ADMIN', value: 'ADMIN' },
];

export default function UsersPage() {
  const toast = useRef<ToastRef>(null);
  const [data, setData] = useState<PaginatedResponse<User> | null>(null);
  const [page, setPage] = useState(0);
  const [busca, setBusca] = useState('');
  const [dialogAberto, setDialogAberto] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'USER' });

  async function carregar() {
    const params = new URLSearchParams({ page: String(page + 1), limit: '10' });
    if (busca) params.set('name', busca);
    const res = await api.get<PaginatedResponse<User>>(`/users?${params}`);
    setData(res.data);
  }

  useEffect(() => { carregar(); }, [page, busca]);

  async function criar() {
    try {
      await api.post('/users', form);
      toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Usuário criado!', life: 3000 });
      setDialogAberto(false);
      setForm({ name: '', email: '', password: '', role: 'USER' });
      carregar();
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Email já cadastrado ou dados inválidos.', life: 4000 });
    }
  }

  async function remover(id: string) {
    if (!confirm('Remover este usuário?')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.current?.show({ severity: 'success', summary: 'Removido', detail: 'Usuário removido.', life: 3000 });
      carregar();
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Não foi possível remover.', life: 3000 });
    }
  }

  const roleTemplate = (row: User) => (
    <Tag value={row.role} severity={row.role === 'ADMIN' ? 'info' : 'secondary'} />
  );

  const dataTemplate = (row: User) => new Date(row.createdAt).toLocaleDateString('pt-BR');

  const acoesTemplate = (row: User) => (
    <Button icon="pi pi-trash" size="small" severity="danger" outlined onClick={() => remover(row.id)} />
  );

  return (
    <>
      <Toast ref={toast} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <Typography variant="h1" style={{ margin: 0, color: '#1351b4' }}>Usuários</Typography>
        <Button label="Novo Usuário" icon="pi pi-user-plus" onClick={() => setDialogAberto(true)} />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <InputSearch
          placeholder="Buscar por nome..."
          value={busca}
          onChange={(e) => { setBusca(e.target.value); setPage(0); }}
          style={{ maxWidth: '320px' }}
        />
      </div>

      <Card>
        <Table value={data?.data ?? []} emptyMessage="Nenhum usuário encontrado">
          <Column field="name" header="Nome" />
          <Column field="email" header="Email" />
          <Column header="Perfil" body={roleTemplate} />
          <Column header="Criado em" body={dataTemplate} />
          <Column header="Ações" body={acoesTemplate} style={{ width: '80px' }} />
        </Table>

        {data && data.totalPages > 1 && (
          <Paginator
            first={page * 10}
            rows={10}
            totalRecords={data.total}
            onPageChange={(e) => setPage(e.page)}
          />
        )}
      </Card>

      <Dialog
        header="Novo Usuário"
        visible={dialogAberto}
        onHide={() => setDialogAberto(false)}
        style={{ width: '420px' }}
        contentStyle={{ overflow: 'visible' }}
        footer={
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <Button label="Cancelar" outlined onClick={() => setDialogAberto(false)} />
            <Button label="Salvar" onClick={criar} disabled={!form.name || !form.email || !form.password} />
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontWeight: 600, fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>Nome *</label>
            <InputText value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ width: '100%' }} autoFocus />
          </div>
          <div>
            <label style={{ fontWeight: 600, fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>Email *</label>
            <InputText type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ fontWeight: 600, fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>Senha *</label>
            <InputPassword value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} feedback={false} style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ fontWeight: 600, fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>Perfil</label>
            {/* Select nativo para evitar problema de overflow do Dropdown dentro do Dialog */}
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              style={{
                width: '100%',
                padding: '0.625rem 0.75rem',
                border: '1px solid #ced4da',
                borderRadius: '6px',
                fontSize: '1rem',
                backgroundColor: '#fff',
                cursor: 'pointer',
              }}
            >
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
        </div>
      </Dialog>
    </>
  );
}
