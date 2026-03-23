import { API_ENDPOINTS } from "@/lib/constants";
import { ApiResponse, Business, BusinessStats } from "@/types";

export interface RegisterBusinessData {
  name: string;
  category: string;
  logo?: string;
  website?: string;
  linkedin?: string;
  bio?: string;
  email: string;
  phone: string;
  address: string;
  accountNumber: string;
  bankCode: string;
  accountName: string;
  tier: number;
  userId?: string; // Link business to user
  documents: {
    cacCertificate?: string;
    governmentId?: string;
    proofOfAddress?: string;
    bankStatement?: string;
  };
}

export const registerBusiness = async (
  data: RegisterBusinessData
): Promise<{ success: boolean; business_id: string; message: string }> => {
  const response = await fetch(API_ENDPOINTS.REGISTER_BUSINESS, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to register business");
  }

  return response.json();
};

export const getBusiness = async (
  businessId: string
): Promise<ApiResponse<Business>> => {
  const response = await fetch(API_ENDPOINTS.GET_BUSINESS(businessId), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch business");
  }

  const result = await response.json();
  
  // Normalize Hedera NFT data (handle both snake_case and camelCase)
  if (result.data?.hedera?.trust_id_nft) {
    result.data.hedera.trustIdNft = {
      tokenId: result.data.hedera.trust_id_nft.token_id,
      serialNumber: result.data.hedera.trust_id_nft.serial_number,
      explorerUrl: result.data.hedera.trust_id_nft.explorer_url,
    };
  }

  return result;
};

export const getBusinessStats = async (businessId: string): Promise<{
  success: boolean;
  stats: BusinessStats;
  trust_score: number;
  rating: number;
  review_count: number;
}> => {
  const response = await fetch(`${API_ENDPOINTS.GET_BUSINESS(businessId)}/stats`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch business stats");
  }

  return response.json();
};

export const generateApiKey = async (
  businessId: string
): Promise<{ success: boolean; api_key: string; message: string }> => {
  const response = await fetch(`${API_ENDPOINTS.GET_BUSINESS(businessId)}/api-keys/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ businessId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to generate API key");
  }

  return response.json();
};

export const suspendBusiness = async (
  businessId: string,
  reason: string,
  token: string
): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_ENDPOINTS.ADMIN_BUSINESSES}/suspend/${businessId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ reason, suspendedBy: "admin" }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to suspend business");
  }

  return response.json();
};

export const deleteBusiness = async (
  businessId: string,
  token: string
): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_ENDPOINTS.ADMIN_BUSINESSES}/delete/${businessId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ deletedBy: "admin" }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete business");
  }

  return response.json();
};
