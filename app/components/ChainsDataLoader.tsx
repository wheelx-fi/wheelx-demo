'use client';

import { useEffect } from 'react';
import { useChainsAndTokens } from '../api/useChainsAndTokens';
import { useChainsStore } from '../store/chainsStore';

/**
 * Fetches /v1/chain-info on mount and syncs chains + tokens into zustand store.
 * Render this component once in your app (e.g. in layout or page).
 */
export function useLoadChainsData() {
  const { data, isError } = useChainsAndTokens();
  const { setChains, setTokens, setSlippagePolicies, chains } = useChainsStore();

  useEffect(() => {
    if (!data || isError) return;

    const allChains = [
      ...(data.chains || []),
      ...(data.deposit_platforms?.prediction?.chains || []),
    ];

    const allTokens = [
      ...(data.tokens || []),
      ...(data.deposit_platforms?.prediction?.tokens || []),
    ];

    // Only update if data actually changed
    if (
      !chains ||
      JSON.stringify(allChains) !== JSON.stringify(chains)
    ) {
      setChains(allChains);
      setTokens(allTokens);
    }

    // Sync slippage policies
    if (data.slippage_policies?.length) {
      setSlippagePolicies(data.slippage_policies);
    }
  }, [data, isError, setChains, setTokens, setSlippagePolicies, chains]);
}
