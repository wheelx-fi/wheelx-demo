'use client';

import { useQuery } from '@tanstack/react-query';
import { BASE_API_URL } from '../api/consts';

// ── Types ───────────────────────────────────────────────────────────

interface UsdPriceRequestItem {
  chain_index: string;
  token: string;
}

interface UsdPriceResponseItem {
  chainIndex: string;
  tokenAddress: string;
  time: string;
  price: string;
}

// ── API call ───────────────────────────────────────────────────────

async function fetchUsdPrice(items: UsdPriceRequestItem[]): Promise<UsdPriceResponseItem[]> {
  const res = await fetch(`${BASE_API_URL}/v1/token-price`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(items),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch token price: ${res.status}`);
  }

  return res.json();
}

// ── Hook ────────────────────────────────────────────────────────────

interface UseTokenUsdPriceResult {
  price: number | null;
  isLoading: boolean;
}

/**
 * Fetches the USD price of a token via POST /v1/token-price.
 * Returns null if the price is unavailable for the given token + chain.
 */
export function useTokenUsdPrice(
  tokenAddress: string | undefined,
  chainId: number | undefined,
): UseTokenUsdPriceResult {
  const items: UsdPriceRequestItem[] | undefined =
    tokenAddress && chainId
      ? [{ chain_index: String(chainId), token: tokenAddress }]
      : undefined;

  const { data, isLoading } = useQuery({
    queryKey: ['usdPrice', items],
    queryFn: () => fetchUsdPrice(items!),
    enabled: !!items,
    retry: 4,
    retryDelay: 1000,
  });

  const price = data?.[0]?.price ? Number(data[0].price) : null;

  return { price, isLoading };
}
