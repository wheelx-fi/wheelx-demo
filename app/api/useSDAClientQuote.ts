'use client';

import { useCallback, useRef } from 'react';
import { BASE_API_URL } from './consts';
import type { SDAQuoteRequest, SDAQuoteResponse } from './types';

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

export function useSDAClientQuote() {
  const abortRef = useRef<AbortController | null>(null);

  const cancelQuote = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  }, []);

  const fetchQuote = useCallback(
    async (params: SDAQuoteRequest): Promise<SDAQuoteResponse> => {
      // Cancel any in-flight request
      cancelQuote();

      const controller = new AbortController();
      abortRef.current = controller;

      const requestBody: SDAQuoteRequest & { quote_only: boolean } = {
        ...params,
        from_address: params.from_address || NULL_ADDRESS,
        amount: params.amount || '0',
        use_deposit_address: true,
        quote_only: true,
        exact_out: true,
      };

      const res = await fetch(`${BASE_API_URL}/v1/quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => 'Unknown error');
        let detail = errorText;
        try {
          const parsed = JSON.parse(errorText);
          if (typeof parsed.detail === 'string') {
            detail = parsed.detail;
          } else if (Array.isArray(parsed.detail) && parsed.detail[0]?.msg) {
            detail = parsed.detail[0].msg;
          }
        } catch {
          // use raw errorText
        }
        throw new Error(detail);
      }

      return res.json() as Promise<SDAQuoteResponse>;
    },
    [cancelQuote],
  );

  return { fetchQuote, cancelQuote };
}
