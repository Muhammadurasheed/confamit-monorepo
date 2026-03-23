import { API_ENDPOINTS } from '@/lib/constants';
import type { Receipt, AnalysisResult } from '@/types';

export interface ScanReceiptResponse {
  success: boolean;
  receiptId: string;
  message: string;
}

export interface ReceiptAnalysisResponse {
  receipt: Receipt;
  analysis: AnalysisResult;
}

export class ReceiptsService {
  /**
   * Upload and scan a receipt
   */
  static async scanReceipt(
    file: File,
    options?: { anchorOnHedera?: boolean }
  ): Promise<ScanReceiptResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (options?.anchorOnHedera) {
      formData.append('anchorOnHedera', 'true');
    }

    const response = await fetch(API_ENDPOINTS.SCAN_RECEIPT, {
      method: 'POST',
      body: formData,
      // Note: Don't set Content-Type for FormData, browser will set it with boundary
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || `Upload failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get receipt details by ID
   */
  static async getReceipt(receiptId: string): Promise<ReceiptAnalysisResponse> {
    const response = await fetch(`${API_ENDPOINTS.SCAN_RECEIPT}/${receiptId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch receipt');
    }

    return response.json();
  }

  /**
   * Get user's receipt history
   */
  static async getUserReceipts(userId: string): Promise<Receipt[]> {
    const response = await fetch(`${API_ENDPOINTS.SCAN_RECEIPT}/user/${userId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch receipt history');
    }

    const data = await response.json();
    return data.receipts || [];
  }
}
