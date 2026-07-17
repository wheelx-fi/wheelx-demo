import { create } from 'zustand';
import type { ChainInfo, DepositToken, SlippagePolicy, TokenInfo } from '../api/types';

export interface DepositConfig {
  fromChainIds: number[];
  toChainIds: number[];
  fromTokens: DepositToken[];
  toTokens: DepositToken[];
}

interface ChainsStore {
  chains: ChainInfo[] | null;
  setChains: (chains: ChainInfo[]) => void;
  tokens: TokenInfo[] | null;
  setTokens: (tokens: TokenInfo[]) => void;
  slippagePolicies: SlippagePolicy[] | null;
  setSlippagePolicies: (policies: SlippagePolicy[]) => void;
  depositConfig: DepositConfig | null;
  setDepositConfig: (config: DepositConfig) => void;
}

export const useChainsStore = create<ChainsStore>((set) => ({
  chains: null,
  setChains: (chains) => set({ chains }),
  tokens: null,
  setTokens: (tokens) => set({ tokens }),
  slippagePolicies: null,
  setSlippagePolicies: (slippagePolicies) => set({ slippagePolicies }),
  depositConfig: null,
  setDepositConfig: (depositConfig) => set({ depositConfig }),
}));
