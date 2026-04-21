'use client';

import { useState, FormEvent, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@uigovpe/components';
import { InputText } from '@uigovpe/components';
import { InputPassword } from '@uigovpe/components';
import { Card } from '@uigovpe/components';
import { Toast, ToastRef } from '@uigovpe/components';
import { GovBar } from '@uigovpe/components';
import { login } from '@/lib/auth';

/**
 * Página de login usando componentes UIGovPE.
 */
export default function LoginPage() {
  const router = useRouter();
  const toast = useRef<ToastRef>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setCarregando(true);

    try {
      await login({ email, password });
      router.push('/dashboard');
    } catch {
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Email ou senha inválidos.',
        life: 4000,
      });
    } finally {
      setCarregando(false);
    }
  }

  return (
    <>
      <Toast ref={toast} />
      <GovBar />

      <main style={{
        minHeight: 'calc(100vh - 56px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backgroundColor: '#f0f4ff',
      }}>
        <Card style={{ width: '100%', maxWidth: '420px', padding: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ color: '#1351b4', fontSize: '1.5rem', margin: '0 0 0.5rem' }}>
              Desafio Técnico
            </h1>
            <p style={{ color: '#555', margin: 0, fontSize: '0.9rem' }}>
              Faça login para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="flex flex-column gap-1">
              <label htmlFor="email" style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                Email
              </label>
              <InputText
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                disabled={carregando}
                style={{ width: '100%' }}
              />
            </div>

            <div className="flex flex-column gap-1">
              <label htmlFor="password" style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                Senha
              </label>
              <InputPassword
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={carregando}
                feedback={false}
                style={{ width: '100%' }}
              />
            </div>

            <Button
              type="submit"
              label={carregando ? 'Entrando...' : 'Entrar'}
              loading={carregando}
              style={{ width: '100%', marginTop: '0.5rem' }}
            />
          </form>
        </Card>
      </main>
    </>
  );
}
