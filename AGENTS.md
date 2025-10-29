# AGENTS.MD

> **README for AI Coding Agents** — This document provides comprehensive guidance for AI agents working on the Oversee codebase. It follows the [agents.md](https://agents.md/) standard.

---

## Project Overview

**Oversee** is a multi-tenant SaaS application for organization management, built with Next.js 16 and Supabase. The application provides features for report management, vehicle case tracking (Bilkollen), and team collaboration with role-based access control.

### Architecture
- **Pattern**: Multi-tenant organization-scoped architecture
- **Routing**: All authenticated routes use `/org/[orgId]/*` pattern for data isolation
- **Data Isolation**: Row-Level Security (RLS) policies enforce organization boundaries
- **Authentication**: Supabase Auth with session validation via `proxy.ts`
- **UI Language**: Swedish for end-user interface (but code comments and variable names in English)

### Tech Stack
- **Framework**: Next.js 16.0.0 (App Router with React Compiler and Cache Components enabled)
- **React**: 19.2.0 (latest with new hooks and async transitions)
- **Database**: Supabase (PostgreSQL with RLS policies)
- **UI Framework**: shadcn/ui (New York style) with Radix UI primitives
- **Styling**: Tailwind CSS v4 with CSS variables for theming
- **Forms**: @tanstack/react-form with Zod validation
- **Charts**: Recharts wrapped in shadcn/ui chart components
- **State Management**: @tanstack/react-query for server state
- **Theme**: next-themes for dark/light mode

### Key Technologies
```json
{
  "next": "16.0.0",
  "react": "19.2.0",
  "@supabase/supabase-js": "2.76.1",
  "@tanstack/react-form": "1.19.5",
  "@tanstack/react-query": "5.90.5",
  "zod": "3.24.4",
  "tailwindcss": "4",
  "typescript": "5"
}
```

---

## Project Structure

```
app/
  (auth)/              — Authentication routes (login, signup, forgot-password)
    actions.ts         — Auth-related server actions
  (authenticated)/     — Protected routes requiring authentication
    org/[orgId]/       — Organization-scoped routes (main app area)
      oversikt/        — Dashboard with KPIs and charts
      alla-rapporter/  — All reports list
      ny-rapport/      — New report creation form
      kategorier/      — Categories management
      tekniker/        — Technicians management
      reporter/        — Reporters management
      bilkollen/       — Vehicle case management system
      settings/        — Organization settings and member management
    layout.tsx         — Authenticated layout with org context
  invite/[token]/      — Public invitation acceptance flow
  api/                 — API routes (analytics, webhooks, etc.)

components/
  ui/                  — shadcn/ui components (Button, Input, Dialog, etc.)
  bilkollen/          — Vehicle case-specific components
  categories/         — Category management components
  technicians/        — Technician management components
  reporters/          — Reporter management components
  shared/             — Shared business logic components

lib/
  actions/            — Shared server actions
  org/                — Organization utilities
    server.ts         — Server-side org helpers (isOrgAdmin, requireOrgRole)
    actions.ts        — Org-related server actions
    context.tsx       — Client-side org context provider
    permissions.ts    — Role-based permission checks
  supabase/           — Supabase clients
    client.ts         — Browser client
    server.ts         — Server-side client (uses cookies)
    proxy.ts          — Proxy configuration
  schemas/            — Zod validation schemas
  utils/              — Utility functions

hooks/                — Custom React hooks (use-mobile.ts, etc.)
types/                — TypeScript type definitions
  database.ts         — Generated Supabase database types
public/               — Static assets (images, fonts)
```

### Directory Conventions
- `app/` — Next.js App Router; folders in `(...)` are route groups (don't affect URLs)
- Server Components by default; add `'use client'` for interactivity
- Colocate route-specific components, actions, and styles with their routes
- Share reusable components in `components/`, utilities in `lib/`

---

## Setup and Installation

### Prerequisites
- Node.js 18+ (React 19 and Next.js 16 requirement)
- npm or pnpm
- Supabase account and project

### Environment Variables
Create `.env.local` in the project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Installation Steps

```bash
# Clone the repository
git clone https://github.com/Berkay2002/oversee.git
cd oversee

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`.

### Supabase Setup
1. Run migrations in `supabase/migrations/` to set up database schema
2. Enable Row Level Security on all tables
3. Configure authentication providers in Supabase dashboard
4. Generate and update TypeScript types: `npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts`

---

## Development Workflow

### Available Commands

```bash
npm run dev      # Start development server with Turbopack (default)
npm run build    # Create production build
npm run start    # Start production server (requires build first)
npm run lint     # Run ESLint
npm run lint -- --fix  # Auto-fix ESLint issues
```

### Development Server
- Uses **Turbopack** by default (Next.js 16 default bundler)
- Hot Module Replacement (HMR) for instant updates
- React Fast Refresh for component state preservation
- Server Actions reload automatically on save

### Proxy.ts Authentication Flow
The `proxy.ts` file (formerly `middleware.ts` in Next.js 15) handles:
- Session validation for all routes except auth pages
- Organization membership verification for `/org/[orgId]/*` routes
- Redirects unauthenticated users to `/login`
- Sets `activeOrgId` cookie for organization context
- Redirects legacy routes to org-scoped equivalents

**Important**: `proxy.ts` replaces `middleware.ts` in Next.js 16. Both the filename and export name changed.

---

## Critical Next.js 16 Patterns

Next.js 16 introduced several breaking changes that affect this codebase:

### 1. Async Dynamic APIs
All dynamic APIs must be awaited in Next.js 16:

```typescript
// ❌ Next.js 15 (old)
export default function Page({ params, searchParams }) {
  const { orgId } = params;
}

// ✅ Next.js 16 (new)
export default async function Page({ params, searchParams }) {
  const { orgId } = await params;
  const query = await searchParams;
}
```

**Affected APIs**: `params`, `searchParams`, `cookies()`, `headers()`

### 2. middleware.ts → proxy.ts
```typescript
// ❌ middleware.ts (Next.js 15)
export function middleware(request) { ... }

// ✅ proxy.ts (Next.js 16)
export function proxy(request) { ... }
export const config = { ... };
```

### 3. PPR → cacheComponents
```typescript
// next.config.ts
export default {
  experimental: {
    cacheComponents: true,  // ✅ New name
    // ppr: true,           // ❌ Old name
  }
}
```

### 4. Image Optimization Defaults Changed
Explicitly set image configuration if you need non-default values:

```typescript
// next.config.ts
images: {
  remotePatterns: [
    { hostname: 'your-supabase-project.supabase.co' }
  ],
  minimumCacheTTL: 60,
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
}
```

### 5. ESLint Flat Config (v9)
This project uses ESLint v9 with flat config format (`eslint.config.mjs`), not legacy `.eslintrc`:

```javascript
// eslint.config.mjs
import eslintConfigNext from 'eslint-config-next/core-web-vitals';
import eslintConfigNextTypescript from 'eslint-config-next/typescript';

export default [
  { ignores: ['.next/**', 'types/database.ts'] },
  eslintConfigNext,
  eslintConfigNextTypescript,
];
```

---

## Server vs Client Components

### Default: Server Components
All components in `app/` are Server Components by default. Use them for:
- Data fetching from database or APIs
- Accessing backend resources (cookies, headers, database)
- Heavy computations that don't need client-side interactivity
- SEO-friendly content rendering

**Example: Server Component with Data Fetching**
```typescript
// app/(authenticated)/org/[orgId]/kategorier/page.tsx
import { createClient } from '@/lib/supabase/server';

interface PageProps {
  params: Promise<{ orgId: string }>;
}

export default async function CategoriesPage({ params }: PageProps) {
  const { orgId } = await params;
  const supabase = await createClient();
  
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('org_id', orgId)
    .order('name');

  return (
    <div>
      <h1>Kategorier</h1>
      {categories?.map(cat => <div key={cat.id}>{cat.name}</div>)}
    </div>
  );
}
```

### Client Components
Add `'use client'` directive at the top of files that need:
- React hooks (`useState`, `useEffect`, `useContext`, etc.)
- Browser APIs (`window`, `document`, `localStorage`)
- Event listeners (`onClick`, `onChange`, etc.)
- Third-party libraries that depend on browser environment

**Example: Client Component with Interactivity**
```typescript
'use client';

import { useState } from 'react';
import { useOrg } from '@/lib/org/context';

export function CategoryForm() {
  const [name, setName] = useState('');
  const { activeOrg } = useOrg();

  return (
    <form>
      <input 
        value={name} 
        onChange={(e) => setName(e.target.value)} 
      />
    </form>
  );
}
```

### Composition Pattern
Compose Client Components inside Server Components (not the other way around):

```typescript
// ✅ Server Component (page.tsx)
import { ClientForm } from './client-form';

export default async function Page() {
  const data = await fetchData(); // Server-side data fetching
  
  return (
    <div>
      <h1>Server-rendered heading</h1>
      <ClientForm initialData={data} /> {/* Client Component */}
    </div>
  );
}
```

**Never use `next/dynamic` with `{ ssr: false }` inside Server Components** — this is not supported in Next.js 16. Instead, create a dedicated Client Component and import it directly.

---

## Server Actions Pattern

Server Actions are the primary way to handle mutations (create, update, delete operations). They run on the server and can directly access the database.

### File Organization
- Colocate actions with routes: `app/(authenticated)/org/[orgId]/route-name/actions.ts`
- Share common actions in: `lib/actions/`
- All action files must start with `'use server'` directive

### Example: Server Action with Cache Invalidation

```typescript
// app/(authenticated)/org/[orgId]/kategorier/actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { updateTag } from 'next/cache';
import { z } from 'zod';

const categorySchema = z.object({
  name: z.string().min(1, 'Namn krävs'),
  description: z.string().optional(),
});

export async function createCategory(orgId: string, formData: FormData) {
  // Validate input
  const values = categorySchema.parse({
    name: formData.get('name'),
    description: formData.get('description'),
  });

  // Database operation
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .insert({
      ...values,
      org_id: orgId,
    })
    .select()
    .single();

  if (error) throw error;

  // Invalidate cache for this organization
  updateTag(`categories-${orgId}`);

  return { success: true, data };
}
```

### Cache Invalidation Strategy
- Use **organization-scoped cache tags**: `categories-${orgId}`, `reports-${orgId}`, etc.
- Call `updateTag()` after mutations to invalidate relevant data
- **Do NOT use `'use cache'` directive** for authenticated data — it's incompatible with `cookies()` API
- Cache invalidation ensures fresh data without full page reload

### Calling Server Actions from Client Components

```typescript
'use client';

import { useForm } from '@tanstack/react-form';
import { createCategory } from './actions';
import { useOrg } from '@/lib/org/context';

export function CategoryForm() {
  const { activeOrg } = useOrg();
  
  const form = useForm({
    defaultValues: { name: '', description: '' },
    onSubmit: async ({ value }) => {
      const formData = new FormData();
      formData.append('name', value.name);
      formData.append('description', value.description || '');
      
      await createCategory(activeOrg.id, formData);
    },
  });

  return <form onSubmit={form.handleSubmit}>...</form>;
}
```

---

## Form Patterns with Tanstack React Form

This project uses **@tanstack/react-form** (not react-hook-form) for form state management, combined with **Zod** for validation.

### Basic Form Pattern

```typescript
'use client';

import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const schema = z.object({
  name: z.string().min(1, 'Namn krävs'),
  email: z.string().email('Ogiltig e-postadress'),
});

export function ExampleForm({ onSubmit }) {
  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
    validatorAdapter: zodValidator(),
    validators: {
      onChange: schema,
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.Field
        name="name"
        children={(field) => (
          <div>
            <Input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
            {field.state.meta.errors && (
              <p className="text-destructive">{field.state.meta.errors}</p>
            )}
          </div>
        )}
      />
      
      <form.Field
        name="email"
        children={(field) => (
          <div>
            <Input
              type="email"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
            {field.state.meta.errors && (
              <p className="text-destructive">{field.state.meta.errors}</p>
            )}
          </div>
        )}
      />

      <Button type="submit" disabled={!form.state.isValid}>
        Spara
      </Button>
    </form>
  );
}
```

### Form with Server Action Integration

```typescript
'use client';

import { useForm } from '@tanstack/react-form';
import { createReport } from './actions';
import { useOrg } from '@/lib/org/context';
import { useRouter } from 'next/navigation';

export function ReportForm() {
  const { activeOrg } = useOrg();
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      title: '',
      description: '',
      category_id: '',
    },
    onSubmit: async ({ value }) => {
      const result = await createReport(activeOrg.id, value);
      if (result.success) {
        router.push(`/org/${activeOrg.id}/alla-rapporter`);
      }
    },
  });

  return <form onSubmit={form.handleSubmit}>...</form>;
}
```

---

## Multi-Tenant Organization Patterns

### Organization Context
Use the organization context to access current organization and user role:

```typescript
'use client';

import { useOrg, useIsOrgAdmin, useIsOrgOwner } from '@/lib/org/context';

export function OrganizationAwareComponent() {
  const { activeOrg, role, userOrgs } = useOrg();
  const isAdmin = useIsOrgAdmin();
  const isOwner = useIsOrgOwner();

  if (!activeOrg) return <div>Välj en organisation</div>;

  return (
    <div>
      <h1>{activeOrg.name}</h1>
      <p>Din roll: {role}</p>
      {isAdmin && <AdminPanel />}
      {isOwner && <OwnerSettings />}
    </div>
  );
}
```

### Server-Side Organization Checks

```typescript
// lib/org/server.ts exports
import { requireOrgRole, isOrgAdmin, getOrgRole } from '@/lib/org/server';

// In a Server Component or Server Action
export default async function AdminPage({ params }) {
  const { orgId } = await params;
  
  // Require admin role (throws error if not)
  await requireOrgRole(orgId, 'admin');
  
  // Or check role conditionally
  const isAdmin = await isOrgAdmin(orgId);
  if (!isAdmin) {
    return <div>Access denied</div>;
  }

  return <AdminContent />;
}
```

### Role-Based Access Control
Three roles exist:
- **owner**: Full access, can delete organization, manage all members
- **admin**: Can manage members, settings, and all data
- **member**: Can view and create data, limited management access

### Database Queries with RLS
All database tables have `org_id` foreign key with Row Level Security policies:

```typescript
const supabase = await createClient();

// ✅ RLS automatically filters by user's accessible orgs
const { data } = await supabase
  .from('reports')
  .select('*')
  .eq('org_id', orgId);  // Explicit org filter (best practice)

// ❌ Never bypass RLS with service role in user-facing code
```

---

## Code Style Guidelines

### TypeScript
- **Strict mode enabled** in `tsconfig.json`
- Use **explicit types** for function parameters and return values
- Prefer **interfaces** over type aliases for object shapes
- Use **type inference** for local variables when obvious

### Component Structure
```typescript
'use client'; // If needed

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { createAction } from './actions';

interface ComponentProps {
  title: string;
  onComplete?: () => void;
}

export function Component({ title, onComplete }: ComponentProps) {
  const [state, setState] = useState(false);

  const handleClick = async () => {
    await createAction();
    onComplete?.();
  };

  return (
    <div>
      <h2>{title}</h2>
      <Button onClick={handleClick}>Click</Button>
    </div>
  );
}
```

### Naming Conventions
- **Components**: PascalCase (`CategoryForm.tsx`)
- **Files**: PascalCase for components, kebab-case for utilities (`use-mobile.ts`)
- **Functions/Variables**: camelCase (`handleSubmit`, `isAdmin`)
- **Types/Interfaces**: PascalCase (`PageProps`, `CategoryFormValues`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)
- **Server Actions**: camelCase verbs (`createCategory`, `updateReport`)

### Import Organization
```typescript
// 1. React & Next.js
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// 2. Third-party libraries
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';

// 3. Local modules (use @ alias)
import { Button } from '@/components/ui/button';
import { useOrg } from '@/lib/org/context';
import { createCategory } from './actions';

// 4. Types
import type { Database } from '@/types/database';
```

### Styling with Tailwind
- Use **Tailwind utility classes** directly in JSX
- Compose classes with `cn()` utility (from `lib/utils.ts`)
- Use **CSS variables** for theme colors (defined in `app/globals.css`)
- Avoid inline styles except for dynamic values

```typescript
import { cn } from '@/lib/utils';

<div className={cn(
  "flex items-center gap-2 p-4",
  isActive && "bg-accent",
  className
)}>
  ...
</div>
```

### JSX Formatting
- **Two-space indentation**
- **Self-closing tags** when no children: `<Component />`
- **Props order**: structure → behavior → styling
- **Conditional rendering**: Use ternary for JSX, `&&` for optional elements

```typescript
<Button
  type="submit"
  onClick={handleClick}
  disabled={isLoading}
  className="mt-4"
>
  {isLoading ? 'Sparar...' : 'Spara'}
</Button>
```

---

## Testing Guidelines

### Current State
- **No automated test framework** is currently configured
- No test scripts in `package.json`
- Testing relies on **ESLint** and **manual QA**

### Manual Testing Approach
When implementing features, manually verify:
1. **Authentication flow**: Login, logout, session persistence
2. **Organization switching**: Data isolation between orgs
3. **CRUD operations**: Create, read, update, delete for all entities
4. **Role-based access**: Test as owner, admin, and member
5. **Form validation**: Test error states and edge cases
6. **Responsive design**: Test on mobile, tablet, desktop
7. **Theme switching**: Verify dark/light mode

### Linting as Quality Gate
```bash
# Run linting before committing
npm run lint

# Auto-fix safe issues
npm run lint -- --fix

# Check specific files
npm run lint -- app/path/to/file.tsx
```

**ESLint configuration**:
- Uses ESLint v9 flat config format (`eslint.config.mjs`)
- Extends `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Ignores `.next/`, `types/database.ts` (generated)

### Future Testing Setup
When adding tests, use:
- **Jest** with React Testing Library for component tests
- **Playwright** for E2E tests
- Colocate tests: `ComponentName.test.tsx` next to `ComponentName.tsx`
- Test organization-scoped behavior and RLS isolation

---

## Build and Deployment

### Production Build

```bash
# Create optimized production build
npm run build

# Start production server locally
npm run start
```

Build outputs to `.next/` directory.

### Build Configuration
- **Turbopack** enabled by default (Next.js 16)
- **React Compiler** enabled for automatic memoization
- **Cache Components** enabled (PPR-like behavior)
- **TypeScript strict mode** enforced

### Deployment Checklist
- [ ] Run `npm run lint` and fix all issues
- [ ] Test authentication and organization switching
- [ ] Verify environment variables are set
- [ ] Test RLS policies in Supabase
- [ ] Check database migrations are applied
- [ ] Verify image optimization settings
- [ ] Test on production-like environment

### Environment-Specific Configuration
- Development: `.env.local` (gitignored)
- Production: Set environment variables in deployment platform
- Never commit secrets or API keys to version control

---

## Common Troubleshooting

### Authentication Issues
**Symptom**: User logged in but redirected to login page

**Solutions**:
- Check `activeOrgId` cookie is set (inspect in DevTools)
- Verify user has membership in `organization_members` table
- Check `default_org_id` in user profile
- Review `proxy.ts` for authentication logic

### Organization Access Denied
**Symptom**: 403 or access denied errors on org routes

**Solutions**:
- Verify user belongs to organization (check `organization_members`)
- Check RLS policies on affected tables
- Ensure `org_id` is correctly set in database queries
- Verify role-based checks use correct role values

### Data Not Refreshing After Mutation
**Symptom**: Changes not visible after create/update

**Solutions**:
- Ensure `updateTag()` is called in Server Action with correct org tag
- Check cache tag format: `${tableName}-${orgId}`
- Verify Server Action is marked with `'use server'`
- Use React Query `invalidateQueries` for client-side cache

### Form Validation Not Working
**Symptom**: Form submits with invalid data

**Solutions**:
- Check Zod schema is correctly applied to form
- Verify `validatorAdapter: zodValidator()` is set
- Ensure `validators: { onChange: schema }` is configured
- Check field names match schema keys exactly

### Styling Issues
**Symptom**: Tailwind classes not applied

**Solutions**:
- Verify class names are correct (no typos)
- Check `cn()` utility is used for conditional classes
- Ensure Tailwind config includes all content paths
- Check CSS variables are defined in `globals.css`

### Next.js 16 Migration Issues
**Symptom**: Build errors after upgrading

**Solutions**:
- Ensure all `params` and `searchParams` are awaited
- Rename `middleware.ts` to `proxy.ts` and update export
- Update `ppr` to `cacheComponents` in config
- Check ESLint uses flat config format (v9)
- Verify no `next/dynamic` with `{ ssr: false }` in Server Components

---

## Commit and Pull Request Guidelines

### Commit Messages
- Use imperative mood: `Add feature`, `Fix bug`, `Update docs`
- Keep first line under 72 characters
- Capitalize first word
- No period at end of subject line
- Provide context in body for non-obvious changes

**Examples**:
```
Add category filtering to reports page

Update organization switching to persist in cookie

Fix RLS policy for member role access
```

### Pull Request Process
1. **Create feature branch** from `master`
2. **Run linting**: `npm run lint -- --fix`
3. **Test manually** in development environment
4. **Write clear PR description**:
   - What changes were made
   - Why changes were needed
   - UX impacts (include screenshots/recordings for UI changes)
   - Link related issues
   - List any follow-up tasks or known limitations
5. **Request review** after CI passes (linting)
6. **Resolve all review comments**
7. **Squash or rebase** before merging

### PR Description Template
```markdown
## Changes
- Brief description of what was changed

## Why
- Reason for the change

## Testing
- How to test the changes manually
- Expected behavior

## Screenshots
[If UI changes]

## Notes
- Any caveats, follow-ups, or related work
```

### Code Review Checklist
- [ ] Follows TypeScript and React conventions
- [ ] Uses Server Components where appropriate
- [ ] Server Actions include cache invalidation
- [ ] Organization-scoped data access (includes `org_id`)
- [ ] Role-based access control applied where needed
- [ ] Form validation with Zod schema
- [ ] Error handling implemented
- [ ] No console.log statements in production code
- [ ] Tailwind classes used consistently
- [ ] Imports organized correctly
- [ ] ESLint passes with no warnings

---

## Additional Resources

### Documentation Files
- `README.md` — Basic project information
- `MIGRATION_PLAN.md` — Vite to Next.js 16 migration details
- `ORG_MIGRATION_PLAN.md` — Multi-tenant migration documentation
- `cache/` — Cache and data fetching patterns

### External References
- [Next.js 16 Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Tanstack React Form](https://tanstack.com/form/latest)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [agents.md Standard](https://agents.md/)

### Key Patterns to Reference
- Server Actions: `app/(authenticated)/org/[orgId]/*/actions.ts`
- Client Forms: `components/*/form.tsx`
- Organization Context: `lib/org/context.tsx`
- Supabase Client: `lib/supabase/server.ts`
- Database Types: `types/database.ts`

---

## Swedish UI Language Context

The user interface is in **Swedish** for end-user readability, while code (variable names, functions, comments) remains in **English** for developer collaboration.

### Common Swedish Terms in UI
- **Översikt** — Overview/Dashboard
- **Alla rapporter** — All reports
- **Ny rapport** — New report
- **Kategorier** — Categories
- **Tekniker** — Technicians
- **Rapportörer** — Reporters
- **Inställningar** — Settings
- **Medlem** — Member
- **Administratör** — Administrator
- **Ägare** — Owner
- **Spara** — Save
- **Avbryt** — Cancel
- **Ta bort** — Delete
- **Redigera** — Edit

### When Working with UI Text
- Keep **labels, buttons, and messages** in Swedish
- Use **English for code variables** (e.g., `categoryName`, not `kategoriNamn`)
- Validation **error messages** should be in Swedish
- **Documentation and comments** should be in English
- **Toast notifications** should be in Swedish

**Example**:
```typescript
const categorySchema = z.object({
  name: z.string().min(1, 'Namn krävs'),  // Error message in Swedish
});

<Button>Spara</Button>  // UI text in Swedish
```

---

**Last Updated**: October 29, 2025  
**Next.js Version**: 16.0.0  
**React Version**: 19.2.0
