'use client';

import { ChakraProvider } from '@chakra-ui/react';
import { system } from '@/app/ui/theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core';
import type { EvmNetwork } from '@dynamic-labs/sdk-react-core';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import { SolanaWalletConnectorsWithConfig } from '@dynamic-labs/solana';
import { DynamicWagmiConnector } from '@dynamic-labs/wagmi-connector';
import { WagmiProvider } from 'wagmi';
import { useState, useMemo, type PropsWithChildren } from 'react';
import { config, supportedChains } from './wagmi';
import { SOLANA_MAINNET } from './consts/solana';

export function DynamicProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(() => new QueryClient());

  const evmNetworks: EvmNetwork[] = useMemo(
    () =>
      supportedChains.map(
        (chain) =>
          ({
            chainId: chain.id,
            networkId: chain.id,
            name: chain.name,
            nativeCurrency: {
              name: chain.nativeCurrency.name,
              symbol: chain.nativeCurrency.symbol,
              decimals: chain.nativeCurrency.decimals,
            },
            rpcUrls: chain.rpcUrls.default.http ? [...chain.rpcUrls.default.http] : [],
            blockExplorerUrls: chain.blockExplorers?.default?.url
              ? [chain.blockExplorers.default.url]
              : [],
          }) as unknown as EvmNetwork,
      ),
    [],
  );

  const solanaConnectors = useMemo(
    () =>
      SolanaWalletConnectorsWithConfig({
        customRpcUrls: {
          solana: [SOLANA_MAINNET.rpcUrl],
        },
      }),
    [],
  );

  const dynamicSettings = useMemo(
    () => ({
      environmentId:
        process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID || 'REPLACE_WITH_YOUR_ENVIRONMENT_ID',
      walletConnectors: [EthereumWalletConnectors, solanaConnectors],
      initialAuthenticationMode: 'connect-only' as const,
      overrides: {
        evmNetworks,
      },
    }),
    [evmNetworks, solanaConnectors],
  );

  return (
    <ChakraProvider value={system}>
      <QueryClientProvider client={queryClient}>
        <DynamicContextProvider settings={dynamicSettings}>
          <WagmiProvider config={config}>
            <DynamicWagmiConnector>{children}</DynamicWagmiConnector>
          </WagmiProvider>
        </DynamicContextProvider>
      </QueryClientProvider>
    </ChakraProvider>
  );
}
