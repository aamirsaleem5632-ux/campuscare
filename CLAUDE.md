# CampusCare — Project Instructions for Claude Code

## What this project is
CampusCare is a campus electronic complaint management system. Students report computer, projector,
fan, light and Wi-Fi issues (with photos), track them by complaint ID, and an administrator manages
statuses and sees statistics.

## Stack
Next.js 15 (App Router) · TypeScript (strict) · Tailwind CSS 3 · Supabase (Postgres + Storage) · GitHub · Vercel

## Commands
- `npm install` — install dependencies
- `npm run dev` — dev server at http://localhost:3000
- `npm run build` — production build (must pass before deploying)
- `npm run lint` — lint

## Architecture
- `src/app/` pages: `/` home, `/submit` form, `/track` tracking, `/admin` dashboard, `/admin/login`.
- `src/app/api/complaints` (POST create), `/api/complaints/[id]` (GET public lookup).
- `src/app/api/admin/*` — login, logout, list complaints, PATCH status. ALL protected by `middleware.ts`.
- `src/lib/supabase.ts` — server-only service-role client. Never import it in a `"use client"` file.
- `src/lib/auth.ts` — HMAC-signed httpOnly session cookie (Web Crypto; works on Edge + Node).
- `src/lib/validation.ts` — shared validation used by both the form and the API.
- `supabase/schema.sql` — database table + storage bucket.

## AI (Gemini)
- `src/lib/gemini.ts` wraps `@google/genai`; model comes from `GEMINI_MODEL`. Server-only, never import in client files.
- `/api/ai/suggest` (public, rate limited), `/api/admin/ai/triage` and `/api/admin/ai/report` (admin only, behind middleware).
- AI output is untrusted: validate/clamp it (e.g. category must be in `CATEGORIES`) and let the user review before submitting.

## Rules
1. All database/storage access happens on the server via API routes. The browser never gets the service role key.
2. Never commit `.env.local`. Only `.env.example` is committed. Never prefix secrets with `NEXT_PUBLIC_`.
3. Any new `/api/admin/*` or `/admin/*` route is automatically protected by middleware; do not bypass it.
4. Validate on both client and server. Return clear JSON errors `{ error, fields? }`.
5. Statuses are exactly: `Pending`, `In Progress`, `Resolved`. Categories: `Computer`, `Projector`, `Fan`, `Light`, `Wi-Fi`. Constants live in `src/lib/constants.ts`.
6. Complaint IDs look like `CC-YYYYMMDD-XXXXXX` (hex) and are generated server-side.
7. Every async UI action needs a loading state, an error message and a success notification.
8. Keep the UI responsive (mobile-first Tailwind) and use `StatusBadge` for statuses.
9. Inspect existing code before changing it; work in small stages and run `npm run build` after each.

## Testing checklist
Submit complaint (with/without images) → confirmation shows ID → track by ID → admin login →
view details/images → change status → tracking shows new status → stats and charts update →
wrong password rejected → `/api/admin/complaints` returns 401 when logged out.
