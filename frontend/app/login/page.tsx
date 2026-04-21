'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/auth';

/**
 * Página de login.
 * Autentica o usuário e redireciona para o dashboard.
 */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      await login({ email, password });
      // Redireciona para o dashboard após login bem-sucedido
      router.push('/dashboard');
    } catch {
      setErro('Email ou senha inválidos. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main style={styles.container}>
      <div style={styles.card}>
        {/* Cabeçalho */}
        <div style={styles.header}>
          <h1 style={styles.titulo}>Desafio Técnico</h1>
          <p style={styles.subtitulo}>Faça login para continuar</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.campo}>
            <label htmlFor="email" style={styles.label}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              disabled={carregando}
              style={styles.input}
              autoComplete="email"
            />
          </div>

          <div style={styles.campo}>
            <label htmlFor="password" style={styles.label}>
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={carregando}
              style={styles.input}
              autoComplete="current-password"
            />
          </div>

          {/* Mensagem de erro */}
          {erro && (
            <p role="alert" style={styles.erro}>
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={carregando}
            style={{
              ...styles.botao,
              opacity: carregando ? 0.7 : 1,
              cursor: carregando ? 'not-allowed' : 'pointer',
            }}
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </main>
  );
}

// Estilos inline simples — serão substituídos pela UIGovPE na Fase 5
const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: '1rem',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    padding: '2rem',
    width: '100%',
    maxWidth: '400px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '1.5rem',
  },
  titulo: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#1351b4',
    margin: 0,
  },
  subtitulo: {
    color: '#555',
    marginTop: '0.5rem',
    fontSize: '0.9rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  campo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#333',
  },
  input: {
    padding: '0.625rem 0.75rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  erro: {
    color: '#e52207',
    fontSize: '0.875rem',
    margin: 0,
    padding: '0.5rem',
    backgroundColor: '#fff3f2',
    borderRadius: '4px',
    border: '1px solid #e52207',
  },
  botao: {
    backgroundColor: '#1351b4',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '0.75rem',
    fontSize: '1rem',
    fontWeight: 600,
    marginTop: '0.5rem',
    transition: 'background-color 0.2s',
  },
};
