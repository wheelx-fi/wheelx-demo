import { create } from 'zustand';
import type { SDAQuoteResponse } from '../api/types';

export interface SDAFormData {
  // Step 1: Receive chain & token
  chainName: string;
  chainId: number | null;
  chainLogo: string;
  tokenLogo: string;
  tokenName: string;
  tokenSymbol: string;
  tokenAddress: string;
  tokenDecimals: number;
  receiveAddress: string;
  // Step 2: From chain & token
  fromChainId: number | null;
  fromChainName: string;
  fromTokenSymbol: string;
  fromTokenAddress: string;
  fromTokenDecimals: number;
  fromTokenLogo: string;
}

export interface SDAOrderState {
  quoteResponse: SDAQuoteResponse | null;
  orderStatus: string | null;
  requestId: string | null;
  isPollingOrder: boolean;
}

interface SDAStore {
  formData: SDAFormData;
  orderState: SDAOrderState;
  saveFormData: (data: Partial<SDAFormData>) => void;
  clearFormData: () => void;
  setQuoteResponse: (res: SDAQuoteResponse | null) => void;
  setOrderStatus: (status: string | null) => void;
  setRequestId: (id: string | null) => void;
  setIsPollingOrder: (polling: boolean) => void;
  clearOrderState: () => void;
}

const initialFormData: SDAFormData = {
  chainName: '',
  chainId: null,
  chainLogo: '',
  tokenLogo: '',
  tokenName: '',
  tokenSymbol: '',
  tokenAddress: '',
  tokenDecimals: 18,
  receiveAddress: '',
  fromChainId: null,
  fromChainName: '',
  fromTokenSymbol: '',
  fromTokenAddress: '',
  fromTokenDecimals: 18,
  fromTokenLogo: '',
};

const initialOrderState: SDAOrderState = {
  quoteResponse: null,
  orderStatus: null,
  requestId: null,
  isPollingOrder: false,
};

export const useSDAStore = create<SDAStore>((set) => ({
  formData: { ...initialFormData },
  orderState: { ...initialOrderState },
  saveFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),
  clearFormData: () => set({ formData: { ...initialFormData } }),
  setQuoteResponse: (res) =>
    set((state) => ({
      orderState: { ...state.orderState, quoteResponse: res },
    })),
  setOrderStatus: (status) =>
    set((state) => ({
      orderState: { ...state.orderState, orderStatus: status },
    })),
  setRequestId: (id) =>
    set((state) => ({
      orderState: { ...state.orderState, requestId: id },
    })),
  setIsPollingOrder: (polling) =>
    set((state) => ({
      orderState: { ...state.orderState, isPollingOrder: polling },
    })),
  clearOrderState: () =>
    set((state) => ({
      orderState: { ...initialOrderState },
      formData: {
        ...state.formData,
        fromChainId: null,
        fromChainName: '',
        fromTokenSymbol: '',
        fromTokenAddress: '',
        fromTokenDecimals: 18,
        fromTokenLogo: '',
      },
    })),
}));
