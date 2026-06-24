'use client';

import dynamic from 'next/dynamic';

// ChakraProvider + Dynamic SDK 的 providers 全部只在客户端挂载，避免 CSS-in-JS 注入冲突
const DynamicProviders = dynamic(
  () => import('./DynamicProviders').then((mod) => ({ default: mod.DynamicProviders })),
  { ssr: false },
);

export function Providers({ children }: { children: React.ReactNode }) {
  return <DynamicProviders>{children}</DynamicProviders>;
}
