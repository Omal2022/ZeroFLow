import express from "express";

// In-memory storage for tokens (in production, use database)
interface TokenStore {
  [email: string]: {
    token: string;
    expiry: number;
    verified: boolean;
  };
}

const tokenStore: TokenStore = {};

// Generate random 6-digit token
function generateToken(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send token to email (POST /auth/send-token)
export const sendToken = (req: express.Request, res: express.Response): void => {
  const { email } = req.body;

  if (!email || !email.includes('@')) {
    res.status(400).json({
      success: false,
      message: "Valid email is required"
    });
    return;
  }

  // Generate token
  const token = generateToken();
  const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes

  // Store token
  tokenStore[email] = {
    token,
    expiry,
    verified: false
  };

  // Simulate sending email (in production, use SendGrid, AWS SES, etc.)
  console.log(`
╔════════════════════════════════════════════╗
║        EMAIL TOKEN VERIFICATION            ║
╠════════════════════════════════════════════╣
║ To: ${email}
║ Subject: Your ZeroFlow Verification Code   ║
║                                            ║
║ Your verification code is:                 ║
║                                            ║
║            ${token}                    ║
║                                            ║
║ This code expires in 10 minutes.           ║
║                                            ║
║ If you didn't request this, ignore it.     ║
╚════════════════════════════════════════════╝
  `);

  res.json({
    success: true,
    message: "Verification token sent to your email. Check console for demo.",
    expiresIn: "10 minutes",
    // For demo purposes only - remove in production!
    demoToken: token
  });
};

// Verify token (POST /auth/verify-token)
export const verifyToken = (req: express.Request, res: express.Response): void => {
  const { email, token } = req.body;

  if (!email || !token) {
    res.status(400).json({
      success: false,
      message: "Email and token are required"
    });
    return;
  }

  const stored = tokenStore[email];

  if (!stored) {
    res.status(404).json({
      success: false,
      message: "No verification request found for this email"
    });
    return;
  }

  // Check if expired
  if (Date.now() > stored.expiry) {
    delete tokenStore[email];
    res.status(400).json({
      success: false,
      message: "Token has expired. Please request a new one."
    });
    return;
  }

  // Check if token matches
  if (stored.token !== token) {
    res.status(400).json({
      success: false,
      message: "Invalid token. Please check and try again."
    });
    return;
  }

  // Mark as verified
  stored.verified = true;

  res.json({
    success: true,
    message: "Email verified successfully!",
    verified: true,
    email
  });
};

// Check if email is verified
export const checkVerification = (req: express.Request, res: express.Response): void => {
  const { email } = req.query;

  if (!email || typeof email !== 'string') {
    res.status(400).json({
      success: false,
      message: "Email is required"
    });
    return;
  }

  const stored = tokenStore[email];

  if (!stored || !stored.verified) {
    res.json({
      success: true,
      verified: false,
      message: "Email not verified"
    });
    return;
  }

  res.json({
    success: true,
    verified: true,
    message: "Email is verified"
  });
};

// Resend token
export const resendToken = (req: express.Request, res: express.Response): void => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({
      success: false,
      message: "Email is required"
    });
    return;
  }

  // Delete old token and send new one
  delete tokenStore[email];

  // Call sendToken logic
  sendToken(req, res);
};
