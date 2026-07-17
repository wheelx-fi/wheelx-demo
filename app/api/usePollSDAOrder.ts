'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { BASE_API_URL } from './consts';
import type { OrderDetail, OrderStatus } from './types';

// Once the order reaches one of these statuses, polling stops automatically.
const TERMINAL_STATUSES: OrderStatus[] = ['Filled', 'Failed', 'Refund'];

interface UsePollSDAOrderOptions {
  /** Polling interval in ms (default: 5000) */
  interval?: number;
  /** Maximum polling attempts (default: 100) */
  maxAttempts?: number;
}

interface UsePollSDAOrderResult {
  /** Latest order detail data */
  data: OrderDetail | null;
  /** Whether currently polling */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
  /** Current attempt count */
  attemptCount: number;
  /** Whether polling has stopped */
  stopped: boolean;
  /** Stop polling manually */
  stopPolling: () => void;
  /** Start polling for a given order id */
  startPolling: (orderId: string) => void;
  /** Reset state */
  reset: () => void;
}

export function usePollSDAOrder(options: UsePollSDAOrderOptions = {}): UsePollSDAOrderResult {
  const { interval = 5000, maxAttempts = 100 } = options;

  const [orderId, setOrderId] = useState<string | null>(null);
  const [data, setData] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [stopped, setStopped] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stoppedRef = useRef(false);
  const attemptRef = useRef(0);
  const orderIdRef = useRef<string | null>(null);

  const fetchOrder = useCallback(async (id: string) => {
    try {
      const res = await fetch(`${BASE_API_URL}/v1/order/${id}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch order: ${res.status}`);
      }

      return (await res.json()) as OrderDetail;
    } catch (err) {
      throw err;
    }
  }, []);

  const executePoll = useCallback(async () => {
    const oid = orderIdRef.current;
    if (!oid || stoppedRef.current || attemptRef.current >= maxAttempts) {
      return;
    }

    setIsLoading(true);
    attemptRef.current += 1;
    setAttemptCount(attemptRef.current);

    try {
      const result = await fetchOrder(oid);
      setData(result);
      setError(null);

      if (TERMINAL_STATUSES.includes(result.status)) {
        stoppedRef.current = true;
        setStopped(true);
        setIsLoading(false);
        return;
      }

      if (attemptRef.current >= maxAttempts) {
        stoppedRef.current = true;
        setStopped(true);
        setIsLoading(false);
        return;
      }

      // Schedule next poll
      timerRef.current = setTimeout(() => {
        executePoll();
      }, interval);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');

      if (attemptRef.current >= maxAttempts) {
        stoppedRef.current = true;
        setStopped(true);
        setIsLoading(false);
        return;
      }

      // Retry on error
      timerRef.current = setTimeout(() => {
        executePoll();
      }, interval);
      setIsLoading(false);
    }
  }, [fetchOrder, interval, maxAttempts]);

  const stopPolling = useCallback(() => {
    stoppedRef.current = true;
    setStopped(true);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsLoading(false);
  }, []);

  const startPolling = useCallback(
    (oid: string) => {
      // Stop any existing polling
      stopPolling();

      // Reset state
      stoppedRef.current = false;
      attemptRef.current = 0;

      setOrderId(oid);
      orderIdRef.current = oid;
      setData(null);
      setError(null);
      setStopped(false);
      setAttemptCount(0);
      setIsLoading(true);

      // Start first poll immediately
      attemptRef.current = 1;
      setAttemptCount(1);

      fetchOrder(oid)
        .then((result) => {
          if (stoppedRef.current) return;
          setData(result);

          if (TERMINAL_STATUSES.includes(result.status)) {
            stoppedRef.current = true;
            setStopped(true);
            setIsLoading(false);
            return;
          }

          if (attemptRef.current >= maxAttempts) {
            stoppedRef.current = true;
            setStopped(true);
            setIsLoading(false);
            return;
          }

          timerRef.current = setTimeout(() => {
            executePoll();
          }, interval);
          setIsLoading(false);
        })
        .catch((err) => {
          if (stoppedRef.current) return;
          setError(err instanceof Error ? err.message : 'Unknown error');

          if (attemptRef.current >= maxAttempts) {
            stoppedRef.current = true;
            setStopped(true);
            setIsLoading(false);
            return;
          }

          timerRef.current = setTimeout(() => {
            executePoll();
          }, interval);
          setIsLoading(false);
        });
    },
    [stopPolling, fetchOrder, executePoll, interval, maxAttempts],
  );

  const reset = useCallback(() => {
    stopPolling();
    setOrderId(null);
    orderIdRef.current = null;
    setData(null);
    setError(null);
    setStopped(false);
    setAttemptCount(0);
    setIsLoading(false);
  }, [stopPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stoppedRef.current = true;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    data,
    isLoading,
    error,
    attemptCount,
    stopped,
    stopPolling,
    startPolling,
    reset,
  };
}
