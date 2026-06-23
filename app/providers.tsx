'use client';

import { ChakraProvider } from '@chakra-ui/react';
import { system } from '@/app/ui/theme';
import dynamic from 'next/dynamic';

// Dynamic SDK 的 providers 只在客户端挂载，避免 CSS-in-JS 注入冲突
const DynamicProviders = dynamic(
  () => import('./DynamicProviders').then((mod) => ({ default: mod.DynamicProviders })),
  { ssr: false },
);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider value={system}>
      <DynamicProviders>{children}</DynamicProviders>
    </ChakraProvider>
  );
}
