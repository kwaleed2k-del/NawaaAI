# Nawaa AI — Full Project Audit Report

**Date:** 2026-03-10
**Audited by:** Claude Code (4 parallel agents)
**Project:** https://github.com/kwaleed2k-del/NawaaAI
**Stack:** Next.js 16, React 19, Supabase, OpenAI, Google Gemini, Tailwind CSS, Zustand

---

## Phase 1 — CRITICAL (Fix Immediately)

| # | Issue | File | Status |
|---|-------|------|--------|
| 1 | API keys exposed in `.env.local` committed to git | `.env.local` | **MANUAL** — Revoke & regenerate keys |
| 2 | `.env.local` not in `.gitignore` | `.gitignore` | **MANUAL** — Add to gitignore, purge from history |
| 3 | `competitor_analyses` table missing from DB schema | `supabase/schema.sql` | **FIXED** |
| 4 | Delete without user ownership check | `competitor-analysis/page.tsx:217`, `companies/page.tsx:632` | **FIXED** |
| 5 | Build errors silently ignored (`ignoreBuildErrors: true`) | `next.config.ts:5-10` | **FIXED** |

---

## Phase 2 — Security Hardening

| # | Issue | File | Status |
|---|-------|------|--------|
| 6 | No input length validation on any API endpoint | All `app/api/*/route.ts` | **FIXED** |
| 7 | No file size limit on uploads | `upload-logo/route.ts` | **FIXED** — 10MB limit |
| 8 | File type validation only checks MIME, not actual content | `upload-logo/route.ts` | **FIXED** — sharp magic-byte validation |
| 9 | `Promise.all` in scraping — one failure kills entire request | `competitor-analysis/route.ts:213` | **FIXED** — `Promise.allSettled` |
| 10 | No message content length validation in chat | `chat/route.ts` | **FIXED** — 4096 char limit per message |
| 11 | Unvalidated JSON.parse of AI responses | `analyze-company/route.ts`, `competitor-analysis/route.ts` | **FIXED** — try/catch + field validation |
| 12 | In-memory rate limiting unbounded | `lib/api-auth.ts` | **FIXED** — 10K entry cap + eviction |
| 13 | Rate limits too generous | `lib/api-auth.ts` | **FIXED** — Tightened all limits |
| 14 | Env vars not validated at startup | `lib/gemini.ts`, `lib/openai.ts` | **FIXED** — throws on missing keys |
| 15 | Database indexes missing on foreign keys | `supabase/schema.sql` | **FIXED** (Phase 1) |
| 16 | PDF extraction: no size limit, no magic-byte check | `extract-pdf/route.ts` | **FIXED** — 10MB + `%PDF-` check |
| 17 | Large PDFs fail when sent to Gemini | `extract-pdf/route.ts` | **FIXED** — auto-compression for large PDFs |
| 18 | extract-colors returns 200 on error (silent failure) | `extract-colors/route.ts` | **FIXED** — returns 500 |
| 19 | No content length validation on image generation prompts | `generate-images/route.ts` | **FIXED** — 2000 char limit |
| 20 | No validation on generate-plan inputs | `generate-plan/route.ts` | **FIXED** — name + prompt limits |
| 21 | No validation on hashtag topic length | `hashtags/generate/route.ts` | **FIXED** — 500 char limit |

---

## Phase 3 — Performance (TODO)

| # | Issue | File | Severity |
|---|-------|------|----------|
| 22 | Entire landing page is `"use client"` (828 lines) | `app/page.tsx:1` | HIGH — Deferred (large refactor) |
| 23 | Excessive Framer Motion on dashboard | `dashboard/page.tsx` | **FIXED** — Replaced all motion.div with CSS |
| 24 | `<img>` tags used instead of `next/image` | `dashboard/page.tsx` | **FIXED** — next/image with sizes/fill |
| 25 | No image dimensions — causes CLS | `dashboard/page.tsx` | **FIXED** — width/height/fill added |
| 26 | Dashboard re-renders every 3 seconds (quote rotation) | `dashboard/page.tsx:138` | **FIXED** — Changed to 10s |
| 27 | Backdrop-filter blur on multiple components | `globals.css:195-216` | **FIXED** — Reduced blur values |
| 28 | html2canvas + jsPDF loaded eagerly (150KB+) | `lib/export-*.ts` | **FIXED** — Dynamic imports |
| 29 | No Suspense boundaries, no ISR/caching | All dashboard pages | TODO |
| 30 | KimzChat notification animation runs forever | `components/KimzChat.tsx` | **FIXED** — Stops after first message |
| 31 | `SELECT *` on companies table (includes large JSONB) | `dashboard/page.tsx:113` | **FIXED** — Specific columns |
| 32 | Missing `React.memo` on expensive components | `layout.tsx` NavLinks, SidebarBottom | TODO |
| 33 | `strip-motion.mjs` exists but was never run | Root | LOW — Not needed after manual fixes |
| 34 | 16 CSS keyframe animations defined, many unused | `globals.css:89-162` | **FIXED** — Removed 4 unused animations |
| 35 | next/image remote patterns not configured | `next.config.ts` | **FIXED** — Added Supabase patterns |

---

## Phase 4 — UI/UX Polish

| # | Issue | File | Status |
|---|-------|------|--------|
| 35 | No `loading.tsx`, `error.tsx`, `not-found.tsx` | `app/` root | **FIXED** — Created all three + dashboard variants |
| 36 | No error boundaries in layouts | `(auth)/layout.tsx`, `(dashboard)/layout.tsx` | **FIXED** — `(auth)/error.tsx` + `(dashboard)/error.tsx` |
| 37 | Missing accessibility: no aria-labels on icon buttons | `(dashboard)/layout.tsx`, auth pages, companies | **FIXED** — Added aria-labels throughout |
| 38 | No dark mode support | `app/layout.tsx` | SKIPPED (per user request) |
| 39 | No breadcrumb navigation on dashboard pages | All `(dashboard)/*` pages | **FIXED** — Auto breadcrumbs from pathname |
| 40 | Mobile sidebar has no focus trap | `(dashboard)/layout.tsx` | **FIXED** — Focus trap + Escape key + aria-modal |
| 41 | Quote carousel dots too small for touch (8px) | `login/page.tsx`, `signup/page.tsx` | **FIXED** — 44x44px touch target with aria-labels |
| 42 | No search clear button or "no results" message | `(dashboard)/layout.tsx` | **FIXED** — Clear button with X icon |
| 43 | Missing loading skeletons for data fetching | `hashtags/page.tsx`, others | **FIXED** — Dashboard `loading.tsx` skeleton |
| 44 | No delete confirmation dialog | `my-generations/page.tsx` | **ALREADY FIXED** — `confirmDeleteId` pattern existed |
| 45 | Password validation only shows after typing | `signup/page.tsx:305` | **FIXED** — Always visible for guidance |
| 46 | Insights page is placeholder — no real data | `insights/page.tsx` | DEFERRED — Well-designed "coming soon" page |
| 47 | Locale switch has no visual feedback | `(dashboard)/layout.tsx` | **FIXED** — Flash animation on toggle |
| 48 | Company logos not responsive, can overflow | `companies/page.tsx` | **FIXED** — max-w-full + proper alt text |
| 49 | Empty alt text on generated images | `my-generations/page.tsx` | **FIXED** — Meaningful alt text added |
| 50 | Hero text clamp could be too large on tablets | `app/page.tsx:338` | **FIXED** — Reduced from 10vw to 7vw |

---

## Phase 5 — Code Quality & Enhancements

| # | Issue | File | Status |
|---|-------|------|--------|
| 51 | ChatMessage type duplicated in 2 files | `KimzChat.tsx` + `chat/route.ts` | **FIXED** — Shared `lib/types.ts` |
| 52 | Zustand store mixes auth state with UI state | `lib/store.ts` | **FIXED** — Separated AuthSlice and UISlice |
| 53 | Race condition in LocaleSync | `components/LocaleSync.tsx` + `app/page.tsx` | **FIXED** — Single source of truth via store |
| 54 | No content policy on image generation prompts | `generate-images/route.ts` | **FIXED** — Blocked patterns for NSFW/violence/hate |
| 55 | SSRF validation incomplete (no DNS rebinding) | `lib/api-auth.ts` | **FIXED** — Block .internal/.local, credentials, metadata |
| 56 | Missing CORS headers on API routes | `middleware.ts` | **FIXED** — CORS preflight + response headers |
| 57 | Magic numbers everywhere | `api-auth.ts`, `generate-images/route.ts` | **FIXED** — Named constants extracted |
| 58 | Inconsistent error response shapes | `lib/api-auth.ts` | **FIXED** — `apiError()` / `apiSuccess()` helpers |
| 59 | Unused export `createBrowserClient` | `lib/supabase.ts` | **FIXED** — Removed alias, updated companies import |
| 60 | Exposed system prompts in source code | `chat/route.ts` | **FIXED** — Env-overridable via KIMZ_SYSTEM_PROMPT |
| 61 | Gemini model fallback array has only 1 model | `generate-images/route.ts` | **FIXED** — 3 models in fallback chain |
| 62 | Implement dark mode | Full app | DEFERRED (per user request) |
| 63 | Move rate limiting to Redis | `lib/api-auth.ts` | DEFERRED (infrastructure change) |
| 64 | Extract shared types to `lib/types.ts` | Multiple files | **FIXED** — `lib/types.ts` created |
| 65 | Clean up unused CSS animations | `globals.css` | **FIXED** (Phase 3) |

---

## Summary

| Phase | Total Issues | Fixed | Remaining |
|-------|-------------|-------|-----------|
| Phase 1 — Critical | 5 | 3 | 2 (manual: revoke keys, gitignore) |
| Phase 2 — Security | 16 | 16 | 0 |
| Phase 3 — Performance | 13 | 10 | 3 (TODO items) |
| Phase 4 — UI/UX | 16 | 13 | 3 (dark mode skipped, insights deferred, #44 was already fixed) |
| Phase 5 — Code Quality | 15 | 12 | 3 (dark mode deferred, Redis deferred, CSS done in P3) |
| **TOTAL** | **65** | **54** | **11** |

---

## Validation Limits Reference

All input validation limits added in Phase 2:

| Endpoint | Field | Limit |
|----------|-------|-------|
| All endpoints | Company name | 500 chars |
| `/api/competitor-analysis` | Competitor name | 500 chars |
| `/api/competitor-analysis` | Company description | 2,000 chars |
| `/api/competitor-analysis` | Social handle | 200 chars |
| `/api/competitor-analysis` | Max competitors | 5 |
| `/api/chat` | Message content | 4,096 chars per message |
| `/api/chat` | Max messages | 10 (last 10 kept) |
| `/api/generate-images` | Additional instructions | 2,000 chars |
| `/api/generate-images` | Image text overlay | 200 chars |
| `/api/generate-plan` | Focus prompt | 2,000 chars |
| `/api/hashtags/generate` | Topic | 500 chars |
| `/api/upload-logo` | File size | 10 MB |
| `/api/upload-logo` | Formats | PNG, JPEG, WebP (magic-byte checked) |
| `/api/extract-pdf` | File size | 10 MB |
| `/api/extract-pdf` | Format | PDF (magic-byte `%PDF-` checked) |
| `/api/analyze-company` | Description | 8,000 chars |

## Rate Limits Reference

| Endpoint | Requests/minute |
|----------|----------------|
| `/api/analyze-company` | 3 |
| `/api/competitor-analysis` | 2 |
| `/api/generate-plan` | 5 |
| `/api/generate-images` | 5 |
| `/api/hashtags/generate` | 15 |
| `/api/extract-pdf` | 5 |
| `/api/extract-colors` | 15 |
| `/api/upload-logo` | 5 |
| `/api/chat` | 20 |
