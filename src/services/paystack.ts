// Paystack Account Resolution Service
// Used to verify Nigerian bank account details in real-time

import { API_BASE_URL } from '@/lib/constants';

export interface ResolveAccountParams {
  accountNumber: string;
  bankCode: string;
}

export interface ResolveAccountResponse {
  success: boolean;
  data?: {
    account_number: string;
    account_name: string;
    bank_id: number;
  };
  message?: string;
}

/**
 * Resolves a Nigerian bank account number to get the account name
 * Calls our secure backend endpoint which handles Paystack API
 */
export const resolveAccountNumber = async (
  params: ResolveAccountParams
): Promise<ResolveAccountResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/accounts/resolve`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountNumber: params.accountNumber,
          bankCode: params.bankCode,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        message: error.error || 'Failed to verify account',
      };
    }

    const data = await response.json();

    if (!data.success) {
      return {
        success: false,
        message: data.error || 'Failed to verify account',
      };
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error('Account resolution error:', error);
    return {
      success: false,
      message: 'Network error. Please check your connection.',
    };
  }
};

/**
 * Validates if account name matches business name
 * Returns match percentage and warnings
 */
export const validateAccountNameMatch = (
  accountName: string,
  businessName: string
): {
  matches: boolean;
  confidence: number;
  warning?: string;
} => {
  const normalize = (str: string) =>
    str
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .trim();

  const normalizedAccount = normalize(accountName);
  const normalizedBusiness = normalize(businessName);

  // Exact match
  if (normalizedAccount === normalizedBusiness) {
    return { matches: true, confidence: 100 };
  }

  // Check if one contains the other
  if (
    normalizedAccount.includes(normalizedBusiness) ||
    normalizedBusiness.includes(normalizedAccount)
  ) {
    return { matches: true, confidence: 85 };
  }

  // Calculate similarity (simple word overlap)
  const accountWords = normalizedAccount.split(' ');
  const businessWords = normalizedBusiness.split(' ');
  const commonWords = accountWords.filter((word) =>
    businessWords.includes(word)
  );

  const similarity = (commonWords.length / Math.max(accountWords.length, businessWords.length)) * 100;

  if (similarity > 60) {
    return {
      matches: true,
      confidence: similarity,
      warning: 'Account name partially matches business name. Please verify this is correct.',
    };
  }

  return {
    matches: false,
    confidence: similarity,
    warning: '⚠️ Account name does not match business name. This may cause verification delays.',
  };
};

// Export as service object for easy import
export const paystackService = {
  resolveAccountNumber,
  validateAccountNameMatch,
};

