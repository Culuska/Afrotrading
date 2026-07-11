# AfroTrading — Gold Signal Provider Platform

A premium, dark-themed gold (XAUUSD) trading signal platform. Monorepo with a Next.js 15
frontend and an Express + Prisma + PostgreSQL backend.

## Structure

```
Afrotrading/
├── frontend/   Next.js 15 (App Router), TypeScript, Tailwind CSS v4, Framer Motion, TanStack Query
└── backend/    Express, TypeScript, Prisma ORM, PostgreSQL, JWT + bcrypt auth
```

## Features

- **Home**: hero with live TradingView XAUUSD chart + price widget, latest signals, performance
  stats, education/market-analysis previews, pricing, testimonials, CTA.
- **Signals**: public signal feed with status filters (running/pending/winning/losing) and search;
  full signal history table with weekly/monthly/yearly ranges and win-rate/profit-factor stats.
- **Education Center**: categorized videos/articles/PDFs, VIP-gated content.
- **Market Analysis**: daily/weekly/monthly technical & fundamental analysis, embedded TradingView
  technical-analysis widget.
- **Pricing**: Free / VIP Monthly / VIP Lifetime plans with feature comparison.
- **Auth**: register (with Telegram join CTA), login, forgot/reset password, email verification.
- **User Dashboard**: profile, saved signals, education progress, notification settings, security.
- **Admin Dashboard**: overview stats, signal CRUD (publish → auto-post to Telegram), user
  management (suspend/activate/upgrade/downgrade/reset password/export CSV), education & market
  analysis CMS, site settings.
- **Telegram integration**: publishing a signal from the admin panel posts it to your Telegram
  channel via the Bot API.
- SEO: metadata API, Open Graph/Twitter cards, `sitemap.xml`, `robots.txt`, JSON-LD, PWA manifest.

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS v4, Framer Motion, Radix UI
  primitives (shadcn-style components), TanStack Query, sonner (toasts).
- **Backend**: Node.js, Express, Prisma ORM, PostgreSQL, JWT, bcryptjs, Cloudinary (media
  uploads), Nodemailer (email), Telegram Bot API.

## Local Development

### Prerequisites

- Node.js 20+
- PostgreSQL 14+

### Backend

```bash
cd backend
cp .env.example .env        # fill in DATABASE_URL, JWT_SECRET, etc.
npm install
npx prisma migrate dev      # creates schema
npm run seed                # seeds admin user, demo signals, pricing, education content
npm run dev                 # http://localhost:4000
```

Seeded admin login: `admin@afrotrading.com` / `Admin@12345` — **change this immediately in any
non-local environment.**

### Frontend

```bash
cd frontend
cp .env.example .env.local  # set NEXT_PUBLIC_API_URL to your backend URL
npm install
npm run dev                 # http://localhost:3000
```

## Deployment

- **Frontend → Vercel**: import the `frontend/` directory as the project root, set
  `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_SITE_URL` / `NEXT_PUBLIC_TELEGRAM_GROUP_URL` env vars.
- **Backend → Railway / Render**: deploy the `backend/` directory, provision a PostgreSQL add-on,
  set the env vars from `backend/.env.example`, and run `npx prisma migrate deploy` on release.
- **Database**: managed PostgreSQL (Railway, Render, Supabase, or Neon all work).
- **Media**: create a free Cloudinary account and set `CLOUDINARY_*` env vars to enable chart/media
  uploads from the admin panel.
- **Telegram**: create a bot via [@BotFather](https://t.me/BotFather), add it as an admin to your
  channel/group, and set `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHANNEL_CHAT_ID`.

## Known Limitations / Suggested Follow-ups

This build covers the full core platform (signals, auth, admin/user dashboards, education, market
analysis, Telegram publishing, SEO). The following items from the original spec are intentionally
scoped out and are natural next steps:

- **Payments** (Stripe/PayPal) are not wired up — membership upgrades are currently admin-managed.
- **Two-factor authentication** — schema has `twoFactorEnabled`/`twoFactorSecret` fields reserved,
  but the TOTP flow itself isn't implemented.
- **Multi-language (EN/SO/AR)** — not implemented; recommend `next-intl` for full i18n routing.
- **Full offline PWA** — a web manifest + icons are included for installability, but there's no
  service worker for offline caching yet (consider `next-pwa`/Workbox).
- **Referral system** — `referralCode`/`referredBy` fields exist on the `User` model and
  registration accepts a `referralCode`, but there's no referral rewards UI yet.
- TradingView widgets require the end user's browser to reach `s3.tradingview.com` — they render
  correctly in production but may be blocked by restrictive local/corporate network policies.

## Security Notes

- Passwords hashed with bcrypt (cost factor 12).
- JWT auth with role-based access control (`FREE` / `VIP` / `ADMIN`).
- Rate limiting on all routes, stricter limits on auth endpoints.
- Helmet, CORS allowlist, and XSS input sanitization on the API.
- Audit log (`AuditLog` model) records every admin mutation (signal/user/content changes).
