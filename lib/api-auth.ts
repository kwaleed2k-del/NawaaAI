import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/* ══ Authentication ══ */
export async function authenticateRequest() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { user: null, error: NextResponse.json({ error: "Not authenticated" }, { status: 401 }) };
  }
  return { user, error: null };
}

/* ══ Constants ══ */
/** Maximum length for short string inputs (names, topics) */
const MAX_STRING_LENGTH = 500;
/** Maximum length for long-form text (descriptions, company profiles) */
const MAX_LONG_TEXT_LENGTH = 8_000;
/** Maximum length for a single chat message */
const MAX_MESSAGE_LENGTH = 4_096;
/** Maximum number of rate limit entries before eviction */
const MAX_RATE_LIMIT_ENTRIES = 10_000;
/** Rate limit cleanup interval (5 minutes) */
const RATE_LIMIT_CLEANUP_MS = 300_000;
/** Default rate limit window (1 minute) */
const DEFAULT_WINDOW_MS = 60_000;
/** Default max requests per window for unlisted endpoints */
const DEFAULT_MAX_REQUESTS = 30;

/* ══ Input Validation Helpers ══ */

export function validateStringInput(value: unknown, fieldName: string, maxLen = MAX_STRING_LENGTH): string | null {
  if (typeof value !== "string" || value.trim().length === 0) return `${fieldName} is required`;
  if (value.length > maxLen) return `${fieldName} must be under ${maxLen} characters`;
  return null;
}

export function validateMessageContent(messages: unknown): string | null {
  if (!Array.isArray(messages) || messages.length === 0) return "Messages are required";
  for (const msg of messages) {
    if (!msg || typeof msg.content !== "string") return "Invalid message format";
    if (msg.content.length > MAX_MESSAGE_LENGTH) return `Message too long (max ${MAX_MESSAGE_LENGTH} chars)`;
    if (!["user", "assistant"].includes(msg.role)) return "Invalid message role";
  }
  return null;
}

export { MAX_STRING_LENGTH, MAX_LONG_TEXT_LENGTH, MAX_MESSAGE_LENGTH };

/** Standardized error response factory */
export function apiError(message: string, status: number, code?: string): NextResponse {
  return NextResponse.json({ error: message, ...(code && { code }) }, { status });
}

/** Standardized success response factory */
export function apiSuccess<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

/* ══ Rate Limiting (in-memory, per-user per-endpoint) ══ */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMITS: Record<string, { max: number; windowMs: number }> = {
  "/api/analyze-company": { max: 3, windowMs: DEFAULT_WINDOW_MS },
  "/api/competitor-analysis": { max: 2, windowMs: DEFAULT_WINDOW_MS },
  "/api/generate-plan": { max: 5, windowMs: DEFAULT_WINDOW_MS },
  "/api/generate-images": { max: 5, windowMs: DEFAULT_WINDOW_MS },
  "/api/hashtags/generate": { max: 15, windowMs: DEFAULT_WINDOW_MS },
  "/api/extract-pdf": { max: 5, windowMs: DEFAULT_WINDOW_MS },
  "/api/extract-colors": { max: 15, windowMs: DEFAULT_WINDOW_MS },
  "/api/upload-logo": { max: 5, windowMs: DEFAULT_WINDOW_MS },
  "/api/chat": { max: 20, windowMs: DEFAULT_WINDOW_MS },
};

// Clean stale entries periodically, enforce max size
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetAt) rateLimitMap.delete(key);
  }
}, RATE_LIMIT_CLEANUP_MS);

export function checkRateLimit(userId: string, endpoint: string): NextResponse | null {
  const config = RATE_LIMITS[endpoint] ?? { max: DEFAULT_MAX_REQUESTS, windowMs: DEFAULT_WINDOW_MS };
  const key = `${userId}:${endpoint}`;
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    // Prevent unbounded memory growth
    if (rateLimitMap.size >= MAX_RATE_LIMIT_ENTRIES) {
      const oldest = rateLimitMap.keys().next().value;
      if (oldest) rateLimitMap.delete(oldest);
    }
    rateLimitMap.set(key, { count: 1, resetAt: now + config.windowMs });
    return null;
  }
  if (entry.count >= config.max) {
    return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 });
  }
  entry.count++;
  return null;
}

/* ══ URL Validation (block SSRF + DNS rebinding) ══ */
const BLOCKED_HOSTNAMES = new Set([
  "localhost", "127.0.0.1", "0.0.0.0", "::1", "[::1]",
  "metadata.google.internal", "169.254.169.254",
  "metadata.google", "metadata",
]);

const PRIVATE_IP_REGEX = /^(10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|192\.168\.\d+\.\d+|169\.254\.\d+\.\d+|127\.\d+\.\d+\.\d+|0\.0\.0\.0|fd[0-9a-f]{2}:|fc[0-9a-f]{2}:)$/i;

export function validateExternalUrl(url: string): { valid: boolean; error?: string } {
  try {
    let normalized = url.trim();
    if (!/^https?:\/\//i.test(normalized)) normalized = "https://" + normalized;
    const parsed = new URL(normalized);

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return { valid: false, error: "Only HTTP/HTTPS URLs are allowed" };
    }

    const h = parsed.hostname.toLowerCase();

    // Block known internal/metadata hostnames
    if (BLOCKED_HOSTNAMES.has(h)) {
      return { valid: false, error: "Private URLs are not allowed" };
    }

    // Block private/reserved IP ranges (IPv4 + IPv6)
    if (PRIVATE_IP_REGEX.test(h)) {
      return { valid: false, error: "Private IP addresses are not allowed" };
    }

    // Block hostnames that resolve to common cloud metadata endpoints
    if (h.endsWith(".internal") || h.endsWith(".local") || h.endsWith(".localhost")) {
      return { valid: false, error: "Internal hostnames are not allowed" };
    }

    // Block numeric-only hostnames (potential IP obfuscation like 0x7f000001)
    if (/^[\d.]+$/.test(h) && !h.includes(".")) {
      return { valid: false, error: "Invalid hostname format" };
    }

    // Block URLs with credentials (user:pass@host)
    if (parsed.username || parsed.password) {
      return { valid: false, error: "URLs with credentials are not allowed" };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: "Invalid URL format" };
  }
}
