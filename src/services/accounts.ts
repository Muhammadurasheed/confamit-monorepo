import { API_BASE_URL } from '@/lib/constants';

export interface CheckAccountRequest {
  accountNumber: string;
  bankCode?: string;
  businessName?: string;
}

export interface FraudReport {
  total: number;
  recent_30_days: number;
  details?: Array<{
    category: string;
    description_summary: string;
    severity: string;
    reported_at: Date;
    verified: boolean;
  }>;
  categories?: {
    type: string;
    count: number;
  }[];
}

export interface VerifiedBusiness {
  business_id: string;
  name: string;
  verified: boolean;
  trust_score: number;
  rating: number;
  review_count: number;
  location: string;
  tier: number;
  verification_date: string;
  reviews?: Array<{
    rating: number;
    comment: string;
    reviewer_name: string;
    verified_purchase: boolean;
    created_at: Date;
  }>;
}

export interface AccountCheckResult {
  success: boolean;
  data: {
    account_id: string;
    account_hash: string;
    bank_code: string | null;
    trust_score: number;
    risk_level: "low" | "medium" | "high";
    checks: {
      last_checked: string;
      check_count: number;
      fraud_reports: FraudReport;
      verified_business_id: string | null;
      flags: string[];
    };
    verified_business?: VerifiedBusiness;
  };
}

export class AccountsService {
  private static instance: AccountsService;

  private constructor() {}

  static getInstance(): AccountsService {
    if (!AccountsService.instance) {
      AccountsService.instance = new AccountsService();
    }
    return AccountsService.instance;
  }

  async checkAccount(request: CheckAccountRequest): Promise<AccountCheckResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account_number: request.accountNumber,
          bank_code: request.bankCode,
          business_name: request.businessName,
        }),
      });

      if (!response.ok) {
        throw new Error(`Account check failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Account check error:', error);
      throw error;
    }
  }

  async getAccount(accountId: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/${accountId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch account: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get account error:', error);
      throw error;
    }
  }

  async reportFraud(
    accountNumber: string,
    category: string,
    description: string,
    businessName?: string
  ): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/report-fraud`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountNumber,
          businessName,
          category,
          description,
        }),
      });

      if (!response.ok) {
        throw new Error(`Fraud report failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Report fraud error:', error);
      throw error;
    }
  }

  async saveAccountCheckToHistory(accountData: any, accountNumber: string): Promise<void> {
    try {
      // Import firebase dynamically to avoid circular dependencies
      const { db, auth } = await import('@/lib/firebase');
      
      if (!db) {
        // No Firebase configured, skip saving
        return;
      }

      const { addDoc, collection } = await import('firebase/firestore');
      
      const userId = auth?.currentUser?.uid || 'anonymous';
      
      // Mask account number for privacy (show first 3 and last 2 digits)
      const maskedAccountNumber = `${accountNumber.slice(0, 3)}***${accountNumber.slice(-2)}`;
      
      const historyData = {
        type: 'account_check',
        account_id: accountData.account_id,
        account_number_masked: maskedAccountNumber,
        trust_score: accountData.trust_score,
        risk_level: accountData.risk_level,
        verdict: accountData.risk_level === 'low' ? 'safe' : accountData.risk_level === 'medium' ? 'caution' : 'high_risk',
        fraud_reports_count: accountData.checks?.fraud_reports?.total || 0,
        is_verified_business: !!accountData.verified_business,
        business_name: accountData.verified_business?.name || null,
        user_id: userId,
        created_at: new Date(),
      };
      
      await addDoc(collection(db, 'account_checks'), historyData);
      
      console.log('✅ Account check saved to history');
    } catch (error) {
      // Fail silently - don't block user flow
      console.warn('Failed to save account check to history:', error);
    }
  }
}

export const accountsService = AccountsService.getInstance();
