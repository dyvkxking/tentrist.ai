# Tentrist Frontend — Comprehensive Build Plan

**Version:** 1.0  
**Date:** 2026-06-16  
**Status:** Ready for Implementation

---

## Overview

This document defines the complete frontend implementation for Tentrist — a B2B SaaS dashboard for decentralized GPU orchestration. It expands Phase 4 of the main build plan into a production-ready SaaS application.

---

## Part 1: Project Foundation

### 1.1 Next.js Project Initialization

```bash
cd frontend && npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"
```

**Core Dependencies:**
```bash
# UI & Styling
npm install tailwindcss @tailwindcss/typography clsx tailwind-merge
npm install lucide-react # Icons
npm install class-variance-authority # Component variants

# State & Data Fetching
npm install @tanstack/react-query
npm install zustand # Client state
npm install SWR # Alternative data fetching

# Web3
npm install wagmi viem @tanstack/react-query
npm install @rainbow-me/rainbowkit

# Forms & Validation
npm install react-hook-form @hookform/resolvers zod

# Charts & Analytics
npm install recharts

# Tables
npm install @tanstack/react-table

# Notifications & Toasts
npm install sonner

# Date handling
npm install date-fns

# API Client
npm install axios

# Real-time (if not using SSE from backend)
npm install socket.io-client
```

### 1.2 Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   (auth)
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── layout.tsx
│   │
│   ├── (dashboard)
│   │   ├── layout.tsx          # Dashboard layout with sidebar
│   │   ├── page.tsx           # Dashboard home/overview
│   │   ├── jobs/
│   │   │   ├── page.tsx       # Jobs list
│   │   │   ├── new/page.tsx   # Submit new job wizard
│   │   │   └── [id]/
│   │   │       ├── page.tsx   # Job detail
│   │   │       └── logs/page.tsx
│   │   ├── nodes/
│   │   │   ├── page.tsx       # Nodes list
│   │   │   ├── register/page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx   # Node detail
│   │   ├── analytics/
│   │   │   ├── page.tsx       # Overview analytics
│   │   │   └── jobs/page.tsx
│   │   ├── wallet/
│   │   │   └── page.tsx       # Wallet & staking management
│   │   ├── settings/
│   │   │   ├── page.tsx       # General settings
│   │   │   ├── api-keys/page.tsx
│   │   │   ├── notifications/page.tsx
│   │   │   └── team/page.tsx
│   │   └── admin/             # Admin panel (role-gated)
│   │       ├── page.tsx
│   │       ├── users/page.tsx
│   │       └── slashing/page.tsx
│   │
│   ├── (marketing)
│   │   ├── layout.tsx
│   │   ├── page.tsx           # Landing page
│   │   ├── pricing/page.tsx
│   │   ├── features/page.tsx
│   │   ├── docs/page.tsx
│   │   └── about/page.tsx
│   │
│   ├── api/
│   │   └── v1/
│   │       └── [...slug]/route.ts
│   │
│   └── globals.css
│
├── components/
│   ├── ui/                    # Base UI components (shadcn-style)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   ├── select.tsx
│   │   ├── toast.tsx
│   │   ├── skeleton.tsx
│   │   └── tooltip.tsx
│   │
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   ├── footer.tsx
│   │   └── mobile-nav.tsx
│   │
│   ├── jobs/
│   │   ├── job-list.tsx
│   │   ├── job-card.tsx
│   │   ├── job-status-badge.tsx
│   │   ├── job-filters.tsx
│   │   ├── job-table.tsx      # Table view
│   │   ├── submit-job-form.tsx
│   │   └── job-progress.tsx
│   │
│   ├── nodes/
│   │   ├── node-list.tsx
│   │   ├── node-card.tsx
│   │   ├── node-status-badge.tsx
│   │   ├── reputation-badge.tsx
│   │   ├── node-filters.tsx
│   │   ├── node-stats.tsx
│   │   └── register-node-form.tsx
│   │
│   ├── analytics/
│   │   ├── stats-card.tsx
│   │   ├── uptime-chart.tsx
│   │   ├── jobs-chart.tsx
│   │   ├── reputation-chart.tsx
│   │   └── metrics-table.tsx
│   │
│   ├── wallet/
│   │   ├── wallet-connect.tsx
│   │   ├── stake-form.tsx
│   │   ├── unstake-form.tsx
│   │   └── transaction-history.tsx
│   │
│   ├── charts/
│   │   ├── line-chart.tsx
│   │   ├── bar-chart.tsx
│   │   └── area-chart.tsx
│   │
│   └── shared/
│       ├── live-indicator.tsx
│       ├── empty-state.tsx
│       ├── error-state.tsx
│       ├── loading-spinner.tsx
│       ├── page-header.tsx
│       └── breadcrumb-nav.tsx
│
├── hooks/
│   ├── use-auth.ts
│   ├── use-jobs.ts
│   ├── use-nodes.ts
│   ├── use-wallet.ts
│   ├── use-analytics.ts
│   ├── use-sse.ts            # Server-Sent Events
│   └── use-toast.ts
│
├── lib/
│   ├── api.ts                # API client
│   ├── constants.ts
│   ├── utils.ts              # cn() and helpers
│   ├── validations.ts        # Zod schemas
│   └── websocket.ts          # Real-time connection
│
├── stores/
│   ├── auth-store.ts
│   ├── ui-store.ts
│   └── notification-store.ts
│
├── types/
│   ├── index.ts              # Shared types
│   ├── job.ts
│   ├── node.ts
│   └── analytics.ts
│
├── config/
│   └── site.ts               # Site configuration
│
├── styles/
│   └── components/           # Component-specific styles
│
└── public/
    ├── images/
    └── icons/
```

---

## Part 2: Authentication & Onboarding

### 2.1 Authentication Pages

**Login Page** (`src/app/(auth)/login/page.tsx`)
- [ ] Email/password login form
- [ ] "Forgot password" link
- [ ] Wallet connect option (Web3 login)
- [ ] Demo mode button (for testing)
- [ ] Redirect to dashboard on success

**Signup Page** (`src/app/(auth)/signup/page.tsx`)
- [ ] Email/password signup
- [ ] API key generation on signup
- [ ] Terms of service checkbox
- [ ] Wallet connect for Web3-native users

### 2.2 Auth Provider Setup

**Auth Context** (`src/hooks/use-auth.tsx`)
- [ ] Auth state management (user, loading, error)
- [ ] Login/logout functions
- [ ] Session persistence (localStorage/JWT)
- [ ] Route protection (redirect to login if unauthenticated)
- [ ] Role-based access (user, admin)

---

## Part 3: Marketing Pages (Public)

### 3.1 Landing Page (`src/app/(marketing)/page.tsx`)

**Hero Section**
- [ ] Headline: "GPU Computing at 70% Less Cost"
- [ ] Subheadline explaining DePIN + SLA guarantee
- [ ] CTA buttons: "Start Free" / "Book Demo"
- [ ] Animated GPU cluster illustration

**Social Proof**
- [ ] Logo carousel of partner companies
- [ ] "Trusted by AI teams at..." text

**Features Section**
- [ ] 3-column grid with feature cards
- [ ] Icons + short descriptions
- [ ] "View all features" link

**How It Works**
- [ ] 3-step visual: Submit Job → GPU Executes → SLA Enforced
- [ ] Animated workflow diagram

**Pricing Preview**
- [ ] 3 tiers (Starter, Pro, Enterprise)
- [ ] Monthly/annual toggle
- [ ] "Compare all features" link

**Testimonials**
- [ ] 3 customer quotes with avatars
- [ ] Company logos

**CTA Section**
- [ ] Final call to action
- [ ] Background gradient

**Footer**
- [ ] Links: Product, Company, Resources, Legal
- [ ] Social icons
- [ ] Copyright

### 3.2 Pricing Page (`src/app/(marketing)/pricing/page.tsx`)
- [ ] Pricing cards with feature lists
- [ ] FAQ section
- [ ] Enterprise contact form

### 3.3 Features Page (`src/app/(marketing)/features/page.tsx`)
- [ ] Detailed feature breakdown
- [ ] Interactive demos
- [ ] Comparison table vs competitors

### 3.4 Docs Page (`src/app/(marketing)/docs/page.tsx`)
- [ ] Quick start guide
- [ ] API reference
- [ ] SDK documentation links

---

## Part 4: Dashboard Layout

### 4.1 Dashboard Shell

**Root Layout** (`src/app/(dashboard)/layout.tsx`)
- [ ] Sidebar navigation (collapsible)
- [ ] Top header with user menu
- [ ] Main content area
- [ ] Toast notifications container

**Sidebar** (`src/components/layout/sidebar.tsx`)
- [ ] Logo at top
- [ ] Navigation items with icons:
  - Overview (home icon)
  - Jobs (briefcase icon)
  - Nodes (server icon)
  - Analytics (chart icon)
  - Wallet (wallet icon)
  - Settings (gear icon)
- [ ] Admin section (gated)
- [ ] Collapse/expand toggle
- [ ] User profile summary at bottom

**Header** (`src/components/layout/header.tsx`)
- [ ] Breadcrumb navigation
- [ ] Search bar (global search)
- [ ] Notifications bell (with count badge)
- [ ] User avatar dropdown

### 4.2 Dashboard Home (`src/app/(dashboard)/page.tsx`)

**Stats Overview Cards**
- [ ] Total Jobs (with trend indicator)
- [ ] Active Jobs (running now)
- [ ] Total Nodes
- [ ] Wallet Balance

**Recent Activity**
- [ ] Last 5 jobs with status
- [ ] Last 5 node heartbeats

**Quick Actions**
- [ ] "Submit New Job" button
- [ ] "Register Node" button
- [ ] "View Analytics" button

**System Status**
- [ ] Network status indicator
- [ ] Connected wallet
- [ ] Recent SLA events

---

## Part 5: Jobs Management

### 5.1 Jobs List Page (`src/app/(dashboard)/jobs/page.tsx`)

**Filter Bar**
- [ ] Status filter (pending, running, completed, failed, requeued)
- [ ] Date range picker
- [ ] Search by job ID
- [ ] Sort options (date, status, deadline)

**Jobs Table** (`src/components/jobs/job-table.tsx`)
- [ ] Columns: Job ID, Type, Status, SLA Deadline, Nodes, Progress, Actions
- [ ] Row click → navigate to detail
- [ ] Pagination (25 per page)
- [ ] Bulk actions (cancel selected)

**Jobs Cards View** (alternative)
- [ ] Card per job
- [ ] Same info as table
- [ ] Toggle between table/card views

### 5.2 Submit Job Wizard (`src/app/(dashboard)/jobs/new/page.tsx`)

**Step 1: Job Type**
- [ ] Select job type (LLM Fine-tuning, Batch Processing, Image Rendering, Custom)
- [ ] Each type has different SLA options

**Step 2: SLA Configuration**
- [ ] Required uptime percentage slider (90-100%)
- [ ] Required throughput input (ops/second)
- [ ] Deadline date/time picker
- [ ] Budget estimate calculator

**Step 3: Workload Config**
- [ ] File upload (for input data)
- [ ] Parameters JSON editor
- [ ] Checkpoint interval setting
- [ ] Node preference (any, high-reputation, specific)

**Step 4: Review & Submit**
- [ ] Summary of all selections
- [ ] Estimated cost
- [ ] Submit button
- [ ] Web3 transaction for payment deposit

**Progress Indicator**
- [ ] Step indicator at top
- [ ] Back/Next buttons
- [ ] Save as draft option

### 5.3 Job Detail Page (`src/app/(dashboard)/jobs/[id]/page.tsx`)

**Header Section**
- [ ] Job ID + status badge
- [ ] Created date
- [ ] Actions dropdown (Cancel, View Logs, Export)

**SLA Metrics**
- [ ] Uptime percentage (actual vs required)
- [ ] Throughput (actual vs required)
- [ ] Time remaining until deadline
- [ ] SLA status indicator (on-track, at-risk, breached)

**Assigned Nodes**
- [ ] List of nodes with:
  - Node address (truncated)
  - Reputation score
  - Current heartbeat status
  - Assigned work units

**Progress Section**
- [ ] Work unit progress bar
- [ ] Checkpoint status
- [ ] Estimated completion time

**Work Units Table**
- [ ] Unit ID, Assigned Node, Status, Progress, Checkpoint
- [ ] Expandable row for details

**Logs Tab** (`src/app/(dashboard)/jobs/[id]/logs/page.tsx`)
- [ ] Real-time log stream (SSE)
- [ ] Filter by node
- [ ] Search within logs
- [ ] Download logs button

**History Tab**
- [ ] State changes with timestamps
- [ ] SLA events
- [ ] Node assignments

---

## Part 6: Nodes Management

### 6.1 Nodes List Page (`src/app/(dashboard)/nodes/page.tsx`)

**Filter Bar**
- [ ] Status filter (online, offline, stale, slashed)
- [ ] Reputation range
- [ ] Search by address
- [ ] Sort options

**Nodes Table** (`src/components/nodes/node-table.tsx`)
- [ ] Columns: Address, Stake, Reputation, Status, Last Heartbeat, Jobs Completed, Actions
- [ ] Reputation badge (gold/silver/bronze)
- [ ] Status dot (green/red/yellow)
- [ ] Row click → detail page

**Stats Cards Above Table**
- [ ] Total staked
- [ ] Average reputation
- [ ] Online/offline ratio

### 6.2 Register Node Page (`src/app/(dashboard)/nodes/register/page.tsx`)

**Registration Form**
- [ ] Node address input (or generate new)
- [ ] Stake amount selector
- [ ] Minimum stake warning
- [ ] Terms checkbox
- [ ] Web3 transaction to stake

**Confirmation**
- [ ] Success state
- [ ] Node ID shown
- [ ] Quick link to node detail

### 6.3 Node Detail Page (`src/app/(dashboard)/nodes/[id]/page.tsx`)

**Header Section**
- [ ] Full node address (copy button)
- [ ] Status badge
- [ ] Actions: Stake More, Unstake, Deregister

**Stats Grid**
- [ ] Stake Amount
- [ ] Reputation Score
- [ ] Total Jobs Completed
- [ ] Uptime Percentage

**Reputation History Chart**
- [ ] Line chart of reputation over time
- [ ] Mark significant events (slash, reward)

**Heartbeat Timeline**
- [ ] Last 24 hours of heartbeats
- [ ] Color-coded (normal, VRAM warning, latency warning)
- [ ] Expandable to show details

**Assigned Jobs**
- [ ] List of current/recent jobs on this node
- [ ] Link to job detail

**Slashing History**
- [ ] Table of past slashing events
- [ ] Amount slashed, reason, date
- [ ] Link to related job

---

## Part 7: Analytics Dashboard

### 7.1 Analytics Overview (`src/app/(dashboard)/analytics/page.tsx`)

**Time Range Selector**
- [ ] 24h, 7d, 30d, 90d, Custom
- [ ] Date range picker for custom

**Key Metrics Cards**
- [ ] Total Jobs Completed
- [ ] Average Uptime
- [ ] SLA Compliance Rate
- [ ] Total Value Transacted

**Charts Row 1**
- [ ] Jobs over time (bar chart)
- [ ] Node uptime trend (line chart)

**Charts Row 2**
- [ ] Revenue/value flow (area chart)
- [ ] Reputation distribution (histogram)

**SLA Performance Table**
- [ ] SLA metric, Target, Actual, Status
- [ ] Color-coded status

### 7.2 Jobs Analytics (`src/app/(dashboard)/analytics/jobs/page.tsx`)

**Performance Metrics**
- [ ] Success rate
- [ ] Average completion time
- [ ] Requeue rate

**Job Type Breakdown**
- [ ] Pie chart of job types
- [ ] Table with counts

**SLA Breach Analysis**
- [ ] Breach rate by job type
- [ ] Common breach reasons

---

## Part 8: Wallet & Staking

### 8.1 Wallet Page (`src/app/(dashboard)/wallet/page.tsx`)

**Wallet Connection**
- [ ] Connect wallet button
- [ ] Connected: address + balance
- [ ] Network indicator (Sepolia, Mainnet)

**Stake Management**
- [ ] Current stake amount
- [ ] "Stake More" button → modal
- [ ] "Unstake" button → modal (with cooldown warning)

**Transaction History**
- [ ] Table: Date, Type, Amount, Hash, Status
- [ ] Link to block explorer
- [ ] Filter by type

**Earnings**
- [ ] Total earned from jobs
- [ ] Pending earnings
- [ ] Lifetime earnings chart

---

## Part 9: Settings

### 9.1 General Settings (`src/app/(dashboard)/settings/page.tsx`)

**Profile Section**
- [ ] Email (read-only or editable)
- [ ] Display name
- [ ] Avatar upload
- [ ] Timezone selector

**Preferences**
- [ ] Default SLA settings
- [ ] Notification preferences
- [ ] Dashboard view preferences

### 9.2 API Keys (`src/app/(dashboard)/settings/api-keys/page.tsx`)

**API Key List**
- [ ] Key name, created date, last used
- [ ] Reveal/copy button
- [ ] Revoke button

**Create New Key**
- [ ] Name input
- [ ] Permissions checkboxes
- [ ] Expiration date picker
- [ ] Create button

### 9.3 Notifications (`src/app/(dashboard)/settings/notifications/page.tsx`)

**Notification Toggles**
- [ ] Job completed
- [ ] Job failed
- [ ] SLA breached
- [ ] Node offline
- [ ] Slash event
- [ ] Weekly report

**Channel Settings**
- [ ] Email notifications toggle
- [ ] Browser notifications toggle

### 9.4 Team Settings (`src/app/(dashboard)/settings/team/page.tsx`)

**Team Members Table**
- [ ] Name, Email, Role, Actions
- [ ] Invite new member button
- [ ] Remove member

**Roles**
- [ ] Admin
- [ ] Member
- [ ] Billing

---

## Part 10: Admin Panel

### 10.1 Admin Dashboard (`src/app/(dashboard)/admin/page.tsx`)

**System Overview**
- [ ] Total users
- [ ] Total jobs (all time)
- [ ] Total slashed amount
- [ ] Active nodes

**Recent Activity**
- [ ] Recent user signups
- [ ] Recent slashing events
- [ ] Recent job submissions

### 10.2 User Management (`src/app/(dashboard)/admin/users/page.tsx`)

**Users Table**
- [ ] Email, Role, Jobs submitted, Status
- [ ] Actions: Edit, Suspend, Delete

**Filters**
- [ ] Role filter
- [ ] Status filter

### 10.3 Slashing Review (`src/app/(dashboard)/admin/slashing/page.tsx`)

**Recent Slash Events**
- [ ] Node, Job, Amount, Reason, Timestamp
- [ ] "Review" action → details modal

**Dispute Resolution**
- [ ] Manual override option
- [ ] Reason input for override
- [ ] Audit log of overrides

---

## Part 11: Shared Components

### 11.1 UI Components (`src/components/ui/`)

**Button** (`button.tsx`)
- [ ] Variants: primary, secondary, outline, ghost, destructive
- [ ] Sizes: sm, md, lg
- [ ] Loading state with spinner
- [ ] Disabled state
- [ ] Icon support (left/right)

**Card** (`card.tsx`)
- [ ] Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- [ ] Hover effect variant

**Badge** (`badge.tsx`)
- [ ] Variants: default, success, warning, danger, outline
- [ ] Size sm/md

**Input** (`input.tsx`)
- [ ] Default, error, disabled states
- [ ] Label and helper text support
- [ ] Icon prefix/suffix support

**Table** (`table.tsx`)
- [ ] Table, TableHeader, TableBody, TableRow, TableHead, TableCell
- [ ] Striped rows option
- [ ] Hover effect option

**Dialog** (`dialog.tsx`)
- [ ] Modal with backdrop
- [ ] Close button
- [ ] Title, description, children, footer

**Select** (`select.tsx`)
- [ ] Single select
- [ ] Multi select option
- [ ] Search/filter option

**Tabs** (`tabs.tsx`)
- [ ] Horizontal tabs
- [ ] Tab list, tab trigger, tab content

**Toast** (`toast.tsx`)
- [ ] Success, error, warning, info variants
- [ ] Auto-dismiss (5s default)
- [ ] Action button option

**Skeleton** (`skeleton.tsx`)
- [ ] Rectangle, circle variants
- [ ] Animated pulse

**Tooltip** (`tooltip.tsx`)
- [ ] Top, bottom, left, right placements
- [ ] Delay on show

### 11.2 Shared Features

**LiveIndicator** (`src/components/shared/live-indicator.tsx`)
- [ ] Green pulsing dot when connected
- [ ] Red static dot when disconnected
- [ ] Tooltip with connection status

**EmptyState** (`src/components/shared/empty-state.tsx`)
- [ ] Icon, title, description, action button
- [ ] Reusable for all empty list states

**ErrorState** (`src/components/shared/error-state.tsx`)
- [ ] Error icon, message, retry button

**LoadingSpinner** (`src/components/shared/loading-spinner.tsx`)
- [ ] Centered spinner with optional message

**PageHeader** (`src/components/shared/page-header.tsx`)
- [ ] Title, description, breadcrumbs
- [ ] Action buttons slot

**BreadcrumbNav** (`src/components/shared/breadcrumb-nav.tsx`)
- [ ] Auto-generated from route
- [ ] Custom override option

---

## Part 12: Real-Time Features

### 12.1 SSE Integration (`src/hooks/use-sse.ts`)

**useSSE Hook**
```typescript
function useSSE<T>(url: string, onMessage: (data: T) => void) {
  // Connect to SSE endpoint
  // Handle reconnection
  // Cleanup on unmount
}
```

### 12.2 Real-Time Updates by Context

**Job Updates**
- [ ] Job status changes
- [ ] Progress updates
- [ ] Node assignments
- [ ] SLA status changes

**Node Updates**
- [ ] Heartbeat received
- [ ] Status changes (online→offline)
- [ ] Reputation changes

**Notifications**
- [ ] Toast notifications for important events
- [ ] Bell icon badge count
- [ ] Notification dropdown list

---

## Part 13: Theming & Responsive Design

### 13.1 Theme System

**Light/Dark Mode**
- [ ] System preference detection
- [ ] Manual toggle in header
- [ ] Persist preference
- [ ] CSS variables for colors

**Color Palette**
```css
--primary: brand color (purple/blue)
--primary-foreground: white
--secondary: gray variant
--accent: highlight color
--background: page background
--foreground: text color
--muted: subtle backgrounds
--destructive: error/slash red
--success: green
--warning: yellow
```

### 13.2 Responsive Breakpoints

**Tailwind breakpoints**
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

**Mobile Adaptations**
- [ ] Sidebar → bottom nav on mobile
- [ ] Table → cards on mobile
- [ ] Charts → simplified on mobile
- [ ] Horizontal scroll for tables on small screens

---

## Implementation Phases

### Phase A: Foundation (Week 1)
1. Initialize Next.js project with all dependencies
2. Set up Tailwind config with theme
3. Build all base UI components
4. Set up project structure (folders, imports)
5. Configure React Query and Zustand
6. Build layout components (sidebar, header)

### Phase B: Auth & Marketing (Week 1-2)
1. Auth context and hooks
2. Login/signup pages
3. Route protection
4. Landing page
5. Pricing page
6. Footer and basic marketing pages

### Phase C: Core Dashboard (Week 2-3)
1. Dashboard home
2. Jobs list with filters
3. Job detail page
4. Submit job wizard
5. Nodes list
6. Node detail page

### Phase D: Advanced Features (Week 3-4)
1. Analytics dashboard + charts
2. Wallet page + Web3 integration
3. Settings pages
4. Admin panel
5. Real-time updates (SSE)
6. Notifications system

### Phase E: Polish (Week 4-5)
1. Theming (light/dark mode)
2. Mobile responsive
3. Loading states
4. Error handling
5. Empty states
6. Performance optimization

---

## Verification Checklist

### Pre-Launch
- [ ] All pages render without errors
- [ ] All forms validate correctly
- [ ] All buttons have handlers
- [ ] All API calls handle errors
- [ ] Loading states for all async operations
- [ ] Empty states for all lists
- [ ] Responsive design works (mobile, tablet, desktop)
- [ ] Light/dark mode works
- [ ] Real-time updates work (SSE connected)
- [ ] Web3 wallet connect works
- [ ] Route guards work (protected routes)
- [ ] No console errors
- [ ] Lighthouse score > 80 (Performance, Accessibility, Best Practices)

### Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

---

## File Checklist (Complete)

### Core
- [ ] `frontend/package.json`
- [ ] `frontend/tsconfig.json`
- [ ] `frontend/next.config.js`
- [ ] `frontend/tailwind.config.ts`
- [ ] `frontend/src/app/globals.css`

### Auth
- [ ] `frontend/src/app/(auth)/login/page.tsx`
- [ ] `frontend/src/app/(auth)/signup/page.tsx`
- [ ] `frontend/src/hooks/use-auth.tsx`

### Marketing
- [ ] `frontend/src/app/(marketing)/layout.tsx`
- [ ] `frontend/src/app/(marketing)/page.tsx`
- [ ] `frontend/src/app/(marketing)/pricing/page.tsx`
- [ ] `frontend/src/app/(marketing)/features/page.tsx`
- [ ] `frontend/src/app/(marketing)/docs/page.tsx`

### Dashboard Layout
- [ ] `frontend/src/app/(dashboard)/layout.tsx`
- [ ] `frontend/src/components/layout/sidebar.tsx`
- [ ] `frontend/src/components/layout/header.tsx`
- [ ] `frontend/src/components/layout/mobile-nav.tsx`

### Dashboard Pages
- [ ] `frontend/src/app/(dashboard)/page.tsx`
- [ ] `frontend/src/app/(dashboard)/jobs/page.tsx`
- [ ] `frontend/src/app/(dashboard)/jobs/new/page.tsx`
- [ ] `frontend/src/app/(dashboard)/jobs/[id]/page.tsx`
- [ ] `frontend/src/app/(dashboard)/jobs/[id]/logs/page.tsx`
- [ ] `frontend/src/app/(dashboard)/nodes/page.tsx`
- [ ] `frontend/src/app/(dashboard)/nodes/register/page.tsx`
- [ ] `frontend/src/app/(dashboard)/nodes/[id]/page.tsx`
- [ ] `frontend/src/app/(dashboard)/analytics/page.tsx`
- [ ] `frontend/src/app/(dashboard)/analytics/jobs/page.tsx`
- [ ] `frontend/src/app/(dashboard)/wallet/page.tsx`
- [ ] `frontend/src/app/(dashboard)/settings/page.tsx`
- [ ] `frontend/src/app/(dashboard)/settings/api-keys/page.tsx`
- [ ] `frontend/src/app/(dashboard)/settings/notifications/page.tsx`
- [ ] `frontend/src/app/(dashboard)/settings/team/page.tsx`
- [ ] `frontend/src/app/(dashboard)/admin/page.tsx`
- [ ] `frontend/src/app/(dashboard)/admin/users/page.tsx`
- [ ] `frontend/src/app/(dashboard)/admin/slashing/page.tsx`

### UI Components
- [ ] `frontend/src/components/ui/button.tsx`
- [ ] `frontend/src/components/ui/card.tsx`
- [ ] `frontend/src/components/ui/input.tsx`
- [ ] `frontend/src/components/ui/badge.tsx`
- [ ] `frontend/src/components/ui/dialog.tsx`
- [ ] `frontend/src/components/ui/dropdown-menu.tsx`
- [ ] `frontend/src/components/ui/table.tsx`
- [ ] `frontend/src/components/ui/tabs.tsx`
- [ ] `frontend/src/components/ui/select.tsx`
- [ ] `frontend/src/components/ui/toast.tsx`
- [ ] `frontend/src/components/ui/skeleton.tsx`
- [ ] `frontend/src/components/ui/tooltip.tsx`

### Feature Components
- [ ] `frontend/src/components/jobs/job-list.tsx`
- [ ] `frontend/src/components/jobs/job-card.tsx`
- [ ] `frontend/src/components/jobs/job-status-badge.tsx`
- [ ] `frontend/src/components/jobs/job-filters.tsx`
- [ ] `frontend/src/components/jobs/job-table.tsx`
- [ ] `frontend/src/components/jobs/submit-job-form.tsx`
- [ ] `frontend/src/components/jobs/job-progress.tsx`
- [ ] `frontend/src/components/nodes/node-list.tsx`
- [ ] `frontend/src/components/nodes/node-card.tsx`
- [ ] `frontend/src/components/nodes/node-status-badge.tsx`
- [ ] `frontend/src/components/nodes/reputation-badge.tsx`
- [ ] `frontend/src/components/nodes/node-filters.tsx`
- [ ] `frontend/src/components/nodes/register-node-form.tsx`
- [ ] `frontend/src/components/analytics/stats-card.tsx`
- [ ] `frontend/src/components/analytics/uptime-chart.tsx`
- [ ] `frontend/src/components/analytics/jobs-chart.tsx`
- [ ] `frontend/src/components/analytics/reputation-chart.tsx`
- [ ] `frontend/src/components/wallet/wallet-connect.tsx`
- [ ] `frontend/src/components/wallet/stake-form.tsx`
- [ ] `frontend/src/components/wallet/unstake-form.tsx`
- [ ] `frontend/src/components/wallet/transaction-history.tsx`
- [ ] `frontend/src/components/shared/live-indicator.tsx`
- [ ] `frontend/src/components/shared/empty-state.tsx`
- [ ] `frontend/src/components/shared/error-state.tsx`
- [ ] `frontend/src/components/shared/loading-spinner.tsx`
- [ ] `frontend/src/components/shared/page-header.tsx`
- [ ] `frontend/src/components/shared/breadcrumb-nav.tsx`

### Hooks
- [ ] `frontend/src/hooks/use-auth.ts`
- [ ] `frontend/src/hooks/use-jobs.ts`
- [ ] `frontend/src/hooks/use-nodes.ts`
- [ ] `frontend/src/hooks/use-wallet.ts`
- [ ] `frontend/src/hooks/use-analytics.ts`
- [ ] `frontend/src/hooks/use-sse.ts`
- [ ] `frontend/src/hooks/use-toast.ts`

### Lib
- [ ] `frontend/src/lib/api.ts`
- [ ] `frontend/src/lib/constants.ts`
- [ ] `frontend/src/lib/utils.ts`
- [ ] `frontend/src/lib/validations.ts`
- [ ] `frontend/src/lib/websocket.ts`

### Stores
- [ ] `frontend/src/stores/auth-store.ts`
- [ ] `frontend/src/stores/ui-store.ts`
- [ ] `frontend/src/stores/notification-store.ts`

### Types
- [ ] `frontend/src/types/index.ts`
- [ ] `frontend/src/types/job.ts`
- [ ] `frontend/src/types/node.ts`
- [ ] `frontend/src/types/analytics.ts`

### Config
- [ ] `frontend/src/config/site.ts`

---

## Notes

- **Total Pages:** ~35 pages (vs 6 in original plan)
- **Total Components:** ~60 components
- **Total Hooks:** ~10 custom hooks
- **Estimated Time:** 5-6 weeks for full implementation
- **Priority:** Core Dashboard > Auth > Marketing > Advanced Features > Polish
