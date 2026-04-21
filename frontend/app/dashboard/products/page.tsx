'use client';

import { useEffect, useState, useRef } from 'react';
import {
  Button, InputSearch, Card, Table, Column,
  Paginator, Dialog, InputText, InputTextarea,
  MultiSelect, Toast, ToastRef, Tag, Chip, Typography,
} from '@uigovpe/components';
import api from '@/lib/api';
import type { Product, Category, PaginatedResponse } from '@/types';

export default function ProductsPage() {
  const toast = useRef<ToastRef>(null);
  const [data, setData] = useState<PaginatedResponse<Product> | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(0);
  const [busca, setBusca] = useState('');
  const [filtroCat, setFiltroCat] = useState<string>('');
  const [dialogAberto, setDialogAberto] = useState(false);
  const [editando, setEditando] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', description: '', categoryIds: [] as string[] });

  async function carregar() {
    const params = new URLSearchParams({ page: String(page + 1), limit: '10' });
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

  function abrirCriar() {
    setEditando(null);
    setForm({ name: '', description: '', categoryIds: [] });
    setDialogAberto(true);
  }

  function abrirEditar(p: Product) {
    setEditando(p);
    setForm({ name: p.name, description: p.description ?? '', categoryIds: p.categories.map((c) => c.category.id) });
    setDialogAberto(true);
  }

  async function salvar() {
    try {
      if (editando) {
        await api.patch(`/products/${editando.id}`, form);
        toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Produto atualizado!', life: 3000 });
      } else {
        await api.post('/products', form);
        toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Produto criado!', life: 3000 });
      }
      setDialogAberto(false);
      carregar();
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Não foi possível salvar.', life: 3000 });
    }
  }

  async function remover(id: string) {
    if (!confirm('Remover este produto?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.current?.show({ severity: 'success', summary: 'Removido', detail: 'Produto removido.', life: 3000 });
      carregar();
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Não foi possível remover.', life: 3000 });
    }
  }

  async function favoritar(id: string) {
    try {
      await api.post(`/products/${id}/favorite`);
      toast.current?.show({ severity: 'success', summary: 'Favoritado!', detail: 'Produto adicionado aos favoritos.', life: 3000 });
    } catch {
      toast.current?.show({ severity: 'warn', summary: 'Aviso', detail: 'Produto já está nos favoritos.', life: 3000 });
    }
  }

  const categoriasOptions = categories.map((c) => ({ label: c.name, value: c.id }));
  const filtroOptions = [{ label: 'Todas as categorias', value: '' }, ...categoriasOptions];

  const categoriasTemplate = (row: Product) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
      {row.categories.map((c) => (
        <Tag key={c.category.id} value={c.category.name} />
      ))}
    </div>
  );

  const acoesTemplate = (row: Product) => (
    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
      <Button icon="pi pi-star" size="small" outlined tooltip="Favoritar" onClick={() => favoritar(row.id)} />
      <Button icon="pi pi-pencil" size="small" outlined onClick={() => abrirEditar(row)} />
      <Button icon="pi pi-trash" size="small" severity="danger" outlined onClick={() => remover(row.id)} />
    </div>
  );

  return (
    <>
      <Toast ref={toast} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <Typography variant="h1" style={{ margin: 0, color: '#1351b4' }}>Produtos</Typography>
        <Button label="Novo Produto" icon="pi pi-plus" onClick={abrirCriar} />
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <InputSearch
          placeholder="Buscar por nome..."
          value={busca}
          onChange={(e) => { setBusca(e.target.value); setPage(0); }}
          style={{ maxWidth: '280px' }}
        />
        <select
          value={filtroCat}
          onChange={(e) => { setFiltroCat(e.target.value); setPage(0); }}
          style={{ padding: '0.5rem 0.75rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.9rem' }}
        >
          {filtroOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <Card>
        <Table value={data?.data ?? []} emptyMessage="Nenhum produto encontrado">
          <Column field="name" header="Nome" />
          <Column header="Categorias" body={categoriasTemplate} />
          <Column field="creator.name" header="Criador" />
          <Column header="Ações" body={acoesTemplate} style={{ width: '160px' }} />
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
        header={editando ? 'Editar Produto' : 'Novo Produto'}
        visible={dialogAberto}
        onHide={() => setDialogAberto(false)}
        style={{ width: '500px' }}
        footer={
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <Button label="Cancelar" outlined onClick={() => setDialogAberto(false)} />
            <Button label="Salvar" onClick={salvar} disabled={!form.name.trim()} />
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontWeight: 600, fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>Nome *</label>
            <InputText value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ width: '100%' }} autoFocus />
          </div>
          <div>
            <label style={{ fontWeight: 600, fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>Descrição</label>
            <InputTextarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ fontWeight: 600, fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>Categorias</label>
            <MultiSelect
              value={form.categoryIds}
              options={categoriasOptions}
              onChange={(e) => setForm({ ...form, categoryIds: e.value })}
              placeholder="Selecione as categorias"
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </Dialog>
    </>
  );
}
