import express from "express";
import {
  sendToken,
  verifyToken,
  checkVerification,
  resendToken
} from "../controllers/authController";

const router = express.Router();

// Send verification token to email
router.post("/send-token", sendToken);

// Verify token
router.post("/verify-token", verifyToken);

// Check if email is verified
router.get("/check-verification", checkVerification);

// Resend token
router.post("/resend-token", resendToken);

export default router;
