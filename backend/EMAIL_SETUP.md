# Email Verification Setup Guide

This guide explains how to set up email verification using Gmail and Nodemailer for the ZeroFlow KYC application.

## Prerequisites

- Gmail account
- Gmail App Password (required for security)

## Step 1: Install Nodemailer

Since nodemailer might not be installed due to network restrictions, you need to install it manually:

```bash
cd backend
npm install nodemailer @types/nodemailer
```

**Alternative using yarn:**
```bash
cd backend
yarn add nodemailer @types/nodemailer
```

## Step 2: Generate Gmail App Password

Gmail requires an "App Password" instead of your regular password for security reasons.

### How to generate a Gmail App Password:

1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security** → **2-Step Verification** (enable it if not already enabled)
3. Scroll down to **App passwords**
4. Click **Select app** → Choose "Mail"
5. Click **Select device** → Choose "Other (Custom name)"
6. Enter "ZeroFlow KYC" or any name
7. Click **Generate**
8. Copy the 16-character password (format: `xxxx xxxx xxxx xxxx`)

## Step 3: Configure Environment Variables

The `.env` file in `/backend/.env` should contain:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Gmail Configuration for Email Verification
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your app password here
```

**Important:**
- Replace `your-email@gmail.com` with your actual Gmail address
- Replace `your app password here` with the 16-character App Password (spaces are OK)
- Never commit `.env` to git (it's already in `.gitignore`)

## Step 4: Test Email Sending

Start the backend server:

```bash
cd backend
npm run dev
```

Test the email endpoint:

```bash
curl -X POST http://localhost:5000/auth/send-token \
  -H "Content-Type: application/json" \
  -d '{"email":"recipient@example.com"}'
```

You should receive an email with a 6-digit verification code.

## Email Flow

1. **User enters email** → Frontend calls `/auth/send-token`
2. **Backend generates 6-digit code** → Sends email via Gmail SMTP
3. **User receives email** → Enters code in verification field
4. **Frontend calls `/auth/verify-token`** → Backend validates code
5. **User proceeds** → Can continue to next step (face verification)

## Email Template

The verification email includes:
- Professional HTML design with ZeroFlow branding
- 6-digit verification code in large, readable format
- 10-minute expiration warning
- Responsive design for mobile devices

## Troubleshooting

### Error: "Gmail credentials not configured"
- Check that `GMAIL_USER` and `GMAIL_PASS` are set in `.env`
- Restart the backend server after modifying `.env`

### Error: "Invalid login: 535-5.7.8 Username and Password not accepted"
- You're using your regular Gmail password instead of an App Password
- Generate an App Password (see Step 2)
- Ensure 2-Step Verification is enabled on your Google Account

### Error: "tunneling socket could not be established"
- Network firewall or proxy blocking Gmail SMTP
- Check internet connection
- Try different network if on corporate/restricted network

### Fallback Mode
If email sending fails, the system falls back to console logging for development:
- Token will be printed in server console
- Response includes `demoToken` field for testing

## Security Notes

1. **Never commit `.env` file** - Contains sensitive credentials
2. **Use App Passwords** - Never use your actual Gmail password
3. **Rotate credentials** - Change App Password periodically
4. **Production considerations:**
   - Use proper email service (SendGrid, AWS SES, Mailgun)
   - Implement rate limiting to prevent abuse
   - Store tokens in database instead of memory
   - Add email template versioning

## Files Modified

- `/backend/src/services/emailService.ts` - Email sending utility
- `/backend/src/controllers/authController.ts` - Updated to use nodemailer
- `/backend/.env` - Gmail credentials (not in git)
- `/backend/package.json` - Added nodemailer dependencies

## Support

For issues or questions, check:
- Nodemailer documentation: https://nodemailer.com/
- Gmail App Passwords: https://support.google.com/accounts/answer/185833
