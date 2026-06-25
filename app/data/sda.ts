export interface TokenInfo {
  chainId: number;
  tokenAddress: string;
  tokenSymbol: string;
}

export interface SdaData {
  fromChain: number[];
  toChain: number[];
  fromToken: TokenInfo[];
  toToken: TokenInfo[];
}

export const sda = (): SdaData => {
  return {
    fromChain: [
      1, 10, 56, 137, 143, 988, 999, 1868, 2818, 4217, 4326, 8453, 9745, 42161, 43114, 57073, 59144,
      1151111081099710,
    ],
    fromToken: [
      // Ethereum (1)
      {
        chainId: 1,
        tokenSymbol: 'WETH',
        tokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      },
      {
        chainId: 1,
        tokenSymbol: 'USDe',
        tokenAddress: '0x4c9edd5852cd905f086c759e8383e09bff1e68b3',
      },
      {
        chainId: 1,
        tokenSymbol: 'USDC',
        tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      },
      {
        chainId: 1,
        tokenSymbol: 'USDT',
        tokenAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      },
      {
        chainId: 1,
        tokenSymbol: 'mUSD',
        tokenAddress: '0xaca92e438df0b2401ff60da7e4337b687a2435da',
      },
      {
        chainId: 1,
        tokenSymbol: 'DAI',
        tokenAddress: '0x6b175474e89094c44da98b954eedeac495271d0f',
      },
      {
        chainId: 1,
        tokenSymbol: 'PYUSD',
        tokenAddress: '0x6c3ea9036406852006290770bedfcaba0e23a0e8',
      },
      {
        chainId: 1,
        tokenSymbol: 'USDG',
        tokenAddress: '0xe343167631d89b6ffc58b88d6b7fb0228795491d',
      },
      {
        chainId: 1,
        tokenSymbol: 'ETH',
        tokenAddress: '0x0000000000000000000000000000000000000000',
      },
      // Optimism (10)
      {
        chainId: 10,
        tokenSymbol: 'WETH',
        tokenAddress: '0x4200000000000000000000000000000000000006',
      },
      {
        chainId: 10,
        tokenSymbol: 'USDC',
        tokenAddress: '0x0b2c639c533813f4aa9d7837caf62653d097ff85',
      },
      {
        chainId: 10,
        tokenSymbol: 'USDT',
        tokenAddress: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58',
      },
      {
        chainId: 10,
        tokenSymbol: 'ETH',
        tokenAddress: '0x0000000000000000000000000000000000000000',
      },
      // BNB Chain (56)
      {
        chainId: 56,
        tokenSymbol: 'USDC',
        tokenAddress: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
      },
      {
        chainId: 56,
        tokenSymbol: 'USDT',
        tokenAddress: '0x55d398326f99059ff775485246999027b3197955',
      },
      {
        chainId: 56,
        tokenSymbol: 'BNB',
        tokenAddress: '0x0000000000000000000000000000000000000000',
      },
      // Polygon (137)
      {
        chainId: 137,
        tokenSymbol: 'USDC.e',
        tokenAddress: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
      },
      {
        chainId: 137,
        tokenSymbol: 'USDC',
        tokenAddress: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
      },
      {
        chainId: 137,
        tokenSymbol: 'USDT',
        tokenAddress: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
      },
      // Monad (143)
      {
        chainId: 143,
        tokenSymbol: 'USDC',
        tokenAddress: '0x754704bc059f8c67012fed69bc8a327a5aafb603',
      },
      {
        chainId: 143,
        tokenSymbol: 'mUSD',
        tokenAddress: '0xaca92e438df0b2401ff60da7e4337b687a2435da',
      },
      {
        chainId: 143,
        tokenSymbol: 'MON',
        tokenAddress: '0x0000000000000000000000000000000000000000',
      },
      // Stable (988)
      {
        chainId: 988,
        tokenSymbol: 'USDT0',
        tokenAddress: '0x779ded0c9e1022225f8e0630b35a9b54be713736',
      },
      // HyperEVM (999)
      {
        chainId: 999,
        tokenSymbol: 'USD₮0',
        tokenAddress: '0xb8ce59fc3717ada4c02eadf9682a9e934f625ebb',
      },
      {
        chainId: 999,
        tokenSymbol: 'USDe',
        tokenAddress: '0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34',
      },
      {
        chainId: 999,
        tokenSymbol: 'USDC',
        tokenAddress: '0xb88339cb7199b77e23db6e890353e22632ba630f',
      },
      {
        chainId: 999,
        tokenSymbol: 'HYPE',
        tokenAddress: '0x0000000000000000000000000000000000000000',
      },
      // Soneium (1868)
      {
        chainId: 1868,
        tokenSymbol: 'USDC.e',
        tokenAddress: '0xba9986d2381edf1da03b0b9c1f8b00dc4aacc369',
      },
      {
        chainId: 1868,
        tokenSymbol: 'ETH',
        tokenAddress: '0x0000000000000000000000000000000000000000',
      },
      // Morph (2818)
      {
        chainId: 2818,
        tokenSymbol: 'ETH',
        tokenAddress: '0x0000000000000000000000000000000000000000',
      },
      // Tempo (4217)
      {
        chainId: 4217,
        tokenSymbol: 'USDC',
        tokenAddress: '0x20c000000000000000000000b9537d11c60e8b50',
      },
      // MegaETH (4326)
      {
        chainId: 4326,
        tokenSymbol: 'USDT',
        tokenAddress: '0xb8ce59fc3717ada4c02eadf9682a9e934f625ebb',
      },
      {
        chainId: 4326,
        tokenSymbol: 'USDm',
        tokenAddress: '0xfafddbb3fc7688494971a79cc65dca3ef82079e7',
      },
      {
        chainId: 4326,
        tokenSymbol: 'ETH',
        tokenAddress: '0x0000000000000000000000000000000000000000',
      },
      // Base (8453)
      {
        chainId: 8453,
        tokenSymbol: 'cbBTC',
        tokenAddress: '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf',
      },
      {
        chainId: 8453,
        tokenSymbol: 'WETH',
        tokenAddress: '0x4200000000000000000000000000000000000006',
      },
      {
        chainId: 8453,
        tokenSymbol: 'DEGEN',
        tokenAddress: '0x4ed4e862860bed51a9570b96d89af5e1b0efefed',
      },
      {
        chainId: 8453,
        tokenSymbol: 'USDT',
        tokenAddress: '0xfde4c96c8593536e31f229ea8f37b2ada2699bb2',
      },
      {
        chainId: 8453,
        tokenSymbol: 'USDC',
        tokenAddress: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
      },
      {
        chainId: 8453,
        tokenSymbol: 'ETH',
        tokenAddress: '0x0000000000000000000000000000000000000000',
      },
      // Plasma (9745)
      {
        chainId: 9745,
        tokenSymbol: 'USD₮0',
        tokenAddress: '0xb8ce59fc3717ada4c02eadf9682a9e934f625ebb',
      },
      {
        chainId: 9745,
        tokenSymbol: 'XPL',
        tokenAddress: '0x0000000000000000000000000000000000000000',
      },
      // Arbitrum (42161)
      {
        chainId: 42161,
        tokenSymbol: 'WETH',
        tokenAddress: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
      },
      {
        chainId: 42161,
        tokenSymbol: 'USDC',
        tokenAddress: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
      },
      {
        chainId: 42161,
        tokenSymbol: 'USDT',
        tokenAddress: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
      },
      {
        chainId: 42161,
        tokenSymbol: 'ETH',
        tokenAddress: '0x0000000000000000000000000000000000000000',
      },
      // Avalanche (43114)
      {
        chainId: 43114,
        tokenSymbol: 'USDC',
        tokenAddress: '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e',
      },
      {
        chainId: 43114,
        tokenSymbol: 'USDe',
        tokenAddress: '0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34',
      },
      // Ink (57073)
      {
        chainId: 57073,
        tokenSymbol: 'USDC',
        tokenAddress: '0x2d270e6886d130d724215a266106e6832161eaed',
      },
      {
        chainId: 57073,
        tokenSymbol: 'ETH',
        tokenAddress: '0x0000000000000000000000000000000000000000',
      },
      // Linea (59144)
      {
        chainId: 59144,
        tokenSymbol: 'mUSD',
        tokenAddress: '0xaca92e438df0b2401ff60da7e4337b687a2435da',
      },
      {
        chainId: 59144,
        tokenSymbol: 'USDC',
        tokenAddress: '0x176211869ca2b568f2a7d4ee941e073a821ee1ff',
      },
      {
        chainId: 59144,
        tokenSymbol: 'ETH',
        tokenAddress: '0x0000000000000000000000000000000000000000',
      },
      // Solana (1151111081099710)
      {
        chainId: 1151111081099710,
        tokenSymbol: 'PENGU',
        tokenAddress: '2zMMhcVQEXDtdE6vsFS7S7D5oUodfJHE8vd1gnBouauv',
      },
      {
        chainId: 1151111081099710,
        tokenSymbol: 'USDC',
        tokenAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      },
      {
        chainId: 1151111081099710,
        tokenSymbol: 'USDT',
        tokenAddress: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
      },
      {
        chainId: 1151111081099710,
        tokenSymbol: 'PYUSD',
        tokenAddress: '2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo',
      },
      {
        chainId: 1151111081099710,
        tokenSymbol: 'USDG',
        tokenAddress: '2u1tszSeqZ3qBWF3uNGPFc8TzMk2tdiwknnRMWGWjGWH',
      },
      {
        chainId: 1151111081099710,
        tokenSymbol: 'SOL',
        tokenAddress: '11111111111111111111111111111111',
      },
    ],
    toChain: [
      1, 10, 56, 137, 143, 988, 999, 1868, 2818, 4217, 4326, 8453, 9745, 42161, 43114, 57073, 59144,
      1151111081099710,
    ],
    toToken: [
      // Ethereum (1)
      {
        chainId: 1,
        tokenSymbol: 'WETH',
        tokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      },
      {
        chainId: 1,
        tokenSymbol: 'USDe',
        tokenAddress: '0x4c9edd5852cd905f086c759e8383e09bff1e68b3',
      },
      {
        chainId: 1,
        tokenSymbol: 'USDC',
        tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      },
      {
        chainId: 1,
        tokenSymbol: 'USDT',
        tokenAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      },
      {
        chainId: 1,
        tokenSymbol: 'mUSD',
        tokenAddress: '0xaca92e438df0b2401ff60da7e4337b687a2435da',
      },
      {
        chainId: 1,
        tokenSymbol: 'DAI',
        tokenAddress: '0x6b175474e89094c44da98b954eedeac495271d0f',
      },
      {
        chainId: 1,
        tokenSymbol: 'PYUSD',
        tokenAddress: '0x6c3ea9036406852006290770bedfcaba0e23a0e8',
      },
      {
        chainId: 1,
        tokenSymbol: 'USDG',
        tokenAddress: '0xe343167631d89b6ffc58b88d6b7fb0228795491d',
      },
      {
        chainId: 1,
        tokenSymbol: 'ETH',
        tokenAddress: '0x0000000000000000000000000000000000000000',
      },
      // Optimism (10)
      {
        chainId: 10,
        tokenSymbol: 'WETH',
        tokenAddress: '0x4200000000000000000000000000000000000006',
      },
      {
        chainId: 10,
        tokenSymbol: 'USDC',
        tokenAddress: '0x0b2c639c533813f4aa9d7837caf62653d097ff85',
      },
      {
        chainId: 10,
        tokenSymbol: 'USDT',
        tokenAddress: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58',
      },
      {
        chainId: 10,
        tokenSymbol: 'ETH',
        tokenAddress: '0x0000000000000000000000000000000000000000',
      },
      // BNB Chain (56)
      {
        chainId: 56,
        tokenSymbol: 'USDC',
        tokenAddress: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
      },
      {
        chainId: 56,
        tokenSymbol: 'USDT',
        tokenAddress: '0x55d398326f99059ff775485246999027b3197955',
      },
      {
        chainId: 56,
        tokenSymbol: 'BNB',
        tokenAddress: '0x0000000000000000000000000000000000000000',
      },
      // Polygon (137)
      {
        chainId: 137,
        tokenSymbol: 'USDC.e',
        tokenAddress: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
      },
      {
        chainId: 137,
        tokenSymbol: 'USDC',
        tokenAddress: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
      },
      {
        chainId: 137,
        tokenSymbol: 'USDT',
        tokenAddress: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
      },
      // Monad (143)
      {
        chainId: 143,
        tokenSymbol: 'USDC',
        tokenAddress: '0x754704bc059f8c67012fed69bc8a327a5aafb603',
      },
      {
        chainId: 143,
        tokenSymbol: 'mUSD',
        tokenAddress: '0xaca92e438df0b2401ff60da7e4337b687a2435da',
      },
      {
        chainId: 143,
        tokenSymbol: 'MON',
        tokenAddress: '0x0000000000000000000000000000000000000000',
      },
      // Stable (988)
      {
        chainId: 988,
        tokenSymbol: 'USDT0',
        tokenAddress: '0x779ded0c9e1022225f8e0630b35a9b54be713736',
      },
      // HyperEVM (999)
      {
        chainId: 999,
        tokenSymbol: 'USD₮0',
        tokenAddress: '0xb8ce59fc3717ada4c02eadf9682a9e934f625ebb',
      },
      {
        chainId: 999,
        tokenSymbol: 'USDe',
        tokenAddress: '0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34',
      },
      {
        chainId: 999,
        tokenSymbol: 'USDC',
        tokenAddress: '0xb88339cb7199b77e23db6e890353e22632ba630f',
      },
      {
        chainId: 999,
        tokenSymbol: 'HYPE',
        tokenAddress: '0x0000000000000000000000000000000000000000',
      },
      // Soneium (1868)
      {
        chainId: 1868,
        tokenSymbol: 'USDC.e',
        tokenAddress: '0xba9986d2381edf1da03b0b9c1f8b00dc4aacc369',
      },
      {
        chainId: 1868,
        tokenSymbol: 'ETH',
        tokenAddress: '0x0000000000000000000000000000000000000000',
      },
      // Morph (2818)
      {
        chainId: 2818,
        tokenSymbol: 'ETH',
        tokenAddress: '0x0000000000000000000000000000000000000000',
      },
      // Tempo (4217)
      {
        chainId: 4217,
        tokenSymbol: 'USDC',
        tokenAddress: '0x20c000000000000000000000b9537d11c60e8b50',
      },
      // MegaETH (4326)
      {
        chainId: 4326,
        tokenSymbol: 'USDT',
        tokenAddress: '0xb8ce59fc3717ada4c02eadf9682a9e934f625ebb',
      },
      {
        chainId: 4326,
        tokenSymbol: 'USDm',
        tokenAddress: '0xfafddbb3fc7688494971a79cc65dca3ef82079e7',
      },
      {
        chainId: 4326,
        tokenSymbol: 'ETH',
        tokenAddress: '0x0000000000000000000000000000000000000000',
      },
      // Base (8453)
      {
        chainId: 8453,
        tokenSymbol: 'cbBTC',
        tokenAddress: '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf',
      },
      {
        chainId: 8453,
        tokenSymbol: 'WETH',
        tokenAddress: '0x4200000000000000000000000000000000000006',
      },
      {
        chainId: 8453,
        tokenSymbol: 'DEGEN',
        tokenAddress: '0x4ed4e862860bed51a9570b96d89af5e1b0efefed',
      },
      {
        chainId: 8453,
        tokenSymbol: 'USDT',
        tokenAddress: '0xfde4c96c8593536e31f229ea8f37b2ada2699bb2',
      },
      {
        chainId: 8453,
        tokenSymbol: 'USDC',
        tokenAddress: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
      },
      {
        chainId: 8453,
        tokenSymbol: 'ETH',
        tokenAddress: '0x0000000000000000000000000000000000000000',
      },
      // Plasma (9745)
      {
        chainId: 9745,
        tokenSymbol: 'USD₮0',
        tokenAddress: '0xb8ce59fc3717ada4c02eadf9682a9e934f625ebb',
      },
      {
        chainId: 9745,
        tokenSymbol: 'XPL',
        tokenAddress: '0x0000000000000000000000000000000000000000',
      },
      // Arbitrum (42161)
      {
        chainId: 42161,
        tokenSymbol: 'WETH',
        tokenAddress: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
      },
      {
        chainId: 42161,
        tokenSymbol: 'USDC',
        tokenAddress: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
      },
      {
        chainId: 42161,
        tokenSymbol: 'USDT',
        tokenAddress: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
      },
      {
        chainId: 42161,
        tokenSymbol: 'ETH',
        tokenAddress: '0x0000000000000000000000000000000000000000',
      },
      // Avalanche (43114)
      {
        chainId: 43114,
        tokenSymbol: 'USDC',
        tokenAddress: '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e',
      },
      {
        chainId: 43114,
        tokenSymbol: 'USDe',
        tokenAddress: '0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34',
      },
      // Ink (57073)
      {
        chainId: 57073,
        tokenSymbol: 'USDC',
        tokenAddress: '0x2d270e6886d130d724215a266106e6832161eaed',
      },
      {
        chainId: 57073,
        tokenSymbol: 'ETH',
        tokenAddress: '0x0000000000000000000000000000000000000000',
      },
      // Linea (59144)
      {
        chainId: 59144,
        tokenSymbol: 'mUSD',
        tokenAddress: '0xaca92e438df0b2401ff60da7e4337b687a2435da',
      },
      {
        chainId: 59144,
        tokenSymbol: 'USDC',
        tokenAddress: '0x176211869ca2b568f2a7d4ee941e073a821ee1ff',
      },
      {
        chainId: 59144,
        tokenSymbol: 'ETH',
        tokenAddress: '0x0000000000000000000000000000000000000000',
      },
      // Solana (1151111081099710)
      {
        chainId: 1151111081099710,
        tokenSymbol: 'PENGU',
        tokenAddress: '2zMMhcVQEXDtdE6vsFS7S7D5oUodfJHE8vd1gnBouauv',
      },
      {
        chainId: 1151111081099710,
        tokenSymbol: 'USDC',
        tokenAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      },
      {
        chainId: 1151111081099710,
        tokenSymbol: 'USDT',
        tokenAddress: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
      },
      {
        chainId: 1151111081099710,
        tokenSymbol: 'PYUSD',
        tokenAddress: '2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo',
      },
      {
        chainId: 1151111081099710,
        tokenSymbol: 'USDG',
        tokenAddress: '2u1tszSeqZ3qBWF3uNGPFc8TzMk2tdiwknnRMWGWjGWH',
      },
      {
        chainId: 1151111081099710,
        tokenSymbol: 'SOL',
        tokenAddress: '11111111111111111111111111111111',
      },
      {
        chainId: 1151111081099710,
        tokenSymbol: 'DSF',
        tokenAddress: '3o2GCwpoUTr6CezPdvMYHmxY9wcfVr5TU1oTb1uLJGVm',
      },
    ],
  };
};
