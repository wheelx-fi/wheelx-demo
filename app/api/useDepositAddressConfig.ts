'use client';

import { useQuery } from '@tanstack/react-query';
import { DEPOSIT_ADDRESS_CONFIG_URL } from './consts';
import type { DepositAddressConfigResponse } from './types';

export async function fetchDepositAddressConfig(): Promise<DepositAddressConfigResponse> {
  const res = await fetch(DEPOSIT_ADDRESS_CONFIG_URL, {
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch deposit-address-config: ${res.status}`);
  }

  return res.json();
}

export function useDepositAddressConfig(enabled = true) {
  return useQuery({
    queryKey: ['depositAddressConfig'],
    queryFn: fetchDepositAddressConfig,
    enabled,
    staleTime: 30 * 1000, // 30s
    refetchOnWindowFocus: false,
  });
}
