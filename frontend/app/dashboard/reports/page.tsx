'use client';

import { useEffect, useState, useRef } from 'react';
import {
  Card, Table, Column, Paginator, Typography,
  Toast, ToastRef, Tag, InputText,
} from '@uigovpe/components';
import api from '@/lib/api';

interface Summary {
  totalUsuarios: number;
  totalProdutos: number;
  totalCategorias: number;
  totalFavoritos: number;
}

interface AuditLog {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: string;
  entityId: string;
  createdAt: string;
  user: { id: string; name: string; email: string };
}

interface Paginated {
  data: AuditLog[];
  total: number;
  totalPages: number;
}

export default function ReportsPage() {
  const toast = useRef<ToastRef>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [logs, setLogs] = useState<Paginated | null>(null);
  const [page, setPage] = useState(0);
  const [filtros, setFiltros] = useState({ entity: '', startDate: '', endDate: '' });

  async function carregarSummary() {
    try {
      const res = await api.get<Summary>('/reports/summary');
      setSummary(res.data);
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar resumo.', life: 3000 });
    }
  }

  async function carregarLogs() {
    const params = new URLSearchParams({ page: String(page + 1), limit: '10' });
    if (filtros.entity) params.set('entity', filtros.entity);
    // Converte a data para ISO incluindo o início e fim do dia
    if (filtros.startDate) params.set('startDate', `${filtros.startDate}T00:00:00.000Z`);
    if (filtros.endDate) params.set('endDate', `${filtros.endDate}T23:59:59.999Z`);
    const res = await api.get<Paginated>(`/reports/detailed?${params}`);
    setLogs(res.data);
  }

  useEffect(() => { carregarSummary(); }, []);
  useEffect(() => { carregarLogs(); }, [page, filtros]);

  const actionSeverity = (action: string) => {
    if (action === 'CREATE') return 'success';
    if (action === 'UPDATE') return 'warning';
    return 'danger';
  };

  const dataTemplate = (row: AuditLog) =>
    new Date(row.createdAt).toLocaleString('pt-BR');

  const actionTemplate = (row: AuditLog) => (
    <Tag value={row.action} severity={actionSeverity(row.action) as any} />
  );

  return (
    <>
      <Toast ref={toast} />
      <Typography variant="h1" style={{ color: '#1351b4', marginBottom: '1.5rem' }}>
        Relatórios
      </Typography>

      {/* Cards de resumo */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Usuários', value: summary.totalUsuarios, icon: 'pi pi-users' },
            { label: 'Produtos', value: summary.totalProdutos, icon: 'pi pi-box' },
            { label: 'Categorias', value: summary.totalCategorias, icon: 'pi pi-tag' },
            { label: 'Favoritos', value: summary.totalFavoritos, icon: 'pi pi-star' },
          ].map((item) => (
            <Card key={item.label} style={{ padding: '1.25rem', textAlign: 'center' }}>
              <i className={item.icon} style={{ fontSize: '1.75rem', color: '#1351b4', marginBottom: '0.5rem', display: 'block' }} />
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1351b4' }}>{item.value}</div>
              <div style={{ color: '#666', fontSize: '0.875rem' }}>{item.label}</div>
            </Card>
          ))}
        </div>
      )}

      {/* Filtros do relatório detalhado */}
      <Card style={{ marginBottom: '1rem', padding: '1rem' }}>
        <Typography variant="h3" style={{ marginBottom: '1rem', color: '#333' }}>
          Auditoria Detalhada
        </Typography>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <InputText
            placeholder="Filtrar por entidade (ex: Product)"
            value={filtros.entity}
            onChange={(e) => { setFiltros({ ...filtros, entity: e.target.value }); setPage(0); }}
            style={{ maxWidth: '220px' }}
          />
          <input
            type="date"
            value={filtros.startDate}
            onChange={(e) => { setFiltros({ ...filtros, startDate: e.target.value }); setPage(0); }}
            style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <input
            type="date"
            value={filtros.endDate}
            onChange={(e) => { setFiltros({ ...filtros, endDate: e.target.value }); setPage(0); }}
            style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
      </Card>

      {/* Tabela de auditoria */}
      <Card>
        <Table value={logs?.data ?? []} emptyMessage="Nenhum registro encontrado">
          <Column header="Ação" body={actionTemplate} style={{ width: '100px' }} />
          <Column field="entity" header="Entidade" />
          <Column field="entityId" header="ID da Entidade" style={{ fontSize: '0.75rem', color: '#888' }} />
          <Column field="user.name" header="Usuário" />
          <Column header="Data/Hora" body={dataTemplate} />
        </Table>

        {logs && logs.totalPages > 1 && (
          <Paginator
            first={page * 10}
            rows={10}
            totalRecords={logs.total}
            onPageChange={(e) => setPage(e.page)}
          />
        )}
      </Card>
    </>
  );
}
