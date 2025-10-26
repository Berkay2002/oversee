# Verkstads Insikt: Multi-Tenant Organization Migration Plan

**Project:** Converting from single-user to multi-organization architecture
**Target:** Full multi-tenant support with organization hierarchy
**Supabase Project ID:** hzowvejjmnamhnrbqpou
**Database Migration:** ✅ Completed (see comprehensive report in user context)

---

## Database Schema Changes (Applied)

### New Tables
- **organizations** - Organization/workspace entities (id, name, created_by_user_id, created_at)
- **organization_members** - User-org membership with roles (org_id, user_id, role: owner/admin/member, created_at)
- **org_invitations** - Email invitations for new members (id, org_id, email, role, token, expires_at, created_by, accepted_at)

### Updated Tables
- **reports** - Now has `org_id` (FK to organizations)
- **categories** - Now has `org_id` (FK to organizations)
- **technicians** - Now has `org_id` (FK to organizations)
- **reporters** - Now has `org_id` (FK to organizations)
- **profiles** - Added `default_org_id` (FK to organizations)

### Removed Columns
- `created_by_user_id` removed from categories, technicians, reporters, reports (replaced with `org_id`)

### RLS Policies
All tables updated with organization-scoped RLS policies using helper functions:
- `is_org_member(uid, org_id)` - Check membership
- `is_org_admin_or_owner(uid, org_id)` - Check admin/owner role

### Database Functions (RPC)
- `create_org(name)` - Create new organization
- `add_user_to_org(org_id, user_id, role)` - Add member
- `remove_user_from_org(org_id, user_id)` - Remove member
- `transfer_org_ownership(org_id, new_owner_id)` - Transfer ownership

### Helper Views
- `v_reports`, `v_categories`, `v_technicians`, `v_reporters` - Auto-inject `org_id` from user's default org

---

## Phase 1: Foundation & Core Infrastructure ✅ COMPLETED

### 1.1 Database Setup ✅
- [x] Create `org_invitations` table
- [x] Add RLS policies for invitations (admin/owner can manage)
- [x] Create indexes for fast token lookup
- [x] Verify all existing tables have `org_id` columns
- [x] Verify RLS policies are properly configured
- [x] Test database helper functions (create_org, add_user_to_org, etc.)

### 1.2 Organization Utilities ✅
- [x] Create `lib/org/server.ts` with server-side helpers:
  - [x] `getActiveOrgForUser(orgId, userId)` - Validates membership and returns org + role
  - [x] `getUserDefaultOrg(userId)` - Gets user's default_org_id from profiles
  - [x] `getUserOrganizations(userId)` - Lists all orgs user belongs to
  - [x] `isOrgAdmin(orgId, userId)` - Check if user has admin or owner role
  - [x] `isOrgOwner(orgId, userId)` - Check if user is owner
  - [x] `requireOrgRole(orgId, userId, role)` - Throws if user doesn't have required role
- [x] Create `lib/org/actions.ts` with server actions:
  - [x] `setActiveOrg(orgId)` - Sets cookie for active org
  - [x] `switchOrganization(orgId)` - Validates + sets cookie + revalidates
  - [x] `getActiveOrgId()` - Gets active org from cookie or user's default
  - [x] `createOrganization(name)` - Creates new org using RPC function
  - [x] `updateOrganizationName(orgId, name)` - Updates org name (admin/owner only)
  - [x] `deleteOrganization(orgId)` - Deletes org (owner only)
- [x] Create `lib/org/permissions.ts` with permission helpers:
  - [x] `canManageMembers(role)` - Check if role can manage members (admin/owner)
  - [x] `canDeleteData(role)` - Check if role can delete data (admin/owner)
  - [x] `canEditOrgSettings(role)` - Check if role can edit settings (admin/owner)
  - [x] `canTransferOwnership(role)` - Check if role can transfer ownership (owner)
  - [x] `canDeleteOrg(role)` - Check if role can delete org (owner)
  - [x] `canInviteMembers(role)` - Check if role can invite (admin/owner)
  - [x] `canChangeMemberRoles(role)` - Check if role can change roles (owner)
- [x] Create `lib/org/context.tsx` with client context:
  - [x] `OrgProvider` component for React context
  - [x] `useOrg()` hook to access active org and role
  - [x] `useIsOrgAdmin()` hook for admin checks
  - [x] `useIsOrgOwner()` hook for owner checks

### 1.3 Routing Structure ✅
- [x] Create `app/(authenticated)/org/[orgId]` route group
- [x] Create `app/(authenticated)/org/[orgId]/layout.tsx`:
  - [x] Validate user is authenticated
  - [x] Validate user is member of orgId from URL
  - [x] Fetch active org details and user role
  - [x] Wrap children in OrgProvider
  - [x] Add header with SidebarTrigger and OrgSwitcher
  - [x] Fix React linting (no JSX in try/catch blocks)
- [x] Create `app/(authenticated)/org/[orgId]/page.tsx` (redirects to /oversikt)
- [x] Create directory structure for org-scoped pages:
  - [x] `oversikt/` (dashboard)
  - [x] `alla-rapporter/` (all reports) - directory created
  - [x] `kategorier/` (categories) - directory created
  - [x] `tekniker/` (technicians) - directory created
  - [x] `reporter/` (reporters) - directory created
  - [x] `ny-rapport/` (new report) - directory created

### 1.4 Proxy.ts Updates ✅
- [x] Add organization-scoped route validation for `/org/[orgId]/*`
- [x] Validate user membership before allowing access
- [x] Set `activeOrgId` cookie when accessing org routes
- [x] Add legacy route redirects:
  - [x] `/oversikt` → `/org/[activeOrgId]/oversikt`
  - [x] `/alla-rapporter` → `/org/[activeOrgId]/alla-rapporter`
  - [x] `/kategorier` → `/org/[activeOrgId]/kategorier`
  - [x] `/tekniker` → `/org/[activeOrgId]/tekniker`
  - [x] `/reporter` → `/org/[activeOrgId]/reporter`
  - [x] `/ny-rapport` → `/org/[activeOrgId]/ny-rapport`
- [x] Add root path (`/`) redirect logic:
  - [x] Redirect to active org from cookie if available
  - [x] Fallback to user's default_org_id from profile
  - [x] Redirect to `/create-organization` if no org found
- [x] Update admin-only route protection:
  - [x] Keep `/anvandare` admin-only
  - [x] Redirect non-admins to their active org instead of `/oversikt`

### 1.5 Organization Context ✅
- [x] Create React Context provider (client component)
- [x] Export hooks for accessing org data in client components
- [x] Integrate into org layout for automatic provision
- [x] Type-safe with TypeScript interfaces

---

## Phase 2: Update Dashboard & Analytics ✅ COMPLETED

### 2.1 Dashboard Overview Page ✅
- [x] Create `app/(authenticated)/org/[orgId]/oversikt/page.tsx`
- [x] Copy from existing `app/(authenticated)/oversikt/page.tsx`
- [x] Add `params: Promise<{ orgId: string }>` interface
- [x] Extract `orgId` from params using `await params`
- [x] Pass `orgId` to all server actions
- [x] Keep all existing UI components unchanged

### 2.2 Dashboard Server Actions ✅
- [x] Create `app/(authenticated)/org/[orgId]/oversikt/actions.ts`
- [x] Update `hamtaInstrumentpanelNyckeltal(orgId)`:
  - [x] Add `orgId` parameter
  - [x] Filter reports by `org_id`
  - [x] Filter categories by `org_id`
  - [x] Return org-scoped KPIs
- [x] Update `hamtaKategoriFordelning(orgId)`:
  - [x] Add `orgId` parameter
  - [x] Filter categories by `org_id`
  - [x] Filter reports by `org_id`
  - [x] Return org-scoped category breakdown
- [x] Update `hamtaTeknikerPrestation(orgId)`:
  - [x] Add `orgId` parameter
  - [x] Filter technicians by `org_id`
  - [x] Filter reports by `org_id`
  - [x] Return org-scoped technician performance
- [x] Update `hamtaDagstrender(orgId)`:
  - [x] Add `orgId` parameter
  - [x] Filter reports by `org_id`
  - [x] Return org-scoped daily trends
- [x] Update `hamtaToppRegistreringar(orgId)`:
  - [x] Add `orgId` parameter
  - [x] Filter categories by `org_id`
  - [x] Filter reports by `org_id`
  - [x] Return org-scoped top registrations

---

## Phase 3: Organization Switcher ✅ COMPLETED

### 3.1 Switcher Component ✅
- [x] Create `components/org-switcher.tsx` (client component)
- [x] Use shadcn/ui Select component
- [x] Accept currentOrgId and organizations list as props
- [x] Handle organization change with `switchOrganization` server action
- [x] Navigate to new org's oversikt page after switch
- [x] Add loading state during switch
- [x] Hide switcher if user only has one org

### 3.2 Server Wrapper ✅
- [x] Create `components/org-switcher-wrapper.tsx` (server component)
- [x] Fetch user's organizations from database
- [x] Map to simple `{ id, name }` format
- [x] Pass to client OrgSwitcher component
- [x] Handle unauthenticated state (return null)

### 3.3 Layout Integration ✅
- [x] Import OrgSwitcherWrapper in org layout
- [x] Place in header (right side)
- [x] Pass currentOrgId from params
- [x] Add SidebarTrigger to left side of header

---

## Phase 4: Organization Creation ✅ COMPLETED

### 4.1 Creation Page ✅
- [x] Create `app/(authenticated)/create-organization/page.tsx`
- [x] Build form UI with shadcn/ui components:
  - [x] Card layout with centered design
  - [x] Organization name input field
  - [x] Create button with loading state
  - [x] Error alert display
- [x] Client component with useState for form state
- [x] Call `createOrganization` server action on submit
- [x] Redirect to new org's oversikt page after creation
- [x] Validate organization name (required, non-empty)

### 4.2 Server Action Integration ✅
- [x] Use existing `createOrganization` action from `lib/org/actions.ts`
- [x] Action calls `create_org` RPC function
- [x] Sets new org as user's default_org_id
- [x] Sets activeOrgId cookie
- [x] Returns orgId for redirect

### 4.3 Proxy Integration ✅
- [x] Redirect users with no orgs to `/create-organization`
- [x] Check in proxy.ts when handling root path
- [x] Only redirect if activeOrgId and default_org_id both null

---

## Phase 5: Update Reports Pages ✅ COMPLETED

### 5.1 All Reports Page ✅
- [x] Create `app/(authenticated)/org/[orgId]/alla-rapporter/page.tsx`
- [x] Copy from existing `app/(authenticated)/alla-rapporter/page.tsx`
- [x] Add `params: Promise<{ orgId: string }>` interface
- [x] Extract `orgId` from params
- [x] Pass `orgId` to all server actions
- [x] Update DataTable to use org-scoped actions

### 5.2 Reports Server Actions ✅
- [x] Create `app/(authenticated)/org/[orgId]/alla-rapporter/actions.ts`
- [x] Update `getReports(orgId, options)`:
  - [x] Add `orgId` parameter as first argument
  - [x] Filter by `.eq('org_id', orgId)`
  - [x] Keep all existing filters (search, technician, category)
  - [x] Keep pagination logic
  - [x] Update cache tag to `reports-${orgId}`
- [x] Update `updateReport(orgId, reportId, data)`:
  - [x] Add `orgId` parameter
  - [x] Validate report belongs to org before update
  - [x] Update with RLS enforcement
  - [x] Revalidate org-scoped cache
- [x] Update `deleteReport(orgId, reportId)`:
  - [x] Add `orgId` parameter
  - [x] Validate report belongs to org
  - [x] Delete with RLS enforcement
  - [x] Revalidate org-scoped cache

### 5.3 Reports Components ✅
- [x] Copy all component files from `alla-rapporter/` to org-scoped directory
- [x] Update imports in components to use org-scoped actions
- [x] Ensure DataTable passes orgId to all server actions
- [x] Update any hardcoded paths to use `/org/[orgId]/` prefix
- [x] Update data-table-toolbar to use org-scoped getTechnicians and getCategories
- [x] Update data-table-row-actions to use org-scoped deleteReport

### 5.4 Technicians Pages ✅
- [x] Create `app/(authenticated)/org/[orgId]/tekniker/page.tsx`
- [x] Create `app/(authenticated)/org/[orgId]/tekniker/actions.ts`
- [x] Update all CRUD operations to include orgId parameter
- [x] Add org_id filtering and validation to all queries
- [x] Update cache tags to be org-specific

### 5.5 Categories Pages ✅
- [x] Create `app/(authenticated)/org/[orgId]/kategorier/page.tsx`
- [x] Create `app/(authenticated)/org/[orgId]/kategorier/actions.ts`
- [x] Update all CRUD operations to include orgId parameter
- [x] Add org_id filtering to all queries
- [x] Update cache tags to be org-specific

### 5.6 Reporters Pages ✅
- [x] Create `app/(authenticated)/org/[orgId]/reporter/page.tsx`
- [x] Create `app/(authenticated)/org/[orgId]/reporter/actions.ts`
- [x] Update all CRUD operations to include orgId parameter
- [x] Add org_id filtering and validation to all queries
- [x] Update cache tags to be org-specific

### 5.7 New Report Form ✅
- [x] Create `app/(authenticated)/org/[orgId]/ny-rapport/page.tsx`
- [x] Create `app/(authenticated)/org/[orgId]/ny-rapport/actions.ts`
- [x] Update `createReport` to include orgId parameter
- [x] Update `data-actions.ts` helper functions to filter by orgId
- [x] Update form to fetch org-scoped data (categories, technicians, reporters)
- [x] Update navigation paths to use org-scoped routes

---

## Phase 6: Member Management ✅ COMPLETED

### 6.1 Settings Layout ✅
- [x] Create `app/(authenticated)/org/[orgId]/settings/layout.tsx`
- [x] Add settings navigation (tabs or sidebar)
- [x] Links: Overview, Members, (future: Billing, etc.)

### 6.2 Settings Overview Page ✅
- [x] Create `app/(authenticated)/org/[orgId]/settings/page.tsx`
- [x] Display org details (name, created date, member count)
- [x] Edit org name form (admin/owner only)
- [x] Delete org button (owner only, with confirmation modal)
- [x] Use `updateOrganizationName` and `deleteOrganization` actions

### 6.3 Members Management Page ✅
- [x] Create `app/(authenticated)/org/[orgId]/settings/members/page.tsx`
- [x] List all organization members
- [x] Display user info (name, email) and role badge
- [x] Show "You" indicator for current user
- [x] Remove member button (admin/owner, prevent removing last owner)
- [x] Change role dropdown (owner only)
- [x] Invite member button (admin/owner)

### 6.4 Members Server Actions ✅
- [x] Create `app/(authenticated)/org/[orgId]/settings/members/actions.ts`
- [x] Implement `getOrgMembers(orgId)`:
  - [x] Join organization_members with profiles
  - [x] Return user details (name, email) + role
  - [x] Order by role (owner, admin, member) then name
- [x] Implement `addUserToOrg(orgId, userId, role)`:
  - [x] Validate caller is admin/owner
  - [x] Call `add_user_to_org` RPC function
  - [x] Revalidate members page
- [x] Implement `removeUserFromOrg(orgId, userId)`:
  - [x] Validate caller is admin/owner
  - [x] Prevent removing last owner
  - [x] Call `remove_user_from_org` RPC function
  - [x] Revalidate members page
- [x] Implement `updateMemberRole(orgId, userId, newRole)`:
  - [x] Validate caller is owner
  - [x] Prevent demoting last owner
  - [x] Call `add_user_to_org` with new role (upsert behavior)
  - [x] Revalidate members page
- [x] Implement `transferOwnership(orgId, newOwnerId)`:
  - [x] Validate caller is owner
  - [x] Call `transfer_org_ownership` RPC function
  - [x] Revalidate members page

### 6.5 Invitation System ✅
- [x] Create `app/(authenticated)/org/[orgId]/settings/members/invite/actions.ts`
- [x] Implement `createInvitation(orgId, email, role)`:
  - [x] Validate caller is admin/owner
  - [x] Generate secure random token (crypto.randomUUID())
  - [x] Set expiry (e.g., 7 days from now)
  - [x] Insert into org_invitations table
  - [x] Return invitation link: `/invite/[token]`
  - [x] (Optional) Send email with invitation link
- [x] Implement `listPendingInvitations(orgId)`:
  - [x] Filter where accepted_at IS NULL
  - [x] Filter where expires_at > NOW()
  - [x] Order by created_at DESC
- [x] Implement `cancelInvitation(invitationId)`:
  - [x] Validate caller is admin/owner
  - [x] Delete invitation
  - [x] Revalidate invitations list

### 6.6 Invitation Acceptance Page ✅
- [x] Create `app/invite/[token]/page.tsx` (public route)
- [x] Fetch invitation by token
- [x] Check if expired
- [x] Check if already accepted
- [x] If not authenticated:
  - [x] Show message to sign up/login first
  - [x] Redirect to login with returnUrl
- [x] If authenticated:
  - [x] Call `acceptInvitation(token)` action
  - [x] Add user to org with specified role
  - [x] Mark invitation as accepted
  - [x] Redirect to `/org/[orgId]/oversikt`

### 6.7 Invitation Acceptance Action ✅
- [x] Create `app/invite/[token]/actions.ts`
- [x] Implement `acceptInvitation(token)`:
  - [x] Validate user is authenticated
  - [x] Fetch invitation by token
  - [x] Validate not expired
  - [x] Validate not already accepted
  - [x] Call `add_user_to_org(org_id, user.id, role)`
  - [x] Update invitation: set accepted_at and accepted_by
  - [x] Return success + orgId for redirect

---

## Phase 7: Role-Based UI Permissions 📋 PENDING

### 7.1 Client-Side Permission Hooks
- [x] `useIsOrgAdmin()` - Already created in context.tsx
- [x] `useIsOrgOwner()` - Already created in context.tsx
- [ ] Use hooks in client components to conditionally render:
  - [ ] Delete buttons (admin/owner only)
  - [ ] Edit buttons (admin/owner only)
  - [ ] Settings links (admin/owner only)
  - [ ] Invite member button (admin/owner only)

### 7.2 Reports Page Permissions
- [ ] Hide delete button if not admin/owner
- [ ] Hide edit button if not admin/owner (or implement edit permission)
- [ ] Show read-only view for members

### 7.3 Categories Page Permissions
- [ ] Hide "Add Category" button if not admin/owner
- [ ] Hide delete/edit actions if not admin/owner
- [ ] Show read-only table for members

### 7.4 Technicians Page Permissions
- [ ] Hide "Add Technician" button if not admin/owner
- [ ] Hide delete/edit actions if not admin/owner
- [ ] Show read-only table for members

### 7.5 Reporters Page Permissions
- [ ] Hide "Add Reporter" button if not admin/owner
- [ ] Hide delete/edit actions if not admin/owner
- [ ] Show read-only table for members

### 7.6 Settings Page Permissions
- [ ] Hide settings link in navigation if not admin/owner
- [ ] Redirect if member tries to access /settings
- [ ] Show different UI based on role:
  - [ ] Owner: Can delete org, transfer ownership, change all roles
  - [ ] Admin: Can edit org, manage members (except owner role changes)
  - [ ] Member: No access to settings

### 7.7 Server-Side Permission Validation
- [ ] Add role checks to all server actions:
  - [ ] Use `requireOrgRole()` helper
  - [ ] Delete actions: require admin or owner
  - [ ] Update actions: require admin or owner (or validate ownership)
  - [ ] Member management: require admin or owner
  - [ ] Role changes: require owner
  - [ ] Org deletion: require owner
- [ ] Return clear error messages:
  - [ ] "Requires admin role or higher"
  - [ ] "Requires owner role"
  - [ ] "Permission denied"

---

## Phase 8: Update Sidebar Navigation ✅ COMPLETED

### 8.1 Read Current Sidebar ✅
- [x] Examine `components/AppSidebar.tsx`
- [x] Identify all navigation links
- [x] Understand current structure

### 8.2 Update Nav Links ✅
- [x] Add `orgId` parameter to AppSidebar component
- [x] Update all nav links to use `/org/${orgId}/` prefix:
  - [x] Översikt → `/org/${orgId}/oversikt`
  - [x] Alla Rapporter → `/org/${orgId}/alla-rapporter`
  - [x] Ny Rapport → `/org/${orgId}/ny-rapport`
  - [x] Kategorier → `/org/${orgId}/kategorier`
  - [x] Tekniker → `/org/${orgId}/tekniker`
  - [x] Reporter → `/org/${orgId}/reporter`
  - [x] Settings → `/org/${orgId}/settings` (conditional, admin/owner only)
- [x] Keep /anvandare as global admin-only route (no org prefix)

### 8.3 Update Layout Integration ✅
- [x] Pass `orgId` to AppSidebar from org layout
- [x] Ensure sidebar highlights active route correctly
- [x] Test navigation between pages

### 8.4 Add Org Name Display ✅
- [x] Show current org name in sidebar header
- [x] (Optional) Add org avatar/logo
- [x] Style to differentiate from user profile

---

## Phase 9: Testing & Validation ⚠️ PENDING

### 9.1 Database RLS Testing
- [ ] Test with owner role:
  - [ ] Can read all org data
  - [ ] Can update all org data
  - [ ] Can delete all org data
  - [ ] Can manage members
  - [ ] Can change roles
  - [ ] Can delete org
- [ ] Test with admin role:
  - [ ] Can read all org data
  - [ ] Can update all org data
  - [ ] Can delete all org data
  - [ ] Can manage members (add/remove)
  - [ ] Cannot change roles to/from owner
  - [ ] Cannot delete org
- [ ] Test with member role:
  - [ ] Can read all org data
  - [ ] Can create data (reports, categories, etc.)
  - [ ] Cannot delete data (own or others)
  - [ ] Cannot update data (unless it's their own profile)
  - [ ] Cannot access settings
  - [ ] Cannot manage members

### 9.2 Cross-Org Data Isolation
- [ ] Create two separate orgs
- [ ] Add test data to each org
- [ ] Verify user in Org A cannot see Org B's data
- [ ] Verify switching to Org B shows only Org B's data
- [ ] Test direct URL access with wrong orgId (should redirect)

### 9.3 Organization Switching
- [ ] Create user with multiple orgs
- [ ] Test switching via dropdown
- [ ] Verify cookie is set correctly
- [ ] Verify redirect to new org's dashboard
- [ ] Verify data refreshes for new org
- [ ] Test persistence (refresh page, should stay in same org)

### 9.4 Member Management
- [ ] Test adding existing user to org
- [ ] Test removing user from org
- [ ] Test changing user role (owner → admin → member → admin → owner)
- [ ] Test preventing last owner removal
- [ ] Test transferring ownership
- [ ] Test invitation creation
- [ ] Test invitation acceptance (as new user)
- [ ] Test expired invitation (should fail)
- [ ] Test already-accepted invitation (should fail)

### 9.5 Role-Based UI
- [ ] Login as owner → verify all actions visible
- [ ] Login as admin → verify owner-only actions hidden
- [ ] Login as member → verify delete/edit buttons hidden
- [ ] Test server-side validation (e.g., try deleting as member via API)

### 9.6 CRUD Operations
- [ ] Test creating reports in org
- [ ] Test updating reports
- [ ] Test deleting reports (as admin/owner)
- [ ] Test creating categories
- [ ] Test updating categories
- [ ] Test deleting categories
- [ ] Test same for technicians and reporters
- [ ] Verify all operations filter by org_id
- [ ] Verify cache invalidation works per-org

### 9.7 Edge Cases
- [ ] User with no orgs:
  - [ ] Should redirect to /create-organization
  - [ ] After creating org, should redirect to /org/[orgId]/oversikt
- [ ] User removed from org while browsing:
  - [ ] Should redirect to root (will pick another org or create-org page)
  - [ ] Should show error message (optional)
- [ ] Last owner trying to leave org:
  - [ ] Should prevent removal
  - [ ] Show error: "Cannot remove last owner"
- [ ] Expired invitation tokens:
  - [ ] Should show "Invitation expired" message
  - [ ] Should not allow acceptance
- [ ] Invalid org IDs in URL:
  - [ ] `/org/fake-uuid-123/oversikt` → should redirect to root
  - [ ] Membership validation should fail

### 9.8 Performance Testing
- [ ] Test with 100+ reports in an org
- [ ] Test with 10+ orgs for a user
- [ ] Verify queries are indexed and fast
- [ ] Check for N+1 query issues
- [ ] Verify caching works correctly per-org

---

## Phase 10: Cleanup & Documentation 📋 PENDING

### 10.1 Remove Legacy Routes
- [ ] Delete `app/(authenticated)/oversikt/` (after verifying org version works)
- [ ] Delete `app/(authenticated)/alla-rapporter/`
- [ ] Delete `app/(authenticated)/kategorier/`
- [ ] Delete `app/(authenticated)/tekniker/`
- [ ] Delete `app/(authenticated)/reporter/`
- [ ] Delete `app/(authenticated)/ny-rapport/`
- [ ] Keep `/anvandare` as global admin route

### 10.2 Update Documentation
- [ ] Update README.md with multi-tenant architecture
- [ ] Document new routing structure
- [ ] Document permission model (owner/admin/member)
- [ ] Document org creation and invitation flow
- [ ] Add screenshots/diagrams if helpful

### 10.3 Update Environment Variables
- [ ] Verify all required env vars are in `.env.example`
- [ ] Document any new env vars needed
- [ ] Verify `.env.local` has all required values

### 10.4 Migration Guide for Users
- [ ] Create user-facing guide:
  - [ ] "What's changed" summary
  - [ ] How to create an organization
  - [ ] How to invite team members
  - [ ] How to switch between organizations
  - [ ] What roles mean (owner/admin/member)
- [ ] (Optional) Create migration banner for existing users

### 10.5 Code Cleanup
- [ ] Remove any commented-out code
- [ ] Remove unused imports
- [ ] Ensure consistent formatting
- [ ] Run linter and fix issues
- [ ] Update comments and JSDoc where needed

---

## Progress Tracking

### Overall Completion
- **Completed Phases**: 5/10 (50%)
  - ✅ Phase 1: Foundation & Core Infrastructure
  - ✅ Phase 2: Update Dashboard & Analytics
  - ✅ Phase 3: Organization Switcher
  - ✅ Phase 4: Organization Creation
  - ✅ Phase 5: Update Reports Pages (ALL pages migrated!)

- **In Progress**: 0/10 (0%)

- **Pending**: 5/10 (50%)
  - 📋 Phase 6: Member Management
  - 📋 Phase 7: Role-Based UI Permissions
  - 📋 Phase 8: Update Sidebar Navigation
  - 📋 Phase 9: Testing & Validation
  - 📋 Phase 10: Cleanup & Documentation

### Task Completion
- **Total Tasks**: ~180+
- **Completed**: ~100+ (55.6%)
- **In Progress**: 0 (0%)
- **Pending**: ~80+ (44.4%)

### Recent Updates
- ✅ **Phase 5 COMPLETED**: Migrated all reports-related pages to org-scoped routes
- ✅ Created org-scoped alla-rapporter (all reports) page with full CRUD operations
- ✅ Created org-scoped tekniker (technicians) page with full CRUD operations
- ✅ Created org-scoped kategorier (categories) page with full CRUD operations
- ✅ Created org-scoped reporter (reporters) page with full CRUD operations
- ✅ Created org-scoped ny-rapport (new report) page with org-filtered dropdowns
- ✅ All server actions updated with orgId parameter and org_id filtering
- ✅ All cache tags made org-specific for proper invalidation
- ✅ All components reuse existing shared components from /components

### Next Priority
1. 🎯 Phase 8: Update sidebar navigation (enables full app navigation)
2. Phase 6: Implement member management (core multi-tenant feature)
3. Phase 7: Add role-based permissions (security requirement)
4. Phase 9: Comprehensive testing
5. Phase 10: Cleanup legacy routes

---

## Notes

### Breaking Changes
- All URLs changed from `/page` to `/org/[orgId]/page`
- All server actions now require `orgId` as first parameter
- `created_by_user_id` removed from data models (replaced with `org_id`)
- Legacy routes redirect automatically (temporary compatibility)

### Database Schema
- Database migration already applied in production ✅
- All tables have RLS policies configured ✅
- Helper functions and views available ✅
- Cannot easily rollback database changes (careful testing needed)

### Development Tips
- Always test with multiple orgs and multiple users
- Use different roles to verify permission checks
- Check browser DevTools for any console errors
- Verify network requests filter by correct org_id
- Test org switching thoroughly

### Common Patterns
```typescript
// Page component
interface PageProps {
  params: Promise<{ orgId: string }>;
}

export default async function Page({ params }: PageProps) {
  const { orgId } = await params;
  const data = await getData(orgId);
  return <div>...</div>;
}

// Server action
export async function getData(orgId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('table')
    .select('*')
    .eq('org_id', orgId);
  return data;
}

// Client component with hooks
'use client';
import { useOrg, useIsOrgAdmin } from '@/lib/org/context';

export function Component() {
  const { activeOrg } = useOrg();
  const isAdmin = useIsOrgAdmin();
  return <div>...</div>;
}
```

---

**Last Updated**: 2025-01-25
**Migration Status**: 50% Complete (5/10 phases done, Phase 5 just completed!)
