export const BASE_API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://dev-api.wheelx.fi';

export const CHAIN_INFO_URL = `${BASE_API_URL}/v1/chain-info`;

export const DEPOSIT_ADDRESS_CONFIG_URL = `${BASE_API_URL}/v1/deposit-address-config`;
