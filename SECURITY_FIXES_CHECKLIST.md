# 🔒 ZeroFlow Security Fixes Checklist

## ✅ Quick Action Items (Start Here)

### CRITICAL - Fix Today
- [ ] Remove `demoToken` from `/auth/send-token` response (`authController.ts:65`)
- [ ] Install and configure `express-rate-limit` package
- [ ] Replace `Math.random()` with `crypto.randomInt()` (`authController.ts:16`)
- [ ] Remove all console.log statements with sensitive data
- [ ] Add authentication middleware to all protected routes

### HIGH - Fix This Week
- [ ] Install and configure `validator.js` for input sanitization
- [ ] Add server-side face verification (remove client-side bypass)
- [ ] Fix trust score to be calculated only server-side
- [ ] Add proper email validation with regex
- [ ] Implement HTTPS enforcement in production
- [ ] Add file type validation for document uploads
- [ ] Hash and encrypt sensitive data (NIN, BVN) at rest

### MEDIUM - Fix This Month
- [ ] Install and configure `helmet` for security headers
- [ ] Add request size limits to bodyParser
- [ ] Implement proper CORS configuration with env variables
- [ ] Add token cleanup mechanism for expired tokens
- [ ] Implement comprehensive error handling (no verbose errors)

### LOW - Ongoing
- [ ] Implement audit logging (winston)
- [ ] Set up monitoring and alerting
- [ ] Create incident response plan

---

## 📦 Required NPM Packages

```bash
# Install security dependencies
npm install --save express-rate-limit
npm install --save helmet
npm install --save validator
npm install --save xss
npm install --save jsonwebtoken
npm install --save bcrypt
npm install --save winston
npm install --save dotenv
```

---

## 🔧 Quick Fixes (Copy & Paste)

### 1. Rate Limiting
**File:** `backend/src/server.ts`
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use(limiter);

// Strict limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5
});

app.use('/auth/', authLimiter);
```

### 2. Security Headers
**File:** `backend/src/server.ts`
```typescript
import helmet from 'helmet';

app.use(helmet());
```

### 3. Secure Token Generation
**File:** `backend/src/controllers/authController.ts`
```typescript
import crypto from 'crypto';

function generateToken(): string {
  return crypto.randomInt(100000, 999999).toString();
}
```

### 4. Input Validation
**File:** Create `backend/src/middleware/validation.ts`
```typescript
import validator from 'validator';
import xss from 'xss';

export function sanitizeString(input: string): string {
  return xss(validator.trim(input));
}

export function validateEmail(email: string): boolean {
  return validator.isEmail(email);
}

export function validateNIN(nin: string): boolean {
  return /^\d{11}$/.test(nin);
}
```

### 5. Authentication Middleware
**File:** Create `backend/src/middleware/auth.ts`
```typescript
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
}
```

### 6. HTTPS Enforcement
**File:** Create `backend/src/middleware/httpsRedirect.ts`
```typescript
import { Request, Response, NextFunction } from 'express';

export function httpsRedirect(req: Request, res: Response, next: NextFunction) {
  if (process.env.NODE_ENV === 'production' && req.header('x-forwarded-proto') !== 'https') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
}
```

---

## 🎯 Priority Order

1. **Remove token exposure** (5 min)
2. **Add rate limiting** (15 min)
3. **Fix crypto token gen** (5 min)
4. **Add helmet** (5 min)
5. **Add auth middleware** (30 min)
6. **Input sanitization** (1 hour)
7. **Server-side verification** (2-3 hours)
8. **Encrypt sensitive data** (3-4 hours)

**Total Time to Basic Security:** ~1 day

---

## 🔴 DO NOT Deploy Until:

- [ ] All CRITICAL vulnerabilities fixed
- [ ] All HIGH vulnerabilities fixed
- [ ] Security testing performed
- [ ] Code review completed
- [ ] Penetration testing with running app
- [ ] Environment variables properly configured
- [ ] HTTPS configured
- [ ] Database encryption enabled
- [ ] Monitoring/logging active

---

## 📚 Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Security Checklist](https://github.com/goldbergyoni/nodebestpractices#6-security-best-practices)
- [CBN KYC Guidelines](https://www.cbn.gov.ng/)

---

## 🧪 Testing Commands

```bash
# Test rate limiting
for i in {1..10}; do curl http://localhost:5000/auth/send-token -d '{"email":"test@test.com"}' -H "Content-Type: application/json"; done

# Test XSS protection
curl -X POST http://localhost:5000/kyc/create-account \
  -H "Content-Type: application/json" \
  -d '{"firstName":"<script>alert(1)</script>","lastName":"Test"}'

# Test authentication
curl http://localhost:5000/kyc/create-account
# Should return 401 Unauthorized
```

---

Updated: November 13, 2025
