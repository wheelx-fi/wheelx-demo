/**
 * Solana chain configuration
 * Solana is NOT an EVM chain – it's handled by Dynamic SDK, not wagmi.
 */

export const SOLANA_MAINNET = {
  platform_id: 0,
  chain_id: 1151111081099710, // "solana" encoded
  name: 'Solana',
  network: 'mainnet' as const,
  symbol: 'SOL',
  decimals: 9,
  rpcUrl:
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
    'https://mainnet.helius-rpc.com/?api-key=7337bed2-6c3a-472f-b06f-9b2be0e1392f',
  explorerUrl: 'https://solscan.io/',
};

export const isSolanaChain = (chainId?: number): boolean => {
  return chainId === SOLANA_MAINNET.chain_id;
};
