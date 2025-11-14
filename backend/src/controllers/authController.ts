import express from "express";

// In-memory storage for tokens (in production, use database)
interface TokenStore {
  [key: string]: {
    token: string;
    expiry: number;
    verified: boolean;
    type: 'email' | 'phone';
    contact: string;
  };
}

const tokenStore: TokenStore = {};

// Generate random 6-digit token
function generateToken(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send token to email or phone (POST /auth/send-token)
export const sendToken = (req: express.Request, res: express.Response): void => {
  const { email, phone, type } = req.body;

  // Validate input
  if (type === 'email') {
    if (!email || !email.includes('@')) {
      res.status(400).json({
        success: false,
        message: "Valid email is required"
      });
      return;
    }
  } else if (type === 'phone') {
    if (!phone || phone.length < 10) {
      res.status(400).json({
        success: false,
        message: "Valid phone number is required"
      });
      return;
    }
  } else {
    res.status(400).json({
      success: false,
      message: "Type must be 'email' or 'phone'"
    });
    return;
  }

  const contact = type === 'email' ? email : phone;
  const key = `${type}:${contact}`;

  // Generate token
  const token = generateToken();
  const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes

  // Store token
  tokenStore[key] = {
    token,
    expiry,
    verified: false,
    type,
    contact
  };

  // Simulate sending email or SMS (in production, use SendGrid, Twilio, etc.)
  if (type === 'email') {
    console.log(`
╔════════════════════════════════════════════╗
║        EMAIL TOKEN VERIFICATION            ║
╠════════════════════════════════════════════╣
║ To: ${email.padEnd(38)} ║
║ Subject: Your ZeroFlow Verification Code   ║
║                                            ║
║ Your verification code is:                 ║
║                                            ║
║            ${token}                        ║
║                                            ║
║ This code expires in 10 minutes.           ║
║                                            ║
║ If you didn't request this, ignore it.     ║
╚════════════════════════════════════════════╝
    `);
  } else {
    console.log(`
╔════════════════════════════════════════════╗
║        SMS TOKEN VERIFICATION              ║
╠════════════════════════════════════════════╣
║ To: ${phone.padEnd(38)} ║
║                                            ║
║ ZeroFlow Verification Code:                ║
║                                            ║
║            ${token}                        ║
║                                            ║
║ Valid for 10 minutes. Do not share.        ║
╚════════════════════════════════════════════╝
    `);
  }

  res.json({
    success: true,
    message: `Verification token sent to your ${type}. Check console for demo.`,
    expiresIn: "10 minutes",
    type,
    contact,
    // For demo purposes only - remove in production!
    demoToken: token
  });
};

// Verify token (POST /auth/verify-token)
export const verifyToken = (req: express.Request, res: express.Response): void => {
  const { email, phone, token, type } = req.body;

  if (!token) {
    res.status(400).json({
      success: false,
      message: "Token is required"
    });
    return;
  }

  if (!type || (type !== 'email' && type !== 'phone')) {
    res.status(400).json({
      success: false,
      message: "Type must be 'email' or 'phone'"
    });
    return;
  }

  const contact = type === 'email' ? email : phone;
  if (!contact) {
    res.status(400).json({
      success: false,
      message: `${type} is required`
    });
    return;
  }

  const key = `${type}:${contact}`;
  const stored = tokenStore[key];

  if (!stored) {
    res.status(404).json({
      success: false,
      message: `No verification request found for this ${type}`
    });
    return;
  }

  // Check if expired
  if (Date.now() > stored.expiry) {
    delete tokenStore[key];
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
    message: `${type === 'email' ? 'Email' : 'Phone'} verified successfully!`,
    verified: true,
    type,
    contact
  });
};

// Check if email/phone is verified
export const checkVerification = (req: express.Request, res: express.Response): void => {
  const { email, phone, type } = req.query;

  if (!type || (type !== 'email' && type !== 'phone')) {
    res.status(400).json({
      success: false,
      message: "Type must be 'email' or 'phone'"
    });
    return;
  }

  const contact = type === 'email' ? email : phone;
  if (!contact || typeof contact !== 'string') {
    res.status(400).json({
      success: false,
      message: `${type} is required`
    });
    return;
  }

  const key = `${type}:${contact}`;
  const stored = tokenStore[key];

  if (!stored || !stored.verified) {
    res.json({
      success: true,
      verified: false,
      message: `${type === 'email' ? 'Email' : 'Phone'} not verified`
    });
    return;
  }

  res.json({
    success: true,
    verified: true,
    message: `${type === 'email' ? 'Email' : 'Phone'} is verified`
  });
};

// Resend token
export const resendToken = (req: express.Request, res: express.Response): void => {
  const { email, phone, type } = req.body;

  if (!type || (type !== 'email' && type !== 'phone')) {
    res.status(400).json({
      success: false,
      message: "Type must be 'email' or 'phone'"
    });
    return;
  }

  const contact = type === 'email' ? email : phone;
  if (!contact) {
    res.status(400).json({
      success: false,
      message: `${type} is required`
    });
    return;
  }

  // Delete old token and send new one
  const key = `${type}:${contact}`;
  delete tokenStore[key];

  // Call sendToken logic
  sendToken(req, res);
};
