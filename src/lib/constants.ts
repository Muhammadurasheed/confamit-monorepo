// API Configuration
// Using Render deployment for backend
// IMPORTANT: VITE_API_BASE_URL includes /api suffix, VITE_API_URL does not
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
export const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'http://localhost:8080';
export const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000';

console.log('📡 ConfirmIT API Connection:', { 
  BASE: API_BASE_URL, 
  AI: AI_SERVICE_URL,
  MODE: import.meta.env.MODE 
});

// Environment detection
export const IS_DEVELOPMENT = import.meta.env.DEV;
export const IS_PRODUCTION = import.meta.env.PROD;

// Firebase Configuration
export const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Cloudinary Configuration
export const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
};

// Hedera Configuration
export const HEDERA_CONFIG = {
  network: import.meta.env.VITE_HEDERA_NETWORK || 'testnet',
  explorerUrl: 'https://hashscan.io/testnet',
};

// Paystack Configuration
export const PAYSTACK_CONFIG = {
  publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
};

// Business Registration & Subscription Model
export const BUSINESS_REGISTRATION = {
  oneTimeVerification: 10000, // ₦10K one-time registration
  monthlySubscription: 1000, // ₦1K/month marketplace listing
  freeTrialDays: 30, // 1 month free trial after registration
} as const;

// Marketplace Subscription Plans
export const MARKETPLACE_PLANS = {
  monthly: {
    name: 'Monthly Subscription',
    price: 1000,
    duration: '1 month',
    features: [
      'Marketplace search visibility',
      'Enhanced business profile',
      'Photo gallery (up to 10 images)',
      'Analytics dashboard',
      'Customer reviews',
      'Multiple contact methods',
      'Priority in search results',
    ],
  },
} as const;

// Legacy tiers (keep for backward compatibility)
export const BUSINESS_TIERS = {
  1: {
    name: 'Verification',
    price: 10000,
    features: [
      'Full KYC verification',
      'Trust ID NFT on blockchain',
      'Basic business profile',
      'Verified badge',
      '30-day marketplace trial',
    ]
  },
} as const;

// Trust Score Thresholds
export const TRUST_SCORE_THRESHOLDS = {
  high: 80,
  medium: 50,
  low: 0,
} as const;

// File Upload Limits
export const UPLOAD_LIMITS = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  allowedDocumentTypes: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
} as const;

// API Endpoints
// Note: API_BASE_URL already includes /api, don't add it again
export const API_ENDPOINTS = {
  BASE: API_BASE_URL,
  SCAN_RECEIPT: `${API_BASE_URL}/receipts/scan`,
  CHECK_ACCOUNT: `${API_BASE_URL}/accounts/check`,
  RESOLVE_ACCOUNT: `${API_BASE_URL}/accounts/resolve`,
  REGISTER_BUSINESS: `${API_BASE_URL}/business/register`,
  GET_BUSINESS: (id: string) => `${API_BASE_URL}/business/${id}`,
  GENERATE_API_KEY: `${API_BASE_URL}/business/api-keys/generate`,
  GET_BUSINESS_STATS: (id: string) => `${API_BASE_URL}/business/stats/${id}`,
  ADMIN_BUSINESSES: `${API_BASE_URL}/business/admin`,
  // Hedera anchoring endpoint (uses API_URL without /api suffix)
  ANCHOR_RECEIPT: (id: string) => `${API_URL}/api/receipts/${id}/anchor`,
} as const;

