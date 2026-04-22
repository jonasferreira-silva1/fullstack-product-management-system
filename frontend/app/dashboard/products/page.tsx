'use client';

import { useEffect, useState, useRef } from 'react';
import {
  Button, InputSearch, Card, Table, Column,
  Paginator, Dialog, InputText, InputTextarea,
  MultiSelect, Toast, ToastRef, Tag, Typography,
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
  // Estado para upload de imagem
  const [imagemSelecionada, setImagemSelecionada] = useState<File | null>(null);
  const [uploadando, setUploadando] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setImagemSelecionada(null);
    setDialogAberto(true);
  }

  function abrirEditar(p: Product) {
    setEditando(p);
    setForm({ name: p.name, description: p.description ?? '', categoryIds: p.categories.map((c) => c.category.id) });
    setImagemSelecionada(null);
    setDialogAberto(true);
  }

  async function salvar() {
    try {
      let produtoId: string;

      if (editando) {
        await api.patch(`/products/${editando.id}`, form);
        produtoId = editando.id;
        toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Produto atualizado!', life: 3000 });
      } else {
        const res = await api.post<Product>('/products', form);
        produtoId = res.data.id;
        toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Produto criado!', life: 3000 });
      }

      // Se há imagem selecionada, faz o upload após salvar
      if (imagemSelecionada && produtoId) {
        setUploadando(true);
        const formData = new FormData();
        formData.append('file', imagemSelecionada);
        await api.post(`/upload/product/${produtoId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.current?.show({ severity: 'success', summary: 'Imagem', detail: 'Imagem enviada com sucesso!', life: 3000 });
        setUploadando(false);
      }

      setDialogAberto(false);
      carregar();
    } catch {
      setUploadando(false);
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

  const imagemTemplate = (row: Product) => (
    row.imageUrl ? (
      <img
        src={`http://localhost:3001${row.imageUrl}`}
        alt={row.name}
        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
      />
    ) : <span style={{ color: '#ccc', fontSize: '0.75rem' }}>Sem imagem</span>
  );

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
          <Column header="Imagem" body={imagemTemplate} style={{ width: '70px' }} />
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

      {/* Dialog criar/editar com upload de imagem */}
      <Dialog
        header={editando ? 'Editar Produto' : 'Novo Produto'}
        visible={dialogAberto}
        onHide={() => setDialogAberto(false)}
        style={{ width: '500px' }}
        footer={
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <Button label="Cancelar" outlined onClick={() => setDialogAberto(false)} />
            <Button
              label={uploadando ? 'Enviando imagem...' : 'Salvar'}
              loading={uploadando}
              onClick={salvar}
              disabled={!form.name.trim() || uploadando}
            />
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

          {/* Upload de imagem do produto */}
          <div>
            <label style={{ fontWeight: 600, fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>
              Imagem do produto
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={(e) => setImagemSelecionada(e.target.files?.[0] ?? null)}
              />
              <Button
                label="Selecionar imagem"
                icon="pi pi-upload"
                outlined
                size="small"
                onClick={() => fileInputRef.current?.click()}
              />
              {imagemSelecionada && (
                <span style={{ fontSize: '0.8rem', color: '#555' }}>
                  <i className="pi pi-check" style={{ color: '#2e7d32', marginRight: '0.25rem' }} />
                  {imagemSelecionada.name}
                </span>
              )}
              {!imagemSelecionada && editando?.imageUrl && (
                <span style={{ fontSize: '0.8rem', color: '#888' }}>Imagem atual mantida</span>
              )}
            </div>
            <p style={{ fontSize: '0.75rem', color: '#888', margin: '0.25rem 0 0' }}>
              JPG, PNG ou WebP — máx. 5MB
            </p>
          </div>
        </div>
      </Dialog>
    </>
  );
}
