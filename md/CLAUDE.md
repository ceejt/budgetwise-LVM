# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**BudgetWise** is a full-stack student-oriented budget tracking web application built with Next.js 15, React, TypeScript, Tailwind CSS v4, and Supabase (PostgreSQL). It provides income/expense tracking, goal management, personalized financial tips, and e-wallet integration (GCash/Maya).

## Development Commands

```bash
# Development
npm install          # Install dependencies
npm run dev          # Start development server at localhost:3000

# Production
npm run build        # Build for production
npm run start        # Run production server

# Code Quality
npm run lint         # Run ESLint
```

## Architecture Overview

### Tech Stack

- **Frontend**: Next.js 16.0.0 with App Router (server & client components), React 18, TypeScript
- **UI**: shadcn/ui (70+ Radix UI components), Tailwind CSS v4, Lucide icons, Recharts for charts
- **Backend**: Supabase (PostgreSQL with Row-Level Security)
- **Authentication**: Supabase Auth (email/password + Google OAuth)
- **Forms**: React Hook Form + Zod validation
- **Session Management**: Supabase SSR with cookie-based sessions

### Key Architectural Patterns

1. **Next.js App Router with Server/Client Components**

   - Server components for protected pages and data fetching (`app/dashboard/page.tsx`)
   - Client components marked with `"use client"` for interactivity
   - Middleware-based authentication in `middleware.ts` protects routes and refreshes sessions

2. **Authentication Flow**

   - Middleware (`lib/supabase/middleware.ts`) checks session on every request
   - No session → redirects to `/auth/signin`
   - Valid session → allows access to protected routes
   - `/demo` route bypasses authentication (see `middleware.ts:43`)
   - Email verification is **disabled** for testing (see `app/auth/signup/page.tsx:46-58`)

3. **Component Structure**

   - Dashboard layout uses collapsible sidebar (`components/dashboard/dashboard-layout.tsx`)
   - Feature sections: ExpensesSection, IncomeSection, GoalsSection, SummarySection, TipsSection, CalendarSection
   - All CRUD operations use modal dialogs (e.g., `add-transaction-dialog.tsx`, `edit-wallet-dialog.tsx`)
   - Demo versions exist in `components/dashboard/demo/` with hardcoded data

4. **Data Flow Pattern**

   - Components query Supabase directly in `useEffect` hooks (no abstraction layer)
   - Simple state management with React `useState` (no Redux/Context)
   - CRUD operations: dialog submit → Supabase mutation → close dialog → parent `onSuccess` callback → refetch data

5. **Database Schema** (`lib/types.ts`)

   - `profiles` - User accounts (user_type: student|general, currency, theme)
   - `categories` - Expense categories with budgets, icons, colors
   - `transactions` - Income/expense records (type: income|expense)
   - `goals` - Savings goals (type: weekly|monthly|custom, status tracking)
   - `financial_tips` - Personalized tips generated from spending analysis
   - `e_wallets` - Digital wallets (GCash, Maya, other)
   - `calendar_tasks` - Task management
   - `user_preferences` - Settings
   - All tables have Row-Level Security (RLS) - users only access their own data

6. **Personalized Tips Algorithm** (`components/dashboard/tips-section.tsx`)
   - Analyzes user's expense transactions
   - Calculates spending by category
   - Generates rule-based tips:
     - If category > 40% of budget → suggest limiting
     - If has expenses → suggest 50/30/20 rule
     - Always suggest income generation and saving habits
   - Inserts into `financial_tips` table
   - Displays top 2 unread tips on dashboard

### Important Implementation Details

- **Supabase Clients**:

  - `lib/supabase/client.ts` - Browser-side client
  - `lib/supabase/server.ts` - Server-side client with cookie handling
  - `lib/supabase/middleware.ts` - Session refresh and auth logic

- **Authentication Setup**:

  - Email verification disabled for testing (can enable in Supabase dashboard)
  - Google OAuth redirects to `/auth/callback`
  - Demo route bypasses auth middleware

- **Environment Variables** (`.env.local`):

  ```env
  NEXT_PUBLIC_SUPABASE_URL=your_url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
  SUPABASE_SERVICE_ROLE_KEY=your_service_key
  NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback
  ```

- **Demo Mode**: Access `/demo` for fully functional demo with mock data (no auth required)

- **Color Scheme**: Primary #293F55 (dark blue), Secondary #72ADFD (light blue), Background #F5F5F5

## Database Setup

Run SQL scripts in Supabase SQL Editor (in order):

1. `scripts/001_create_tables.sql`
2. `scripts/002_create_profile_trigger.sql`

Or using Supabase CLI:

```bash
npm install -g supabase
supabase link --project-ref your-project-ref
supabase db push
```

## Common Development Tasks

### Adding a New Feature

1. Create database table in Supabase with RLS policies
2. Add TypeScript type to `lib/types.ts`
3. Create UI component in `components/`
4. Use Supabase client (`lib/supabase/client.ts`) to fetch/mutate data in hooks
5. Add navigation/route if needed

### Working with shadcn/ui Components

- All UI components are in `components/ui/`
- Use existing components for consistency
- Components are unstyled Radix UI primitives styled with Tailwind

### Modifying Authentication

- Auth logic: `lib/supabase/middleware.ts`
- Login flow: `app/auth/signin/page.tsx`
- Signup: `app/auth/signup/page.tsx`
- OAuth callback: `app/auth/callback/route.ts`

### Form Validation

- All forms use React Hook Form + Zod
- Schema validation happens before Supabase mutation
- Error handling via form state

## Deployment

Recommended: **Vercel** (native Next.js support)

```bash
npm install -g vercel
vercel
```

Also compatible with: Netlify, Railway, Render, AWS Amplify

**Important**: Add all environment variables in deployment platform settings.

## Current Feature Status

**Implemented**:

- User authentication (email/password + Google OAuth)
- Income/expense tracking with categories
- Goal setting and progress tracking
- Personalized financial tips
- E-wallet management
- User settings and preferences
- Public demo mode

**Partial/Testing**:

- Email verification (disabled)
- Calendar tasks (UI only, limited backend)

**Not Implemented**:

- Account deletion (stubbed)
- Real-time updates
- Push notifications

**IMPORTANT**

- Prioritize efficiency all the time
- Keep in mind that this an open-source project so proper documentation is a must, and all the other means to keep it open-source-friendly
