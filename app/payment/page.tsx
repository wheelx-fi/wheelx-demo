'use client';

import {
  Box,
  createListCollection,
} from '@chakra-ui/react';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useLoadChainsData } from '../components/ChainsDataLoader';
import { useChainsStore } from '../store/chainsStore';
import type { ChainInfo } from '../api/types';
import QRCode from 'qrcode';
import { getAddress } from 'viem';
import { useSDAStore } from '../store/sdaStore';
import { useSDAClientQuote } from '../api/useSDAClientQuote';
import { usePollSDAOrder } from '../api/usePollSDAOrder';
import { calculateAutoSlippage } from '../api/slippage';
import { isSolanaChain } from '../consts/solana';
import { isValidEVMAddress, isValidSolanaAddress, isValidTronAddress } from '../utils/address';
import type { SDAQuoteResponse, TokenInfo } from '../api/types';
import { ETH_CHAIN_ID, NULL_ADDRESS } from './config';
import { formatPriceImpact, formatEstimatedTime } from './utils';
import { SdaHeader } from './components/SdaHeader';
import { SdaFooter } from './components/SdaFooter';
import { Step1ReceiveForm } from './components/Step1ReceiveForm';
import type { EnrichedToken } from './components/Step1ReceiveForm';
import { Step2DepositForm } from './components/Step2DepositForm';

// ── Icon sizes (shared between steps) ──────────────────────────────────
const chainIconSize = { w: '18px', h: '18px' };
const tokenIconSize = { w: '18px', h: '18px' };

// Convert a decimal amount string to base units (wei-like) for a token with
// `decimals` precision. Handles different token precisions and truncates
// extra fractional digits beyond `decimals`.
function toBaseUnits(value: string, decimals: number): string {
  const trimmed = value.trim();
  if (!trimmed) return '0';
  const negative = trimmed.startsWith('-');
  const cleaned = negative ? trimmed.slice(1) : trimmed;
  const [intPartRaw, fracPartRaw = ''] = cleaned.split('.');
  const intPart = intPartRaw === '' ? '0' : intPartRaw;
  const fracPart = (fracPartRaw + '0'.repeat(decimals)).slice(0, decimals);
  let result = intPart + fracPart;
  result = result.replace(/^0+(?=\d)/, '');
  if (result === '') result = '0';
  return negative ? '-' + result : result;
}

// Convert a base-units (wei-like) integer string back to a decimal amount
// string, trimmed of trailing zeros, for a token with `decimals` precision.
function fromBaseUnits(value: string, decimals: number): string {
  const trimmed = value.trim();
  if (!trimmed || trimmed === '0') return '0';
  const negative = trimmed.startsWith('-');
  const cleaned = negative ? trimmed.slice(1) : trimmed;
  const padded = cleaned.padStart(decimals + 1, '0');
  const intPart = padded.slice(0, padded.length - decimals);
  const fracPart = padded.slice(padded.length - decimals).replace(/0+$/, '');
  const result = fracPart ? `${intPart}.${fracPart}` : intPart;
  return negative ? '-' + result : result;
}

// Round a decimal amount string to at most `maxFractionDigits` digits
// (half-up), leaving fewer-precision values untouched, for display only.
function roundAmount(value: string, maxFractionDigits: number): string {
  const trimmed = value.trim();
  if (!trimmed || trimmed === '0') return '0';
  const [intPartRaw, fracPartRaw = ''] = trimmed.split('.');
  const intPart = intPartRaw === '' ? '0' : intPartRaw;
  if (fracPartRaw.length <= maxFractionDigits) {
    const frac = fracPartRaw.replace(/0+$/, '');
    return frac ? `${intPart}.${frac}` : intPart;
  }
  const factor = 10 ** maxFractionDigits;
  const rounded = Math.round(Number(`${intPart}.${fracPartRaw}`) * factor) / factor;
  const str = rounded.toFixed(maxFractionDigits).replace(/0+$/, '').replace(/\.$/, '');
  return str === '' ? '0' : str;
}

// ── Component ──────────────────────────────────────────────────────────
const SDAPage = () => {
  // ── Core state ──────────────────────────────────────────────────
  const [activeIndex, setActiveIndex] = useState(0);
  const [receiveAddress, setReceiveAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // ── Data hooks ──────────────────────────────────────────────────
  useLoadChainsData();
  const { chains, tokens: apiTokens, slippagePolicies } = useChainsStore();
  const { saveFormData, setQuoteResponse, setRequestId, setIsPollingOrder } = useSDAStore();
  const { fetchQuote, cancelQuote } = useSDAClientQuote();
  const {
    data: orderData,
    startPolling,
    stopPolling,
    reset: resetOrder,
  } = usePollSDAOrder({ interval: 2000, maxAttempts: 100 });

  // ── Deposit config from /v1/deposit-address-config ───────────────
  const { depositConfig } = useChainsStore();

  const toChainIds = useMemo(
    () => new Set(depositConfig?.toChainIds ?? []),
    [depositConfig],
  );
  const fromChainIds = useMemo(
    () => new Set(depositConfig?.fromChainIds ?? []),
    [depositConfig],
  );

  // Token address lookup: "chainId:addressLowercase"
  const toTokenSet = useMemo(
    () =>
      new Set(
        (depositConfig?.toTokens ?? []).map(
          (t) => `${t.chain_id}:${t.address?.toLowerCase()}`,
        ),
      ),
    [depositConfig],
  );
  const fromTokenSet = useMemo(
    () =>
      new Set(
        (depositConfig?.fromTokens ?? []).map(
          (t) => `${t.chain_id}:${t.address?.toLowerCase()}`,
        ),
      ),
    [depositConfig],
  );

  // ── Filtered chains from API ─────────────────────────────────────
  const allAllowedChainIds = useMemo(
    () => new Set([...toChainIds, ...fromChainIds]),
    [toChainIds, fromChainIds],
  );

  const allFilteredChains: ChainInfo[] = useMemo(
    () => (chains || []).filter((c) => !c.is_testnet && allAllowedChainIds.has(c.chain_id)),
    [chains, allAllowedChainIds],
  );

  const toFilteredChains = useMemo(
    () => allFilteredChains.filter((c) => toChainIds.has(c.chain_id)),
    [allFilteredChains, toChainIds],
  );

  // ── Step 1/2 chain / token selections ───────────────────────────
  const [selectedChainId, setSelectedChainId] = useState<number | null>(null);
  const [selectedTokenKey, setSelectedTokenKey] = useState<string | null>(null);
  const [fromChainId, setFromChainId] = useState<number | null>(ETH_CHAIN_ID);
  const [fromTokenKey, setFromTokenKey] = useState<string | null>(null);

  // ── Computed effective values ───────────────────────────────────
  const effectiveChainId = selectedChainId ?? toFilteredChains[0]?.chain_id ?? null;
  const effectiveFromChainId = fromChainId ?? ETH_CHAIN_ID;

  // ── Chain lookup maps ────────────────────────────────────────────
  const toChainsMap = useMemo(
    () => Object.fromEntries(toFilteredChains.map((c) => [c.chain_id, c])),
    [toFilteredChains],
  );

  const fromFilteredChains = useMemo(
    () => {
      let apiChains = allFilteredChains.filter((c) => fromChainIds.has(c.chain_id));
      // If step 1 (to) selected Tron, hide Tron in step 2 (from) — Tron has only one token and cannot self-transfer
      if (effectiveChainId != null && toChainsMap[effectiveChainId]?.name === 'Tron') {
        apiChains = apiChains.filter((c) => c.name !== 'Tron');
      }
      return apiChains;
    },
    [allFilteredChains, fromChainIds, effectiveChainId, toChainsMap],
  );

  const fromChainsMap = useMemo(
    () => Object.fromEntries(fromFilteredChains.map((c) => [c.chain_id, c])),
    [fromFilteredChains],
  );

  const allChainsMap = useMemo(
    () => Object.fromEntries(allFilteredChains.map((c) => [c.chain_id, c])),
    [allFilteredChains],
  );

  // ── Token lookup map (for fee_level / categories) ───────────────
  const tokensMap = useMemo(() => {
    const map = new Map<string, TokenInfo>();
    if (apiTokens) {
      for (const t of apiTokens) {
        const key = `${t.chain_id}:${t.address?.toLowerCase()}`;
        if (!map.has(key)) map.set(key, t);
      }
    }
    return map;
  }, [apiTokens]);

  // ── Quote + Order state ─────────────────────────────────────────
  const [quoteResponse, setQuoteResponseLocal] = useState<SDAQuoteResponse | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  // Bump this to manually re-trigger the quote request (e.g. after countdown expires).
  const [quoteRefreshTick, setQuoteRefreshTick] = useState(0);
  const pendingQuoteRef = useRef(false);
  const [showDemoResult, setShowDemoResult] = useState(false);
  const [showOrderResult, setShowOrderResult] = useState(false);

  // Show result when order data first returns
  useEffect(() => {
    if (orderData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowDemoResult(true);
      const timer = setTimeout(() => setShowDemoResult(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [orderData]);

  // Show result when order status changes
  useEffect(() => {
    const status = orderData?.status;
    if (status) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowOrderResult(true);
      const hideDelay = status === 'Filled' || status === 'Failed' || status === 'Refund' ? 20000 : 5000;
      const timer = setTimeout(() => setShowOrderResult(false), hideDelay);
      return () => clearTimeout(timer);
    }
  }, [orderData?.status]);

  // ── Step 1: Enriched tokens (from sda.toToken) ───────────────────
  const enrichedTokens: EnrichedToken[] = useMemo(() => {
    if (!effectiveChainId) return [];
    if (!apiTokens) return [];
    const seen = new Set<string>();
    return apiTokens
      .filter(
        (t) =>
          t.chain_id === effectiveChainId &&
          toTokenSet.has(`${t.chain_id}:${t.address?.toLowerCase()}`),
      )
      .filter((t) => {
        const key = t.address?.toLowerCase();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((t) => ({
        symbol: t.symbol,
        native: t.tags?.includes('native' as never) ?? false,
        logo: t.logo || '/images/default-token-icon.png',
        name: t.name ?? t.symbol,
        address: t.address,
        decimals: t.decimals,
        categories: t.categories,
      }))
      .sort((a, b) => {
        // Stablecoin first (USDT before USDC) → native token → others
        const stableOrder: Record<string, number> = { USDT: 0, USDC: 1 };
        const aStable = a.categories?.includes('stablecoin') ? (stableOrder[a.symbol] ?? 2) : 99;
        const bStable = b.categories?.includes('stablecoin') ? (stableOrder[b.symbol] ?? 2) : 99;
        if (aStable !== bStable) return aStable - bStable;
        const aNative = a.native ? 0 : 1;
        const bNative = b.native ? 0 : 1;
        if (aNative !== bNative) return aNative - bNative;
        return a.symbol.localeCompare(b.symbol);
      });
  }, [effectiveChainId, apiTokens, toTokenSet]);

  const effectiveTokenKey = useMemo(() => {
    if (!effectiveChainId || enrichedTokens.length === 0) return null;
    const native = enrichedTokens.find((t) => t.native);
    const defaultTok = native ?? enrichedTokens[0];
    return `${effectiveChainId}:${defaultTok.symbol}`;
  }, [effectiveChainId, enrichedTokens]);

  const displayTokenKey = selectedTokenKey ?? effectiveTokenKey;

  // ── Step 2: Enriched tokens (from sda.fromToken) ─────────────────
  const fromEnrichedTokens: EnrichedToken[] = useMemo(() => {
    if (!effectiveFromChainId) return [];
    if (!apiTokens) return [];
    const seen = new Set<string>();
    const toChainId = effectiveChainId;
    const toTokenSymbol = displayTokenKey
      ? enrichedTokens.find((t) => `${effectiveChainId}:${t.symbol}` === displayTokenKey)?.symbol
      : null;

    return apiTokens
      .filter(
        (t) =>
          t.chain_id === effectiveFromChainId &&
          fromTokenSet.has(`${t.chain_id}:${t.address?.toLowerCase()}`),
      )
      .filter((t) => {
        const key = t.address?.toLowerCase();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .filter((t) => {
        if (toChainId !== null && t.chain_id === toChainId && toTokenSymbol && t.symbol === toTokenSymbol) {
          return false;
        }
        return true;
      })
      .map((t) => ({
        symbol: t.symbol,
        native: t.tags?.includes('native' as never) ?? false,
        logo: t.logo || '/images/default-token-icon.png',
        name: t.name ?? t.symbol,
        address: t.address,
        decimals: t.decimals,
        categories: t.categories,
      }))
      .sort((a, b) => {
        // Stablecoin first (USDT before USDC) → native token → others
        const stableOrder: Record<string, number> = { USDT: 0, USDC: 1 };
        const aStable = a.categories?.includes('stablecoin') ? (stableOrder[a.symbol] ?? 2) : 99;
        const bStable = b.categories?.includes('stablecoin') ? (stableOrder[b.symbol] ?? 2) : 99;
        if (aStable !== bStable) return aStable - bStable;
        const aNative = a.native ? 0 : 1;
        const bNative = b.native ? 0 : 1;
        if (aNative !== bNative) return aNative - bNative;
        return a.symbol.localeCompare(b.symbol);
      });
  }, [effectiveFromChainId, apiTokens, fromTokenSet, effectiveChainId, displayTokenKey, enrichedTokens]);

  const effectiveFromTokenKey = useMemo(() => {
    if (!effectiveFromChainId || fromEnrichedTokens.length === 0) return null;
    const usdt = fromEnrichedTokens.find((t) => t.symbol === 'USDT');
    const defaultTok = usdt ?? fromEnrichedTokens[0];
    return `${effectiveFromChainId}:${defaultTok.symbol}`;
  }, [effectiveFromChainId, fromEnrichedTokens]);

  const displayFromTokenKey = fromTokenKey ?? effectiveFromTokenKey;

  // If step 1 (to) selected Tron and step 2 (from) is currently Tron, reset from to ETH
  // (Tron has only one token and cannot self-transfer)
  useEffect(() => {
    if (
      effectiveChainId != null &&
      fromChainId != null &&
      toChainsMap[effectiveChainId]?.name === 'Tron' &&
      fromChainsMap[fromChainId]?.name === 'Tron'
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFromChainId(ETH_CHAIN_ID);
      setFromTokenKey(null);
    }
  }, [effectiveChainId, fromChainId, toChainsMap, fromChainsMap]);

  // ── Chakra collections ──────────────────────────────────────────
  const toChainCollection = useMemo(() => {
    if (!toFilteredChains.length) return null;
    return createListCollection({
      items: toFilteredChains.map((c) => ({
        label: c.name,
        value: c.chain_id.toString(),
      })),
    });
  }, [toFilteredChains]);

  const fromChainCollection = useMemo(() => {
    if (!fromFilteredChains.length) return null;
    return createListCollection({
      items: fromFilteredChains.map((c) => ({
        label: c.name,
        value: c.chain_id.toString(),
      })),
    });
  }, [fromFilteredChains]);

  const tokenCollection = useMemo(() => {
    if (!enrichedTokens.length) return null;
    return createListCollection({
      items: enrichedTokens.map((t) => ({
        label: t.symbol,
        value: `${effectiveChainId}:${t.symbol}`,
        address: t.address,
        decimals: t.decimals,
      })),
    });
  }, [enrichedTokens, effectiveChainId]);

  const fromTokenCollection = useMemo(() => {
    if (!fromEnrichedTokens.length) return null;
    return createListCollection({
      items: fromEnrichedTokens.map((t) => ({
        label: t.symbol,
        value: `${effectiveFromChainId}:${t.symbol}`,
        address: t.address,
        decimals: t.decimals,
      })),
    });
  }, [fromEnrichedTokens, effectiveFromChainId]);

  // ── Selected item lookups ───────────────────────────────────────
  const selectedChain = effectiveChainId ? toChainsMap[effectiveChainId] : null;
  const selectedToken = useMemo(
    () =>
      displayTokenKey
        ? enrichedTokens.find((t) => `${effectiveChainId}:${t.symbol}` === displayTokenKey) ?? null
        : null,
    [displayTokenKey, enrichedTokens, effectiveChainId],
  );

  const fromSelectedChain = effectiveFromChainId ? fromChainsMap[effectiveFromChainId] : null;
  const fromSelectedToken = useMemo(
    () =>
      displayFromTokenKey
        ? fromEnrichedTokens.find((t) => `${effectiveFromChainId}:${t.symbol}` === displayFromTokenKey) ?? null
        : null,
    [displayFromTokenKey, fromEnrichedTokens, effectiveFromChainId],
  );

  // ── Address validation ──────────────────────────────────────────
  const chainIsSolana = useMemo(
    () => isSolanaChain(effectiveChainId ?? undefined),
    [effectiveChainId],
  );

  const chainIsTron = useMemo(
    () => effectiveChainId !== null && toChainsMap[effectiveChainId]?.name === 'Tron',
    [effectiveChainId, toChainsMap],
  );

  const addressError = useMemo(() => {
    if (!receiveAddress.trim()) return null;
    if (chainIsTron) {
      return isValidTronAddress(receiveAddress.trim())
        ? null
        : 'Invalid Tron address (expected base58, 34 chars, starting with T)';
    }
    if (chainIsSolana) {
      return isValidSolanaAddress(receiveAddress.trim())
        ? null
        : 'Invalid Solana address (expected base58, 32-44 chars)';
    }
    return isValidEVMAddress(receiveAddress.trim())
      ? null
      : 'Invalid EVM address (must start with 0x, 42 chars)';
  }, [receiveAddress, chainIsSolana, chainIsTron]);

  // Amount must be a number greater than 0
  const amountError = useMemo(() => {
    if (!amount.trim()) return null;
    const num = Number(amount);
    if (Number.isNaN(num) || num <= 0) {
      return 'Only numbers greater than 0 are allowed';
    }
    return null;
  }, [amount]);

  // ── Handlers ────────────────────────────────────────────────────
  const handleChainChange = useCallback((e: { value: string[] }) => {
    const id = Number(e.value[0]);
    setSelectedChainId(id);
    setSelectedTokenKey(null);
  }, []);

  const handleTokenChange = useCallback((e: { value: string[] }) => {
    const key = e.value[0];
    const token = enrichedTokens.find((t) => `${effectiveChainId}:${t.symbol}` === key);
    console.log('[Token Selected]', { key, token, chainId: effectiveChainId });
    setSelectedTokenKey(key);
  }, [enrichedTokens, effectiveChainId]);

  const handleFromChainChange = useCallback((e: { value: string[] }) => {
    const id = Number(e.value[0]);
    setFromChainId(id);
    setFromTokenKey(null);
  }, []);

  const handleFromTokenChange = useCallback((e: { value: string[] }) => {
    const key = e.value[0];
    const token = fromEnrichedTokens.find((t) => `${effectiveFromChainId}:${t.symbol}` === key);
    console.log('[From Token Selected]', { key, token, chainId: effectiveFromChainId });
    setFromTokenKey(key);
  }, [fromEnrichedTokens, effectiveFromChainId]);

  const handleNext = useCallback(() => {
    if (addressError !== null || !receiveAddress.trim()) return;
    saveFormData({
      chainName: selectedChain?.name ?? '',
      chainId: selectedChain?.chain_id ?? null,
      chainLogo: selectedChain?.chain_icon ?? '',
      tokenLogo: selectedToken?.logo ?? '',
      tokenName: selectedToken?.name ?? '',
      tokenSymbol: selectedToken?.symbol ?? '',
      tokenAddress: selectedToken?.address ?? '',
      tokenDecimals: selectedToken?.decimals ?? 18,
      receiveAddress: receiveAddress.trim(),
    });
    setActiveIndex(1);
  }, [selectedChain, selectedToken, receiveAddress, saveFormData, addressError]);

  // Stop order polling and re-fetch the quote (used when the quote countdown expires).
  const handleRefreshQuote = useCallback(() => {
    stopPolling();
    resetOrder();
    setIsPollingOrder(false);
    setQuoteRefreshTick((t) => t + 1);
  }, [stopPolling, resetOrder, setIsPollingOrder]);

  // Stop the order request immediately when the quote countdown expires.
  const handleCountdownExpired = useCallback(() => {
    stopPolling();
    resetOrder();
    setIsPollingOrder(false);
  }, [stopPolling, resetOrder, setIsPollingOrder]);

  // ── QR Code generation ──────────────────────────────────────────
  const depositAddress = quoteResponse?.deposit_address || '';
  const chainIsSol = isSolanaChain(effectiveFromChainId ?? undefined);

  const displayAddress = useMemo(() => {
    if (!depositAddress) return '';
    if (chainIsSol) return depositAddress;
    try {
      return getAddress(depositAddress);
    } catch {
      return depositAddress;
    }
  }, [depositAddress, chainIsSol]);

  useEffect(() => {
    let cancelled = false;
    if (!displayAddress) {
      Promise.resolve().then(() => { if (!cancelled) setQrCodeUrl(''); });
      return () => { cancelled = true; };
    }
    const qrContent = chainIsSol ? `solana:${displayAddress}` : displayAddress;
    QRCode.toDataURL(qrContent, {
      width: 140,
      margin: 0,
      color: { dark: '#000000', light: '#FFFFFFFF' },
    }).then((url) => {
      if (!cancelled) setQrCodeUrl(url);
    }).catch(() => {
      if (!cancelled) setQrCodeUrl('');
    });
    return () => { cancelled = true; };
  }, [displayAddress, chainIsSol, effectiveFromChainId]);

  const handleCopyAddress = useCallback(async () => {
    if (!displayAddress) return;
    try {
      await navigator.clipboard.writeText(displayAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API not available
    }
  }, [displayAddress]);

  // ── Quote request effect ────────────────────────────────────────
  useEffect(() => {
    if (activeIndex !== 1) return;
    if (!effectiveFromChainId || !effectiveChainId) return;
    if (!displayFromTokenKey || !displayTokenKey) return;
    if (!receiveAddress) return;
    if (pendingQuoteRef.current) return;

    pendingQuoteRef.current = true;

    const doQuote = async () => {
      setQuoteLoading(true);
      setQuoteError(null);
      stopPolling();
      resetOrder();
      setIsPollingOrder(false);

      const fromTokenAddr = fromEnrichedTokens.find(
        (t) => `${effectiveFromChainId}:${t.symbol}` === displayFromTokenKey,
      )?.address;
      const toTokenAddr = selectedToken?.address;

      if (!fromTokenAddr || !toTokenAddr) {
        setQuoteLoading(false);
        pendingQuoteRef.current = false;
        return;
      }

      const toChainInfo = toChainsMap[effectiveChainId];
      const toPlatformId = toChainInfo?.platform_id ?? 0;
      const fromTokenInfo = tokensMap.get(`${effectiveFromChainId}:${fromTokenAddr?.toLowerCase()}`) ?? null;
      const toTokenInfo = tokensMap.get(`${effectiveChainId}:${toTokenAddr?.toLowerCase()}`) ?? null;

      // Quote is exact_out → amount is the receive (to_token) amount in base units.
      // Different tokens have different precisions, so scale by to_token decimals.
      const amountBaseUnits = toBaseUnits(
        amount,
        toTokenInfo?.decimals ?? selectedToken?.decimals ?? 18,
      );

      const autoSlippage = calculateAutoSlippage(
        slippagePolicies,
        fromTokenInfo,
        toTokenInfo,
        Object.values(allChainsMap),
      );

      try {
        const res = await fetchQuote({
          from_chain: effectiveFromChainId,
          to_chain: effectiveChainId,
          from_token: fromTokenAddr,
          to_token: toTokenAddr,
          from_address: NULL_ADDRESS,
          to_address: receiveAddress,
          amount: amountBaseUnits,
          slippage: autoSlippage,
          to_platform_id: toPlatformId,
          use_deposit_address: true,
          // exact_out only when an amount is entered; empty amount → exact_in mode
          exact_out: amount.trim() !== '',
        });

        setQuoteResponseLocal(res);
        setQuoteResponse(res);
        setRequestId(res.request_id ?? null);
        setQuoteLoading(false);
        pendingQuoteRef.current = false;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to fetch quote';
        setQuoteError(msg);
        setQuoteResponseLocal(null);
        setQuoteResponse(null);
        setRequestId(null);
        setQuoteLoading(false);
        pendingQuoteRef.current = false;
      }
    };

    doQuote();
    return () => { cancelQuote(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, effectiveFromChainId, effectiveChainId, displayFromTokenKey, displayTokenKey, receiveAddress, amount, slippagePolicies, quoteRefreshTick]);

  // ── Order polling effect ─────────────────────────────────────────
  const prevRequestIdRef = useRef<string | null>(null);

  useEffect(() => {
    const requestId = quoteResponse?.request_id;
    if (prevRequestIdRef.current && prevRequestIdRef.current !== requestId) {
      stopPolling();
      resetOrder();
    }
    prevRequestIdRef.current = requestId ?? null;
    if (!requestId) return;
    setIsPollingOrder(true);
    startPolling(requestId);
  }, [quoteResponse?.request_id, startPolling, stopPolling, resetOrder, setIsPollingOrder]);

  // Stop polling when switching back to step 1
  const prevActiveIndexRef = useRef(activeIndex);
  useEffect(() => {
    if (prevActiveIndexRef.current === 1 && activeIndex === 0) {
      stopPolling();
      resetOrder();
      setIsPollingOrder(false);
    }
    prevActiveIndexRef.current = activeIndex;
  }, [activeIndex, stopPolling, resetOrder, setIsPollingOrder]);

  // ── Loading state ───────────────────────────────────────────────
  const isLoading = !chains || !toChainCollection;

  // ── Derived TxInfo ──────────────────────────────────────────────
  const txInfo = useMemo(() => {
    if (!quoteResponse) return null;
    return {
      priceImpact: formatPriceImpact(quoteResponse.price_impact),
      slippage: `${quoteResponse.slippage / 100}%`,
      estimatedTime: formatEstimatedTime(quoteResponse.estimated_time),
    };
  }, [quoteResponse]);

  // Deposit amount the user needs to send, based on the step-2 selected token.
  // amount_in (base units) → decimal string + token symbol, e.g. "1USDT".
  const depositAmountText = useMemo(() => {
    if (!quoteResponse?.amount_in || !fromSelectedToken) return null;
    // Stablecoins are priced ~1:1 to USD, so 2 decimals are enough;
    // otherwise keep 6 decimals of precision.
    const fromTokenInfo = tokensMap.get(
      `${effectiveFromChainId}:${fromSelectedToken.address?.toLowerCase()}`,
    );
    const isStablecoin = fromTokenInfo?.categories?.includes('stablecoin') ?? false;
    const maxFractionDigits = isStablecoin ? 2 : 6;
    const value = roundAmount(
      fromBaseUnits(quoteResponse.amount_in, fromSelectedToken.decimals),
      maxFractionDigits,
    );
    return `${value}-${fromSelectedToken.symbol}`;
  }, [quoteResponse, fromSelectedToken, tokensMap, effectiveFromChainId]);

  // ── Render ──────────────────────────────────────────────────────
  return (
    <Box padding={['40px 20px', '40px 0', '40px 0']}>
      <Box
        position="relative"
        margin={'0 auto'}
        w={['100%', '460px', '460px']}
        h={'auto'}
        minH={'270px'}
        border={'1px solid #bbb'}
        borderRadius={'5px'}
        bgColor={'#fff'}
        boxShadow={'0 0 5px rgba(0,0,0,.4)'}
        padding={'0 15px 40px'}
      >
        <SdaHeader activeIndex={activeIndex} onStepChange={setActiveIndex} />

        {/* Step 1: Receive — data source: sda().toChain / sda().toToken */}
        {activeIndex === 0 && (
          <Step1ReceiveForm
            isLoading={isLoading}
            effectiveChainId={effectiveChainId}
            onChainChange={handleChainChange}
            selectedChain={selectedChain}
            chainCollection={toChainCollection}
            chainsMap={toChainsMap}
            tokenCollection={tokenCollection}
            displayTokenKey={displayTokenKey}
            onTokenChange={handleTokenChange}
            selectedToken={selectedToken}
            enrichedTokens={enrichedTokens}
            receiveAddress={receiveAddress}
            onAddressChange={setReceiveAddress}
            addressError={addressError}
            amount={amount}
            onAmountChange={setAmount}
            amountError={amountError}
            onNext={handleNext}
            chainIconSize={chainIconSize}
            tokenIconSize={tokenIconSize}
          />
        )}

        {/* Step 2: Deposit — data source: sda().fromChain / sda().fromToken */}
        {activeIndex === 1 && (
          <Step2DepositForm
            isLoading={isLoading}
            chainCollection={fromChainCollection}
            chainsMap={fromChainsMap}
            effectiveFromChainId={effectiveFromChainId}
            onFromChainChange={handleFromChainChange}
            fromSelectedChain={fromSelectedChain}
            fromTokenCollection={fromTokenCollection}
            displayFromTokenKey={displayFromTokenKey}
            onFromTokenChange={handleFromTokenChange}
            fromSelectedToken={fromSelectedToken}
            fromEnrichedTokens={fromEnrichedTokens}
            depositAmountText={depositAmountText}
            amount={amount}
            quoteLoading={quoteLoading}
            quoteRequestId={quoteResponse?.request_id ?? null}
            onRefreshQuote={handleRefreshQuote}
            onCountdownExpired={handleCountdownExpired}
            quoteError={quoteError}
            qrCodeUrl={qrCodeUrl}
            displayAddress={displayAddress}
            copied={copied}
            onCopyAddress={handleCopyAddress}
            isExpanded={isExpanded}
            onToggleExpand={() => setIsExpanded(!isExpanded)}
            txInfo={txInfo}
            orderStatus={orderData?.status}
            showOrderResult={showOrderResult}
            showDemoResult={showDemoResult}
            receiveChainIsTron={chainIsTron}
            chainIconSize={chainIconSize}
            tokenIconSize={tokenIconSize}
          />
        )}

        <SdaFooter />
      </Box>
    </Box>
  );
};

export default SDAPage;
