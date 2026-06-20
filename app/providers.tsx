'use client';

import { ChakraProvider } from '@chakra-ui/react';
import { system } from '@/app/ui/theme';
import { DynamicProviders } from './DynamicProviders';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider value={system}>
      <DynamicProviders>{children}</DynamicProviders>
    </ChakraProvider>
  );
}
