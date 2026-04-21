'use client';

import { useEffect, useState, useRef } from 'react';
import {
  Button, InputText, InputSearch, Card,
  Table, Column, Paginator, Dialog,
  Toast, ToastRef, Tag, Typography,
} from '@uigovpe/components';
import api from '@/lib/api';
import type { Category, PaginatedResponse } from '@/types';

export default function CategoriesPage() {
  const toast = useRef<ToastRef>(null);
  const [data, setData] = useState<PaginatedResponse<Category> | null>(null);
  const [page, setPage] = useState(0); // PrimeReact usa 0-indexed
  const [busca, setBusca] = useState('');
  const [dialogAberto, setDialogAberto] = useState(false);
  const [editando, setEditando] = useState<Category | null>(null);
  const [nome, setNome] = useState('');

  async function carregar() {
    const params = new URLSearchParams({ page: String(page + 1), limit: '10' });
    if (busca) params.set('name', busca);
    const res = await api.get<PaginatedResponse<Category>>(`/categories?${params}`);
    setData(res.data);
  }

  useEffect(() => { carregar(); }, [page, busca]);

  function abrirCriar() { setEditando(null); setNome(''); setDialogAberto(true); }
  function abrirEditar(cat: Category) { setEditando(cat); setNome(cat.name); setDialogAberto(true); }

  async function salvar() {
    try {
      if (editando) {
        await api.patch(`/categories/${editando.id}`, { name: nome });
        toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Categoria atualizada!', life: 3000 });
      } else {
        await api.post('/categories', { name: nome });
        toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Categoria criada!', life: 3000 });
      }
      setDialogAberto(false);
      carregar();
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Não foi possível salvar.', life: 3000 });
    }
  }

  async function remover(id: string) {
    if (!confirm('Remover esta categoria?')) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.current?.show({ severity: 'success', summary: 'Removido', detail: 'Categoria removida.', life: 3000 });
      carregar();
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Não foi possível remover.', life: 3000 });
    }
  }

  // Template de ações na tabela
  const acoesTemplate = (row: Category) => (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <Button label="Editar" icon="pi pi-pencil" size="small" outlined onClick={() => abrirEditar(row)} />
      <Button label="Remover" icon="pi pi-trash" size="small" severity="danger" outlined onClick={() => remover(row.id)} />
    </div>
  );

  const dataTemplate = (row: Category) =>
    new Date(row.createdAt).toLocaleDateString('pt-BR');

  return (
    <>
      <Toast ref={toast} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <Typography variant="h1" style={{ margin: 0, color: '#1351b4' }}>Categorias</Typography>
        <Button label="Nova Categoria" icon="pi pi-plus" onClick={abrirCriar} />
      </div>

      {/* Barra de busca */}
      <div style={{ marginBottom: '1rem' }}>
        <InputSearch
          placeholder="Buscar por nome..."
          value={busca}
          onChange={(e) => { setBusca(e.target.value); setPage(0); }}
          style={{ width: '100%', maxWidth: '320px' }}
        />
      </div>

      {/* Tabela */}
      <Card>
        <Table value={data?.data ?? []} emptyMessage="Nenhuma categoria encontrada">
          <Column field="name" header="Nome" />
          <Column field="creator.name" header="Criador" />
          <Column header="Criado em" body={dataTemplate} />
          <Column header="Ações" body={acoesTemplate} style={{ width: '200px' }} />
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

      {/* Dialog criar/editar */}
      <Dialog
        header={editando ? 'Editar Categoria' : 'Nova Categoria'}
        visible={dialogAberto}
        onHide={() => setDialogAberto(false)}
        style={{ width: '400px' }}
        footer={
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <Button label="Cancelar" outlined onClick={() => setDialogAberto(false)} />
            <Button label="Salvar" onClick={salvar} disabled={!nome.trim()} />
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontWeight: 600, fontSize: '0.875rem' }}>Nome *</label>
          <InputText
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome da categoria"
            style={{ width: '100%' }}
            autoFocus
          />
        </div>
      </Dialog>
    </>
  );
}
