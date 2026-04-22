'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, Button, InputText, Toast, ToastRef, Typography, Avatar } from '@uigovpe/components';
import apiClient from '@/lib/api';
import type { User } from '@/types/auth';

export default function ProfilePage() {
  const toast = useRef<ToastRef>(null);
  const [usuario, setUsuario] = useState<User | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function carregar() {
    const res = await apiClient.get<User>('/auth/me');
    setUsuario(res.data);
  }

  useEffect(() => { carregar(); }, []);

  async function handleUploadAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Valida tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Arquivo muito grande. Máximo: 5MB.', life: 4000 });
      return;
    }

    // Valida tipo
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Tipo inválido. Use JPG, PNG ou WebP.', life: 4000 });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await apiClient.post('/upload/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Foto de perfil atualizada!', life: 3000 });
      carregar(); // Recarrega para mostrar novo avatar
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao enviar imagem.', life: 3000 });
    } finally {
      setUploading(false);
    }
  }

  if (!usuario) return <p>Carregando...</p>;

  const avatarUrl = usuario.avatarUrl
    ? `http://localhost:3001${usuario.avatarUrl}`
    : null;

  return (
    <>
      <Toast ref={toast} />
      <Typography variant="h1" style={{ color: '#1351b4', marginBottom: '1.5rem' }}>
        Meu Perfil
      </Typography>

      <Card style={{ maxWidth: '500px', padding: '2rem' }}>
        {/* Avatar com botão de upload */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #1351b4' }}
            />
          ) : (
            <div style={{
              width: '100px', height: '100px', borderRadius: '50%',
              backgroundColor: '#1351b4', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '2.5rem', color: '#fff', fontWeight: 700,
            }}>
              {usuario.name.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Input de arquivo oculto */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={handleUploadAvatar}
          />

          <Button
            label={uploading ? 'Enviando...' : 'Alterar foto de perfil'}
            icon="pi pi-camera"
            outlined
            loading={uploading}
            onClick={() => fileInputRef.current?.click()}
          />
          <p style={{ fontSize: '0.75rem', color: '#888', margin: 0 }}>
            JPG, PNG ou WebP — máx. 5MB
          </p>
        </div>

        {/* Dados do usuário */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontWeight: 600, fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>Nome</label>
            <InputText value={usuario.name} disabled style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ fontWeight: 600, fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>Email</label>
            <InputText value={usuario.email} disabled style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ fontWeight: 600, fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>Perfil</label>
            <InputText value={usuario.role} disabled style={{ width: '100%' }} />
          </div>
        </div>
      </Card>
    </>
  );
}
