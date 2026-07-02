import type { ChainInfo } from '../api/types';

/** Ethereum chain ID (mainnet) */
export const ETH_CHAIN_ID = 1;

/** Zero address used as from_address in quote requests */
export const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

// ── Custom chain/token not returned by backend API ──────────────────────
/** Tron mainnet chain ID (not returned by backend) */
export const CUSTOM_CHAIN_ID = 728126428;

export const CUSTOM_CHAIN: ChainInfo = {
  name: 'Tron',
  rpc_url: '',
  rpc_fallback: [],
  chain_icon: 'https://demo.wheelx.fi/images/728126428.png',
  chain_id: CUSTOM_CHAIN_ID,
  eth_token: NULL_ADDRESS,
  support_kline: false,
  is_popular: false,
  outbound: false,
  inbound: true,
};

export const CUSTOM_TOKEN = {
  symbol: 'USDT',
  name: 'Tether USD',
  logo: 'https://wheelx.fi/images/tokens/usdt.png',
  address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
  decimals: 6,
};
