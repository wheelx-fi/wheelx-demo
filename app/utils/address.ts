import { isAddress } from 'viem';

/**
 * Validate an EVM address: must start with 0x, 42 characters long,
 * and pass viem's checksum validation.
 */
export function isValidEVMAddress(address: string): boolean {
  if (
    !address ||
    typeof address !== 'string' ||
    !address.startsWith('0x') ||
    address.length !== 42
  ) {
    return false;
  }
  return isAddress(address);
}

/**
 * Validate a Solana address: base58 encoded, 32-44 characters long.
 * Base58 excludes 0 O I l to avoid visual confusion.
 */
export function isValidSolanaAddress(address: string): boolean {
  if (!address || typeof address !== 'string') return false;
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  return base58Regex.test(address);
}

/**
 * Get the expected address type label for a chain.
 */
export function getChainAddressTypeLabel(isSolana: boolean): string {
  return isSolana ? 'Solana base58 address' : 'EVM (0x...) address';
}
