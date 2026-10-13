# CampusCare — Campus Electronic Complaint Management System

Students report campus facility problems (computers, projectors, fans, lights, Wi-Fi), track them by ID,
and administrators manage statuses and view live statistics.

**Live site:** _add your Vercel URL here_  ·  **Repository:** _add your GitHub URL here_

## Features
- Complaint form: name, department, location, category, title, description, up to 3 photos
- Unique complaint ID (`CC-YYYYMMDD-XXXXXX`) and submission date, plus confirmation screen
- Tracking by complaint ID: details, date, status (Pending / In Progress / Resolved)
- Admin dashboard: table, details modal with pictures, status updates, search and category/status filters
- Statistics: totals, status donut chart, category bar chart (from real data)
- Responsive UI, validation, loading states, errors and success notifications
- AI features powered by Gemini: student "Improve with AI" (suggests category, title, clearer description), admin AI triage (priority + suggested action), admin AI insights report
- Password-protected admin (signed httpOnly cookie + middleware); Supabase key stays on the server

## Tech stack
Next.js 15 · TypeScript · Tailwind CSS · Supabase (database + storage) · Google Gemini (`@google/genai`) · GitHub · Vercel

## 1. Run locally (VS Code)
Requires Node.js 18.18+ (20 recommended).

```powershell
npm install
copy .env.example .env.local     # then edit .env.local
npm run dev
```
Open http://localhost:3000.

## 2. Set up Supabase
1. Create a free project at https://supabase.com.
2. Open **SQL Editor → New query**, paste the contents of `supabase/schema.sql`, click **Run**.
   This creates the `complaints` table and a public storage bucket named `complaint-images`.
3. Go to **Project Settings → API** and copy the **Project URL** and the **service_role** key.

## 3. Environment variables
Fill in `.env.local`:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (**secret**, server only) |
| `ADMIN_PASSWORD` | Password for `/admin` |
| `ADMIN_SESSION_SECRET` | Long random string used to sign the admin cookie |
| `GEMINI_API_KEY` | Google Gemini API key from https://aistudio.google.com/apikey (**secret**, server only) |
| `GEMINI_MODEL` | Gemini model name (default `gemini-3.8-flash`; change here if your key uses another model) |
| `GEMINI_MAX_OUTPUT_TOKENS` | _Optional._ Max tokens per AI response (default `1024`) |
| `GEMINI_TEMPERATURE` | _Optional._ Temperature for the admin insights report (default `0.4`) |
| `GEMINI_JSON_TEMPERATURE` | _Optional._ Temperature for suggest/triage JSON output (default `0.2`) |
| `AI_SUGGEST_RATE_LIMIT` | _Optional._ Requests per minute per IP for `/api/ai/suggest` (default `8`) |

Generate a secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## 4. Push to GitHub
```powershell
git init
git add .
git commit -m "CampusCare initial version"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/campuscare.git
git push -u origin main
```
`.env.local` is git-ignored, so your secrets are not uploaded.

## 5. Deploy to Vercel
1. Go to https://vercel.com → **Add New → Project** and import your GitHub repo.
2. Under **Environment Variables**, add the required variables from the table above (the optional `GEMINI_*` / `AI_*` ones only if you want to override defaults).
3. Click **Deploy**. Every `git push` to `main` redeploys automatically.

## Testing checklist
- [ ] Submit a complaint with and without images; confirmation shows ID and date
- [ ] Validation errors appear for empty/short fields and bad images
- [ ] Track by ID (also via `/track?id=...`); unknown ID shows an error
- [ ] `/admin` redirects to login when logged out; wrong password is rejected
- [ ] Admin sees table, details and images; search and filters work
- [ ] Changing status updates the table and the tracking page
- [ ] Stat cards and charts match the data
- [ ] Layout works on mobile, tablet, desktop

## Project structure
```
src/app/            pages and API routes
src/components/     Navbar, StatusBadge, Toast, Spinner
src/lib/            supabase client, auth, validation, constants, types
src/middleware.ts   protects /admin and /api/admin
supabase/schema.sql database setup
CLAUDE.md           instructions for Claude Code
CLAUDE_CODE_USAGE.md  write-up of how Claude Code was used
```

## Security notes
- Service role key and admin password are only read on the server.
- Row Level Security is enabled on `complaints` with no public policies; all access goes through the API.
- Uploads are limited to JPG/PNG/WebP, 5 MB, 3 files, validated on the server.

## AI features
All Gemini calls happen on the server (`src/lib/gemini.ts`). If `GEMINI_API_KEY` is missing the app still works; AI buttons just show an error message. The public suggestion endpoint is rate limited (8 requests/minute per IP by default, set with `AI_SUGGEST_RATE_LIMIT`).
# CampusCare — Campus Electronic Complaint Management System

## Student Name
Esha Amir Choudhary

## Project Overview
CampusCare is a web-based campus complaint management system that allows students to submit complaints, track their status, and enables administrators to manage complaints.

## Technologies Used
- Next.js
- TypeScript
- Tailwind CSS
- Supabase
- Google Gemini API
- GitHub
- Vercel

## GitHub Repository
https://github.com/aamirsaleem5632-ux/campuscare
