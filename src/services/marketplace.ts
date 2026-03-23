import { API_BASE_URL } from "@/lib/constants";
import type { 
  MarketplaceSearchResult, 
  MarketplaceSearchFilters,
  Business,
  MarketplaceProfile,
  MarketplaceAnalytics
} from "@/types";

/**
 * Search businesses in marketplace
 */
export async function searchMarketplace(
  filters: MarketplaceSearchFilters
): Promise<{
  success: boolean;
  businesses: MarketplaceSearchResult[];
  totalResults: number;
  page: number;
  limit: number;
}> {
  const params = new URLSearchParams();
  
  if (filters.q) params.append('q', filters.q);
  if (filters.lat) params.append('lat', filters.lat.toString());
  if (filters.lng) params.append('lng', filters.lng.toString());
  if (filters.radius) params.append('radius', filters.radius.toString());
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());

  const response = await fetch(`${API_BASE_URL}/marketplace/search?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to search marketplace');
  }

  return response.json();
}

/**
 * Get full business profile for marketplace
 */
export async function getMarketplaceBusinessProfile(
  businessId: string
): Promise<{
  success: boolean;
  data: {
    businessId: string;
    name: string;
    logo: string;
    category: string;
    trustScore: number;
    rating: number;
    reviewCount: number;
    profile: MarketplaceProfile;
    analytics: MarketplaceAnalytics;
    verification: any;
    hedera: any;
  };
}> {
  const response = await fetch(`${API_BASE_URL}/marketplace/business/${businessId}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch business profile');
  }

  return response.json();
}

/**
 * Track user action on business profile
 */
export async function trackMarketplaceAction(
  businessId: string,
  actionType: 'website_click' | 'directions' | 'phone_call' | 'whatsapp'
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/marketplace/business/${businessId}/action`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ type: actionType }),
  });

  if (!response.ok) {
    throw new Error('Failed to track action');
  }

  return response.json();
}

/**
 * Update marketplace profile
 */
export async function updateMarketplaceProfile(
  businessId: string,
  profileData: Partial<MarketplaceProfile>
): Promise<{ success: boolean; message: string }> {
  // Trim businessId to remove any trailing/leading whitespace or dashes
  const cleanBusinessId = businessId.trim().replace(/[-\s]+$/, '');
  
  console.log('Updating marketplace profile:', {
    originalId: businessId,
    cleanId: cleanBusinessId,
    url: `${API_BASE_URL}/marketplace/business/${cleanBusinessId}/profile`
  });

  const response = await fetch(`${API_BASE_URL}/marketplace/business/${cleanBusinessId}/profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Update profile failed:', {
      status: response.status,
      statusText: response.statusText,
      error: errorText
    });
    throw new Error(`Failed to update profile: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Activate marketplace listing (1-month free)
 */
export async function activateMarketplace(
  businessId: string
): Promise<{ success: boolean; message: string; expiryDate: string }> {
  const response = await fetch(`${API_BASE_URL}/marketplace/business/${businessId}/activate`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to activate marketplace');
  }

  return response.json();
}

/**
 * Initialize Paystack payment for marketplace renewal (₦1,000/month)
 */
export async function initializeMarketplaceRenewal(
  businessId: string,
  userEmail: string
): Promise<{ success: boolean; authorization_url: string; reference: string }> {
  const response = await fetch(`${API_BASE_URL}/marketplace/business/${businessId}/renew/initialize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email: userEmail }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to initialize renewal payment');
  }

  return response.json();
}

/**
 * Verify marketplace renewal payment
 */
export async function verifyMarketplaceRenewal(
  businessId: string,
  reference: string
): Promise<{ success: boolean; message: string; newExpiryDate: string }> {
  const response = await fetch(`${API_BASE_URL}/marketplace/business/${businessId}/renew/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reference }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to verify renewal payment');
  }

  return response.json();
}

/**
 * Renew marketplace subscription (direct - for manual/admin use)
 */
export async function renewMarketplaceSubscription(
  businessId: string
): Promise<{ success: boolean; message: string; newExpiryDate: string }> {
  const response = await fetch(`${API_BASE_URL}/marketplace/business/${businessId}/renew`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to renew subscription');
  }

  return response.json();
}

/**
 * Get user's current location using browser geolocation API
 */
/**
 * Reverse geocode coordinates to location name
 * Uses OpenStreetMap Nominatim (free, no API key required)
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=12&addressdetails=1`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'ConfirmIT-Marketplace/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Geocoding failed');
    }

    const data = await response.json();
    
    // Extract relevant location parts
    const address = data.address || {};
    const suburb = address.suburb || address.neighbourhood || address.quarter;
    const city = address.city || address.town || address.village || address.state_district;
    const state = address.state;

    // Build location name
    if (suburb && city) {
      return `${suburb}, ${city}`;
    } else if (city) {
      return city;
    } else if (state) {
      return state;
    } else if (data.display_name) {
      // Fallback to first two parts of display name
      const parts = data.display_name.split(',').slice(0, 2);
      return parts.join(',').trim();
    }
    
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    // Return coordinates as fallback
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

export async function getCurrentLocation(): Promise<{ lat: number; lng: number }> {
  // Try IP-based fallback immediately as it is usually much faster than desktop GPS
  let ipLocation: { lat: number, lng: number } | null = null;
  
  try {
    const ipRes = await fetch('https://get.geojs.io/v1/ip/geo.json', { signal: AbortSignal.timeout(3000) });
    if (ipRes.ok) {
      const data = await ipRes.json();
      if (data.latitude && data.longitude) {
        ipLocation = { lat: parseFloat(data.latitude), lng: parseFloat(data.longitude) };
      }
    }
  } catch (e) {
    console.warn('IP geolocation failed', e);
  }

  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(ipLocation || { lat: 6.5244, lng: 3.3792 });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        resolve(ipLocation || { lat: 6.5244, lng: 3.3792 }); // Fallback to IP then Lagos
      },
      {
        enableHighAccuracy: false, // False results in instant resolution on Desktop
        timeout: 5000,
        maximumAge: 300000, 
      }
    );
  });
}

/**
 * Check if business is currently open based on hours
 */
export function isBusinessOpen(hours: MarketplaceProfile['hours']): boolean {
  if (!hours) return false;

  const now = new Date();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = dayNames[now.getDay()] as keyof typeof hours;
  
  const todayHours = hours[today];
  if (!todayHours) return false;

  const currentTime = now.getHours() * 60 + now.getMinutes();
  const [openHour, openMin] = todayHours.open.split(':').map(Number);
  const [closeHour, closeMin] = todayHours.close.split(':').map(Number);
  
  const openTime = openHour * 60 + openMin;
  const closeTime = closeHour * 60 + closeMin;

  return currentTime >= openTime && currentTime <= closeTime;
}

/**
 * Format distance for display
 */
export function formatDistance(km: number | null): string {
  if (km === null) return 'Location unavailable';
  if (km < 1) return `${Math.round(km * 1000)}m away`;
  return `${km.toFixed(1)}km away`;
}

/**
 * Forward geocode query to coordinates
 * Uses OpenStreetMap Nominatim (free, no API key required)
 */
export async function forwardGeocode(query: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ConfirmIT-Marketplace/1.0'
      }
    });
    if (!response.ok) throw new Error('Forward geocoding failed');
    const data = await response.json();
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
  } catch (e) {
    console.error('Forward geocoding error:', e);
  }
  return null;
}
