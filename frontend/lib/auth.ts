import api from './api';
import type { LoginForm, LoginResponse } from '@/types/auth';

/**
 * Funções utilitárias de autenticação no cliente.
 */

// Chave usada para armazenar o token no localStorage
const TOKEN_KEY = 'access_token';

/**
 * Realiza o login e armazena o token JWT.
 */
export async function login(data: LoginForm): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/auth/login', data);
  const { access_token, user } = response.data;

  // Armazena o token para uso nas próximas requisições
  localStorage.setItem(TOKEN_KEY, access_token);

  return response.data;
}

/**
 * Remove o token e redireciona para o login.
 */
export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  window.location.href = '/login';
}

/**
 * Retorna o token armazenado ou null.
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Verifica se o usuário está autenticado.
 */
export function isAuthenticated(): boolean {
  return !!getToken();
}
