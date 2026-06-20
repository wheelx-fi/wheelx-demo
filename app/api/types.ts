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
