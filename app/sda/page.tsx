'use client';

import {
  Box,
  HStack,
  Image,
  Text,
  Portal,
  Select,
  createListCollection,
  Spinner,
  Center,
  VStack,
  Input,
  Button,
} from '@chakra-ui/react';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useLoadChainsData } from '../components/ChainsDataLoader';
import { useChainsStore } from '../store/chainsStore';
import type { ChainInfo } from '../api/types';
import { HiArrowLongRight } from 'react-icons/hi2';
import { PiCopy } from 'react-icons/pi';
import { AiOutlineDollarCircle } from 'react-icons/ai';
import { ToggleTip } from '@/components/ui/ToggleTip';
import { LuInfo } from 'react-icons/lu';
import { AiOutlinePercentage } from 'react-icons/ai';
import { IoMdTime } from 'react-icons/io';
import { RiErrorWarningFill } from 'react-icons/ri';
import SdaResult from '@/components/Sda/Result';
import QRCode from 'qrcode';
import { getAddress } from 'viem';
import { useSDAStore } from '../store/sdaStore';
import { useSDAClientQuote } from '../api/useSDAClientQuote';
import { usePollSDAOrder } from '../api/usePollSDAOrder';
import { calculateAutoSlippage } from '../api/slippage';
import { isSolanaChain } from '../consts/solana';
import { isValidEVMAddress, isValidSolanaAddress } from '../utils/address';
import type { SDAQuoteResponse, TokenInfo } from '../api/types';
import { TiArrowSortedDown } from "react-icons/ti";

// ── Constants ──────────────────────────────────────────────────────────
const ETH_CHAIN_ID = 1;
const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

// Allowed chains and tokens for the two-step SDA flow
const ALLOWED_CHAIN_IDS = new Set<number>([
  1, 56, 8453, 42161, 999, 10, 143, 137, 1151111081099710, 4217, 988, 9745, 43114, 2818,
]);

const ALLOWED_TOKEN_ADDRESSES: Map<number, Set<string>> = new Map([
  [1, new Set([
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', '0xdac17f958d2ee523a2206206994597c13d831ec7',
    '0x0000000000000000000000000000000000000000', '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    '0x8d0d000ee44948fc98c9b98a4fa4921476f08b0d', '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf',
    '0x4c9edd5852cd905f086c759e8383e09bff1e68b3', '0x8292bb45bf1ee4d140127049757c2e0ff06317ed',
    '0x6c3ea9036406852006290770bedfcaba0e23a0e8', '0xe343167631d89b6ffc58b88d6b7fb0228795491d',
    '0x45804880de22913dafe09f4980848ece6ecbaf78', '0x68749665ff8d2d112fa859aa293f07a622782f38',
    '0xdc035d45d973e3ec169d2276ddab16f1e407384f', '0x6b175474e89094c44da98b954eedeac495271d0f',
    '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
  ])],
  [56, new Set([
    '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d', '0x0000000000000000000000000000000000000000',
    '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c', '0xe9e7cea3dedca5984780bafc599bd69add087d56',
    '0x2170ed0880ac9a755fd29b2688956bd959f933f8', '0xce24439f2d9c6a2289f741120fe202248b666666',
    '0x8d0d000ee44948fc98c9b98a4fa4921476f08b0d', '0x55d398326f99059ff775485246999027b3197955',
    '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
  ])],
  [8453, new Set([
    '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf',
    '0x50c5725949a6f0c72e6c4a641f24049a917db0cb', '0x0000000000000000000000000000000000000000',
    '0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22', '0xfde4c96c8593536e31f229ea8f37b2ada2699bb2',
    '0x4200000000000000000000000000000000000006',
  ])],
  [42161, new Set([
    '0xaf88d065e77c8cc2239327c5edb3a432268e5831', '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
    '0x912ce59144191c1204e64559fe8253a0e49e6548', '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
    '0x0000000000000000000000000000000000000000', '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f',
    '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9', '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
  ])],
  [999, new Set([
    '0xb88339cb7199b77e23db6e890353e22632ba630f', '0x9fdbda0a5e284c32744d2f17ee5c74b284993463',
    '0x0000000000000000000000000000000000000000', '0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34',
    '0xb8ce59fc3717ada4c02eadf9682a9e934f625ebb', '0xbe6727b535545c67d5caa73dea54865b92cf7907',
  ])],
  [10, new Set([
    '0x0b2c639c533813f4aa9d7837caf62653d097ff85', '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
    '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1', '0x0000000000000000000000000000000000000000',
    '0x01bff41798a0bcf287b996046ca68b395dbc1071', '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58',
    '0x4200000000000000000000000000000000000006',
  ])],
  [143, new Set([
    '0x754704bc059f8c67012fed69bc8a327a5aafb603', '0x0000000000000000000000000000000000000000',
  ])],
  [137, new Set([
    '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359', '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
    '0x0000000000000000000000000000000000000000', '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
    '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063', '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
  ])],
  [1151111081099710, new Set([
    'epjfwdd5aufqssqem2qn1xzybapc8g4weggkzwytdt1v',
    '11111111111111111111111111111111',
    '3o2GCwpoUTr6CezPdvMYHmxY9wcfVr5TU1oTb1uLJGVm',
    'dekqhypn7gmrj5cartqfawefqzbz33hyf6s5icwjeont', 'es9vmfrzacermjfrf4h2fyd4kconky11mcce8benwnyb',
    'usd1ttgy1n17neehlmeloaybftrbuserhqyiqzvemub', 'usdswr9apdhk5bvjkmjzff41ffux8bsxdckr81vtwca',
    'cbbtcf3aa214zxhibazqwf4122fbybrandfqgw4imij',
  ])],
  [4217, new Set([
    '0x20c0000000000000000000000000000000000000', '0x20c000000000000000000000b9537d11c60e8b50',
    '0x20c00000000000000000000014f22ca97301eb73',
  ])],
  [988, new Set([
    '0x0000000000000000000000000000000000000000', '0x779ded0c9e1022225f8e0630b35a9b54be713736',
  ])],
  [9745, new Set([
    '0x0000000000000000000000000000000000000000', '0x6100e367285b01f48d07953803a2d8dca5d19873',
    '0xb8ce59fc3717ada4c02eadf9682a9e934f625ebb', '0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34',
  ])],
  [43114, new Set([
    '0x0000000000000000000000000000000000000000', '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7',
    '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e', '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7',
    '0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab', '0x0555e30da8f98308edb960aa94c0db47230d2b9c',
  ])],
  [2818, new Set([
    '0x0000000000000000000000000000000000000000', '0x5300000000000000000000000000000000000011',
    '0xe34c91815d7fc18a9e2148bcd4241d0a5848b693', '0xc7d67a9cbb121b3b0b9c053dd9f469523243379a',
    '0xcfb1186f4e93d60e60a8bdd997427d1f33bc372b',
  ])],
]);

/** Check if a token is allowed based on its chain_id and address */
function isTokenAllowed(chainId: number, address: string | undefined): boolean {
  if (!address) return false;
  const allowed = ALLOWED_TOKEN_ADDRESSES.get(chainId);
  if (!allowed) return false;
  return allowed.has(address.toLowerCase());
}

// ── Helpers ────────────────────────────────────────────────────────────
function formatPriceImpact(priceImpact: SDAQuoteResponse['price_impact']): string {
  const bridgeFee = parseFloat(priceImpact.bridge_fee) || 0;
  const dstGasFee = parseFloat(priceImpact.dst_gas_fee) || 0;
  const swapFee = parseFloat(priceImpact.swap_fee) || 0;
  const totalFee = bridgeFee + dstGasFee + swapFee;

  if (totalFee === 0) return 'Free';

  // Show the total fee as a percentage
  return `-${totalFee.toFixed(2)}%`;
}

function formatEstimatedTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (secs === 0) return `${mins} min${mins > 1 ? 's' : ''}`;
  return `${mins} min ${secs}s`;
}

// ── Component ──────────────────────────────────────────────────────────
const SDAPage = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [receiveAddress, setReceiveAddress] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

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

  // ── Filtered chains (exclude testnets + only allowed chains) ─────
  const filteredChains: ChainInfo[] = useMemo(
    () => (chains || []).filter((c) => !c.is_testnet && ALLOWED_CHAIN_IDS.has(c.chain_id)),
    [chains],
  );

  // Chain lookup map: chain_id → ChainInfo
  const chainsMap = useMemo(
    () => Object.fromEntries(filteredChains.map((c) => [c.chain_id, c])),
    [filteredChains],
  );

  // Token lookup map: chain_id:address→lowercase → TokenInfo (for fee_level, categories)
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

  // ── Selected state + computed effective values ──────────────────
  const [selectedChainId, setSelectedChainId] = useState<number | null>(null);
  const [selectedTokenKey, setSelectedTokenKey] = useState<string | null>(null);

  // Second pair: "From" selects — default to Ethereum
  const [fromChainId, setFromChainId] = useState<number | null>(ETH_CHAIN_ID);
  const [fromTokenKey, setFromTokenKey] = useState<string | null>(null);

  // ── Quote + Order state ─────────────────────────────────────────
  const [quoteResponse, setQuoteResponseLocal] = useState<SDAQuoteResponse | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const pendingQuoteRef = useRef(false);
  const [showDemoResult, setShowDemoResult] = useState(false);
  const [showOrderResult, setShowOrderResult] = useState(false);

  // When order data first returns, show the result for 5 seconds
  useEffect(() => {
    if (orderData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowDemoResult(true);
      const timer = setTimeout(() => setShowDemoResult(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [orderData]);

  // When order status changes (success/failed/refund), show the result for 5 seconds
  useEffect(() => {
    const status = orderData?.status;
    if (status) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowOrderResult(true);
      const timer = setTimeout(() => setShowOrderResult(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [orderData?.status]);

  // Default to first chain for "Receive"
  const effectiveChainId = selectedChainId ?? filteredChains[0]?.chain_id ?? null;
  // Default to Ethereum for "From" (already set in useState)
  const effectiveFromChainId = fromChainId ?? ETH_CHAIN_ID;

  // ── Tokens for selected chain (filtered by allowlist) ───────────
  const enrichedTokens = useMemo(() => {
    if (!effectiveChainId || !apiTokens) return [];
    const seen = new Set<string>();
    return apiTokens
      .filter((t) => t.chain_id === effectiveChainId && isTokenAllowed(effectiveChainId, t.address))
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
      }));
  }, [effectiveChainId, apiTokens]);

  // Default token: native first, then first available
  const effectiveTokenKey = useMemo(() => {
    if (!effectiveChainId || enrichedTokens.length === 0) return null;
    const native = enrichedTokens.find((t) => t.native);
    const defaultTok = native ?? enrichedTokens[0];
    return `${effectiveChainId}:${defaultTok.symbol}`;
  }, [effectiveChainId, enrichedTokens]);

  const displayTokenKey = selectedTokenKey ?? effectiveTokenKey;

  // ── From-chain tokens (with filtering for step 2) ───────────────
  const fromEnrichedTokens = useMemo(() => {
    if (!effectiveFromChainId || !apiTokens) return [];
    const seen = new Set<string>();
    // Get step 1 selection for filtering
    const toChainId = effectiveChainId;
    const toTokenSymbol = displayTokenKey
      ? enrichedTokens.find((t) => `${effectiveChainId}:${t.symbol}` === displayTokenKey)?.symbol
      : null;

    return apiTokens
      .filter((t) => t.chain_id === effectiveFromChainId && isTokenAllowed(effectiveFromChainId, t.address))
      .filter((t) => {
        const key = t.address?.toLowerCase();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      // Filter: exclude same token on same network as step 1
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
      }));
  }, [effectiveFromChainId, apiTokens, effectiveChainId, displayTokenKey, enrichedTokens]);

  // Default from token: USDT if available, else first
  const effectiveFromTokenKey = useMemo(() => {
    if (!effectiveFromChainId || fromEnrichedTokens.length === 0) return null;
    // Prefer USDT
    const usdt = fromEnrichedTokens.find((t) => t.symbol === 'USDT');
    const defaultTok = usdt ?? fromEnrichedTokens[0];
    return `${effectiveFromChainId}:${defaultTok.symbol}`;
  }, [effectiveFromChainId, fromEnrichedTokens]);

  const displayFromTokenKey = fromTokenKey ?? effectiveFromTokenKey;

  // ── From collections ──────────────────────────────────────────────
  const fromTokenCollection = useMemo(() => {
    if (!fromEnrichedTokens.length) return null;
    return createListCollection({
      items: fromEnrichedTokens.map((t) => ({
        label: t.symbol,
        value: `${effectiveFromChainId}:${t.symbol}`,
      })),
    });
  }, [fromEnrichedTokens, effectiveFromChainId]);

  const fromSelectedChain = effectiveFromChainId ? chainsMap[effectiveFromChainId] : null;
  const fromSelectedToken = useMemo(
    () =>
      displayFromTokenKey
        ? fromEnrichedTokens.find(
          (t) => `${effectiveFromChainId}:${t.symbol}` === displayFromTokenKey,
        )
        : null,
    [displayFromTokenKey, fromEnrichedTokens, effectiveFromChainId],
  );

  // ── From handlers ─────────────────────────────────────────────────
  const handleFromChainChange = useCallback((e: { value: string[] }) => {
    const id = Number(e.value[0]);
    setFromChainId(id);
    setFromTokenKey(null);
  }, []);

  const handleFromTokenChange = useCallback((e: { value: string[] }) => {
    setFromTokenKey(e.value[0]);
  }, []);

  // ── Chakra collections ───────────────────────────────────────────
  const chainCollection = useMemo(() => {
    if (!filteredChains.length) return null;
    return createListCollection({
      items: filteredChains.map((c) => ({
        label: c.name,
        value: c.chain_id.toString(),
      })),
    });
  }, [filteredChains]);

  const tokenCollection = useMemo(() => {
    if (!enrichedTokens.length) return null;
    return createListCollection({
      items: enrichedTokens.map((t) => ({
        label: t.symbol,
        address: t.address,
        decimals: t.decimals,
        value: `${effectiveChainId}:${t.symbol}`,
      })),
    });
  }, [enrichedTokens, effectiveChainId]);

  // ── Selected item lookups ────────────────────────────────────────
  const selectedChain = effectiveChainId ? chainsMap[effectiveChainId] : null;
  const selectedToken = useMemo(
    () =>
      displayTokenKey
        ? enrichedTokens.find((t) => `${effectiveChainId}:${t.symbol}` === displayTokenKey)
        : null,
    [displayTokenKey, enrichedTokens, effectiveChainId],
  );

  // ── Address validation ──────────────────────────────────────────
  const chainIsSolana = useMemo(
    () => isSolanaChain(effectiveChainId ?? undefined),
    [effectiveChainId],
  );

  const addressError = useMemo(() => {
    if (!receiveAddress.trim()) return null; // empty → no error, just can't proceed
    if (chainIsSolana) {
      return isValidSolanaAddress(receiveAddress.trim())
        ? null
        : 'Invalid Solana address (expected base58, 32-44 chars)';
    }
    return isValidEVMAddress(receiveAddress.trim())
      ? null
      : 'Invalid EVM address (must start with 0x, 42 chars)';
  }, [receiveAddress, chainIsSolana]);

  // ── Handlers ─────────────────────────────────────────────────────
  const handleChainChange = useCallback((e: { value: string[] }) => {
    const id = Number(e.value[0]);
    setSelectedChainId(id);
    setSelectedTokenKey(null);
  }, []);

  const handleTokenChange = useCallback((e: { value: string[] }) => {
    setSelectedTokenKey(e.value[0]);
  }, []);

  const handleNext = useCallback(() => {
    // Don't proceed if address is invalid
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

  // ── QR Code generation ──────────────────────────────────────────
  // Use quoteResponse.deposit_address as the deposit address
  const depositAddress = quoteResponse?.deposit_address || '';

  // Convert EVM address to EIP-55 checksummed format for MetaMask compatibility;
  // Solana addresses are kept as-is.
  const chainIsSol = isSolanaChain(effectiveFromChainId ?? undefined);
  const displayAddress = useMemo(() => {
    if (!depositAddress) return '';
    if (chainIsSol) return depositAddress;
    try {
      const checksummed = getAddress(depositAddress);
      console.log('[QR] getAddress succeeded:', {
        original: depositAddress,
        checksummed,
      });
      return checksummed;
    } catch {
      console.warn('[QR] getAddress failed, using raw address:', depositAddress);
      return depositAddress;
    }
  }, [depositAddress, chainIsSol]);

  // MetaMask deep link: opens Send confirmation screen directly in MetaMask mobile app.
  // Format: https://link.metamask.io/send/{address}@{chainId}
  // const metaMaskDeepLink = useMemo(() => {
  //   if (!displayAddress || chainIsSol) return '';
  //   const depositChainId = effectiveChainId ?? effectiveFromChainId;
  //   return `https://link.metamask.io/send/${displayAddress}@${depositChainId}`;
  // }, [displayAddress, chainIsSol, effectiveChainId, effectiveFromChainId]);

  // MetaMask deep link only works on mobile (opens MetaMask app).
  // On desktop, it redirects to chrome-extension:// which 404s on /send/ route.
  // const handleOpenMetaMask = useCallback(async () => {
  //   if (!metaMaskDeepLink || !displayAddress) return;
  //   const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  //   if (isMobile) {
  //     // Navigate current page to trigger MetaMask app deep link
  //     window.location.href = metaMaskDeepLink;
  //   } else {
  //     // Desktop fallback: copy address to clipboard
  //     try {
  //       await navigator.clipboard.writeText(displayAddress);
  //       setCopied(true);
  //       setTimeout(() => setCopied(false), 2000);
  //     } catch {
  //       // clipboard API may fail in insecure contexts
  //     }
  //   }
  // }, [metaMaskDeepLink, displayAddress]);

  useEffect(() => {
    let cancelled = false;
    if (!displayAddress) {
      Promise.resolve().then(() => {
        if (!cancelled) setQrCodeUrl('');
      });
      return () => { cancelled = true; };
    }
    // Solana: use solana: URI so Phantom auto-fills recipient address
    // EVM: use plain EIP-55 address for maximum wallet compatibility.
    //      MetaMask mobile's Send-flow QR scanner recognizes plain addresses;
    //      the main-screen scanner is WalletConnect-only and won't auto-fill.
    const qrContent = chainIsSol
      ? `solana:${displayAddress}`
      : displayAddress;
    console.log('[QR] Generated QR content:', qrContent);
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
    // Only trigger in step 2 with valid data
    if (activeIndex !== 1) return;
    if (!effectiveFromChainId || !effectiveChainId) return;
    if (!displayFromTokenKey || !displayTokenKey) return;
    if (!receiveAddress) return;

    // Prevent duplicate calls
    if (pendingQuoteRef.current) return;
    pendingQuoteRef.current = true;

    const doQuote = async () => {
      setQuoteLoading(true);
      setQuoteError(null);

      // Cancel any in-progress order polling
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

      const toChainInfo = chainsMap[effectiveChainId];
      const toPlatformId = toChainInfo?.platform_id ?? 0;

      // Look up original TokenInfo for fee_level / categories
      const fromTokenInfo = tokensMap.get(`${effectiveFromChainId}:${fromTokenAddr?.toLowerCase()}`) ?? null;
      const toTokenInfo = tokensMap.get(`${effectiveChainId}:${toTokenAddr?.toLowerCase()}`) ?? null;

      // Calculate auto slippage (in bips) based on token pair
      const autoSlippage = calculateAutoSlippage(
        slippagePolicies,
        fromTokenInfo,
        toTokenInfo,
        Object.values(chainsMap),
      );

      try {
        const res = await fetchQuote({
          from_chain: effectiveFromChainId,
          to_chain: effectiveChainId,
          from_token: fromTokenAddr,
          to_token: toTokenAddr,
          from_address: NULL_ADDRESS,
          to_address: receiveAddress,
          amount: (100 * 10 ** 6).toString(),
          slippage: autoSlippage,
          to_platform_id: toPlatformId,
          use_deposit_address: true,
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

    return () => {
      // Cleanup on unmount or dependency change
      cancelQuote();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, effectiveFromChainId, effectiveChainId, displayFromTokenKey, displayTokenKey, receiveAddress, slippagePolicies]);

  // ── Order polling effect ─────────────────────────────────────────
  const prevRequestIdRef = useRef<string | null>(null);

  useEffect(() => {
    const requestId = quoteResponse?.request_id;

    // Stop previous polling if requestId changed
    if (prevRequestIdRef.current && prevRequestIdRef.current !== requestId) {
      stopPolling();
      resetOrder();
    }
    prevRequestIdRef.current = requestId ?? null;

    if (!requestId) return;

    // Start new polling
    setIsPollingOrder(true);
    startPolling(requestId);
  }, [quoteResponse?.request_id, startPolling, stopPolling, resetOrder, setIsPollingOrder]);

  // Stop order polling when user switches back to step 1
  const prevActiveIndexRef = useRef(activeIndex);
  useEffect(() => {
    if (prevActiveIndexRef.current === 1 && activeIndex === 0) {
      stopPolling();
      resetOrder();
      setIsPollingOrder(false);
    }
    prevActiveIndexRef.current = activeIndex;
  }, [activeIndex, stopPolling, resetOrder, setIsPollingOrder]);

  // ── Loading ──────────────────────────────────────────────────────
  const isLoading = !chains || !chainCollection;

  // ── Derived TxInfo values ────────────────────────────────────────
  const txInfo = useMemo(() => {
    if (!quoteResponse) return null;
    return {
      priceImpact: formatPriceImpact(quoteResponse.price_impact),
      slippage: `${quoteResponse.slippage / 100}%`,
      estimatedTime: formatEstimatedTime(quoteResponse.estimated_time),
    };
  }, [quoteResponse]);

  // ── UI helpers ───────────────────────────────────────────────────
  const chainIconSize = { w: '18px', h: '18px' };
  const tokenIconSize = { w: '18px', h: '18px' };

  // ── Step 1: Chain + Token Selects ────────────────────────────────
  const step1 = () => {
    if (activeIndex !== 0) {
      return null;
    }
    if (isLoading) {
      return (
        <Center py={'40px'}>
          <Spinner size="md" color={'blue.500'} />
        </Center>
      );
    }
    return (
      <Box>
        <HStack alignItems="flex-start" gap={'12px'} marginBottom={'15px'}>
          {/* ── Chain Select ─────────────────────────────────── */}
          <Box flex={1}>
            <Select.Root
              collection={chainCollection!}
              width="100%"
              gap={0}
              value={effectiveChainId ? [effectiveChainId.toString()] : []}
              onValueChange={handleChainChange}
            >
              <Select.HiddenSelect />
              <Select.Label
                fontSize={'13px'}
                color={'txt-weak'}
                marginBottom={'5px'}
              >
                Receive Networks <span style={{ color: 'red' }}>*</span>
              </Select.Label>
              <Select.Control>
                <Select.Trigger>
                  {selectedChain ? (
                    <HStack gap={'8px'}>
                      <Image
                        src={selectedChain.chain_icon || '/images/default-token-icon.png'}
                        alt={selectedChain.name}
                        {...chainIconSize}
                        borderRadius={'full'}
                        marginLeft={'8px'}
                      />
                      <Text fontSize={'13px'}>{selectedChain.name}</Text>
                    </HStack>
                  ) : (
                    <Select.ValueText placeholder="Select network" />
                  )}
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator />
                </Select.IndicatorGroup>
              </Select.Control>
              <Portal>
                <Select.Positioner>
                  <Select.Content>
                    {chainCollection!.items.map((item) => {
                      const chain = chainsMap[Number(item.value)];
                      return (
                        <Select.Item item={item} key={item.value} padding={'5px 0'}>
                          <HStack gap={'8px'}>
                            <Image
                              src={chain?.chain_icon || '/images/default-token-icon.png'}
                              alt={item.label}
                              {...chainIconSize}
                              borderRadius={'full'}
                              marginLeft={'8px'}
                            />
                            <Text fontSize={'13px'}>{item.label}</Text>
                          </HStack>
                          <Select.ItemIndicator marginRight={'8px'} />
                        </Select.Item>
                      );
                    })}
                  </Select.Content>
                </Select.Positioner>
              </Portal>
            </Select.Root>
          </Box>
          {/* ── Token Select ─────────────────────────────────── */}
          <Box flex={1}>
            <Select.Root
              collection={tokenCollection!}
              width="100%"
              gap={0}
              value={displayTokenKey ? [displayTokenKey] : []}
              onValueChange={handleTokenChange}
              key={effectiveChainId}
            >
              <Select.HiddenSelect />
              <Select.Label
                fontSize={'13px'}
                color={'txt-weak'}
                marginBottom={'5px'}
              >
                Receive Tokens <span style={{ color: 'red' }}>*</span>
              </Select.Label>
              <Select.Control>
                <Select.Trigger>
                  {selectedToken ? (
                    <HStack gap={'8px'}>
                      <Image
                        src={selectedToken.logo}
                        alt={selectedToken.symbol}
                        {...tokenIconSize}
                        borderRadius={'full'}
                        marginLeft={'8px'}
                      />
                      <Text fontSize={'13px'}>{selectedToken.symbol}</Text>
                    </HStack>
                  ) : (
                    <Select.ValueText placeholder="Select token" />
                  )}
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator marginRight={'8px'} />
                </Select.IndicatorGroup>
              </Select.Control>
              <Portal>
                <Select.Positioner>
                  <Select.Content>
                    {tokenCollection!.items.map((item) => {
                      const tok = enrichedTokens.find(
                        (t) => `${effectiveChainId}:${t.symbol}` === item.value,
                      );
                      return (
                        <Select.Item
                          item={item}
                          key={item.value + item.address}
                          padding={'5px 0'}
                        >
                          <HStack gap={'8px'}>
                            <Image
                              src={tok!.logo}
                              alt={item.label}
                              {...tokenIconSize}
                              borderRadius={'full'}
                              marginLeft={'8px'}
                            />
                            <Text fontSize={'13px'}>{item.label}</Text>
                          </HStack>
                          <Select.ItemIndicator marginRight={'8px'} />
                        </Select.Item>
                      );
                    })}
                  </Select.Content>
                </Select.Positioner>
              </Portal>
            </Select.Root>
          </Box>
        </HStack>
        <HStack alignItems="flex-start" gap={'12px'} marginBottom={addressError ? '5px' : '15px'}>
          <VStack flex={1} gap={0}>
            <Box
              fontSize={'12px'}
              color={'txt-weak'}
              marginBottom={'5px'}
              whiteSpace={'nowrap'}
              w={'100%'}
            >
              Receive Address
              <span style={{ color: 'red' }}>*</span>
            </Box>
            <Input
              type="text"
              paddingLeft={'10px'}
              color="txt-normal"
              value={receiveAddress}
              onChange={(e) => setReceiveAddress(e.target.value)}
              borderColor={addressError ? 'red.500' : undefined}
            />
          </VStack>
        </HStack>
        {addressError && (
          <Box
            color={'red.500'}
            fontSize={'11px'}
            marginBottom={'15px'}
            paddingLeft={'2px'}
          >
            {addressError}
          </Box>
        )}
        <HStack justifyContent={'flex-end'} paddingBottom={'15px'}>
          <Button
            w={'100px'}
            h={'30px'}
            fontSize={'12px'}
            lineHeight={'30px'}
            borderRadius={'10px'}
            position={'relative'}
            bgColor={'#0F40F4'}
            color={'#fff'}
            onClick={handleNext}
          >
            NEXT
            <HiArrowLongRight />
          </Button>
        </HStack>
      </Box>
    );
  };

  // ── Step 2: From Network + Token Selects ────────────────────────
  const step2 = () => {
    if (isLoading && activeIndex === 1) {
      return (
        <Center py={'40px'}>
          <Spinner size="md" color={'blue.500'} />
        </Center>
      );
    }
    if (activeIndex === 1) {
      // Determine order status for Result component
      const orderStatus = orderData?.status;

      return (
        <Box>
          <HStack alignItems="flex-start" gap={'12px'} marginBottom={'15px'}>
            {/* ── From Chain Select ─────────────────────────────── */}
            <Box flex={1}>
              <Select.Root
                collection={chainCollection!}
                width="100%"
                gap={0}
                value={effectiveFromChainId ? [effectiveFromChainId.toString()] : []}
                onValueChange={handleFromChainChange}
              >
                <Select.HiddenSelect />
                <Select.Label
                  fontSize={'13px'}
                  color={'txt-weak'}
                  marginBottom={'5px'}
                >
                  From Networks
                </Select.Label>
                <Select.Control>
                  <Select.Trigger>
                    {fromSelectedChain ? (
                      <HStack gap={'8px'}>
                        <Image
                          src={fromSelectedChain.chain_icon || '/images/default-token-icon.png'}
                          alt={fromSelectedChain.name}
                          {...chainIconSize}
                          borderRadius={'full'}
                          marginLeft={'8px'}
                        />
                        <Text fontSize={'13px'}>{fromSelectedChain.name}</Text>
                      </HStack>
                    ) : (
                      <Select.ValueText placeholder="Select network" />
                    )}
                  </Select.Trigger>
                  <Select.IndicatorGroup>
                    <Select.Indicator marginRight={'8px'} />
                  </Select.IndicatorGroup>
                </Select.Control>
                <Portal>
                  <Select.Positioner>
                    <Select.Content>
                      {chainCollection!.items.map((item) => {
                        const chain = chainsMap[Number(item.value)];
                        return (
                          <Select.Item item={item} key={item.value} padding={'5px 0'}>
                            <HStack gap={'8px'}>
                              <Image
                                src={chain?.chain_icon || '/images/default-token-icon.png'}
                                alt={item.label}
                                {...chainIconSize}
                                borderRadius={'full'}
                                marginLeft={'8px'}
                              />
                              <Text fontSize={'13px'}>{item.label}</Text>
                            </HStack>
                            <Select.ItemIndicator marginRight={'8px'} />
                          </Select.Item>
                        );
                      })}
                    </Select.Content>
                  </Select.Positioner>
                </Portal>
              </Select.Root>
            </Box>
            {/* ── From Token Select ─────────────────────────────── */}
            <Box flex={1}>
              <Select.Root
                collection={fromTokenCollection!}
                width="100%"
                gap={0}
                value={displayFromTokenKey ? [displayFromTokenKey] : []}
                onValueChange={handleFromTokenChange}
                key={effectiveFromChainId}
              >
                <Select.HiddenSelect />
                <Select.Label
                  fontSize={'13px'}
                  color={'txt-weak'}
                  marginBottom={'5px'}
                >
                  Tokens
                </Select.Label>
                <Select.Control>
                  <Select.Trigger>
                    {fromSelectedToken ? (
                      <HStack gap={'8px'}>
                        <Image
                          src={fromSelectedToken.logo}
                          alt={fromSelectedToken.symbol}
                          {...tokenIconSize}
                          borderRadius={'full'}
                          marginLeft={'8px'}
                        />
                        <Text fontSize={'13px'}>{fromSelectedToken.symbol}</Text>
                      </HStack>
                    ) : (
                      <Select.ValueText placeholder="Select token" />
                    )}
                  </Select.Trigger>
                  <Select.IndicatorGroup>
                    <Select.Indicator marginRight={'8px'} />
                  </Select.IndicatorGroup>
                </Select.Control>
                <Portal>
                  <Select.Positioner>
                    <Select.Content>
                      {fromTokenCollection!.items.map((item) => {
                        const tok = fromEnrichedTokens.find(
                          (t) => `${effectiveFromChainId}:${t.symbol}` === item.value,
                        );
                        return (
                          <Select.Item item={item} key={item.value} padding={'5px 0'}>
                            <HStack gap={'8px'}>
                              <Image
                                src={tok!.logo}
                                alt={item.label}
                                {...tokenIconSize}
                                borderRadius={'full'}
                                marginLeft={'8px'}
                              />
                              <Text fontSize={'13px'}>{item.label}</Text>
                            </HStack>
                            <Select.ItemIndicator marginRight={'8px'} />
                          </Select.Item>
                        );
                      })}
                    </Select.Content>
                  </Select.Positioner>
                </Portal>
              </Select.Root>
            </Box>
          </HStack>
          <VStack>
            {/* Loading spinner for quote */}
            {quoteLoading && (
              <Center py={2}>
                <Spinner size="sm" color={'blue.500'} />
              </Center>
            )}
            {/* Quote error */}
            {quoteError && !quoteLoading && (
              <Box
                w={'100%'}
                color={'red.500'}
                fontSize={'12px'}
                textAlign={'center'}
                padding={'4px 0'}
                marginBottom={'8px'}
              >
                {quoteError}
              </Box>
            )}
            <Box>Scan the QR code or copy the address to transfer</Box>
            <Box
              w={'160px'}
              h={'160px'}
              border={'1px solid #BBBBBB'}
              backgroundColor={'#fff'}
              borderRadius={'5px'}
              padding={'10px'}
              position={'relative'}
            >
              {qrCodeUrl ? (
                <Image src={qrCodeUrl} alt="QR Code" w={'140px'} h={'140px'} />
              ) : (
                <Box w={'140px'} h={'140px'} />
              )}
              <Box
                position={'absolute'}
                w={'36px'}
                h={'36px'}
                borderRadius={'36px'}
                backgroundColor={'#fff'}
                left={'50%'}
                top={'50%'}
                transform={'translate3d(-50%,-50%,0)'}
              >
                <Image
                  src={fromSelectedChain?.chain_icon || '/images/default-token-icon.png'}
                  alt="From chain"
                  w={'24px'}
                  h={'24px'}
                  position={'absolute'}
                  left={'50%'}
                  top={'50%'}
                  transform={'translate3d(-50%,-50%,0)'}
                  borderRadius={'full'}
                />
                <Image
                  src={fromSelectedToken?.logo || '/images/default-token-icon.png'}
                  alt="From token"
                  w={'10px'}
                  h={'10px'}
                  position={'absolute'}
                  bottom={'5px'}
                  right={'5px'}
                  borderRadius={'full'}
                />
              </Box>
            </Box>
            <Box color={'txt-normal'} padding={'4px 0'}>
              {displayAddress || 'Waiting for deposit address...'}
            </Box>
            <Button
              marginBottom={'15px'}
              padding={'0 20px'}
              h={'30px'}
              fontSize={'12px'}
              borderRadius={'30px'}
              onClick={handleCopyAddress}
              disabled={!displayAddress}
            >
              <PiCopy style={{ width: '14px', height: '14px' }} />
              {copied ? 'Copied!' : 'Copy Address'}
            </Button>
            {/* {metaMaskDeepLink && (
              <Button
                marginBottom={'10px'}
                padding={'0 20px'}
                h={'30px'}
                fontSize={'12px'}
                borderRadius={'30px'}
                backgroundColor={'#1C8234'}
                color={'white'}
                onClick={handleOpenMetaMask}
              >
                Open in MetaMask
              </Button>
            )} */}
            <Box
              w={'100%'}
              color={'txt-weak'}
              padding={'13px 12px'}
              backgroundColor={'rgba(239,239,239,.59)'}
              borderRadius={'6px'}
              fontSize={'12px'}
              marginBottom={'20px'}
            >
              <HStack justifyContent={'space-between'} gap={0} marginBottom={'6px'}>
                <HStack gap={0}>
                  <Box color={'txt-light'} marginRight={'4px'}>
                    <AiOutlineDollarCircle />
                  </Box>
                  Price impact
                </HStack>
                <HStack gap={0}>
                  <Box marginRight={'5px'}>
                    {quoteLoading ? 'Loading...' : txInfo?.priceImpact ?? '-'}
                  </Box>
                  <ToggleTip content="The total fee impact including bridge fee, gas fee, and swap fee.">
                    <Button variant="ghost" h="22px" minW={0}>
                      <LuInfo style={{ width: '14px', height: '14px' }} />
                    </Button>
                  </ToggleTip>
                  <Box
                    cursor="pointer"
                    w={'14px'}
                    h={'14px'}
                    onClick={() => setIsExpanded(!isExpanded)}
                    transition="transform 0.2s"
                    transform={isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'}
                    marginLeft={'6px'}
                  >
                    <TiArrowSortedDown style={{ width: '14px', height: '14px' }} />
                  </Box>
                </HStack>
              </HStack>
              {isExpanded && (
                <>
                  <HStack justifyContent={'space-between'} gap={0} marginBottom={'6px'}>
                    <HStack gap={0}>
                      <Box color={'txt-light'} marginRight={'4px'}>
                        <AiOutlinePercentage />
                      </Box>
                      Slippage
                    </HStack>
                    <HStack gap={0}>
                      <Box marginRight={'5px'}>
                        {quoteLoading ? 'Loading...' : txInfo?.slippage ?? '-'}
                      </Box>
                      <ToggleTip content="Slippage tolerance for this quote.">
                        <Button variant="ghost" h="22px" minW={0}>
                          <LuInfo style={{ width: '14px', height: '14px' }} />
                        </Button>
                      </ToggleTip>
                      <Box
                        w={'14px'}
                        h={'14px'}
                        marginLeft={'6px'}
                      ></Box>
                    </HStack>
                  </HStack>
                  <HStack justifyContent={'space-between'} gap={0} marginBottom={'10px'}>
                    <HStack gap={0}>
                      <Box color={'txt-light'} marginRight={'4px'}>
                        <IoMdTime />
                      </Box>
                      Est. Time
                    </HStack>
                    <HStack>
                      <Box h="22px">
                        {quoteLoading ? 'Loading...' : txInfo?.estimatedTime ?? '-'}
                      </Box>
                      <Box
                        w={'14px'}
                        h={'14px'}
                        marginLeft={'6px'}
                      ></Box>
                    </HStack>
                  </HStack>
                  <HStack
                    gap={0}
                    padding={'8px 10px'}
                    backgroundColor={'rgba(252,202,0,.13)'}
                    borderRadius={'5px'}
                  >
                    <RiErrorWarningFill
                      style={{ width: '20px', height: '20px', color: 'FCCA00', flexShrink: 0 }}
                    />
                    <Box lineHeight={'1.2'} paddingLeft={'10px'}>
                      Sending the wrong token or from a different network may result in a loss of
                      funds.
                    </Box>
                  </HStack>
                </>
              )}
            </Box>
          </VStack>
          {showOrderResult && orderStatus ? (
            <SdaResult value={orderStatus} />
          ) : showDemoResult ? (
            <SdaResult value={'set'} />
          ) : null}
        </Box>
      );
    }
    return null;
  };

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
        {/* ── Header ────────────────────────────────────────────── */}
        <HStack
          alignItems={'center'}
          justifyContent={'flex-start'}
          h={'30px'}
          gap={0}
          padding={'12px 0'}
          boxSizing={'content-box'}
        >
          <Image
            src={'/images/app_icon_192.png'}
            alt="wheelx logo"
            w={'24px'}
            h={'24px'}
            borderRadius={'full'}
            marginRight={'5px'}
          />
          <Text
            fontSize={['12px', '14px', '16px']}
            color={'txt-light'}
            marginRight={'5px'}
            fontWeight={'bold'}
          >
            Smart Deposit
          </Text>
          <Text fontSize={['10px', '12px', '14px']} color={'txt-weak'} flex={1}>
            Demo
          </Text>
          <HStack
            gap={0}
            h={'28px'}
            borderRadius={'28px'}
            border={'1px solid #BBBBBB'}
            padding={'0 5px'}
          >
            {['Recipient', 'Deposit'].map((item, index) => (
              <HStack
                key={index}
                gap={0}
                h={'20px'}
                padding={'0 5px'}
                borderRadius={'20px'}
                background={activeIndex === index ? '#0F40F5' : 'transparent'}
                cursor={index === 0 ? "pointer" : 'default'}
                onClick={() => { if (index === 0) { setActiveIndex(index) } }}
              >
                <Text
                  w={'14px'}
                  h={'14px'}
                  borderRadius={'14px'}
                  backgroundColor={'#7F83F7'}
                  fontSize={'10px'}
                  textAlign={'center'}
                  lineHeight={'14px'}
                  marginRight={'4px'}
                  color={'#fff'}
                >
                  {index + 1}
                </Text>
                <Text
                  color={activeIndex === index ? '#fff' : '#000'}
                  fontSize={['10px', '12px', '14px']}
                >
                  {item}
                </Text>
              </HStack>
            ))}
          </HStack>
        </HStack>
        {step1()}
        {step2()}
        <Box
          position={'absolute'}
          h={'40px'}
          left={'15px'}
          right={'15px'}
          bottom={0}
          borderTop={'1px dashed #bbb'}
          textAlign={'center'}
          color={'txt-weak'}
          opacity={0.6}
          fontSize={'10px'}
          lineHeight={'40px'}
        >
          Powered By WheelX Smart Payment Service
        </Box>
      </Box>
    </Box>
  );
};

export default SDAPage;
