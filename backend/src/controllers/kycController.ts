import express from "express";
import { findNINRecord, findBVNRecord, maskDataByAccessLevel, NINRecord, BVNRecord } from "../mockDb/ninDatabase";

// In-memory storage for created accounts (prevents duplicate accounts)
interface AccountRecord {
  accountNumber: string;
  identityType: string;
  identityNumber: string;
  email: string;
  phone: string;
  createdAt: string;
}

const accountsStore: Map<string, AccountRecord> = new Map();

// Check if account already exists
export function checkExistingAccount(identityNumber: string): AccountRecord | null {
  return accountsStore.get(identityNumber) || null;
}

// Store new account
function storeAccount(identityNumber: string, accountData: AccountRecord): void {
  accountsStore.set(identityNumber, accountData);
}

// Account number generation: 42 + last 4 NIN digits + YYMMDD
export function generateAccountNumber(dob: string, nin: string): string {
  const date = new Date(dob);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);

  // Get last 4 digits of NIN
  const last4NIN = nin.slice(-4);

  return `42${last4NIN}${year}${month}${day}`;
}

// KYC Tier System
export interface KYCTier {
  tier: number;
  name: string;
  requirements: string[];
  transactionLimit: number;
  description: string;
}

export const KYC_TIERS: KYCTier[] = [
  {
    tier: 1,
    name: "Basic",
    requirements: ["Email verification", "NIN verification"],
    transactionLimit: 50000,
    description: "₦50,000/day limit"
  },
  {
    tier: 2,
    name: "Standard",
    requirements: ["Tier 1 requirements", "Utility bill", "ID card upload"],
    transactionLimit: 500000,
    description: "₦500,000/day limit"
  },
  {
    tier: 3,
    name: "Premium",
    requirements: ["Tier 2 requirements", "Proof of address", "Bank statement"],
    transactionLimit: Infinity,
    description: "Unlimited transactions"
  }
];

export function getKYCTierInfo(tier: number): KYCTier | null {
  return KYC_TIERS.find(t => t.tier === tier) || null;
}

// Trust score calculation
export interface TrustScoreFactors {
  ninVerified: boolean;
  bvnVerified: boolean;
  addressVerified: boolean;
  faceMatched: boolean;
  gpsValid: boolean;
  documentsComplete: boolean;
}

export function calculateTrustScore(factors: TrustScoreFactors): number {
  const weights = {
    ninVerified: 0.25,
    bvnVerified: 0.20,
    addressVerified: 0.15,
    faceMatched: 0.20,
    gpsValid: 0.10,
    documentsComplete: 0.10
  };

  let score = 0;
  Object.keys(weights).forEach((key) => {
    if (factors[key as keyof TrustScoreFactors]) {
      score += weights[key as keyof typeof weights];
    }
  });

  return Math.round(score * 100) / 100;
}

// NIN Verification endpoint
export const verifyNIN = (req: express.Request, res: express.Response): void => {
  const { nin } = req.body;

  if (!nin || nin.length !== 11) {
    res.status(400).json({
      success: false,
      message: "Invalid NIN format. Must be 11 digits.",
    });
    return;
  }

  const record = findNINRecord(nin);

  if (!record) {
    res.status(404).json({
      success: false,
      message: "NIN not found in database. Please verify your number.",
      data: null
    });
    return;
  }

  if (record.status !== "active") {
    res.status(400).json({
      success: false,
      message: "This NIN is inactive. Please contact NIMC.",
      data: null
    });
    return;
  }

  // Apply access level masking
  const maskedRecord = maskDataByAccessLevel(record);

  res.json({
    success: true,
    message: "NIN verified successfully!",
    data: {
      nin: maskedRecord.nin,
      access_level: maskedRecord.access_level,
      demographics: maskedRecord.demographics,
      biometrics: maskedRecord.biometrics,
      e_id_details: maskedRecord.e_id_details
    },
    metadata: {
      verification_time: new Date().toISOString(),
      source: "NIMC Mock Database",
      access_level: record.access_level
    }
  });
};

// BVN Verification endpoint (Dojah mock)
export const verifyBVN = (req: express.Request, res: express.Response): void => {
  const { bvn } = req.body;

  if (!bvn || bvn.length !== 11) {
    res.status(400).json({
      success: false,
      message: "Invalid BVN format. Must be 11 digits.",
    });
    return;
  }

  const record = findBVNRecord(bvn);

  if (!record) {
    res.status(404).json({
      success: false,
      message: "BVN not found. Please verify your number.",
      data: null
    });
    return;
  }

  res.json({
    success: true,
    message: "BVN verified successfully via Dojah!",
    data: {
      bvn: record.bvn,
      first_name: record.first_name,
      last_name: record.last_name,
      dob: record.dob,
      phone_number: record.phone_number,
      bank_name: record.bank_name
    },
    metadata: {
      verification_time: new Date().toISOString(),
      source: "Dojah Mock API",
      provider: "BVN Verification Service"
    }
  });
};

// Combined verification (NIN or BVN)
export const verifyIdentity = (req: express.Request, res: express.Response): void => {
  const { identityType, identityNumber } = req.body;

  if (!identityType || !identityNumber) {
    res.status(400).json({
      success: false,
      message: "Both identityType and identityNumber are required.",
    });
    return;
  }

  if (identityType === "NIN") {
    verifyNIN(req, res);
  } else if (identityType === "BVN") {
    verifyBVN(req, res);
  } else {
    res.status(400).json({
      success: false,
      message: "Invalid identity type. Must be 'NIN' or 'BVN'.",
    });
  }
};

// GPS Location verification
export const verifyLocation = (req: express.Request, res: express.Response): void => {
  const { latitude, longitude, address } = req.body;

  if (!latitude || !longitude) {
    res.status(400).json({
      success: false,
      message: "GPS coordinates are required.",
    });
    return;
  }

  // Mock validation: Check if coordinates are within Nigeria bounds
  const nigeriaLat = { min: 4.0, max: 14.0 };
  const nigeriaLng = { min: 2.5, max: 15.0 };

  const isWithinNigeria =
    latitude >= nigeriaLat.min &&
    latitude <= nigeriaLat.max &&
    longitude >= nigeriaLng.min &&
    longitude <= nigeriaLng.max;

  if (!isWithinNigeria) {
    res.status(400).json({
      success: false,
      message: "Location outside of Nigeria. GPS verification failed.",
      trustScoreImpact: -0.10
    });
    return;
  }

  res.json({
    success: true,
    message: "GPS location verified successfully!",
    data: {
      latitude,
      longitude,
      address: address || "Address not provided",
      verified_location: "Lagos, Nigeria", // Mock
      accuracy: "High",
      timestamp: new Date().toISOString()
    },
    trustScoreImpact: +0.10
  });
};

// Complete account creation
export const createAccount = (req: express.Request, res: express.Response): void => {
  const {
    identityType,
    identityNumber,
    firstName,
    lastName,
    dob,
    email,
    phone,
    address,
    latitude,
    longitude,
    faceVerified,
    documentsUploaded
  } = req.body;

  // Validate required fields
  if (!identityNumber || !firstName || !lastName || !dob || !email || !phone) {
    res.status(400).json({
      success: false,
      message: "Missing required fields for account creation.",
    });
    return;
  }

  // Check for existing account with this identity number
  const existingAccount = checkExistingAccount(identityNumber);
  if (existingAccount) {
    res.status(409).json({
      success: false,
      message: `An account already exists with this ${identityType}. You cannot create multiple accounts with the same identity.`,
      existingAccountInfo: {
        accountNumber: existingAccount.accountNumber,
        email: existingAccount.email,
        phone: existingAccount.phone,
        createdAt: existingAccount.createdAt
      }
    });
    return;
  }

  // Verify identity first and retrieve DOB from database
  let verified = false;
  let databaseDOB = dob; // Default to user-provided DOB as fallback

  if (identityType === "NIN") {
    const ninRecord = findNINRecord(identityNumber);
    verified = ninRecord !== null && ninRecord.status === "active";
    // Use DOB from NIN database for account number generation
    if (ninRecord?.demographics?.dob) {
      databaseDOB = ninRecord.demographics.dob;
    }
  } else if (identityType === "BVN") {
    const bvnRecord = findBVNRecord(identityNumber);
    verified = bvnRecord !== null;
    // Use DOB from BVN database for account number generation
    if (bvnRecord?.dob) {
      databaseDOB = bvnRecord.dob;
    }
  }

  if (!verified) {
    res.status(400).json({
      success: false,
      message: "Identity verification failed. Cannot create account.",
    });
    return;
  }

  // Generate account number with new formula: 42 + last 4 NIN + YYMMDD (using database DOB)
  const accountNumber = generateAccountNumber(databaseDOB, identityNumber);

  // Calculate trust score
  const trustScore = calculateTrustScore({
    ninVerified: identityType === "NIN" && verified,
    bvnVerified: identityType === "BVN" && verified,
    addressVerified: !!address && !!latitude && !!longitude,
    faceMatched: faceVerified || false,
    gpsValid: !!latitude && !!longitude,
    documentsComplete: documentsUploaded || false
  });

  // Auto-approve if trust score > 0.7
  const accountStatus = trustScore > 0.7 ? "active" : "pending_review";

  // Assign KYC tier (Tier 1 by default for new accounts with email + NIN/BVN verification)
  const kycTier = 1;
  const tierInfo = getKYCTierInfo(kycTier);

  // Store account to prevent duplicates
  const createdAt = new Date().toISOString();
  storeAccount(identityNumber, {
    accountNumber,
    identityType,
    identityNumber,
    email,
    phone,
    createdAt
  });

  console.log(`
╔════════════════════════════════════════════╗
║         NEW ACCOUNT CREATED                ║
║ Account Number: ${accountNumber}           ║
║ Identity: ${identityType} - ***${identityNumber.slice(-4)}        ║
║ Email: ${email.padEnd(30)}║
║ Status: ${accountStatus.padEnd(33)}║
╚════════════════════════════════════════════╝
  `);

  res.json({
    success: true,
    message: `Account created successfully! ${accountStatus === "active" ? "Your account is now active." : "Your account is under review."}`,
    data: {
      accountNumber,
      accountStatus,
      trustScore,
      kycTier: {
        current: kycTier,
        name: tierInfo?.name || "Basic",
        transactionLimit: tierInfo?.transactionLimit || 50000,
        description: tierInfo?.description || "₦50,000/day limit"
      },
      user: {
        firstName,
        lastName,
        email,
        phone,
        address,
        dob,
        identityType,
        identityNumber: `***${identityNumber.slice(-4)}` // Masked
      },
      createdAt: new Date().toISOString(),
      activationTime: accountStatus === "active" ? new Date().toISOString() : null
    },
    nextSteps: accountStatus === "pending_review"
      ? ["Upload additional documents", "Complete video verification"]
      : ["Access your dashboard", "Make your first transaction"]
  });
};

// Get trust score
export const getTrustScore = (req: express.Request, res: express.Response): void => {
  const factors: TrustScoreFactors = req.body;

  const score = calculateTrustScore(factors);

  res.json({
    success: true,
    trustScore: score,
    factors,
    recommendation: score > 0.7
      ? "Auto-approve"
      : score > 0.5
      ? "Manual review recommended"
      : "Additional verification required"
  });
};

// KYC Tier Upgrade
export const upgradeKYCTier = (req: express.Request, res: express.Response): void => {
  const {
    currentTier,
    targetTier,
    utilityBill,
    idCard,
    proofOfAddress,
    bankStatement
  } = req.body;

  if (!currentTier || !targetTier) {
    res.status(400).json({
      success: false,
      message: "Current tier and target tier are required.",
    });
    return;
  }

  const targetTierInfo = getKYCTierInfo(targetTier);

  if (!targetTierInfo) {
    res.status(400).json({
      success: false,
      message: "Invalid target tier.",
    });
    return;
  }

  // Validate tier progression
  if (targetTier <= currentTier) {
    res.status(400).json({
      success: false,
      message: "Target tier must be higher than current tier.",
    });
    return;
  }

  // Check requirements for tier 2
  if (targetTier === 2) {
    if (!utilityBill || !idCard) {
      res.status(400).json({
        success: false,
        message: "Tier 2 requires utility bill and ID card upload.",
        missingDocuments: [
          ...(!utilityBill ? ["Utility bill"] : []),
          ...(!idCard ? ["ID card"] : [])
        ]
      });
      return;
    }
  }

  // Check requirements for tier 3
  if (targetTier === 3) {
    if (!proofOfAddress || !bankStatement) {
      res.status(400).json({
        success: false,
        message: "Tier 3 requires proof of address and bank statement.",
        missingDocuments: [
          ...(!proofOfAddress ? ["Proof of address"] : []),
          ...(!bankStatement ? ["Bank statement"] : [])
        ]
      });
      return;
    }
  }

  // Mock document verification (in production, this would involve actual document processing)
  console.log(`
╔════════════════════════════════════════════╗
║        KYC TIER UPGRADE REQUEST            ║
║ Current Tier: ${currentTier} → Target Tier: ${targetTier}      ║
║ Documents received:                        ║
${utilityBill ? "║ ✅ Utility Bill                             ║" : ""}
${idCard ? "║ ✅ ID Card                                  ║" : ""}
${proofOfAddress ? "║ ✅ Proof of Address                         ║" : ""}
${bankStatement ? "║ ✅ Bank Statement                           ║" : ""}
╚════════════════════════════════════════════╝
  `);

  res.json({
    success: true,
    message: `Successfully upgraded to ${targetTierInfo.name} tier!`,
    data: {
      newTier: targetTier,
      tierName: targetTierInfo.name,
      transactionLimit: targetTierInfo.transactionLimit,
      description: targetTierInfo.description,
      requirements: targetTierInfo.requirements,
      upgradedAt: new Date().toISOString()
    },
    nextSteps: targetTier < 3
      ? [`You can upgrade to Tier ${targetTier + 1} for higher limits`]
      : ["You have the highest tier with unlimited transactions!"]
  });
};
