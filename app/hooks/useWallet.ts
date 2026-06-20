'use client';

import { useAccount, useDisconnect, useBalance } from 'wagmi';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { formatEther } from 'viem';

export function useWallet() {
  const { setShowAuthFlow } = useDynamicContext();
  const { address, isConnected, chainId } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });

  const openConnectModal = () => {
    setShowAuthFlow(true);
  };

  const disconnectWallet = () => {
    disconnect();
  };

  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : null;

  return {
    address,
    shortAddress,
    isConnected,
    chainId,
    balance: balance ? Number(formatEther(balance.value)).toFixed(4) : null,
    symbol: balance?.symbol ?? 'ETH',
    openConnectModal,
    disconnectWallet,
  };
}
