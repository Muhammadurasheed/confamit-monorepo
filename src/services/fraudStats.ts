import { API_BASE_URL } from '@/lib/constants';

export interface FraudStats {
  scamAccountsReported: number;
  peopleProtected: number;
  averageReviewTimeHours: number;
}

export const fraudStatsService = {
  /**
   * Fetch real-time fraud statistics from backend API
   */
  async getFraudStats(): Promise<FraudStats> {
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/fraud/stats`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch fraud stats');
      }

      const result = await response.json();
      
      return result.data || {
        scamAccountsReported: 0,
        peopleProtected: 0,
        averageReviewTimeHours: 24,
      };
    } catch (error) {
      console.error('Failed to fetch fraud stats:', error);
      // Return default stats on error
      return {
        scamAccountsReported: 0,
        peopleProtected: 0,
        averageReviewTimeHours: 24,
      };
    }
  },
};
