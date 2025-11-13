import express from "express";
import {
  verifyNIN,
  verifyBVN,
  verifyIdentity,
  verifyLocation,
  createAccount,
  getTrustScore,
  upgradeKYCTier,
  checkExistingAccount
} from "../controllers/kycController";

const router = express.Router();

// Identity verification endpoints
router.post("/verify/nin", verifyNIN);
router.post("/verify/bvn", verifyBVN);
router.post("/verify/identity", verifyIdentity);

// Location verification
router.post("/verify/location", verifyLocation);

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

  const existingAccount = checkExistingAccount(identityNumber);

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
  } else {
    res.json({
      success: true,
      exists: false,
      message: "No existing account found. You can proceed with registration."
    });
  }
});

// Account creation
router.post("/create-account", createAccount);

// Trust score calculation
router.post("/trust-score", getTrustScore);

// KYC tier upgrade
router.post("/upgrade", upgradeKYCTier);

export default router;
