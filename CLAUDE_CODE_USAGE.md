# How Claude Code Was Used on CampusCare

**Planning.** Before writing any code I asked Claude Code to inspect the empty project and propose an
architecture in plan mode: pages, API routes, the Supabase schema, and how to protect admin features.
We agreed on server-side API routes using the Supabase service role key so the database is never exposed
to the browser, and a signed-cookie admin session enforced by middleware.

**CLAUDE.md.** I had Claude Code create `CLAUDE.md` with the stack, commands, architecture, security rules
(never commit secrets, admin routes stay behind middleware) and a testing checklist. Claude Code reads it
at the start of every session, so later changes stayed consistent with the same conventions.

**Implementation in stages.** The app was built step by step, reviewing the diff after each stage and
using checkpoints so a bad change could be rewound:
1. Project setup, Tailwind, shared constants/types
2. Supabase schema and server client
3. Complaint form, validation, image upload, ID generation
4. Tracking page
5. Admin login, middleware, dashboard table, filters, status updates
6. Statistics cards and charts
7. Polish: loading states, errors, toasts, responsiveness

**Testing and fixing.** Claude Code ran `npm run build` and `npm run lint` after each stage and fixed type
and lint errors. I then walked through the checklist in `CLAUDE.md` (submission, image upload, tracking,
status updates, dashboard statistics, unauthorized access) and asked Claude Code to fix anything that failed.

**Documentation and deployment.** Claude Code drafted the README, prepared the GitHub repository and
helped configure environment variables on Vercel.
