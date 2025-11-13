// import express from "express";
// import {
//   sendToken,
//   verifyToken,
//   checkVerification,
//   resendToken
// } from "../controllers/authController";

// const router = express.Router();

// // Send verification token to email
// router.post("/send-token", sendToken);

// // Verify token
// router.post("/verify-token", verifyToken);

// // Check if email is verified
// router.get("/check-verification", checkVerification);

// // Resend token
// router.post("/resend-token", resendToken);

// export default router;

import express from "express";
import { z } from "zod";
import validate from "../middleware/validate";
import {
  sendTokenHandler,
  verifyTokenHandler,
  checkVerificationHandler,
  resendTokenHandler,
} from "../controllers/authController";

const router = express.Router();



// Schemas
const sendSchema = z.object({
  email: z.string().email(),
});

const verifySchema = z.object({
  email: z.string().email(),
  token: z.string().min(1),
});

const resendSchema = z.object({
  email: z.string().email(),
});

router.post(
  "/send-token",
  validate(sendSchema),
  sendTokenHandler
);
router.post("/verify-token", validate(verifySchema), verifyTokenHandler);
router.get("/check", checkVerificationHandler);
router.post("/resend-token", validate(resendSchema), resendTokenHandler);

export default router;
