import { API_ENDPOINTS, API_BASE_URL } from "@/lib/constants";

export interface InitializePaystackPaymentData {
  businessId: string;
  email: string;
  tier: number;
}

export interface InitializeNowPaymentsData {
  businessId: string;
  tier: number;
  paymentMethod: 'nowpayments';
  cryptocurrency?: string;
}

export interface PaystackInitializeResponse {
  success: boolean;
  authorization_url: string;
  access_code: string;
  reference: string;
}

export interface NowPaymentsInitializeResponse {
  success: boolean;
  invoice_id?: string;
  invoice_url?: string;
  order_id?: string;
  price_amount?: number;
  price_currency?: string;
  pay_currency?: string;
  // Fallback manual payment
  method?: 'manual_hedera';
  payment_address?: string;
  amount_usdt?: number;
  instructions?: string;
}

export interface VerifyPaymentData {
  businessId: string;
  paymentMethod: 'paystack' | 'nowpayments';
  reference: string;
}

export interface PaymentVerificationResponse {
  success: boolean;
  message: string;
  payment: any;
}

export interface TierPricingResponse {
  ngn: number;
  usd: number;
  discountedUsd: number;
}


export const paymentService = {
  /**
   * Initialize Paystack payment for business verification
   */
  async initializePaystackPayment(
    data: InitializePaystackPaymentData
  ): Promise<PaystackInitializeResponse> {
    const response = await fetch(`${API_BASE_URL}/business/payment/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        businessId: data.businessId,
        email: data.email,
        tier: data.tier,
        paymentMethod: 'paystack',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to initialize payment');
    }

    return response.json();
  },

  /**
   * Initialize NOWPayments (crypto) payment
   */
  async initializeNowPayments(
    data: InitializeNowPaymentsData
  ): Promise<NowPaymentsInitializeResponse> {
    const response = await fetch(`${API_BASE_URL}/business/payment/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        businessId: data.businessId,
        tier: data.tier,
        paymentMethod: 'nowpayments',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to initialize crypto payment');
    }

    return response.json();
  },

  /**
   * Verify payment completion
   */
  async verifyPayment(
    data: VerifyPaymentData
  ): Promise<PaymentVerificationResponse> {
    const response = await fetch(`${API_BASE_URL}/business/payment/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Payment verification failed');
    }

    return response.json();
  },

  /**
   * Get pricing for a specific tier
   */
  async getTierPricing(tier: number): Promise<TierPricingResponse> {
    const response = await fetch(`${API_BASE_URL}/business/payment/pricing/${tier}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch pricing');
    }

    return response.json();
  },

  /**
   * Poll payment status (for crypto payments)
   */
  async getPaymentStatus(businessId: string): Promise<{ status: string; data?: any }> {
    const response = await fetch(`${API_BASE_URL}/business/payment/status/${businessId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to check payment status');
    }

    return response.json();
  },
};
