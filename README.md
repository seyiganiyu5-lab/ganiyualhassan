# Ganiyu Al-Hassan Oluwaseyi — Portfolio

A Next.js 16 portfolio website with an admin dashboard, project management,
CV upload, contact form, and SEO optimization.

## Run locally

### Prerequisites
- [Node.js](https://nodejs.org/) 18+ (or [Bun](https://bun.sh/) — recommended)
- That's it. The database is SQLite (file-based, included).

### Steps

```bash
# 1. Install dependencies
bun install
#   (or: npm install)

# 2. The database + .env are included, so no extra setup needed.
#    Your projects, settings, hero photo, CV, and media are all preserved.

# 3. Start the dev server
bun run dev
#   (or: npm run dev)

# 4. Open http://localhost:3000
```

## Admin dashboard

- URL: `http://localhost:3000/admin`
- Username: `ALHASSAN`
- Password: `@Hassify1010`

## What's included

- `src/` — all application code (pages, components, APIs, lib)
- `public/` — static assets + your uploaded files (hero photo, CV, project images, media library)
- `prisma/` — database schema
- `db/custom.db` — your SQLite database with all current data (projects, settings, messages, media records)
- `.env` — environment variables (DATABASE_URL, ADMIN_USERNAME, ADMIN_PASSWORD)
- `mini-services/` — standalone services (e.g. websocket demo)
- `examples/` — reference examples

## Not included (regenerable)

- `node_modules/` — run `bun install` to recreate
- `.next/` — build cache, auto-generated

## Tech stack

- **Framework:** Next.js 16 (App Router) + TypeScript 5
- **Styling:** Tailwind CSS 4 + shadcn/ui (New York)
- **Database:** Prisma ORM + SQLite
- **Auth:** Custom (credentials in .env)
- **Animations:** Framer Motion

## Deploy to Vercel (free)

To deploy publicly so Google can index it:

1. Push this folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → New Project → import the repo
3. **Important:** Vercel is serverless with a read-only filesystem. Two things
   need adjusting for production:
   - **Database:** SQLite won't persist on Vercel. Swap to **Neon Postgres**
     (free) — change `provider` in `prisma/schema.prisma` from `"sqlite"` to
     `"postgresql"`, then run `bunx prisma db push`.
   - **Uploads:** `public/uploads/` is read-only on Vercel. Use **Vercel Blob**
     (free, 1 GB) — rewrite `src/app/api/upload/route.ts` to use the Blob SDK.
4. Set env vars on Vercel: `DATABASE_URL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`
5. Deploy → get `https://your-name.vercel.app`
6. Admin → SEO → set **Site URL** to your Vercel domain
7. Google Search Console → verify ownership → submit sitemap

## Admin credentials

Set in `.env`:
```
ADMIN_USERNAME=ALHASSAN
ADMIN_PASSWORD=@Hassify1010
```

Change them by editing `.env` and restarting the dev server.
