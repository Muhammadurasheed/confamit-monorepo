import { API_ENDPOINTS } from "@/lib/constants";

export interface BusinessListing {
  business_id: string;
  name: string;
  logo?: string;
  category: string;
  trust_score: number;
  rating: number;
  review_count: number;
  verified: boolean;
  tier: number;
  location?: {
    city: string;
    state: string;
  };
  contact: {
    email: string;
    phone: string;
  };
  stats: {
    profile_views: number;
    verifications: number;
    successful_transactions: number;
  };
  created_at: string;
}

export interface BusinessDirectoryFilters {
  search?: string;
  category?: string;
  minTrustScore?: number;
  verifiedOnly?: boolean;
  tier?: number;
  page?: number;
  limit?: number;
}

export const getBusinessDirectory = async (
  filters: BusinessDirectoryFilters = {}
): Promise<{ success: boolean; data: BusinessListing[]; total: number }> => {
  const params = new URLSearchParams();
  
  if (filters.search) params.append('search', filters.search);
  if (filters.category) params.append('category', filters.category);
  if (filters.minTrustScore) params.append('minTrustScore', filters.minTrustScore.toString());
  if (filters.verifiedOnly) params.append('verifiedOnly', 'true');
  if (filters.tier) params.append('tier', filters.tier.toString());
  params.append('page', (filters.page || 1).toString());
  params.append('limit', (filters.limit || 12).toString());

  const response = await fetch(`${API_ENDPOINTS.GET_BUSINESS('directory')}?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch business directory');
  }

  return response.json();
};

export const getBusinessProfile = async (
  businessId: string
): Promise<{ success: boolean; data: BusinessListing }> => {
  const response = await fetch(API_ENDPOINTS.GET_BUSINESS(businessId), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch business profile');
  }

  return response.json();
};
