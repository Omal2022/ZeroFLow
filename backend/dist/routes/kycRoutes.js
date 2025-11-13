"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const kycController_1 = require("../controllers/kycController");
const router = express_1.default.Router();
// Identity verification endpoints
router.post("/verify/nin", kycController_1.verifyNIN);
router.post("/verify/bvn", kycController_1.verifyBVN);
router.post("/verify/identity", kycController_1.verifyIdentity);
// Location verification
router.post("/verify/location", kycController_1.verifyLocation);
// Check for existing account
router.post("/check-account", (req, res) => {
    const { identityNumber } = req.body;
    if (!identityNumber) {
        res.status(400).json({
            success: false,
            message: "Identity number is required."
        });
        return;
    }
    const existingAccount = (0, kycController_1.checkExistingAccount)(identityNumber);
    if (existingAccount) {
        res.json({
            success: true,
            exists: true,
            message: "An account already exists with this identity number.",
            accountInfo: {
                accountNumber: existingAccount.accountNumber,
                createdAt: existingAccount.createdAt
            }
        });
    }
    else {
        res.json({
            success: true,
            exists: false,
            message: "No existing account found. You can proceed with registration."
        });
    }
});
// Account creation
router.post("/create-account", kycController_1.createAccount);
// Trust score calculation
router.post("/trust-score", kycController_1.getTrustScore);
// KYC tier upgrade
router.post("/upgrade", kycController_1.upgradeKYCTier);
exports.default = router;
