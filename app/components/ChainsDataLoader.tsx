'use client';

import { useEffect } from 'react';
import { useDepositAddressConfig } from '../api/useDepositAddressConfig';
import { useChainsStore } from '../store/chainsStore';
import type { ChainInfo, TokenInfo } from '../api/types';

/**
 * Fetches /v1/deposit-address-config on mount and syncs:
 *   - chains + tokens + slippage policies into zustand store
 *   - deposit configuration (from/to chain IDs & tokens) into zustand store
 *
 * This replaces both the old /v1/chain-info and the hardcoded sda() data.
 */
export function useLoadChainsData() {
  const { data, isError } = useDepositAddressConfig();
  const { setChains, setTokens, setSlippagePolicies, setDepositConfig, chains } = useChainsStore();

  useEffect(() => {
    if (!data || isError) return;

    // ── Extract chains ──────────────────────────────────────────────
    const seenChainIds = new Set<number>();
    const allChains: ChainInfo[] = [];
    const fromChainIds: number[] = [];
    const toChainIds: number[] = [];

    for (const item of data.chains ?? []) {
      if (item.chain_info && !seenChainIds.has(item.chain)) {
        seenChainIds.add(item.chain);
        // Fallback chain_icon to /images/networks/{chain_id}.png if empty.
        allChains.push({
          ...item.chain_info,
          chain_icon:
            item.chain_info.chain_icon ||
            `https://wheelx.fi/images/networks/${item.chain_info.chain_id}.png`,
        });
      }
      if (item.from_enable) {
        fromChainIds.push(item.chain);
      }
      if (item.to_enable) {
        toChainIds.push(item.chain);
      }
    }

    // ── Extract tokens ──────────────────────────────────────────────
    const seenTokenKeys = new Set<string>();
    const allTokens: TokenInfo[] = [];
    const fromTokens: Array<{ chain_id: number; address: string; symbol: string }> = [];
    const toTokens: Array<{ chain_id: number; address: string; symbol: string }> = [];

    for (const item of data.tokens ?? []) {
      if (!item.enable) continue;

      const info = item.token_info;
      const tokenKey = `${item.chain}:${info?.address?.toLowerCase() ?? item.token_address?.toLowerCase()}`;

      // Deduplicate token_info entries
      if (info && !seenTokenKeys.has(tokenKey)) {
        seenTokenKeys.add(tokenKey);
        allTokens.push(info);
      }

      const entry = {
        chain_id: item.chain,
        address: item.token_address || info?.address || '',
        symbol: info?.symbol || item.token_name,
      };

      if (item.direction === 'from') {
        fromTokens.push(entry);
      } else if (item.direction === 'to') {
        toTokens.push(entry);
      }
    }

    // ── Sync to store (only if changed) ─────────────────────────────
    if (
      !chains ||
      JSON.stringify(allChains) !== JSON.stringify(chains)
    ) {
      setChains(allChains);
      setTokens(allTokens);
    }

    if (data.slippage_policies?.length) {
      setSlippagePolicies(data.slippage_policies);
    }

    setDepositConfig({ fromChainIds, toChainIds, fromTokens, toTokens });
  }, [data, isError, setChains, setTokens, setSlippagePolicies, setDepositConfig, chains]);
}
