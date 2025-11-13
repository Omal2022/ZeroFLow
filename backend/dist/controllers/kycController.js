"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTrustScore = exports.createAccount = exports.verifyLocation = exports.verifyIdentity = exports.verifyBVN = exports.verifyNIN = void 0;
exports.generateAccountNumber = generateAccountNumber;
exports.calculateTrustScore = calculateTrustScore;
const ninDatabase_1 = require("../mockDb/ninDatabase");
// Account number generation: 42 + DDMMYY + 2 random digits
function generateAccountNumber(dob) {
    const date = new Date(dob);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    const randomDigits = Math.floor(Math.random() * 90) + 10; // 10-99
    return `42${day}${month}${year}${randomDigits}`;
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
    // Generate account number
    const accountNumber = generateAccountNumber(dob);
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
    res.json({
        success: true,
        message: `Account created successfully! ${accountStatus === "active" ? "Your account is now active." : "Your account is under review."}`,
        data: {
            accountNumber,
            accountStatus,
            trustScore,
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
