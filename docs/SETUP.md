# Tentrist — Setup Guide

This guide gets you from a fresh clone to a fully running local development environment.

---

## Prerequisites

- **Node.js 20+** — [nodejs.org](https://nodejs.org)
- **Go 1.21+** — [go.dev](https://go.dev)
- **Git** — [git-scm.com](https://git-scm.com)
- **Supabase CLI** — `npm install -g supabase`
- **Playwright** (optional, for E2E tests) — `npx playwright install chromium`

---

## Step 1: Clone & Install Dependencies

```bash
git clone https://github.com/your-org/tentrist.ai.git
cd tentrist.ai
```

### Install frontend dependencies
```bash
cd apps/web
npm install
```

### Install Go dependencies
```bash
cd ../backend
go mod download
```

---

## Step 2: Environment Variables

### Frontend
Create `apps/web/.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_CHAIN_ID=31337
```

### Backend
Create `backend/.env`:

```bash
DATABASE_URL=postgres://postgres:postgres@localhost:54322/postgres
ESCROW_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
PORT=8080
CORS_ORIGIN=http://localhost:3000
SUPABASE_JWT_SECRET=your-jwt-secret
```

---

## Step 3: Start Supabase (Local Database)

```bash
cd tentrist.ai/supabase
npx supabase start
```

This starts:
- PostgreSQL on `localhost:54322`
- Supabase Studio on `localhost:54323`
- API on `localhost:54321`

**Note:** `supabase db reset` applies all migrations in `supabase/migrations/`.

---

## Step 4: Apply Database Migrations

```bash
cd tentrist.ai/supabase
npx supabase db reset
```

This creates all tables: `profiles`, `jobs`, `nodes`, `transactions`, `api_keys`, `escrow_positions`, `sla_credits`, `invoices`, `node_heartbeats`, `job_logs`, `node_assignments`.

---

## Step 5: Start the Go Backend

```bash
cd tentrist.ai/backend
go build -o server.exe ./cmd/server
./server.exe
```

Backend runs on **port 8080**. Check health:
```bash
curl http://localhost:8080/api/v1/health
```

---

## Step 6: Start the Next.js Frontend

```bash
cd tentrist.ai/apps/web
npm run dev
```

Frontend runs on **port 3000**. Open [http://localhost:3000](http://localhost:3000).

---

## Step 7: Verify Everything Works

### Frontend loads
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
# Should return 200
```

### Backend is reachable from frontend
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/v1/health
# Should return 200
```

### Run E2E tests
```bash
cd tentrist.ai/apps/web
npx playwright test e2e-tests.spec.ts --reporter=list
# 20/20 tests should pass
```

---

## Common Issues

### "Module not found" on `supabase`
```bash
cd apps/web && npm install @supabase/supabase-js @supabase/ssr
```

### Go can't connect to database
- Make sure Supabase is running: `npx supabase status`
- Check `DATABASE_URL` in `backend/.env` matches the port from `supabase status`

### Frontend shows "Failed to fetch"
- Backend is not running on port 8080
- Or `NEXT_PUBLIC_API_URL` doesn't match `http://localhost:8080`

### Playwright tests timeout
- Dev server must be running on port 3000
- Backend must be running on port 8080
- Supabase must be running on port 54322

### Build fails
```bash
cd apps/web && npm run build
```
Must pass before committing. Fix all TypeScript errors first.

---

## Connecting to Cloud Supabase (Optional)

Instead of local Supabase, use the cloud project:

1. Create a project at [supabase.com](https://supabase.com)
2. Update `NEXT_PUBLIC_SUPABASE_URL` and keys in `.env.local`
3. Run migrations: `npx supabase db push` (or apply SQL files manually)
4. Update `DATABASE_URL` in `backend/.env` with the cloud PostgreSQL connection string

---

## Connecting to Sepolia Testnet (Optional)

To test with real Ethereum:

1. Update `NEXT_PUBLIC_CHAIN_ID=11155111` (Sepolia)
2. Update wagmi config in `src/components/providers/web3-providers.tsx` to include `sepolia` chain
3. Deploy contracts to Sepolia and update `ESCROW_CONTRACT_ADDRESS` in backend `.env`
4. Add Sepolia RPC URL to wagmi transports

---

## Project Structure Quick Reference

```
apps/web/
├── src/
│   ├── app/
│   │   ├── (auth)/          # Login, signup
│   │   ├── (dashboard)/     # Authenticated: jobs, nodes, billing, settings, admin
│   │   ├── (marketing)/     # Public: landing, features, pricing, docs, explore
│   │   └── layout.tsx       # Root layout (Providers)
│   ├── components/
│   │   ├── layout/          # Sidebar, MobileNav, DashboardLayout
│   │   ├── providers/       # SupabaseAuth, Web3, Theme
│   │   └── ui/              # MetricCard, StatusBadge, Card, Button...
│   ├── hooks/               # useJobs, useNodes, useBilling, useWallet...
│   └── lib/                 # supabase.ts, contracts.ts, utils.ts
└── e2e-tests.spec.ts        # 20 Playwright tests

backend/
├── cmd/server/main.go       # Entry point
└── internal/api/handlers/   # job.go, node.go, wallet.go, auth.go...
```
