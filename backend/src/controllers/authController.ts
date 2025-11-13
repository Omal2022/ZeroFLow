// import express from "express";
// import { sendVerificationEmail } from "../services/emailService";

// // In-memory storage for tokens (in production, use database)
// interface TokenStore {
//   [email: string]: {
//     token: string;
//     expiry: number;
//     verified: boolean;
//   };
// }

// const tokenStore: TokenStore = {};

// // Generate random 6-digit token
// function generateToken(): string {
//   return Math.floor(100000 + Math.random() * 900000).toString();
// }

// // Send token to email (POST /auth/send-token)
// export const sendToken = async (req: express.Request, res: express.Response): Promise<void> => {
//   const { email } = req.body;

//   if (!email || !email.includes('@')) {
//     res.status(400).json({
//       success: false,
//       message: "Valid email is required"
//     });
//     return;
//   }

//   // Generate token
//   const token = generateToken();
//   const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes

//   // Store token
//   tokenStore[email] = {
//     token,
//     expiry,
//     verified: false
//   };

//   // Send email using nodemailer
//   try {
//     const emailSent = await sendVerificationEmail(email, token);

//     if (emailSent) {
//       console.log(`✅ Verification email sent successfully to ${email}`);

//       res.json({
//         success: true,
//         message: "Verification code sent to your email. Please check your inbox.",
//         expiresIn: "10 minutes"
//       });
//     } else {
//       // Email failed but token is still generated (fallback to console for demo)
//       console.log(`
// ╔════════════════════════════════════════════╗
// ║        EMAIL TOKEN VERIFICATION            ║
// ╠════════════════════════════════════════════╣
// ║ To: ${email}
// ║ Subject: Your ZeroFlow Verification Code   ║
// ║                                            ║
// ║ Your verification code is:                 ║
// ║                                            ║
// ║            ${token}                    ║
// ║                                            ║
// ║ This code expires in 10 minutes.           ║
// ║                                            ║
// ║ ⚠️  Email sending failed - using console   ║
// ╚════════════════════════════════════════════╝
//       `);

//       res.json({
//         success: true,
//         message: "Email service unavailable. Check server console for token (demo mode).",
//         expiresIn: "10 minutes",
//         // For demo/fallback only
//         demoToken: token
//       });
//     }
//   } catch (error) {
//     console.error('❌ Error in sendToken:', error);

//     // Fallback to console logging for demo
//     console.log(`
// ╔════════════════════════════════════════════╗
// ║        EMAIL TOKEN VERIFICATION            ║
// ╠════════════════════════════════════════════╣
// ║ To: ${email}
// ║ Your verification code is: ${token}        ║
// ║ This code expires in 10 minutes.           ║
// ║                                            ║
// ║ ⚠️  Email service error - check config     ║
// ╚════════════════════════════════════════════╝
//     `);

//     res.json({
//       success: true,
//       message: "Email service error. Check server console for token (demo mode).",
//       expiresIn: "10 minutes",
//       demoToken: token
//     });
//   }
// };

// // Verify token (POST /auth/verify-token)
// export const verifyToken = (req: express.Request, res: express.Response): void => {
//   const { email, token } = req.body;

//   if (!email || !token) {
//     res.status(400).json({
//       success: false,
//       message: "Email and token are required"
//     });
//     return;
//   }

//   const stored = tokenStore[email];

//   if (!stored) {
//     res.status(404).json({
//       success: false,
//       message: "No verification request found for this email"
//     });
//     return;
//   }

//   // Check if expired
//   if (Date.now() > stored.expiry) {
//     delete tokenStore[email];
//     res.status(400).json({
//       success: false,
//       message: "Token has expired. Please request a new one."
//     });
//     return;
//   }

//   // Check if token matches
//   if (stored.token !== token) {
//     res.status(400).json({
//       success: false,
//       message: "Invalid token. Please check and try again."
//     });
//     return;
//   }

//   // Mark as verified
//   stored.verified = true;

//   res.json({
//     success: true,
//     message: "Email verified successfully!",
//     verified: true,
//     email
//   });
// };

// // Check if email is verified
// export const checkVerification = (req: express.Request, res: express.Response): void => {
//   const { email } = req.query;

//   if (!email || typeof email !== 'string') {
//     res.status(400).json({
//       success: false,
//       message: "Email is required"
//     });
//     return;
//   }

//   const stored = tokenStore[email];

//   if (!stored || !stored.verified) {
//     res.json({
//       success: true,
//       verified: false,
//       message: "Email not verified"
//     });
//     return;
//   }

//   res.json({
//     success: true,
//     verified: true,
//     message: "Email is verified"
//   });
// };

// // Resend token
// export const resendToken = async (req: express.Request, res: express.Response): Promise<void> => {
//   const { email } = req.body;

//   if (!email) {
//     res.status(400).json({
//       success: false,
//       message: "Email is required"
//     });
//     return;
//   }

//   // Delete old token and send new one
//   delete tokenStore[email];

//   // Call sendToken logic
//   await sendToken(req, res);
// };


import { Request, Response, NextFunction } from "express";
import tokenService from "../services/tokenService";
import emailService from "../services/emailService";

const EXPIRES_SECONDS = 10 * 60; // 10 minutes

export const sendTokenHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body as { email: string };

    // Generate token and store hashed token with expiry in Redis
    const token = tokenService.generateToken();
    await tokenService.storeToken(email, token, EXPIRES_SECONDS);

    // Try send email; fallback to console
    const sent = await emailService.sendVerificationEmail(email, token);

    if (sent) {
      return res.json({
        success: true,
        message: "Verification code sent to your email.",
        expiresIn: `${EXPIRES_SECONDS} seconds`
      });
    } else {
      return res.json({
        success: true,
        message: "Email service unavailable. Token logged to server (demo).",
        expiresIn: `${EXPIRES_SECONDS} seconds`,
        demoToken: token // only in fallback
      });
    }
  } catch (err) {
    next(err);
  }
};

export const verifyTokenHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, token } = req.body as { email: string; token: string };

    const result = await tokenService.verifyToken(email, token);
    if (result === "NOT_FOUND") {
      return res.status(404).json({ success: false, message: "No verification request found for this email" });
    } else if (result === "EXPIRED") {
      return res.status(400).json({ success: false, message: "Token has expired. Please request a new one." });
    } else if (result === "INVALID") {
      return res.status(400).json({ success: false, message: "Invalid token. Please check and try again." });
    }

    // result === "VERIFIED"
    return res.json({ success: true, message: "Email verified successfully!", verified: true, email });
  } catch (err) {
    next(err);
  }
};

export const checkVerificationHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const emailQuery = req.query.email;
    if (!emailQuery || typeof emailQuery !== "string") {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const verified = await tokenService.isVerified(emailQuery);
    if (!verified) {
      return res.json({ success: true, verified: false, message: "Email not verified" });
    }
    return res.json({ success: true, verified: true, message: "Email is verified" });
  } catch (err) {
    next(err);
  }
};

export const resendTokenHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body as { email: string };
    // Delete any existing token and generate new one
    await tokenService.deleteToken(email);

    // reuse sendTokenHandler logic (but directly here to keep flow simple)
    const token = tokenService.generateToken();
    await tokenService.storeToken(email, token, EXPIRES_SECONDS);
    const sent = await emailService.sendVerificationEmail(email, token);

    if (sent) {
      return res.json({
        success: true,
        message: "New verification code sent to your email.",
        expiresIn: `${EXPIRES_SECONDS} seconds`
      });
    } else {
      return res.json({
        success: true,
        message: "Email service unavailable. Token logged to server (demo).",
        expiresIn: `${EXPIRES_SECONDS} seconds`,
        demoToken: token
      });
    }
  } catch (err) {
    next(err);
  }
};
