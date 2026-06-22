import type { ChainInfo, FeeLevel, SlippagePolicy, TokenInfo } from './types';

/** Minimum token info needed for slippage calculation. */
export type TokenInfoSnippet = Pick<
  TokenInfo,
  'fee_level' | 'symbol' | 'categories' | 'chain_id' | 'address' | 'tags'
>;

/** Minimum chain info needed for ETH-to-ETH bridge detection. */
export type ChainInfoSnippet = Pick<ChainInfo, 'chain_id' | 'eth_token'>;

// ── Constants ────────────────────────────────────────────────────────

/** Slippage for native-ETH to native-ETH cross-chain bridge. */
const ETH_TO_ETH_BRIDGE_SLIPPAGE = 0;

/**
 * Match a slippage policy by bridge flag and fee levels.
 *
 * @param policies  slippage_policies from the backend chain-info API
 * @param isBridge  true = cross-chain, false = same-chain
 * @param fromFeeLevel  fee_level of the from-token
 * @param toFeeLevel    fee_level of the to-token
 * @returns the matched policy, or null if not found
 */
export function matchSlippagePolicy(
  policies: SlippagePolicy[] | null,
  isBridge: boolean,
  fromFeeLevel: FeeLevel,
  toFeeLevel: FeeLevel,
): SlippagePolicy | null {
  if (!policies || policies.length === 0) return null;
  return (
    policies.find(
      (p) =>
        p.bridge === isBridge &&
        p.from_fee_level === fromFeeLevel &&
        p.to_fee_level === toFeeLevel,
    ) || null
  );
}

/**
 * Get the default slippage (in bips) for a token pair.
 *
 * Priority:
 * 1. Matched fee_level policy → policy.default_slippage
 * 2. Fallback: 100 bips same-chain, 200 bips cross-chain
 */
export function getDefaultSlippage(
  policy: SlippagePolicy | null,
  isBridge: boolean,
): number {
  if (policy) return policy.default_slippage;
  // Fallback values
  return isBridge ? 200 : 100;
}

/**
 * Detect whether the token pair forms a native-ETH to native-ETH cross-chain bridge.
 *
 * A token is considered native ETH if either:
 * - Its `address` matches the chain's `eth_token`
 * - Its `tags` array includes `"native"`
 */
export function isETHtoETHBridge(
  fromTokenInfo: TokenInfoSnippet,
  toTokenInfo: TokenInfoSnippet,
  chains: ChainInfoSnippet[],
): boolean {
  // Must be cross-chain
  if (fromTokenInfo.chain_id === toTokenInfo.chain_id) return false;

  const fromChain = chains.find((c) => c.chain_id === fromTokenInfo.chain_id);
  const toChain = chains.find((c) => c.chain_id === toTokenInfo.chain_id);

  if (!fromChain || !toChain) return false;

  const fromIsETH =
    fromTokenInfo.address === fromChain.eth_token ||
    fromTokenInfo.tags?.includes('native');
  const toIsETH =
    toTokenInfo.address === toChain.eth_token ||
    toTokenInfo.tags?.includes('native');

  return fromIsETH && toIsETH;
}

/**
 * Calculate the auto-slippage value (in bips) for the current from/to token pair.
 *
 * Priority:
 * 1. ETH-to-ETH cross-chain bridge → 0 bips
 * 2. Stablecoin-to-stablecoin → 10 bips same-chain / 50 bips cross-chain
 * 3. fee_level policy matching → policy.default_slippage
 * 4. Fallback → 100 bips same-chain / 200 bips cross-chain
 *
 * @returns slippage in bips (e.g. 100 = 1%)
 */
export function calculateAutoSlippage(
  policies: SlippagePolicy[] | null,
  fromTokenInfo: TokenInfoSnippet | null,
  toTokenInfo: TokenInfoSnippet | null,
  chains: ChainInfoSnippet[],
): number {
  if (!fromTokenInfo || !toTokenInfo) {
    return 200; // safe fallback for cross-chain (most common for deposit)
  }

  const isBridge = fromTokenInfo.chain_id !== toTokenInfo.chain_id;

  // ── ① ETH-to-ETH cross-chain bridge ──────────────────────────────
  if (isBridge && isETHtoETHBridge(fromTokenInfo, toTokenInfo, chains)) {
    return ETH_TO_ETH_BRIDGE_SLIPPAGE; // 0 bips
  }

  // ── ② Stablecoin pair ────────────────────────────────────────────
  const fromIsStable = fromTokenInfo.categories?.includes('stablecoin') ?? false;
  const toIsStable = toTokenInfo.categories?.includes('stablecoin') ?? false;
  if (fromIsStable && toIsStable) {
    return isBridge ? 50 : 10; // 0.5% cross-chain, 0.1% same-chain
  }

  // ── ③ fee_level policy matching ──────────────────────────────────
  const fromFeeLevel: FeeLevel = fromTokenInfo.fee_level ?? null;
  const toFeeLevel: FeeLevel = toTokenInfo.fee_level ?? null;

  const matched = matchSlippagePolicy(
    policies,
    isBridge,
    fromFeeLevel,
    toFeeLevel,
  );
  return getDefaultSlippage(matched, isBridge);
}
