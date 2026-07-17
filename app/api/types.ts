export type Tag = 'pin' | 'top' | 'cert' | 'native';
export type FeeLevel = 'Group1' | 'Group2' | null;

export interface TokenInfo {
  name: string;
  address: `0x${string}`;
  chain_id: number;
  decimals: number;
  symbol: string;
  logo: string;
  tags: Tag[];
  support_kline?: boolean;
  token_type?: string;
  categories?: string[];
  chain_icon?: string;
  platform_id?: number;
  platform_type?: string[];
  isSolana?: boolean;
  fee_level?: FeeLevel;
}

export interface ChainInfo {
  name: string;
  rpc_url: string;
  rpc_fallback: string[];
  chain_icon: string;
  chain_id: number;
  eth_token: `0x${string}`;
  support_kline: boolean;
  is_popular: boolean;
  outbound: boolean;
  inbound: boolean;
  is_testnet?: boolean;
  platform_id?: number;
  support_sponsor_gas?: boolean;
}

export interface SlippagePolicy {
  bridge: boolean;
  from_fee_level: FeeLevel;
  to_fee_level: FeeLevel;
  default_slippage: number;
  min_slippage: number;
  max_slippage: number;
  refresh_interval: number;
  notice_rounds?: number;
}

export interface Prediction {
  chains: ChainInfo[];
  tokens: TokenInfo[];
}

export interface ChainsAndTokens {
  chains: ChainInfo[];
  tokens: TokenInfo[];
  slippage_policies?: SlippagePolicy[];
  deposit_platforms: {
    prediction: Prediction;
  };
}

// ── Deposit Address Config Types ────────────────────────────────────

/** A single chain entry in the /v1/deposit-address-config response. */
export interface DepositAddressConfigChain {
  id: number;
  from_enable: boolean;
  to_enable: boolean;
  chain: number;
  created_at: string;
  updated_at: string;
  chain_info: ChainInfo;
}

/** A single token entry in the /v1/deposit-address-config response. */
export interface DepositAddressConfigToken {
  id: number;
  direction: 'from' | 'to';
  token_name: string;
  token_address: string;
  enable: boolean;
  chain: number;
  created_at: string;
  updated_at: string;
  token_info: TokenInfo;
}

/** Transformed deposit config stored in chainsStore (flattened from API). */
export interface DepositToken {
  chain_id: number;
  address: string;
  symbol: string;
}

/** Raw response from /v1/deposit-address-config. */
export interface DepositAddressConfigResponse {
  chains: DepositAddressConfigChain[];
  tokens: DepositAddressConfigToken[];
  slippage_policies?: SlippagePolicy[];
}

// ── SDA Quote Types ────────────────────────────────────────────────

export interface SDAQuoteRequest {
  from_chain: number;
  to_chain: number;
  from_token: string;
  to_token: string;
  from_address: string;
  to_address: string;
  amount: string;
  slippage: number;
  to_platform_id: number;
  sponsor_gas?: boolean;
  quote_only?: boolean;
  use_deposit_address: boolean;
  exact_out?: boolean;
}

export interface SDAQuoteResponse {
  request_id?: string;
  amount_out: string;
  amount_in?: string;
  approve?: {
    token: string;
    spender: string;
    amount: string;
  } | null;
  router_type?: string;
  points: number | string;
  estimated_time: number;
  fee: string;
  min_receive: string;
  price_impact: {
    bridge_fee: string;
    dst_gas_fee: string;
    swap_fee: string;
    before_discount_fee: string;
    discount_percentage?: string;
  };
  recipient: string;
  deposit_address?: string;
  router: string;
  slippage: number;
  quote_message: string | null;
  tx: {
    chainId: number;
    data: string;
    to: string;
    value: string;
    gas?: string | null;
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
    message?: string;
    sender?: string;
    tx?: string;
  } | null;
  routes?: Array<{
    name: string;
    logo: string;
  }>;
  gas_fee?: string | null;
  quotes?: unknown;
}

// ── SDA Order Types ─────────────────────────────────────────────────

export type OrderStatus = 'Open' | 'Filled' | 'Refund' | 'Failed';

export interface OrderDetail {
  data: string;
  fill_block: number | null;
  fill_timestamp: string | null;
  fill_tx_hash: string | null;
  from_amount: string;
  from_chain: number;
  from_token: string;
  open_block: number;
  open_timestamp: string;
  open_tx_hash: string;
  order_id: string;
  status: OrderStatus;
  to_address: string;
  to_chain: number;
  to_token: string;
  to_amount: string;
  amount_out?: string;
  from_token_info: TokenInfo | null;
  to_token_info: TokenInfo | null;
  points: number;
  reward_type: string;
  reward_value: object;
  to_platform_id: number;
}
