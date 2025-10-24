# Verkstads Insikt: Vite → Next.js 16 Migration Plan

**Project:** Converting Verkstads Insikt from Vite + React to Next.js 16
**Target Framework:** Next.js 16.0.0 with App Router
**Supabase Project ID:** hzowvejjmnamhnrbqpou
**GitHub Repo:** Berkay2002/verkstads-insikt (private)

---

## Database Schema Reference

### Tables in Supabase
- **profiles** - User profiles (name, role: admin/user)
- **reports** - Main reports table (technician_name, registration_numbers[], days_taken, problem_description, improvement_description, category_id, reporter_name)
- **categories** - Problem categories (name, description, color, is_predefined)
- **technicians** - Technician profiles (name, description, is_active)
- **reporters** - Reporter profiles (name, description, is_active)

All tables have RLS (Row Level Security) enabled.

---

## Phase 1: Project Setup & Dependencies

### 1.1 Install Missing Dependencies
- [ ] Add `@supabase/supabase-js` to package.json
- [ ] Add `@supabase/ssr` for Next.js integration
- [ ] Verify `recharts` is installed (for dashboard charts)
- [ ] Install React Compiler plugin: `npm install -D babel-plugin-react-compiler`
- [ ] Run `npm install` to install all dependencies
- [ ] Check for any Vite-specific dependencies to remove

### 1.2 Environment Configuration
- [ ] Create `.env.local` file in project root
- [ ] Add `NEXT_PUBLIC_SUPABASE_URL` from project hzowvejjmnamhnrbqpou
- [ ] Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` from project hzowvejjmnamhnrbqpou
- [ ] Document all environment variables in `.env.example`
- [ ] Update `.gitignore` to exclude `.env.local`
- [ ] Remove any `VITE_` prefixed environment variables

### 1.3 Clean Up Vite Configuration
- [ ] Remove `vite.config.ts`
- [ ] Remove Vite-related dependencies from package.json
- [ ] Remove any Vite-specific environment variables (VITE_*)
- [ ] Update scripts in package.json to use Next.js commands:
  - [ ] `"dev": "next dev"` (no --turbopack flag needed)
  - [ ] `"build": "next build"` (Turbopack is now default)
  - [ ] `"start": "next start"`
  - [ ] `"lint": "eslint"` (using ESLint CLI directly)

### 1.4 Next.js 16 Configuration
- [ ] Review and update `next.config.ts` if needed
- [ ] Remove any `experimental.turbopack` config (now top-level `turbopack`)
- [ ] Consider enabling `reactCompiler: true` for performance
- [ ] Consider enabling `cacheComponents: true` for Cache Components/PPR
- [ ] Review image optimization defaults (breaking changes in v16)

---

## Phase 2: Core Architecture Setup

### 2.1 Create Next.js Directory Structure
- [ ] Create `app/(auth)/` route group for authentication pages
- [ ] Create `app/(authenticated)/` route group for protected pages
- [ ] Create `lib/supabase/` for Supabase client utilities
- [ ] Create `lib/contexts/` for any remaining context providers
- [ ] Create `lib/schemas/` for Zod validation schemas
- [ ] Create `types/` directory for TypeScript definitions
- [ ] Create `app/(authenticated)/@modal/` parallel route (if needed)
  - [ ] Add `default.tsx` returning `null` (REQUIRED in Next.js 16)
- [ ] Note: `.next/dev/` is now used for dev builds (not `.next/`)

### 2.2 Database Types & Utilities
- [ ] Create `types/database.ts` with Supabase table types
- [ ] Define TypeScript interfaces for:
  - [ ] Profile type
  - [ ] Report type
  - [ ] Category type
  - [ ] Technician type
  - [ ] Reporter type
- [ ] Create utility types for form data and API responses

### 2.3 Supabase Client Setup
- [ ] Create `lib/supabase/client.ts` (client-side Supabase client)
- [ ] Create `lib/supabase/server.ts` (server-side Supabase client)
- [ ] Create `lib/supabase/proxy.ts` (proxy/middleware Supabase client)
- [ ] Add helper functions for auth session management
- [ ] Ensure all async APIs use `await` (cookies, headers, etc.)
- [ ] Add proper error handling for Supabase operations

---

## Phase 3: Authentication System

### 3.1 Authentication Proxy (formerly Middleware)
⚠️ **BREAKING CHANGE**: `middleware.ts` → `proxy.ts` in Next.js 16
- [ ] Create `proxy.ts` in project root (NOT `middleware.ts`)
- [ ] Export function named `proxy` (NOT `middleware`)
- [ ] Use `nodejs` runtime (edge runtime NOT supported in proxy)
- [ ] Implement session validation logic using Supabase
- [ ] Define protected routes (all routes except /login)
- [ ] Add redirect logic for unauthenticated users
- [ ] Add redirect logic for authenticated users visiting /login
- [ ] Test that authentication redirects work correctly

### 3.2 Authentication Pages
- [ ] Create `app/(auth)/layout.tsx` (centered layout for auth pages)
- [ ] Create `app/(auth)/login/page.tsx`
  - [ ] Build login form with shadcn/ui components (Form, Input, Button)
  - [ ] Add email/password fields with validation
  - [ ] Implement Supabase email auth
  - [ ] Add error handling and validation with Zod
  - [ ] Add loading states
  - [ ] Test login with valid/invalid credentials
- [ ] Create auth actions in `app/(auth)/actions.ts`
  - [ ] `signIn` Server Action (async)
  - [ ] `signOut` Server Action (async)
  - [ ] `getSession` helper (async)
  - [ ] Handle errors and return appropriate responses

### 3.3 Auth Context (Optional - for Client Components)
- [ ] Decide: Use Server Components + middleware OR keep AuthContext
- [ ] If keeping context: Create `lib/contexts/AuthContext.tsx`
- [ ] Adapt context to work with Next.js App Router
- [ ] Create `useAuth` hook for client components

---

## Phase 4: Layout & Navigation

### 4.1 Root Layout
- [ ] Verify `app/layout.tsx` has correct structure
- [ ] Ensure ThemeProvider is properly configured
- [ ] Add font configuration if needed
- [ ] Add metadata (title, description)

### 4.2 Authenticated Layout
- [ ] Create `app/(authenticated)/layout.tsx`
- [ ] Integrate AppSidebar component
- [ ] Add main content area wrapper
- [ ] Add user profile display
- [ ] Add sign-out functionality

### 4.3 Navigation Components
- [ ] Update `components/AppSidebar.tsx` to use Next.js `Link`
- [ ] Update navigation links to match new route structure:
  - [ ] `/oversikt` - Dashboard
  - [ ] `/ny-rapport` - New Report
  - [ ] `/alla-rapporter` - All Reports
  - [ ] `/anvandare` - Users (Admin only)
  - [ ] `/kategorier` - Categories
  - [ ] `/tekniker` - Technicians
  - [ ] `/reporter` - Reporters
- [ ] Add active route highlighting
- [ ] Ensure mobile responsiveness

---

## Phase 5: Page Migrations - Data Management Pages

### 5.1 Categories Page (`/kategorier`)
- [ ] Create `app/(authenticated)/kategorier/page.tsx`
- [ ] Convert to Server Component for initial data load
- [ ] Create `app/(authenticated)/kategorier/actions.ts` for Server Actions:
  - [ ] `getCategories` - Fetch all categories (with cacheTag)
  - [ ] `createCategory` - Create new category (with updateTag)
  - [ ] `updateCategory` - Update existing category (with updateTag)
  - [ ] `deleteCategory` - Delete category (with updateTag)
- [ ] Migrate responsive table/card layout from Vite version
- [ ] Add create/edit dialog with shadcn/ui form components
- [ ] Add delete confirmation dialog (AlertDialog)
- [ ] Implement permission checks (can only edit own categories)
- [ ] Add loading states with Suspense boundaries
- [ ] Add error states with error.tsx
- [ ] Use `cacheTag('categories')` for data caching
- [ ] Use `updateTag('categories')` after mutations for immediate updates

### 5.2 Technicians Page (`/tekniker`)
- [ ] Create `app/(authenticated)/tekniker/page.tsx`
- [ ] Create Server Actions in `app/(authenticated)/tekniker/actions.ts`:
  - [ ] `getTechnicians` - Fetch all technicians (with cacheTag)
  - [ ] `createTechnician` - Create new technician (with updateTag)
  - [ ] `updateTechnician` - Update existing technician (with updateTag)
  - [ ] `deleteTechnician` - Delete technician (with updateTag)
- [ ] Migrate responsive table/card layout from Vite version
- [ ] Add create/edit dialog with shadcn/ui components
- [ ] Add delete confirmation with AlertDialog
- [ ] Implement permission checks (can only edit own technicians)
- [ ] Add search/filter functionality
- [ ] Use `cacheTag('technicians')` for data caching
- [ ] Use `updateTag('technicians')` after mutations

### 5.3 Reporters Page (`/reporter`)
- [ ] Create `app/(authenticated)/reporter/page.tsx`
- [ ] Create Server Actions in `app/(authenticated)/reporter/actions.ts`:
  - [ ] `getReporters` - Fetch all reporters (with cacheTag)
  - [ ] `createReporter` - Create new reporter (with updateTag)
  - [ ] `updateReporter` - Update existing reporter (with updateTag)
  - [ ] `deleteReporter` - Delete reporter (with updateTag)
- [ ] Migrate responsive table/card layout
- [ ] Add CRUD dialogs with shadcn/ui components
- [ ] Implement permission checks
- [ ] Add loading states with Suspense
- [ ] Add error handling with error.tsx
- [ ] Use `cacheTag('reporters')` for data caching
- [ ] Use `updateTag('reporters')` after mutations

### 5.4 Users/Admin Page (`/anvandare`)
- [ ] Create `app/(authenticated)/anvandare/page.tsx`
- [ ] Add admin-only check in proxy.ts
- [ ] Create Server Actions in `app/(authenticated)/anvandare/actions.ts`:
  - [ ] `getUsers` - Fetch all user profiles (with cacheTag)
  - [ ] `inviteUser` - Send invite to new user (Supabase Auth)
  - [ ] `updateUserRole` - Change user role admin/user (with updateTag)
- [ ] Build user management table with shadcn/ui Table
- [ ] Add invite user dialog (Dialog + Form components)
- [ ] Add role change dropdown (Select component)
- [ ] Show user join dates and current roles (Badge for roles)
- [ ] Add proper error handling and validation
- [ ] Use `cacheTag('users')` for data caching
- [ ] Use `updateTag('users')` after role changes

---

## Phase 6: Page Migrations - Reports

### 6.1 New Report Page (`/ny-rapport`)
- [ ] Create `app/(authenticated)/ny-rapport/page.tsx`
- [ ] Mark as Client Component (`'use client'`)
- [ ] Set up react-hook-form with Zod validation schema
- [ ] Create form schema in `lib/schemas/report.ts`:
  - [ ] technician_name (required)
  - [ ] registration_numbers (array, required)
  - [ ] days_taken (number, required)
  - [ ] problem_description (text, required)
  - [ ] improvement_description (text, optional)
  - [ ] category_id (uuid, optional)
  - [ ] reporter_name (text, optional)
- [ ] Create Server Action: `createReport` in `actions.ts`
- [ ] Migrate form components:
  - [ ] TechnicianSelector
  - [ ] CategorySelector
  - [ ] ReviewerSelector (reporter)
  - [ ] Registration numbers input
  - [ ] Days taken input
  - [ ] Problem description textarea
  - [ ] Improvement description textarea
- [ ] Add form validation and error display
- [ ] Add success toast and redirect to /alla-rapporter
- [ ] Add loading state during submission

### 6.2 All Reports Page (`/alla-rapporter`)
- [ ] Create `app/(authenticated)/alla-rapporter/page.tsx`
- [ ] Create Server Component for initial data load with async searchParams
- [ ] Use searchParams for filters and pagination (await searchParams)
- [ ] Create Server Actions in `app/(authenticated)/alla-rapporter/actions.ts`:
  - [ ] `getReports` - Fetch reports with filters (with cacheTag)
  - [ ] `updateReport` - Update existing report (with updateTag)
  - [ ] `deleteReport` - Delete report (with updateTag)
- [ ] Create client component for interactive table: `components/reports/ReportsTable.tsx`
- [ ] Implement features:
  - [ ] Search functionality (client-side filtering)
  - [ ] Filter by technician (Select component)
  - [ ] Filter by category (Select component)
  - [ ] Sort by date (Table sorting)
  - [ ] Sort by days_taken (Table sorting)
  - [ ] Pagination with searchParams
- [ ] Add view report dialog (Dialog component)
- [ ] Add edit report dialog (reuse form components)
- [ ] Add delete confirmation dialog (AlertDialog)
- [ ] Implement permission checks (can only edit/delete own reports or if admin)
- [ ] Add loading states with Suspense boundaries
- [ ] Use `cacheTag('reports')` for data caching
- [ ] Use `updateTag('reports')` after mutations for immediate UI updates

---

## Phase 7: Page Migrations - Dashboard

### 7.1 Overview/Dashboard Page (`/oversikt`)
- [ ] Create `app/(authenticated)/oversikt/page.tsx`
- [ ] Create Server Component for KPI calculations
- [ ] Fetch all reports data server-side
- [ ] Calculate KPIs server-side:
  - [ ] Total reports count
  - [ ] Average repair time
  - [ ] Maximum time taken
  - [ ] Reports by month
  - [ ] Reports by category
  - [ ] Reports by technician
  - [ ] Most reported registration numbers
- [ ] Pass data to client components for charts

### 7.2 Dashboard Components
- [ ] Create/migrate chart components in `components/overview/`:
  - [ ] `KPICards.tsx` - Display KPI metrics (use Card component)
  - [ ] `RepairTimeDistribution.tsx` - Chart for repair time distribution
  - [ ] `TechnicianPerformance.tsx` - Chart for technician stats
  - [ ] `MonthlyTrends.tsx` - Chart for monthly trends
  - [ ] `CategoryAnalysis.tsx` - Chart for category breakdown
  - [ ] `FrequentIssues.tsx` - Table for most reported reg numbers
- [ ] Mark all chart components as Client Components ('use client')
- [ ] **Use shadcn/ui chart components** (already installed):
  - [ ] Import from `@/components/ui/chart`
  - [ ] Use `ChartContainer` to wrap recharts components
  - [ ] Use `ChartTooltip` and `ChartTooltipContent` for tooltips
  - [ ] Use `ChartLegend` and `ChartLegendContent` for legends
  - [ ] Define `ChartConfig` for each chart (colors, labels, icons)
- [ ] Ensure dark/light theme switching works for all charts
- [ ] Add responsive layouts for mobile/desktop
- [ ] Add loading skeletons (Skeleton component)
- [ ] Add empty states (no data) with helpful messages

---

## Phase 8: Shared Components Migration

### 8.1 Form Components
- [ ] Audit `components/forms/` directory from Vite project
- [ ] Migrate needed components:
  - [ ] TechnicianSelector
  - [ ] CategorySelector
  - [ ] ReviewerSelector (ReporterSelector)
- [ ] Update to use shadcn/ui Select component
- [ ] Ensure compatibility with react-hook-form
- [ ] Add proper TypeScript types
- [ ] Test with Next.js Server Actions

### 8.2 Layout Components
- [ ] Update `components/Layout.tsx` if needed
- [ ] Update `components/AppSidebar.tsx` (already done in Phase 4.3)
- [ ] Verify `components/ThemeToggle.tsx` works correctly
- [ ] Test theme switching (light/dark)

### 8.3 UI Components
- [ ] Verify all shadcn/ui components are installed
- [ ] Add any missing components from Vite project
- [ ] Test all UI components render correctly
- [ ] Ensure responsive behavior works

---

## Phase 9: Hooks & Utilities Migration

### 9.1 Custom Hooks Analysis
- [ ] Review `src/hooks/useCategories.ts` from Vite project
- [ ] Review `src/hooks/useReporters.ts` from Vite project
- [ ] Review `src/hooks/useReports.ts` from Vite project
- [ ] Review `src/hooks/useTechnicians.ts` from Vite project
- [ ] Review `src/hooks/useErrorHandler.ts` from Vite project
- [ ] Review `src/hooks/use-mobile.tsx` (already exists)
- [ ] Review `src/hooks/use-toast.ts` (already exists)

### 9.2 Hook Migration Strategy
⚠️ **React 19.2 New Hooks Available**: Consider using `useEffectEvent` where applicable
- [ ] **DO NOT** migrate data fetching hooks - replace with Server Actions
- [ ] Keep `useErrorHandler.ts` for client-side error handling
- [ ] Keep `use-mobile.tsx` and `use-toast.ts` (already in project)
- [ ] Convert any hooks that fetch data into Server Actions
- [ ] Update all hook imports in components
- [ ] Remove unused hooks from old Vite project

### 9.3 Utility Functions
- [ ] Verify `lib/utils.ts` is present and working
- [ ] Migrate any additional utilities from Vite `src/lib/utils.ts`
- [ ] Add helper functions for:
  - [ ] Date formatting (consider date-fns already installed)
  - [ ] Number formatting
  - [ ] Data transformations
  - [ ] Cache tag generation (e.g., `getCategoryTag(id)`)
- [ ] Add type-safe wrappers for new caching APIs if needed

---

## Phase 9.5: ESLint Flat Config Migration

⚠️ **BREAKING CHANGE**: ESLint now defaults to Flat Config format in Next.js 16

### 9.5.1 Migrate ESLint Configuration
- [ ] Check if project uses legacy `.eslintrc` format
- [ ] If yes, migrate to flat config format (`eslint.config.js` or `eslint.config.mjs`)
- [ ] Review ESLint migration guide: https://eslint.org/docs/latest/use/configure/migration-guide
- [ ] Update `@next/eslint-plugin-next` imports for flat config
- [ ] Test ESLint runs correctly: `npm run lint`
- [ ] Fix any ESLint errors before proceeding
- [ ] Remove old `.eslintrc` files after migration

Example flat config:
```js
// eslint.config.mjs
import js from '@eslint/js'
import nextPlugin from '@next/eslint-plugin-next'

export default [
  js.configs.recommended,
  {
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
    },
  },
]
```

---

## Phase 10: Styling & Theme

### 10.1 Global Styles Migration
- [ ] Review Vite's `src/index.css`
- [ ] Merge needed styles into `app/globals.css`
- [ ] Verify Tailwind v4 CSS variables are correct
- [ ] Test dark mode CSS variables
- [ ] Ensure all custom CSS works in Next.js

### 10.2 Component Styles
- [ ] Review `src/App.css` from Vite project
- [ ] Migrate any component-specific styles
- [ ] Convert to Tailwind classes where possible
- [ ] Test all components render correctly

### 10.3 Theme Configuration
- [ ] Verify next-themes configuration in layout.tsx
- [ ] Test theme toggle functionality
- [ ] Test system theme detection
- [ ] Verify theme persistence across page navigation
- [ ] Test theme on all pages

---

## Phase 10.5: Next.js 16 Image Optimization Updates

⚠️ **BREAKING CHANGES** in `next/image` configuration

### 10.5.1 Update Image Configuration
- [ ] Review all `next/image` usages in the codebase
- [ ] Check if using local images with query strings
  - [ ] If yes, add `images.localPatterns` config with `search` property
- [ ] Update `next.config.ts` with new image defaults:
  - [ ] `minimumCacheTTL`: Now defaults to 4 hours (was 60 seconds)
  - [ ] `imageSizes`: 16px removed from default array
  - [ ] `qualities`: Now defaults to `[75]` only
  - [ ] `maximumRedirects`: Now defaults to 3 (was unlimited)
- [ ] If using `images.domains`, migrate to `images.remotePatterns`
- [ ] Add `dangerouslyAllowLocalIP: true` only if needed for private networks
- [ ] Remove any usage of `next/legacy/image` component
- [ ] Test all images load correctly after changes

Example configuration:
```ts
// next.config.ts
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'example.com' }
    ],
    minimumCacheTTL: 14400, // 4 hours (new default)
    imageSizes: [32, 48, 64, 96, 128, 256, 384], // 16 removed
    qualities: [75], // Single quality by default
    maximumRedirects: 3, // New limit
  }
}
```

---

## Phase 11: Testing & Validation

### 11.1 Authentication Flow Testing
- [ ] Test login with valid credentials
- [ ] Test login with invalid credentials
- [ ] Test **proxy** redirects for unauthenticated users (not middleware)
- [ ] Test **proxy** redirects for authenticated users on /login
- [ ] Test sign-out functionality
- [ ] Test session persistence across page refreshes
- [ ] Verify async `cookies()` and `headers()` work in auth
- [ ] Test that proxy.ts runs on nodejs runtime (not edge)

### 11.2 Page Functionality Testing
- [ ] Test `/oversikt` dashboard:
  - [ ] All KPIs display correctly
  - [ ] All charts render with data
  - [ ] Charts are interactive
  - [ ] Responsive on mobile
- [ ] Test `/ny-rapport` form:
  - [ ] All fields validate correctly
  - [ ] Form submission creates report in database
  - [ ] Success message displays
  - [ ] Redirects to /alla-rapporter
- [ ] Test `/alla-rapporter`:
  - [ ] Reports load and display
  - [ ] Search works
  - [ ] Filters work (technician, category)
  - [ ] Sorting works (date, days_taken)
  - [ ] Pagination works
  - [ ] Edit report works
  - [ ] Delete report works (with confirmation)
- [ ] Test `/kategorier`:
  - [ ] Categories load and display
  - [ ] Create new category works
  - [ ] Edit category works
  - [ ] Delete category works
  - [ ] Permission checks work (can only edit own)
- [ ] Test `/tekniker`:
  - [ ] Technicians load and display
  - [ ] CRUD operations work
  - [ ] Permission checks work
- [ ] Test `/reporter`:
  - [ ] Reporters load and display
  - [ ] CRUD operations work
  - [ ] Permission checks work
- [ ] Test `/anvandare`:
  - [ ] Only accessible to admins
  - [ ] Users list loads
  - [ ] Invite user works
  - [ ] Role change works

### 11.3 Role-Based Access Control
- [ ] Test as regular user:
  - [ ] Cannot access `/anvandare`
  - [ ] Can only edit/delete own categories
  - [ ] Can only edit/delete own reports (or test access rules)
- [ ] Test as admin:
  - [ ] Can access `/anvandare`
  - [ ] Can manage all users
  - [ ] Can edit/delete all reports

### 11.4 Error Handling
- [ ] Test network errors (disconnect internet)
- [ ] Test database errors (invalid data)
- [ ] Test form validation errors
- [ ] Test 404 pages (invalid routes)
- [ ] Test error boundaries

### 11.5 Performance Testing
- [ ] Test initial page load speed
- [ ] Test navigation between pages (verify enhanced routing)
- [ ] Test with large datasets (100+ reports)
- [ ] Run `npm run build` successfully (Turbopack by default)
- [ ] Check build output (note: size metrics removed in v16)
- [ ] Test on mobile devices
- [ ] Test on different browsers (Chrome 111+, Edge 111+, Firefox 111+, Safari 16.4+)
- [ ] Verify layout deduplication in Network tab
- [ ] Test incremental prefetching behavior
- [ ] Monitor React Compiler performance if enabled

### 11.6 Caching API Testing
- [ ] Test `cacheTag` for data tagging
- [ ] Test `revalidateTag` with `cacheLife` profile
- [ ] Test `updateTag` for immediate cache updates (read-your-writes)
- [ ] Test `refresh` for client router refresh
- [ ] Verify cache behavior after mutations
- [ ] Test stale-while-revalidate with revalidateTag
- [ ] Ensure caching improves performance

---

## Phase 12: Production Preparation

### 12.1 Build & Deploy Testing
- [ ] Run `npm run build` successfully
- [ ] Fix any build errors
- [ ] Test production build locally with `npm run start`
- [ ] Verify all pages work in production mode
- [ ] Check console for errors

### 12.2 Documentation
- [ ] Update README.md with:
  - [ ] Next.js 16 setup instructions
  - [ ] Environment variables documentation
  - [ ] Development workflow
  - [ ] Deployment instructions
- [ ] Remove Vite-specific documentation
- [ ] Document any breaking changes
- [ ] Add troubleshooting guide

### 12.3 Environment Variables
- [ ] Create `.env.example` with all required variables
- [ ] Document where to get Supabase credentials
- [ ] Ensure `.env.local` is in `.gitignore`
- [ ] Test with missing env variables (should show helpful errors)

### 12.4 Code Cleanup
- [ ] Remove unused imports
- [ ] Remove commented-out code
- [ ] Remove console.logs
- [ ] Remove any remaining `middleware.ts` references
- [ ] Remove `experimental.dynamicIO` if present
- [ ] Remove `experimental.ppr` if present
- [ ] Remove `unstable_` prefixes from cacheLife and cacheTag
- [ ] Remove any `VITE_` environment variables
- [ ] Run ESLint with new flat config and fix all warnings
- [ ] Format code consistently
- [ ] Remove any Vite artifacts
- [ ] Remove AMP-related code if any exists
- [ ] Remove `serverRuntimeConfig`/`publicRuntimeConfig` if used

### 12.5 Final Checks
- [ ] Verify all routes work
- [ ] Verify all links work
- [ ] Verify all images load
- [ ] Test dark/light theme on all pages
- [ ] Test on mobile and desktop
- [ ] Check accessibility (keyboard navigation, screen readers)
- [ ] Review security (RLS policies, auth checks)

---

## Phase 13: Deployment

### 13.1 Deployment Platform Selection
- [ ] Choose deployment platform (Vercel, Netlify, etc.)
- [ ] Set up deployment account
- [ ] Connect GitHub repository

### 13.2 Environment Configuration
- [ ] Add environment variables to deployment platform
- [ ] Verify Supabase URLs are correct
- [ ] Test environment variable access

### 13.3 Deploy & Monitor
- [ ] Deploy to production
- [ ] Test deployed application
- [ ] Monitor for errors
- [ ] Set up error logging (if needed)
- [ ] Share production URL for testing

---

## Next.js 16 Caching APIs Reference

### Overview of Caching Functions

| Function | Purpose | When to Use | Return Value |
|----------|---------|-------------|--------------|
| `cacheTag(tag)` | Tag data for cache invalidation | In Server Components/Actions | void |
| `cacheLife(profile)` | Set cache lifetime | In Server Components/Actions | void |
| `updateTag(tag)` | Immediate cache update (read-your-writes) | In Server Actions for user-facing changes | void |
| `revalidateTag(tag, profile?)` | Background revalidation | In Server Actions for less critical updates | void |
| `refresh()` | Refresh client router | In Server Actions | void |

### Code Examples

#### Example 1: Categories Page with updateTag (Immediate Updates)

```tsx
// app/(authenticated)/kategorier/actions.ts
'use server'

import { updateTag, cacheTag } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function getCategories() {
  'use cache'
  cacheTag('categories')

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createCategory(formData: FormData) {
  const supabase = await createClient()

  const category = {
    name: formData.get('name'),
    description: formData.get('description'),
    color: formData.get('color'),
  }

  const { error } = await supabase
    .from('categories')
    .insert(category)

  if (error) throw error

  // Immediate cache update - user sees their new category right away
  updateTag('categories')
}
```

#### Example 2: Reports with revalidateTag (Background Updates)

```tsx
// app/(authenticated)/alla-rapporter/actions.ts
'use server'

import { revalidateTag, cacheTag } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function getReports() {
  'use cache'
  cacheTag('reports')

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('reports')
    .select('*, categories(*)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function archiveReport(reportId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('reports')
    .update({ archived: true })
    .eq('id', reportId)

  if (error) throw error

  // Background revalidation - users see stale data while it refreshes
  revalidateTag('reports', 'max')
}
```

#### Example 3: Using refresh() for Client Router Updates

```tsx
// app/(authenticated)/anvandare/actions.ts
'use server'

import { refresh, updateTag } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function updateUserRole(userId: string, role: 'admin' | 'user') {
  const supabase = await createClient()

  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)

  if (error) throw error

  // Update cache for user data
  updateTag('users')

  // Also refresh the router to update any client-side state
  refresh()
}
```

#### Example 4: Async Dynamic APIs (params, searchParams)

```tsx
// app/(authenticated)/alla-rapporter/page.tsx
import { getReports } from './actions'

type SearchParams = Promise<{
  search?: string
  technician?: string
  category?: string
  page?: string
}>

export default async function AllaRapporterPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  // MUST await searchParams in Next.js 16
  const params = await searchParams

  const reports = await getReports({
    search: params.search,
    technician: params.technician,
    category: params.category,
    page: parseInt(params.page || '1'),
  })

  return (
    <div>
      {/* Render reports */}
    </div>
  )
}
```

#### Example 5: Async cookies and headers

```tsx
// lib/supabase/server.ts
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function createClient() {
  // MUST await cookies() in Next.js 16
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

#### Example 6: proxy.ts (NOT middleware.ts)

```tsx
// proxy.ts (NOT middleware.ts)
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/proxy'

export async function proxy(request: NextRequest) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  // Redirect to login if not authenticated
  if (!session && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect to dashboard if authenticated and trying to access login
  if (session && request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/oversikt', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

### When to Use Each API

**Use `updateTag`** when:
- User just submitted a form (categories, technicians, reporters)
- User just updated their profile/settings
- User expects to see changes immediately
- User performs CRUD operations

**Use `revalidateTag`** when:
- Content updates happen in background
- Slight delay in updates is acceptable (blog posts, product catalogs)
- You want stale-while-revalidate behavior
- Non-critical data updates

**Use `refresh`** when:
- You need to refresh client router state
- After Server Action that affects multiple pages
- When client-side navigation needs updating
- For non-cached updates (notifications, badges)

### Example 7: Using shadcn/ui Chart Components (for Dashboard)

```tsx
// components/overview/MonthlyTrends.tsx
'use client'

import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart'

const chartConfig = {
  reports: {
    label: 'Reports',
    color: 'hsl(var(--chart-1))',
  },
  avgDays: {
    label: 'Avg Days',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig

export function MonthlyTrends({ data }: { data: MonthlyData[] }) {
  return (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
      <BarChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="reports" fill="var(--color-reports)" radius={4} />
        <Bar dataKey="avgDays" fill="var(--color-avgDays)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
```

This approach gives you:
- ✅ Automatic dark/light mode theme switching
- ✅ Consistent styling with your design system
- ✅ Type-safe chart configuration
- ✅ Built-in responsive behavior
- ✅ Accessible tooltips and legends

---

## File Mapping Reference

### Vite → Next.js Structure

| Vite Path | Next.js Path | Notes |
|-----------|--------------|-------|
| `src/pages/Auth.tsx` | `app/(auth)/login/page.tsx` | Auth page |
| `src/pages/Oversikt.tsx` | `app/(authenticated)/oversikt/page.tsx` | Dashboard |
| `src/pages/NyRapport.tsx` | `app/(authenticated)/ny-rapport/page.tsx` | New report form |
| `src/pages/AllaRapporter.tsx` | `app/(authenticated)/alla-rapporter/page.tsx` | Reports list |
| `src/pages/Anvandare.tsx` | `app/(authenticated)/anvandare/page.tsx` | Admin - Users |
| `src/pages/Kategorier.tsx` | `app/(authenticated)/kategorier/page.tsx` | Categories CRUD |
| `src/pages/Tekniker.tsx` | `app/(authenticated)/tekniker/page.tsx` | Technicians CRUD |
| `src/pages/Reporter.tsx` | `app/(authenticated)/reporter/page.tsx` | Reporters CRUD |
| `src/components/` | `components/` | Keep structure |
| `src/contexts/AuthContext.tsx` | `proxy.ts` + `lib/supabase/` | Convert to proxy (NOT middleware) |
| `src/hooks/` | `hooks/` | Adapt for Next.js |
| `src/integrations/supabase.ts` | `lib/supabase/client.ts` | Split into client/server |
| `src/lib/utils.ts` | `lib/utils.ts` | Keep as-is |
| `index.html` | `app/layout.tsx` | Convert to layout |
| `vite.config.ts` | `next.config.ts` | Remove Vite config |

---

## Key Technical Decisions

### 1. Server Components vs Client Components
- **Server Components (default)**: Data fetching pages, layouts
- **Client Components ('use client')**: Forms, charts, interactive elements
- **React 19.2**: Use View Transitions for smooth navigation animations

### 2. Data Fetching Strategy
- **Server Components**: Direct Supabase queries in page components
- **Server Actions**: For mutations (create, update, delete)
- **No client-side hooks**: Replace useCategories, useReports, etc. with Server Actions
- **Caching**: Use `cacheTag` and `cacheLife` for optimized data caching

### 3. Authentication Approach
- **Proxy (proxy.ts)**: Primary authentication check on nodejs runtime
- **NOT middleware.ts**: Use proxy.ts instead (breaking change in v16)
- **Runtime**: nodejs only (edge runtime NOT supported in proxy)
- **Server Components**: Session verification for data access
- **Optional Context**: For client components that need user data

### 4. Form Handling
- **react-hook-form + Zod**: Client-side validation
- **Server Actions**: Server-side validation and mutation
- **shadcn/ui forms**: Consistent UI components
- **Immediate updates**: Use `updateTag` for read-your-writes semantics

### 5. Styling
- **Tailwind CSS v4**: Continue using current setup
- **CSS Variables**: For theming (already configured)
- **next-themes**: For theme management

### 6. Caching Strategy
- **cacheTag**: Tag cached data for selective revalidation
- **cacheLife**: Define cache lifetime profiles
- **updateTag**: Immediate cache updates (user sees changes right away)
- **revalidateTag**: Background revalidation (stale-while-revalidate)
- **refresh**: Client-side router refresh

### 7. Build & Development
- **Turbopack**: Default for both dev and build (no flags needed)
- **Concurrent builds**: Dev uses `.next/dev`, build uses `.next`
- **React Compiler**: Consider enabling for automatic memoization
- **Cache Components**: Consider enabling for PPR-like behavior

---

## Complexity Estimates

### High Complexity (2-4 hours each)
- ✦ Oversikt/Dashboard page (charts, KPIs, data aggregation)
- ✦ Authentication system (middleware, Server Actions, session management)
- ✦ AllaRapporter page (search, filters, sorting, pagination, CRUD)

### Medium Complexity (1-2 hours each)
- ◆ NyRapport page (complex form with validation)
- ◆ Anvandare page (admin features, role management)
- ◆ Supabase client setup (client/server separation)

### Low Complexity (30min-1 hour each)
- ○ Kategorier, Tekniker, Reporter pages (similar CRUD patterns)
- ○ Layout and navigation components
- ○ Theme configuration
- ○ Environment setup

---

## Notes & Reminders

### Next.js 16 Specific Changes
1. ⚠️ **middleware.ts → proxy.ts**: Rename and update function export
2. ⚠️ **Edge runtime NOT supported**: proxy.ts uses nodejs runtime only
3. ⚠️ **Async APIs fully async**: No sync compatibility for cookies, headers, params, searchParams
4. ⚠️ **Turbopack is default**: No --turbopack flag needed
5. ⚠️ **Image defaults changed**: Review minimumCacheTTL, imageSizes, qualities
6. ⚠️ **Parallel routes require default.js**: Add default.tsx to all parallel routes
7. ⚠️ **PPR → cacheComponents**: Use new config, not experimental.ppr
8. ⚠️ **Removed features**: AMP, next lint, runtime config, unstable_rootParams

### React 19.2 Features
- **View Transitions**: Smooth element animations during navigation
- **useEffectEvent**: Extract non-reactive logic from Effects
- **Activity**: Render background activity with display: none

### General Reminders
1. **No Build During Dev**: You can now run both concurrently (separate .next/dev)
2. **Supabase RLS**: All tables already have RLS enabled - verify policies
3. **GitHub Repo**: Private repo at Berkay2002/verkstads-insikt
4. **shadcn/ui**: Already configured with new-york style
5. **TypeScript**: Strict mode enabled - maintain type safety (TS 5.1.0+ required)
6. **Node.js**: 20.9+ required (18 no longer supported)
7. **Accessibility**: Test keyboard navigation and screen readers
8. **Mobile-First**: Ensure all pages work well on mobile devices
9. **Browser Support**: Chrome 111+, Edge 111+, Firefox 111+, Safari 16.4+

### Caching Best Practices
- Use `updateTag` when users need immediate feedback (forms, settings)
- Use `revalidateTag` when slight delay is acceptable (blog posts, products)
- Use `refresh` to refresh client router after Server Actions
- Use `cacheTag` to organize cache invalidation
- Use `cacheLife` to define cache duration profiles

---

## Progress Tracking

**Total Tasks**: 235+
**Completed**: 0
**In Progress**: 0

**Started**: [Date]
**Target Completion**: [Date]
**Actual Completion**: [Date]

---

## Quick Start Checklist

Start here when beginning the migration:

- [ ] 1. Install dependencies including React Compiler (Phase 1.1)
- [ ] 2. Update package.json scripts (remove --turbopack flags) (Phase 1.3)
- [ ] 3. Set up environment variables (Phase 1.2)
- [ ] 4. Create directory structure (Phase 2.1)
- [ ] 5. Set up Supabase clients with async APIs (Phase 2.3)
- [ ] 6. Create `proxy.ts` NOT `middleware.ts` (Phase 3.1) ⚠️
- [ ] 7. Implement authentication pages (Phase 3.2)
- [ ] 8. Migrate one simple page to test setup (e.g., Kategorier)
- [ ] 9. Test caching APIs (cacheTag, updateTag, revalidateTag)
- [ ] 10. Continue with remaining pages
- [ ] 11. Update image configuration if needed (Phase 10.5)
- [ ] 12. Test thoroughly (Phase 11)
- [ ] 13. Clean up deprecated code (Phase 12.4)
- [ ] 14. Deploy (Phase 13)

### Critical Breaking Changes to Address First
1. ✅ Rename middleware.ts → proxy.ts with nodejs runtime
2. ✅ Update all async APIs (cookies, headers, params, searchParams)
3. ✅ Add default.tsx to any parallel routes
4. ✅ Remove experimental.ppr, use cacheComponents instead
5. ✅ Update image configuration if using query strings or custom settings
6. ✅ Remove VITE_ environment variables, use NEXT_PUBLIC_
7. ✅ Update ESLint to flat config format if needed
