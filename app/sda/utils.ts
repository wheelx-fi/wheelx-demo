import type { SDAQuoteResponse } from '../api/types';

/** Format price impact info into a display string */
export function formatPriceImpact(priceImpact: SDAQuoteResponse['price_impact']): string {
  const bridgeFee = parseFloat(priceImpact.bridge_fee) || 0;
  const dstGasFee = parseFloat(priceImpact.dst_gas_fee) || 0;
  const swapFee = parseFloat(priceImpact.swap_fee) || 0;
  const totalFee = bridgeFee + dstGasFee + swapFee;

  if (totalFee === 0) return 'Free';
  return `-${totalFee.toFixed(2)}%`;
}

/** Format seconds to human-readable time string */
export function formatEstimatedTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (secs === 0) return `${mins} min${mins > 1 ? 's' : ''}`;
  return `${mins} min ${secs}s`;
}
