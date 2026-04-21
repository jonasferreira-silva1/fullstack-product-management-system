import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Desafio Técnico',
  description: 'Sistema de gerenciamento de produtos e categorias',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
