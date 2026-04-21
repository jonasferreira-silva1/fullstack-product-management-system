import axios from 'axios';

/**
 * Instância configurada do Axios para comunicação com o backend.
 * O token JWT é injetado automaticamente via interceptor.
 */
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de requisição — adiciona o token JWT no header Authorization
api.interceptors.request.use((config) => {
  // Lê o token do localStorage (será substituído por cookie httpOnly na Fase 2)
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Interceptor de resposta — redireciona para login em caso de 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;
