import { defineChain } from 'viem';

/**
 * Custom chain definitions for chains NOT included in wagmi/chains.
 * All chains below are mainnet — testnets excluded.
 */

// ── Ethereum (custom override with more RPC URLs) ──────────────────────
export const mainnet = defineChain({
  id: 1,
  name: 'Ethereum',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  blockTime: 12_000,
  rpcUrls: {
    default: {
      http: [
        'https://eth.merkle.io',
        'https://eth-mainnet.public.blastapi.io',
        'https://eth.llamarpc.com',
        'https://rpc.poolz.finance/eth',
        'https://eth.rpc.blxrbdn.com',
        'https://rpc.eth.gateway.fm',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'Etherscan',
      url: 'https://etherscan.io',
      apiUrl: 'https://api.etherscan.io/api',
    },
  },
  contracts: {
    ensUniversalResolver: {
      address: '0xeeeeeeee14d718c2b47d9923deab1335e144eeee',
      blockCreated: 23_085_558,
    },
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 14_353_601,
    },
  },
});

// ── Katana (747474) ──────────────────────────────────────────────────
export const katana = defineChain({
  id: 747474,
  name: 'Katana',
  network: 'katana',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.katana.network'] } },
  blockExplorers: {
    default: {
      name: 'Katana Explorer',
      url: 'https://explorer.katanarpc.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 1898013,
    },
  },
  testnet: false,
});

// ── HyperEVM (999) ───────────────────────────────────────────────────
export const hyperevm = defineChain({
  id: 999,
  name: 'HyperEVM',
  network: 'HYPE',
  nativeCurrency: { name: 'HYPER', symbol: 'HYPER', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.hyperliquid.xyz/evm', 'https://rpc.hypurrscan.io'],
    },
  },
  blockExplorers: { default: { name: 'Purrsec', url: 'https://hyperevmscan.io' } },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 13051,
    },
  },
  testnet: false,
});

// ── Arc (5042) ───────────────────────────────────────────────────────
export const arcMainnet = defineChain({
  id: 5042,
  name: 'Arc',
  network: 'Arc',
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
  rpcUrls: { default: { http: ['https://lb.drpc.live/arc'] } },
  blockExplorers: {
    default: { name: 'Arc Explorer', url: 'https://explorer.arc.io' },
  },
  testnet: false,
});

// ── Stable (988) ─────────────────────────────────────────────────────
export const stable = defineChain({
  id: 988,
  name: 'Stable',
  network: 'stable',
  nativeCurrency: { name: 'USD Coin', symbol: 'gUSDT', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.stable.xyz'] } },
  blockExplorers: { default: { name: 'Stablescan', url: 'https://stablescan.xyz' } },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 1898013,
    },
  },
  testnet: false,
});

// ── Monad (143) ──────────────────────────────────────────────────────
export const monad = defineChain({
  id: 143,
  name: 'Monad',
  blockTime: 400,
  nativeCurrency: { name: 'Monad', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.monad.xyz', 'https://rpc1.monad.xyz'],
      webSocket: ['wss://rpc.monad.xyz', 'wss://rpc1.monad.xyz'],
    },
  },
  blockExplorers: {
    default: { name: 'MonadVision', url: 'https://monadvision.com' },
    monadscan: {
      name: 'Monadscan',
      url: 'https://monadscan.com',
      apiUrl: 'https://api.monadscan.com/api',
    },
  },
  testnet: false,
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 9248132,
    },
  },
});

// ── Metis (1088) ─────────────────────────────────────────────────────
export const metis = defineChain({
  id: 1088,
  name: 'Metis',
  nativeCurrency: { decimals: 18, name: 'Metis', symbol: 'METIS' },
  rpcUrls: {
    default: {
      http: [
        'https://metis.api.onfinality.io/public',
        'https://metis-public.nodies.app',
        'https://metis-andromeda.rpc.thirdweb.com',
        'https://metis.drpc.org',
      ],
      webSocket: ['wss://metis-rpc.publicnode.com', 'wss://metis.drpc.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Metis Explorer',
      url: 'https://explorer.metis.io',
      apiUrl: 'https://api.routescan.io/v2/network/mainnet/evm/1088/etherscan/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 2338552,
    },
  },
});

// ── Polygon zkEVM (1101) ─────────────────────────────────────────────
export const polygonZkEvm = defineChain({
  id: 1101,
  name: 'Polygon zkEVM',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://zkevm-rpc.com'] } },
  blockExplorers: {
    default: {
      name: 'PolygonScan',
      url: 'https://www.oklink.com/polygon-zkevm',
      apiUrl: 'https://api-zkevm.polygonscan.com/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 57746,
    },
  },
});

// ── Tempo (4217) ─────────────────────────────────────────────────────
export const tempo = defineChain({
  id: 4217,
  name: 'Tempo',
  network: 'Tempo',
  nativeCurrency: { name: 'USD', symbol: 'USD', decimals: 6 },
  rpcUrls: { default: { http: ['https://rpc.tempo.xyz'] } },
  blockExplorers: {
    default: { name: 'Tempo Explorer', url: 'https://explore.tempo.xyz' },
  },
  testnet: false,
});

// ── MegaETH (4326) ───────────────────────────────────────────────────
export const megaeth = defineChain({
  id: 4326,
  name: 'MegaETH',
  network: 'MegaETH',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://mainnet.megaeth.com/rpc'] } },
  blockExplorers: {
    default: {
      name: 'MegaETH Explorer',
      url: 'https://megaeth.blockscout.com/',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 0,
    },
  },
  testnet: false,
});

// ── Pharos (1672) ────────────────────────────────────────────────────
export const pharos = defineChain({
  id: 1672,
  name: 'Pharos',
  network: 'pharos',
  nativeCurrency: { name: 'PROS', symbol: 'PROS', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.pharos.xyz'] } },
  blockExplorers: { default: { name: 'Pharos', url: 'https://pharosscan.xyz' } },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 1898013,
    },
  },
  testnet: false,
});

// ── Kite (2366) ──────────────────────────────────────────────────────
export const kite = defineChain({
  id: 2366,
  name: 'Kite',
  network: 'kite',
  nativeCurrency: { name: 'Kite', symbol: 'Kite', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.gokite.ai/'] } },
  blockExplorers: {
    default: { name: 'Kite Explorer', url: 'https://kitescan.ai/' },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 1898013,
    },
  },
  testnet: false,
});

// ── Plasma (9745) ────────────────────────────────────────────────────
export const plasma = defineChain({
  id: 9745,
  name: 'Plasma',
  network: 'Plasma',
  nativeCurrency: { name: 'Plasma', symbol: 'XPL', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.plasma.to'] } },
  blockExplorers: {
    default: { name: 'Plasma Explorer', url: 'https://plasmascan.to' },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 1,
    },
  },
  testnet: false,
});

// ── RARI (1380012617) ────────────────────────────────────────────────
export const rari = defineChain({
  id: 1380012617,
  name: 'RARI',
  network: 'rari',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://mainnet.rpc.rarichain.org/http'] } },
  blockExplorers: {
    default: {
      name: 'RARI Explorer',
      url: 'https://mainnet.explorer.rarichain.org/',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 1898013,
    },
  },
  testnet: false,
});
