import { create } from 'zustand';

export type PaymentMethod = 'paystack' | 'nowpayments' | null;
export type PaymentStatus = 'idle' | 'initializing' | 'pending' | 'confirming' | 'success' | 'failed';
export type CryptoCurrency = 'hbar' | 'usdthbar' | 'btc' | 'eth';

interface PaymentStore {
  // Payment Selection
  selectedMethod: PaymentMethod;
  selectedCrypto: CryptoCurrency | null;
  
  // Payment State
  paymentStatus: PaymentStatus;
  paymentReference: string | null;
  paymentError: string | null;
  
  // Business Context
  businessId: string | null;
  businessName: string | null;
  tier: number | null;
  amount: {
    ngn: number;
    usd: number;
  } | null;
  
  // Actions
  setPaymentMethod: (method: PaymentMethod) => void;
  setSelectedCrypto: (crypto: CryptoCurrency | null) => void;
  setPaymentStatus: (status: PaymentStatus) => void;
  setPaymentReference: (reference: string | null) => void;
  setPaymentError: (error: string | null) => void;
  setBusinessContext: (context: {
    businessId: string;
    businessName: string;
    tier: number;
    amount: { ngn: number; usd: number };
  }) => void;
  reset: () => void;
}

export const usePaymentStore = create<PaymentStore>((set) => ({
  // Initial State
  selectedMethod: null,
  selectedCrypto: null,
  paymentStatus: 'idle',
  paymentReference: null,
  paymentError: null,
  businessId: null,
  businessName: null,
  tier: null,
  amount: null,
  
  // Actions
  setPaymentMethod: (method) => set({ selectedMethod: method }),
  setSelectedCrypto: (crypto) => set({ selectedCrypto: crypto }),
  setPaymentStatus: (status) => set({ paymentStatus: status }),
  setPaymentReference: (reference) => set({ paymentReference: reference }),
  setPaymentError: (error) => set({ paymentError: error }),
  setBusinessContext: (context) => set({
    businessId: context.businessId,
    businessName: context.businessName,
    tier: context.tier,
    amount: context.amount,
  }),
  reset: () => set({
    selectedMethod: null,
    selectedCrypto: null,
    paymentStatus: 'idle',
    paymentReference: null,
    paymentError: null,
    businessId: null,
    businessName: null,
    tier: null,
    amount: null,
  }),
}));
