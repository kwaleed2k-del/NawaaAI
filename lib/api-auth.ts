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

/* ══ Rate Limiting (in-memory, per-user per-endpoint) ══ */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMITS: Record<string, { max: number; windowMs: number }> = {
  "/api/analyze-company": { max: 5, windowMs: 60_000 },
  "/api/competitor-analysis": { max: 3, windowMs: 60_000 },
  "/api/generate-plan": { max: 10, windowMs: 60_000 },
  "/api/generate-images": { max: 10, windowMs: 60_000 },
  "/api/hashtags/generate": { max: 20, windowMs: 60_000 },
  "/api/extract-pdf": { max: 10, windowMs: 60_000 },
  "/api/extract-colors": { max: 20, windowMs: 60_000 },
  "/api/upload-logo": { max: 10, windowMs: 60_000 },
  "/api/chat": { max: 30, windowMs: 60_000 },
};

// Clean stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetAt) rateLimitMap.delete(key);
  }
}, 300_000);

export function checkRateLimit(userId: string, endpoint: string): NextResponse | null {
  const config = RATE_LIMITS[endpoint] ?? { max: 30, windowMs: 60_000 };
  const key = `${userId}:${endpoint}`;
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + config.windowMs });
    return null;
  }
  if (entry.count >= config.max) {
    return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 });
  }
  entry.count++;
  return null;
}

/* ══ URL Validation (block SSRF) ══ */
export function validateExternalUrl(url: string): { valid: boolean; error?: string } {
  try {
    let normalized = url.trim();
    if (!/^https?:\/\//i.test(normalized)) normalized = "https://" + normalized;
    const parsed = new URL(normalized);

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return { valid: false, error: "Only HTTP/HTTPS URLs are allowed" };
    }
    const h = parsed.hostname.toLowerCase();
    if (["localhost", "127.0.0.1", "0.0.0.0", "::1", "[::1]"].includes(h)) {
      return { valid: false, error: "Private URLs are not allowed" };
    }
    if (/^(10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|192\.168\.\d+\.\d+|169\.254\.\d+\.\d+)$/.test(h)) {
      return { valid: false, error: "Private IP addresses are not allowed" };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: "Invalid URL format" };
  }
}
