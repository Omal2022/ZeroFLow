import express from "express";
import {
  verifyNIN,
  verifyBVN,
  verifyIdentity,
  verifyLocation,
  createAccount,
  getTrustScore,
  upgradeKYCTier
} from "../controllers/kycController";

const router = express.Router();

// Identity verification endpoints
router.post("/verify/nin", verifyNIN);
router.post("/verify/bvn", verifyBVN);
router.post("/verify/identity", verifyIdentity);

// Location verification
router.post("/verify/location", verifyLocation);

// Account creation
router.post("/create-account", createAccount);

// Trust score calculation
router.post("/trust-score", getTrustScore);

// KYC tier upgrade
router.post("/upgrade", upgradeKYCTier);

export default router;
