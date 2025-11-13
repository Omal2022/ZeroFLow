import nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Email configuration interface
export interface EmailConfig {
  to: string;
  subject: string;
  html: string;
}

// Create reusable transporter using Gmail
export const createTransporter = () => {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_PASS;

  if (!gmailUser || !gmailPass) {
    throw new Error('Gmail credentials not configured. Please set GMAIL_USER and GMAIL_PASS in .env file');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailPass, // App password, not regular password
    },
  });
};

// Send verification email with token
export const sendVerificationEmail = async (email: string, token: string): Promise<boolean> => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"ZeroFlow KYC" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Email Verification - ZeroFlow',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 10px;
              padding: 30px;
              color: white;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .content {
              background: white;
              color: #333;
              border-radius: 8px;
              padding: 30px;
              margin: 20px 0;
            }
            .token {
              font-size: 36px;
              font-weight: bold;
              text-align: center;
              letter-spacing: 8px;
              color: #667eea;
              background: #f0f4ff;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .info {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .footer {
              text-align: center;
              font-size: 12px;
              color: rgba(255, 255, 255, 0.8);
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 ZeroFlow KYC</h1>
              <p>Email Verification</p>
            </div>

            <div class="content">
              <h2>Hello!</h2>
              <p>Thank you for registering with ZeroFlow. To complete your account creation, please verify your email address.</p>

              <p>Your verification code is:</p>

              <div class="token">${token}</div>

              <div class="info">
                <strong>⏰ Important:</strong> This code will expire in <strong>10 minutes</strong>.
              </div>

              <p>If you didn't request this code, please ignore this email.</p>

              <p>Best regards,<br>The ZeroFlow Team</p>
            </div>

            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
              <p>&copy; 2025 ZeroFlow. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${email} - Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    return false;
  }
};

// Send generic email
export const sendEmail = async (config: EmailConfig): Promise<boolean> => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"ZeroFlow" <${process.env.GMAIL_USER}>`,
      to: config.to,
      subject: config.subject,
      html: config.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${config.to} - Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return false;
  }
};
