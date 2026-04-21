/**
 * Tipos relacionados à autenticação.
 */

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  avatarUrl: string | null;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface LoginForm {
  email: string;
  password: string;
}
