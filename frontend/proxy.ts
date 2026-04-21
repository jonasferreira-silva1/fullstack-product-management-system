import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rotas que não precisam de autenticação
const PUBLIC_ROUTES = ['/login'];

/**
 * Proxy do Next.js 16 — substitui o middleware para proteção de rotas.
 * Redireciona rotas não autenticadas para o login verificando o cookie JWT.
 */
export function proxy(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const { pathname } = request.nextUrl;

  // Permite acesso às rotas públicas sem token
  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  // Se não tem token e não é rota pública, redireciona para login
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Se tem token e está tentando acessar o login, redireciona para dashboard
  if (token && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Aplica em todas as rotas exceto arquivos estáticos e API interna do Next
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
