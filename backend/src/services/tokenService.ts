import Redis from "ioredis";
import crypto from "crypto";
import logger from "../utils/logger";

// Redis connection

const redisUrl = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";
const redis = new Redis(redisUrl);

type VerifyResult = "VERIFIED" | "INVALID" | "EXPIRED" | "NOT_FOUND";

const TOKEN_PREFIX = "email_token:";
const VERIFIED_PREFIX = "email_verified:";

function hashToken(token: string): string {
  // SHA-256 hash (deterministic)
  return crypto.createHash("sha256").update(token).digest("hex");
}

function tokenKey(email: string) {
  return TOKEN_PREFIX + email.toLowerCase();
}

function verifiedKey(email: string) {
  return VERIFIED_PREFIX + email.toLowerCase();
}

const generateToken = (): string => {
  // 6-digit numeric token
  return Math.floor(100000 + Math.random() * 900000).toString();
};

async function storeToken(email: string, token: string, ttlSeconds: number) {
  const hashed = hashToken(token);
  const key = tokenKey(email);
  // store hashed token and expiry timestamp for reference
  const payload = JSON.stringify({ hashed });
  await redis.set(key, payload, "EX", ttlSeconds);
  logger.info(`Stored token for ${email} (ttl ${ttlSeconds}s)`);
}

async function verifyToken(email: string, token: string): Promise<VerifyResult> {
  const key = tokenKey(email);
  const payload = await redis.get(key);
  if (!payload) return "NOT_FOUND";

  try {
    const parsed = JSON.parse(payload) as { hashed: string };
    const hashedInput = hashToken(token);

    if (parsed.hashed !== hashedInput) {
      return "INVALID";
    }

    // token valid -> mark verified in Redis (no expiry) or with long expiry
    await redis.set(verifiedKey(email), "true", "EX", 60 * 60 * 24 * 30); // mark verified for 30 days
    // clear token
    await redis.del(key);
    return "VERIFIED";
  } catch (err: any) {
    logger.error("Error parsing token payload", err);
    return "INVALID";
  }
}

async function isVerified(email: string): Promise<boolean> {
  const key = verifiedKey(email);
  const v = await redis.get(key);
  return v === "true";
}

async function deleteToken(email: string) {
  await redis.del(tokenKey(email));
}

export default {
  generateToken,
  storeToken,
  verifyToken,
  isVerified,
  deleteToken
};
