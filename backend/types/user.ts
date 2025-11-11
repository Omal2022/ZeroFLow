export type Language = "en" | "yo" | "ig" | "ha" | "pidgin";

export type VerificationStatus = "pending" | "verified";

export type UserIdentity = "NIN" | "BVN" | "Drivers License";

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  userIdentity: UserIdentity;
  address: string;
  language: Language;
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
