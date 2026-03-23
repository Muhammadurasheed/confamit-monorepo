/**
 * @confirmit/sdk - Official TypeScript/JavaScript Client
 * AI-powered trust verification infrastructure built on Hedera Hashgraph
 * 
 * @version 1.0.0
 */

import * as crypto from 'crypto';

/**
 * Custom Error Class for ConfirmIT API failures
 */
export class ConfirmITError extends Error {
  public status?: number;
  public code?: string;

  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = 'ConfirmITError';
    this.status = status;
    this.code = code;
  }
}

export interface ConfirmITOptions {
  /** Base URL for the ConfirmIT API Gateway */
  baseUrl?: string;
  /** Request timeout in milliseconds (default: 60000) */
  timeout?: number;
  /** Number of retry attempts on rate limit (429) or server errors (5xx) (default: 2) */
  maxRetries?: number;
}

export interface ReceiptVerificationOptions {
  /** If true, the verification result will be immutably anchored to the Hedera Consensus Service */
  anchorOnHedera?: boolean;
}

export interface ReceiptResult {
  receiptId: string;
  trustScore: number;
  verdict: 'authentic' | 'suspicious' | 'fraudulent' | 'unclear';
  issues: Array<{
    type: string;
    severity: 'high' | 'medium' | 'low';
    description: string;
  }>;
  recommendation: string;
  forensicDetails?: {
    ocrConfidence: number;
    manipulationScore: number;
    metadataFlags: string[];
  };
  merchant?: {
    name: string;
    verified: boolean;
    trustScore: number;
  };
  hederaAnchor?: {
    transactionId: string;
    consensusTimestamp: string;
    explorerUrl: string;
  };
}

export interface AccountResult {
  accountHash: string;
  trustScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  fraudReports: {
    total: number;
    recent30Days: number;
  };
  verifiedBusiness?: {
    businessId: string;
    name: string;
    verified: boolean;
    trustScore: number;
  };
  flags: string[];
}

export interface FraudReportResult {
  success: boolean;
  message: string;
  reportId: string;
  hederaAnchor?: {
    transactionId: string;
    explorerUrl: string;
  };
}

/**
 * ConfirmIT AI Trust API Client
 */
export class ConfirmIT {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;
  private maxRetries: number;

  /**
   * Initialize a new ConfirmIT client instance
   * @param apiKey Your ConfirmIT designated developer API key
   * @param options Client configuration options
   */
  constructor(apiKey: string, options: ConfirmITOptions = {}) {
    if (!apiKey) {
      throw new ConfirmITError('Initialization Failed: API key is required');
    }

    this.apiKey = apiKey;
    this.baseUrl = options.baseUrl || 'https://api.confirmit.africa/api';
    this.timeout = options.timeout || 60000;
    this.maxRetries = options.maxRetries !== undefined ? options.maxRetries : 2;
  }

  /**
   * Verify receipt authenticity using our 5-agent AI forensic pipeline
   * 
   * @param imageUrl - Public URL of the receipt image
   * @param options - Configure Hedera anchoring behavior
   * @returns Comprehensive receipt verification forensics and trust score
   * 
   * @example
   * ```typescript
   * const result = await client.verifyReceipt('https://.../img.jpg', { anchorOnHedera: true });
   * console.log(`Trust Score: ${result.trustScore}/100`);
   * ```
   */
  async verifyReceipt(
    imageUrl: string,
    options: ReceiptVerificationOptions = {}
  ): Promise<ReceiptResult> {
    if (!imageUrl) {
      throw new ConfirmITError('Image URL must be provided');
    }

    const response = await this.requestWithRetry('/receipts/scan', {
      method: 'POST',
      body: JSON.stringify({
        imageUrl,
        anchorOnHedera: options.anchorOnHedera || false,
      }),
    });

    return response.data;
  }

  /**
   * Risk-assess a bank account against the community fraud registry
   * 
   * @param accountNumber - Exact 10-digit Nigerian bank account number
   * @param bankCode - Standardized bank code (e.g., "058")
   * @param businessName - Optional name to attempt direct KYC mapping
   * @returns Account safety analysis and known fraud reports
   * 
   * @example
   * ```typescript
   * const result = await client.checkAccount('0123456789', '058');
   * if (result.riskLevel === 'high') {
   *   throw new Error("High risk account detected. Blocking transaction.");
   * }
   * ```
   */
  async checkAccount(
    accountNumber: string,
    bankCode: string,
    businessName?: string
  ): Promise<AccountResult> {
    if (!accountNumber || !bankCode) {
      throw new ConfirmITError('Account number and bank code are absolutely required');
    }

    const response = await this.requestWithRetry('/accounts/check', {
      method: 'POST',
      body: JSON.stringify({
        accountNumber,
        bankCode,
        businessName,
      }),
    });

    return response.data;
  }

  /**
   * Anchor a fraudulent account record directly to the Hedera blockchain
   * 
   * @param accountNumber - Bank account involved in the fraud
   * @param category - Classification of fraud (e.g., "fake_product", "phishing")
   * @param description - Detailed narrative of the event
   * @returns Success payload containing the Hedera HCS Transaction ID
   */
  async reportFraud(
    accountNumber: string,
    category: string,
    description: string
  ): Promise<FraudReportResult> {
    if (!accountNumber || !category || !description) {
      throw new ConfirmITError('Account number, category, and description are all required to file a report');
    }

    const response = await this.requestWithRetry('/accounts/report-fraud', {
      method: 'POST',
      body: JSON.stringify({
        accountNumber,
        category,
        description,
      }),
    });

    return response;
  }

  /**
   * Cryptographically validate a webhook payload generated by ConfirmIT
   * 
   * @param signature - The `x-confirmit-signature` header from the webhook request
   * @param payload - The RAW String body of the incoming request
   * @param secret - Your private webhook signing secret
   * @returns Boolean indicating if the payload is authentically from ConfirmIT
   * 
   * @example
   * ```typescript
   * app.post('/webhooks', express.raw({ type: 'application/json' }), (req, res) => {
   *   const valid = ConfirmIT.validateWebhook(req.headers['x-confirmit-signature'], req.body, secret);
   *   if (!valid) return res.status(401).send();
   *   // Process event...
   * });
   * ```
   */
  static validateWebhook(
    signature: string,
    payload: string,
    secret: string
  ): boolean {
    if (!signature || !payload || !secret) {
      return false;
    }

    try {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

      return signature === expectedSignature;
    } catch {
      return false;
    }
  }

  /**
   * Async retry wrapper utilizing Exponential Backoff
   */
  private async requestWithRetry(endpoint: string, options: RequestInit, retries = 0): Promise<any> {
    try {
      return await this.executeFetch(endpoint, options);
    } catch (error: any) {
      const isRetryable = error.status === 429 || (error.status >= 500 && error.status <= 599);
      
      if (isRetryable && retries < this.maxRetries) {
        // Exponential backoff: 500ms, 1000ms, 2000ms...
        const backoffDelay = Math.min(1000 * Math.pow(2, retries), 5000) + Math.random() * 200;
        await new Promise(res => setTimeout(res, backoffDelay));
        return this.requestWithRetry(endpoint, options, retries + 1);
      }
      throw error;
    }
  }

  /**
   * Core execution engine for external network calls
   */
  private async executeFetch(endpoint: string, options: RequestInit): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errBody: any = await response.json().catch(() => ({}));
        throw new ConfirmITError(
          errBody?.message || `ConfirmIT API Error: ${response.statusText}`,
          response.status,
          errBody?.code || 'API_ERROR'
        );
      }

      return await response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error instanceof ConfirmITError) throw error;

      if (error.name === 'AbortError') {
        throw new ConfirmITError(`Network Request Timed Out after ${this.timeout}ms`, 408, 'TIMEOUT');
      }

      throw new ConfirmITError(`Network error failed to execute: ${error.message}`, 500, 'NETWORK_FAILED');
    }
  }
}

export default ConfirmIT;
