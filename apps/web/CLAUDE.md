# Frontend: Next.js 16 App

## Quick Facts

- **Next.js 16.2.9** with App Router and Turbopack
- **React 19** with Suspense for all async boundaries
- **TypeScript** — strict mode, must pass `npm run build`
- **CSS:** Tailwind CSS + custom design tokens (see `.claude/rules/frontend-design.md`)

## Running

```bash
npm install          # Install dependencies
npm run dev          # Dev server on port 3000
npm run build        # Production build — MUST pass before commit
npx playwright test  # Run E2E tests
```

## Key Architecture Rules

### 1. Data Fetching
- **Reads:** Use hooks from `src/hooks/` (useJobs, useNodes, useBilling, etc.)
- **Writes:** Use mutations from hooks or call `jobsApi.create()`, etc. directly
- **Never** call `supabase.from(...).select()` directly in components — always through hooks
- **Real-time:** `useStreamingLogs(jobId)` uses Supabase Realtime `postgres_changes`

### 2. Auth
- `useAuth()` from `@/hooks/use-auth` — session state, login/logout
- `getCurrentUser()` from `@/stores/auth-store` — for use in async React Query functions
- Auth pages are in route group `(auth)` — `/login`, `/signup`

### 3. Web3 / Wallet
- Wagmi v2 + RainbowKit — configured in `src/components/providers/web3-providers.tsx`
- Only `hardhat` chain is configured for local dev
- RainbowKit `ConnectButton` used for wallet connection
- `useAccountInfo()` hook exports wallet state

### 4. Providers (WRAP EVERYTHING)
```tsx
// src/app/layout.tsx
<Providers>
  <SupabaseAuthProvider>
    <Web3Providers>
      <ThemeProvider>
        <Suspense fallback={<LoadingFallback />}>
          {children}
        </Suspense>
      </ThemeProvider>
    </Web3Providers>
  </SupabaseAuthProvider>
</Providers>
```

### 5. Route Groups
- `(auth)` — Login, signup, auth callback (`/auth/callback`)
- `(dashboard)` — Auth-gated, sidebar layout, all authenticated pages
- `(marketing)` — Public pages, marketing layout with navbar/footer

## Required Component Patterns

- **MetricCard** — Used for all metric displays. NOT raw divs.
- **StatusBadge** — Used for all job/node status indicators. NOT inline text.
- **Card / CardContent / CardHeader** — All container elements use these.
- **PageHeader** — Every page uses this for consistent header structure.
- **Loading skeletons** — Add `loading.tsx` files next to `page.tsx` for Suspense boundaries.

## Performance

- **Polling intervals:** `useJobs()` 60s, `useJob()` 15s, `useJobLogs()` 10s (reduced from 2s)
- **Stale time:** 30s for most queries to avoid unnecessary refetches
- **Static pages:** Marketing pages use `export const revalidate = 3600`
- **Images:** AVIF/WebP formats, 30-day cache TTL

## File Locations

| Pattern | Location |
|---------|----------|
| Dashboard pages | `src/app/(dashboard)/{page}/page.tsx` |
| Marketing pages | `src/app/(marketing)/{page}/page.tsx` |
| Auth pages | `src/app/(auth)/{page}/page.tsx` |
| Dashboard hooks | `src/hooks/use-{domain}.ts` |
| Shared components | `src/components/ui/` and `src/components/shared/` |
| Layout components | `src/components/layout/` |
| API wrappers | `src/lib/supabase.ts` |
| Contract ABIs | `src/lib/contracts.ts` |

## E2E Tests

```bash
npx playwright test e2e-tests.spec.ts --reporter=list
# 20 tests — all must pass
```

Tests cover: homepage, login, signup, dashboard, jobs, nodes, wallet, billing, settings, marketing pages, admin auth redirects, API health.

## Common Errors

- **"Unexpected token <" JSON error** — API URL is relative (`/api/v1/...`) instead of `process.env.NEXT_PUBLIC_API_URL`. Fix: use absolute URL.
- **"Failed to fetch"** after code change — Browser cached old code. Restart dev server.
- **Build fails with type errors** — Run `npm run build` locally to see exact errors.
- **`useAccount` returns wrong type** — Wagmi v2 has different return types. Check `Web3Providers` exports.

## Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_CHAIN_ID=31337  # Hardhat
```
