export type Language = "en" | "yo" | "ig" | "ha" | "pidgin";

export type VerificationStatus = "pending" | "verified";

export type UserIdentity = "NIN" | "BVN" | "Drivers License";

export interface User {
  userIdentity: UserIdentity;
  id: number;
  name: string;
  email: string;
  phone: string;
  identityNumber: string;
  address?: string;
  language: Language;
}

// API response for verification
export interface VerifyResponse {
  success: boolean;
  user?: User;
  message?: string;
}

export interface IsVerified {
  verified: VerificationStatus;
  account?: {
    number: string;
    balance: number;
  };
  card?: {
    number: string;
    expiry: string;
  };
}

// Form state specifically for onboarding
export interface OnboardingFormState {
  userIdentity: UserIdentity;
  name: string;
  email: string;
  phone: string;
  identityNumber: string;
  language: Language;
}
