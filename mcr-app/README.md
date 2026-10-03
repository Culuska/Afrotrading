# MCR Finance & Operations

Internal web app for **Mogadishu Constructions & Rehabilitation**: project costing, expense approvals,
client invoicing, site payroll, materials, equipment and the site diary in one place.

Built with Next.js 15 (App Router, server actions), Prisma and PostgreSQL. All money is in USD,
stored as integer cents.

## What it does

| Area | Features |
|---|---|
| Dashboard | Net cash, what clients owe, what we owe (suppliers + wages), pending approvals, overdue invoices, cost-overrun alerts, site issues |
| Projects | Contract value, retention %, progress, budget per cost category vs actual, forecast final cost, per-project cost report |
| Expenses | Submit → approve → pay workflow, EVC Plus / Zaad / Sahal / bank / cash, receipt refs, filters, CSV export |
| Invoices | Milestone invoices with automatic retention, over-billing guard, part payments, printable invoice, receivables ageing |
| Attendance & payroll | Daily attendance per site (full/half day), wages owed per site, one-click payroll run that books a paid labour expense |
| Materials | Deliveries and site usage, stock per site, low-stock flags, delivery can raise a materials expense automatically |
| Equipment | Owned vs rented, daily rate, which site it is on |
| Site diary | Daily work done, workers on site, weather, issues/delays |
| Reports | P&L by project, company overhead, 12-month cash flow, receivables ageing by client |

### Roles

- **Admin**: everything, including users and project setup.
- **Finance**: approve and pay expenses, invoices, budgets, payroll.
- **Site manager**: submit expenses, attendance, stock movements, equipment moves, site diary, progress.
- **Viewer**: read-only.

Controls built in: nobody except an Admin can approve an expense they submitted; approved/paid expenses
can't be deleted; paid attendance is locked; invoices can't exceed the contract value unless marked as a
variation; payments can't exceed the invoice; stock can't be issued beyond what is on site.

## Run locally

Needs Node 20+ and PostgreSQL.

```bash
cd mcr-app
cp .env.example .env            # set DATABASE_URL, DATABASE_URL_UNPOOLED, AUTH_SECRET
npm install
npx prisma migrate deploy
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='a-strong-password' npm run db:seed
# add SEED_DEMO=1 to also load sample projects (local only)
npm run dev                     # http://localhost:3000
```

## Deploy on Vercel

1. Create a Vercel project from this repo and set **Root Directory** to `mcr-app`.
2. In the project's **Storage** tab, create a **Neon** Postgres database and connect it. This sets
   `DATABASE_URL` (pooled) and `DATABASE_URL_UNPOOLED` (direct, used for migrations) automatically.
3. Add `AUTH_SECRET`: a long random string (`openssl rand -base64 48`).
4. Deploy. The build runs `prisma migrate deploy` automatically.
5. Create the first admin once, from your machine, against the production database:
   ```bash
   DATABASE_URL='<prod url>' ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='…' npm run db:seed
   ```
   Do **not** set `SEED_DEMO` in production.

## Known limits

- Net cash is "received − paid since records began"; there is no opening balance or bank reconciliation yet.
- No file uploads for receipts yet: store the receipt/transaction number in the reference field.
- Single currency (USD).
