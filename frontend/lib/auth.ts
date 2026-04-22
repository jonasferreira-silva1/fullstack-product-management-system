import api from './api';
import type { LoginForm, LoginResponse } from '@/types/auth';

const TOKEN_KEY = 'access_token';

/**
 * Salva o token em cookie (para o proxy.ts) e localStorage (para o Axios).
 */
function salvarToken(token: string) {
  // Cookie acessível pelo proxy do Next.js (sem httpOnly para poder ler no cliente)
  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
  // localStorage para o interceptor do Axios
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Remove o token do cookie e localStorage.
 */
function removerToken() {
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`;
  localStorage.removeItem(TOKEN_KEY);
}

export async function login(data: LoginForm): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/auth/login', data);
  salvarToken(response.data.access_token);
  return response.data;
}

export function logout(): void {
  removerToken();
  window.location.href = '/login';
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
