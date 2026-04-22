import type { Metadata } from 'next';
import UiGovPEProvider from '@/components/UiGovPEProvider';

// Estilos obrigatórios da UIGovPE e PrimeReact
import '@uigovpe/styles/dist/index.css';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primeicons/primeicons.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Desafio Técnico',
  description: 'Sistema de gerenciamento de produtos e categorias',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="light">
      <body style={{ margin: 0, fontFamily: 'sans-serif', backgroundColor: '#f5f5f5', colorScheme: 'light' }}>
        <UiGovPEProvider>{children}</UiGovPEProvider>
      </body>
    </html>
  );
}
