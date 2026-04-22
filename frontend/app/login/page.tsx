'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, InputText, Card, GovBar } from '@uigovpe/components';
import { login } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  async function handleLogin() {
    setErro('');

    if (!email || !password) {
      setErro('Preencha o email e a senha.');
      return;
    }

    setCarregando(true);
    try {
      await login({ email, password });
      // Só redireciona após garantir que o login foi bem-sucedido
      window.location.href = '/dashboard';
    } catch {
      setCarregando(false);
      setErro('Email ou senha inválidos. Verifique suas credenciais.');
    }
  }

  return (
    <>
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Mensagem de erro — permanece visível até nova tentativa */}
            {erro && (
              <div style={{
                backgroundColor: '#fff3f2',
                border: '1px solid #e52207',
                borderRadius: '4px',
                padding: '0.75rem 1rem',
                color: '#e52207',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                <i className="pi pi-exclamation-circle" />
                {erro}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label htmlFor="email" style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                Email
              </label>
              <InputText
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="seu@email.com"
                disabled={carregando}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label htmlFor="password" style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                Senha
              </label>
              {/* Input nativo para evitar comportamento inesperado do InputPassword */}
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="••••••••"
                disabled={carregando}
                style={{
                  padding: '0.625rem 0.75rem',
                  border: '1px solid #ced4da',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  width: '100%',
                  boxSizing: 'border-box',
                  outline: 'none',
                  backgroundColor: carregando ? '#f8f9fa' : '#fff',
                }}
              />
            </div>

            <Button
              label={carregando ? 'Entrando...' : 'Entrar'}
              loading={carregando}
              disabled={carregando}
              onClick={handleLogin}
              style={{ width: '100%', marginTop: '0.5rem' }}
            />
          </div>
        </Card>
      </main>
    </>
  );
}
