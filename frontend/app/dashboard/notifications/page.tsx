'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, Button, Typography, Toast, ToastRef, Tag } from '@uigovpe/components';
import api from '@/lib/api';

interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const toast = useRef<ToastRef>(null);
  const [notificacoes, setNotificacoes] = useState<Notification[]>([]);
  const [carregando, setCarregando] = useState(true);

  async function carregar() {
    try {
      const res = await api.get<Notification[]>('/notifications');
      setNotificacoes(res.data);
    } finally {
      setCarregando(false);
    }
  }

  async function marcarLida(id: string) {
    await api.patch(`/notifications/${id}/read`);
    setNotificacoes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }

  async function marcarTodasLidas() {
    await api.patch('/notifications/read-all');
    setNotificacoes((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.current?.show({ severity: 'success', summary: 'Pronto', detail: 'Todas marcadas como lidas.', life: 3000 });
  }

  useEffect(() => { carregar(); }, []);

  const naoLidas = notificacoes.filter((n) => !n.read).length;

  if (carregando) return <p>Carregando...</p>;

  return (
    <>
      <Toast ref={toast} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <Typography variant="h1" style={{ color: '#1351b4', margin: 0 }}>
          Notificações {naoLidas > 0 && <span style={{ fontSize: '1rem', color: '#e52207' }}>({naoLidas} não lidas)</span>}
        </Typography>
        {naoLidas > 0 && (
          <Button label="Marcar todas como lidas" outlined onClick={marcarTodasLidas} />
        )}
      </div>

      {notificacoes.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
          <i className="pi pi-bell" style={{ fontSize: '2rem', marginBottom: '1rem', display: 'block', color: '#ccc' }} />
          <p>Nenhuma notificação.</p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {notificacoes.map((n) => (
            <Card
              key={n.id}
              style={{
                padding: '1rem 1.25rem',
                borderLeft: n.read ? '4px solid #ccc' : '4px solid #1351b4',
                opacity: n.read ? 0.7 : 1,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                  <p style={{ margin: '0 0 0.25rem', fontWeight: n.read ? 400 : 600 }}>{n.message}</p>
                  <span style={{ fontSize: '0.8rem', color: '#888' }}>
                    {new Date(n.createdAt).toLocaleString('pt-BR')}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Tag value={n.read ? 'Lida' : 'Nova'} severity={n.read ? 'secondary' : 'info'} />
                  {!n.read && (
                    <Button label="Marcar como lida" size="small" outlined onClick={() => marcarLida(n.id)} />
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
