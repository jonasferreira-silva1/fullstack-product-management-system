'use client';

import { UiProvider } from '@uigovpe/components';

/**
 * Wrapper client-side para o UiProvider da UIGovPE.
 * Necessário porque o layout.tsx é um Server Component no Next.js.
 */
export default function UiGovPEProvider({ children }: { children: React.ReactNode }) {
  return <UiProvider>{children}</UiProvider>;
}
