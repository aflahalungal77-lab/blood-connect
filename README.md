# Blood Connect Meenarkuzhi

Bilingual (Malayalam + English) public blood donor directory and emergency request app built with Next.js App Router and Supabase PostgreSQL. The existing UI is retained; the database/API layer is migrated from MongoDB to Supabase.

## Features
- Search verified donors by blood group and area
- Donor registration with explicit consent and admin approval
- Emergency blood requests reviewed before public listing
- Admin dashboard for verifying/rejecting donors, approving/rejecting requests, marking requests fulfilled/closed, and deleting records
- No public user login or session-based authentication
- Admin API protected by a server-only secret header
- Supabase Row Level Security enabled with no direct public table policies

## Requirements
- Node.js 20+
- Supabase project

## Setup
1. Extract the ZIP and open this project folder in a terminal.
2. Install dependencies: `npm install`.
3. In Supabase Dashboard, open **SQL Editor**, create a query, paste `supabase/schema.sql`, and run it.
4. Copy `.env.example` to `.env.local`.
5. Fill `SUPABASE_URL` from Supabase Project Settings -> API.
6. Fill `SUPABASE_SERVICE_ROLE_KEY` with the server-side secret/service role key from the API settings. Never expose it with a `NEXT_PUBLIC_` prefix.
7. Generate a strong admin secret using `openssl rand -base64 48`, then place it in `ADMIN_SECRET`.
8. Run `npm run dev` and open `http://localhost:3000`.
9. Open `/admin` and enter the same admin secret to manage records.

Example `.env.local`:

```env
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVER_SIDE_SECRET_KEY
ADMIN_SECRET=YOUR_LONG_RANDOM_SECRET
```

## API summary
- `GET /api/donors?bloodGroup=A%2B&location=Meenarkuzhi`
- `POST /api/donors`
- `GET /api/requests` (approved open requests only)
- `POST /api/requests`
- `GET /api/admin` (requires `x-admin-secret`)
- `PATCH /api/admin` (requires `x-admin-secret`)
- `DELETE /api/admin` (requires `x-admin-secret`)

## Deploy to Vercel
1. Push the project to GitHub and import it into Vercel.
2. Add `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `ADMIN_SECRET` to Vercel Environment Variables.
3. Run the SQL schema in the same Supabase project.
4. Redeploy after setting environment variables.

## Security and launch notes
- The Supabase secret/service role key bypasses RLS. It is only imported in server-side route code; do not expose it in browser code or commit `.env.local`.
- The admin shared-secret approach is a simple prototype gate, not a replacement for individual admin accounts and a mature authentication system. Add rate limiting and CAPTCHA/Turnstile before public launch.
- Donor phone numbers are displayed on the public directory only after the donor consented and the admin verified the listing. Approved open request phone numbers are also displayed so people can respond; request form consent should clearly explain this.
- Provide a privacy notice, operator contact details, deletion request process, and data-retention policy. Confirm consent and handling meet applicable Indian privacy requirements.
- Verify donor/request information before approval. A verified listing is not medical certification, and website listings do not guarantee blood availability.
- For medical emergencies, contact a hospital or licensed blood bank directly.

## Troubleshooting
- If you see a missing Supabase environment variable error, check `.env.local` and restart `npm run dev`.
- This package pins Tailwind CSS 3.4.17 to match the included `@tailwind` CSS directives and PostCSS configuration. Run `npm install` inside this project folder after extracting it.
- Do not reuse a `package-lock.json` from a parent directory; run commands from the extracted project root.
