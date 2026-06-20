import { create } from 'zustand';

export interface SDAFormData {
  chainName: string;
  chainId: number | null;
  chainLogo: string;
  tokenLogo: string;
  tokenName: string;
  tokenAddress: string;
  receiveAddress: string;
}

interface SDAStore {
  formData: SDAFormData;
  saveFormData: (data: Partial<SDAFormData>) => void;
  clearFormData: () => void;
}

const initialFormData: SDAFormData = {
  chainName: '',
  chainId: null,
  chainLogo: '',
  tokenLogo: '',
  tokenName: '',
  tokenAddress: '',
  receiveAddress: '',
};

export const useSDAStore = create<SDAStore>((set) => ({
  formData: { ...initialFormData },
  saveFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),
  clearFormData: () => set({ formData: { ...initialFormData } }),
}));
