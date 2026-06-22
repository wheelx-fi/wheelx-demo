import { create } from 'zustand';
import type { ChainInfo, SlippagePolicy, TokenInfo } from '../api/types';

interface ChainsStore {
  chains: ChainInfo[] | null;
  setChains: (chains: ChainInfo[]) => void;
  tokens: TokenInfo[] | null;
  setTokens: (tokens: TokenInfo[]) => void;
  slippagePolicies: SlippagePolicy[] | null;
  setSlippagePolicies: (policies: SlippagePolicy[]) => void;
}

export const useChainsStore = create<ChainsStore>((set) => ({
  chains: null,
  setChains: (chains) => set({ chains }),
  tokens: null,
  setTokens: (tokens) => set({ tokens }),
  slippagePolicies: null,
  setSlippagePolicies: (slippagePolicies) => set({ slippagePolicies }),
}));
