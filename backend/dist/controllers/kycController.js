"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upgradeKYCTier = exports.getTrustScore = exports.createAccount = exports.verifyLocation = exports.verifyIdentity = exports.verifyBVN = exports.verifyNIN = exports.KYC_TIERS = void 0;
exports.checkExistingAccount = checkExistingAccount;
exports.checkExistingAccountByEmail = checkExistingAccountByEmail;
exports.checkExistingAccountByPhone = checkExistingAccountByPhone;
exports.generateAccountNumber = generateAccountNumber;
exports.getKYCTierInfo = getKYCTierInfo;
exports.calculateTrustScore = calculateTrustScore;
const ninDatabase_1 = require("../mockDb/ninDatabase");
const accountsStore = new Map();
// Check if account already exists by identity number
function checkExistingAccount(identityNumber) {
    return accountsStore.get(identityNumber) || null;
}
// Check if account exists by email
function checkExistingAccountByEmail(email) {
    for (const [_, account] of accountsStore) {
        if (account.email.toLowerCase() === email.toLowerCase()) {
            return account;
        }
    }
    return null;
}
// Check if account exists by phone
function checkExistingAccountByPhone(phone) {
    // Normalize phone number (remove spaces, dashes, etc.)
    const normalizedPhone = phone.replace(/[\s-()]/g, '');
    for (const [_, account] of accountsStore) {
        const accountPhone = account.phone.replace(/[\s-()]/g, '');
        if (accountPhone === normalizedPhone) {
            return account;
        }
    }
    return null;
}
// Store new account
function storeAccount(identityNumber, accountData) {
    accountsStore.set(identityNumber, accountData);
}
// Account number generation: 42 + last 4 NIN digits + YYMMDD
function generateAccountNumber(dob, nin) {
    const date = new Date(dob);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    // Get last 4 digits of NIN
    const last4NIN = nin.slice(-4);
    return `42${last4NIN}${year}${month}${day}`;
}
exports.KYC_TIERS = [
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
function getKYCTierInfo(tier) {
    return exports.KYC_TIERS.find(t => t.tier === tier) || null;
}
function calculateTrustScore(factors) {
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
        if (factors[key]) {
            score += weights[key];
        }
    });
    return Math.round(score * 100) / 100;
}
// NIN Verification endpoint
const verifyNIN = (req, res) => {
    const { nin } = req.body;
    if (!nin || nin.length !== 11) {
        res.status(400).json({
            success: false,
            message: "Invalid NIN format. Must be 11 digits.",
        });
        return;
    }
    const record = (0, ninDatabase_1.findNINRecord)(nin);
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
    const maskedRecord = (0, ninDatabase_1.maskDataByAccessLevel)(record);
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
exports.verifyNIN = verifyNIN;
// BVN Verification endpoint (Dojah mock)
const verifyBVN = (req, res) => {
    const { bvn } = req.body;
    if (!bvn || bvn.length !== 11) {
        res.status(400).json({
            success: false,
            message: "Invalid BVN format. Must be 11 digits.",
        });
        return;
    }
    const record = (0, ninDatabase_1.findBVNRecord)(bvn);
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
exports.verifyBVN = verifyBVN;
// Combined verification (NIN or BVN)
const verifyIdentity = (req, res) => {
    const { identityType, identityNumber } = req.body;
    if (!identityType || !identityNumber) {
        res.status(400).json({
            success: false,
            message: "Both identityType and identityNumber are required.",
        });
        return;
    }
    if (identityType === "NIN") {
        (0, exports.verifyNIN)(req, res);
    }
    else if (identityType === "BVN") {
        (0, exports.verifyBVN)(req, res);
    }
    else {
        res.status(400).json({
            success: false,
            message: "Invalid identity type. Must be 'NIN' or 'BVN'.",
        });
    }
};
exports.verifyIdentity = verifyIdentity;
// GPS Location verification
const verifyLocation = (req, res) => {
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
    const isWithinNigeria = latitude >= nigeriaLat.min &&
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
exports.verifyLocation = verifyLocation;
// Complete account creation
const createAccount = (req, res) => {
    const { identityType, identityNumber, firstName, lastName, dob, email, phone, address, latitude, longitude, faceVerified, documentsUploaded } = req.body;
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
            duplicateType: "identity_number",
            existingAccountInfo: {
                accountNumber: existingAccount.accountNumber,
                email: existingAccount.email,
                phone: existingAccount.phone,
                createdAt: existingAccount.createdAt
            }
        });
        return;
    }
    // Check for existing account with this email
    const existingAccountByEmail = checkExistingAccountByEmail(email);
    if (existingAccountByEmail) {
        res.status(409).json({
            success: false,
            message: `An account already exists with this email address (${email}). Each person can only have one account.`,
            duplicateType: "email",
            existingAccountInfo: {
                accountNumber: existingAccountByEmail.accountNumber,
                email: existingAccountByEmail.email,
                createdAt: existingAccountByEmail.createdAt
            }
        });
        return;
    }
    // Check for existing account with this phone number
    const existingAccountByPhone = checkExistingAccountByPhone(phone);
    if (existingAccountByPhone) {
        res.status(409).json({
            success: false,
            message: `An account already exists with this phone number (${phone}). Each person can only have one account.`,
            duplicateType: "phone",
            existingAccountInfo: {
                accountNumber: existingAccountByPhone.accountNumber,
                phone: existingAccountByPhone.phone,
                createdAt: existingAccountByPhone.createdAt
            }
        });
        return;
    }
    // Verify identity first
    let verified = false;
    if (identityType === "NIN") {
        const ninRecord = (0, ninDatabase_1.findNINRecord)(identityNumber);
        verified = ninRecord !== null && ninRecord.status === "active";
    }
    else if (identityType === "BVN") {
        const bvnRecord = (0, ninDatabase_1.findBVNRecord)(identityNumber);
        verified = bvnRecord !== null;
    }
    if (!verified) {
        res.status(400).json({
            success: false,
            message: "Identity verification failed. Cannot create account.",
        });
        return;
    }
    // Generate account number with new formula: 42 + last 4 NIN + YYMMDD
    const accountNumber = generateAccountNumber(dob, identityNumber);
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
║       ✅ NEW ACCOUNT CREATED               ║
╠════════════════════════════════════════════╣
║ Account Number: ${accountNumber}           ║
║ Identity: ${identityType} - ***${identityNumber.slice(-4)}        ║
║ Email: ${email.padEnd(30)}║
║ Phone: ${phone.padEnd(30)}║
║ Status: ${accountStatus.padEnd(33)}║
║ KYC Tier: Tier ${kycTier} (${tierInfo?.description})        ║
║ Trust Score: ${(trustScore * 100).toFixed(0)}%                            ║
╠════════════════════════════════════════════╣
║ 🛡️  Duplicate Prevention: Active          ║
║ Total Accounts: ${accountsStore.size.toString().padEnd(27)}║
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
exports.createAccount = createAccount;
// Get trust score
const getTrustScore = (req, res) => {
    const factors = req.body;
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
exports.getTrustScore = getTrustScore;
// KYC Tier Upgrade
const upgradeKYCTier = (req, res) => {
    const { currentTier, targetTier, utilityBill, idCard, proofOfAddress, bankStatement } = req.body;
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
exports.upgradeKYCTier = upgradeKYCTier;
