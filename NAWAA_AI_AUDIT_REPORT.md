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
| 22 | Entire landing page is `"use client"` (828 lines) | `app/page.tsx:1` | HIGH |
| 23 | Excessive Framer Motion on every section | `app/page.tsx` | HIGH |
| 24 | `<img>` tags used instead of `next/image` | `dashboard/page.tsx:459`, `companies/page.tsx:416` | HIGH |
| 25 | No image dimensions — causes CLS | All `<img>` tags | HIGH |
| 26 | Dashboard re-renders every 3 seconds (quote rotation) | `dashboard/page.tsx:138` | MEDIUM |
| 27 | Backdrop-filter blur on multiple components | `globals.css:195-216` | MEDIUM |
| 28 | html2canvas + jsPDF loaded eagerly (150KB+) | `lib/export-*.ts` | MEDIUM |
| 29 | No Suspense boundaries, no ISR/caching | All dashboard pages | MEDIUM |
| 30 | KimzChat animations run in background when minimized | `components/KimzChat.tsx:306` | MEDIUM |
| 31 | `SELECT *` on companies table (includes large JSONB) | `dashboard/page.tsx:113` | MEDIUM |
| 32 | Missing `React.memo` on expensive components | `layout.tsx` NavLinks, SidebarBottom | MEDIUM |
| 33 | `strip-motion.mjs` exists but was never run | Root | LOW |
| 34 | 16 CSS keyframe animations defined, many unused | `globals.css:89-162` | LOW |

**Recommended fix order:**
1. Replace `<img>` with `next/image` + add dimensions
2. Convert landing page to Server Component with client islands
3. Dynamic import html2canvas/jsPDF
4. Add `React.memo` to sidebar components
5. Replace 3-second quote interval with CSS animation
6. Reduce backdrop-filter usage
7. Add Suspense boundaries for data loading
8. Add specific column selects instead of `SELECT *`

---

## Phase 4 — UI/UX Polish (TODO)

| # | Issue | File | Severity |
|---|-------|------|----------|
| 35 | No `loading.tsx`, `error.tsx`, `not-found.tsx` | `app/` root | HIGH |
| 36 | No error boundaries in layouts | `(auth)/layout.tsx`, `(dashboard)/layout.tsx` | HIGH |
| 37 | Missing accessibility: no aria-labels on icon buttons | `(dashboard)/layout.tsx:244,359` | HIGH |
| 38 | No dark mode support | `app/layout.tsx` | MEDIUM |
| 39 | No breadcrumb navigation on dashboard pages | All `(dashboard)/*` pages | MEDIUM |
| 40 | Mobile sidebar has no focus trap | `(dashboard)/layout.tsx:264-310` | MEDIUM |
| 41 | Quote carousel dots too small for touch (8px) | `login/page.tsx:143` | MEDIUM |
| 42 | No search clear button or "no results" message | `(dashboard)/layout.tsx:347` | MEDIUM |
| 43 | Missing loading skeletons for data fetching | `hashtags/page.tsx`, others | MEDIUM |
| 44 | No delete confirmation dialog | `my-generations/page.tsx` | MEDIUM |
| 45 | Password validation only shows after typing | `signup/page.tsx:305` | LOW |
| 46 | Insights page is placeholder — no real data | `insights/page.tsx` | LOW |
| 47 | Locale switch has no visual feedback | `(dashboard)/layout.tsx:361` | LOW |
| 48 | Company logos not responsive, can overflow | `companies/page.tsx:416` | LOW |
| 49 | Empty alt text on generated images | `dashboard/page.tsx:459` | LOW |
| 50 | Hero text clamp could be too large on tablets | `app/page.tsx:338` | LOW |

**Recommended fix order:**
1. Add `loading.tsx`, `error.tsx`, `not-found.tsx`
2. Add error boundaries to layouts
3. Add aria-labels to all icon buttons
4. Add delete confirmation dialogs
5. Add Suspense boundaries for dashboard data
6. Fix mobile touch targets (min 44x44px)
7. Add breadcrumbs to dashboard pages

---

## Phase 5 — Code Quality & Enhancements (TODO)

| # | Issue | File | Severity |
|---|-------|------|----------|
| 51 | ChatMessage type duplicated in 2 files | `KimzChat.tsx:11` + `chat/route.ts:48` | MEDIUM |
| 52 | Zustand store mixes auth state with UI state | `lib/store.ts` | MEDIUM |
| 53 | Race condition in LocaleSync | `components/LocaleSync.tsx` + `app/page.tsx` | MEDIUM |
| 54 | No content policy on image generation prompts | `generate-images/route.ts:243` | MEDIUM |
| 55 | SSRF validation incomplete (no DNS rebinding) | `lib/api-auth.ts:65` | MEDIUM |
| 56 | Missing CORS headers on API routes | All API routes | LOW |
| 57 | Magic numbers everywhere | `api-auth.ts`, `generate-images/route.ts` | LOW |
| 58 | Inconsistent error response shapes | Various API routes | LOW |
| 59 | Unused export `createBrowserClient` | `lib/supabase.ts:4` | LOW |
| 60 | Exposed system prompts in source code | `chat/route.ts:9-46` | LOW |
| 61 | Gemini model fallback array has only 1 model | `generate-images/route.ts:160` | LOW |
| 62 | Implement dark mode | Full app | ENHANCEMENT |
| 63 | Move rate limiting to Redis | `lib/api-auth.ts` | ENHANCEMENT |
| 64 | Extract shared types to `lib/types.ts` | Multiple files | ENHANCEMENT |
| 65 | Clean up unused CSS animations | `globals.css` | ENHANCEMENT |

---

## Summary

| Phase | Total Issues | Fixed | Remaining |
|-------|-------------|-------|-----------|
| Phase 1 — Critical | 5 | 3 | 2 (manual: revoke keys, gitignore) |
| Phase 2 — Security | 16 | 16 | 0 |
| Phase 3 — Performance | 13 | 0 | 13 |
| Phase 4 — UI/UX | 16 | 0 | 16 |
| Phase 5 — Code Quality | 15 | 0 | 15 |
| **TOTAL** | **65** | **19** | **46** |

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
