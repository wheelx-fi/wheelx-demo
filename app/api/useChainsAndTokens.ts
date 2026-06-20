'use client';

import { useQuery } from '@tanstack/react-query';
import { CHAIN_INFO_URL } from './consts';
import type { ChainsAndTokens } from './types';

export async function fetchChainsAndTokens(): Promise<ChainsAndTokens> {
  const res = await fetch(CHAIN_INFO_URL, {
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch chain-info: ${res.status}`);
  }

  return res.json();
}

export function useChainsAndTokens(enabled = true) {
  return useQuery({
    queryKey: ['chainsAndTokens'],
    queryFn: fetchChainsAndTokens,
    enabled,
    staleTime: 30 * 1000, // 30s
    refetchOnWindowFocus: false,
  });
}
