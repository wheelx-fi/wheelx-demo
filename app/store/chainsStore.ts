import { create } from 'zustand';
import type { ChainInfo, TokenInfo } from '../api/types';

interface ChainsStore {
  chains: ChainInfo[] | null;
  setChains: (chains: ChainInfo[]) => void;
  tokens: TokenInfo[] | null;
  setTokens: (tokens: TokenInfo[]) => void;
}

export const useChainsStore = create<ChainsStore>((set) => ({
  chains: null,
  setChains: (chains) => set({ chains }),
  tokens: null,
  setTokens: (tokens) => set({ tokens }),
}));
