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

## Phase 5: Update Reports Pages 🚧 IN PROGRESS

### 5.1 All Reports Page
- [ ] Create `app/(authenticated)/org/[orgId]/alla-rapporter/page.tsx`
- [ ] Copy from existing `app/(authenticated)/alla-rapporter/page.tsx`
- [ ] Add `params: Promise<{ orgId: string }>` interface
- [ ] Extract `orgId` from params
- [ ] Pass `orgId` to all server actions
- [ ] Update DataTable to use org-scoped actions

### 5.2 Reports Server Actions
- [ ] Create `app/(authenticated)/org/[orgId]/alla-rapporter/actions.ts`
- [ ] Update `getReports(orgId, options)`:
  - [ ] Add `orgId` parameter as first argument
  - [ ] Filter by `.eq('org_id', orgId)`
  - [ ] Keep all existing filters (search, technician, category)
  - [ ] Keep pagination logic
  - [ ] Update cache tag to `reports-${orgId}`
- [ ] Update `updateReport(orgId, reportId, data)`:
  - [ ] Add `orgId` parameter
  - [ ] Validate report belongs to org before update
  - [ ] Update with RLS enforcement
  - [ ] Revalidate org-scoped cache
- [ ] Update `deleteReport(orgId, reportId)`:
  - [ ] Add `orgId` parameter
  - [ ] Validate report belongs to org
  - [ ] Delete with RLS enforcement
  - [ ] Revalidate org-scoped cache

### 5.3 Reports Components
- [ ] Copy all component files from `alla-rapporter/` to org-scoped directory
- [ ] Update imports in components to use org-scoped actions
- [ ] Ensure DataTable passes orgId to all server actions
- [ ] Update any hardcoded paths to use `/org/[orgId]/` prefix

---

## Phase 6: Update Categories Pages 📋 PENDING

### 6.1 Categories Page
- [ ] Create `app/(authenticated)/org/[orgId]/kategorier/page.tsx`
- [ ] Copy from existing `app/(authenticated)/kategorier/page.tsx`
- [ ] Add `params` interface and extract `orgId`
- [ ] Pass `orgId` to server actions
- [ ] Update UI to use org-scoped actions

### 6.2 Categories Server Actions
- [ ] Create `app/(authenticated)/org/[orgId]/kategorier/actions.ts`
- [ ] Update `getCategories(orgId, options)`:
  - [ ] Add `orgId` parameter
  - [ ] Filter by `org_id`
  - [ ] Keep search functionality
  - [ ] Update cache tag to `categories-${orgId}`
- [ ] Update `createCategory(orgId, data)`:
  - [ ] Add `orgId` parameter
  - [ ] Remove `created_by_user_id` logic
  - [ ] Use `v_categories` view for insert (auto-injects org_id)
  - [ ] Or explicitly set `org_id` in insert
  - [ ] Revalidate cache
- [ ] Update `updateCategory(orgId, categoryId, data)`:
  - [ ] Add `orgId` parameter
  - [ ] Validate category belongs to org
  - [ ] Update with validation
  - [ ] Revalidate cache
- [ ] Update `deleteCategory(orgId, categoryId)`:
  - [ ] Add `orgId` parameter
  - [ ] Validate category belongs to org
  - [ ] Check for reports using this category
  - [ ] Delete with RLS enforcement
  - [ ] Revalidate cache

### 6.3 Categories Components
- [ ] Copy component files to org-scoped directory
- [ ] Update imports and actions
- [ ] Ensure forms pass orgId

---

## Phase 7: Update Technicians Pages 📋 PENDING

### 7.1 Technicians Page
- [ ] Create `app/(authenticated)/org/[orgId]/tekniker/page.tsx`
- [ ] Copy from existing page
- [ ] Add params interface
- [ ] Pass orgId to actions

### 7.2 Technicians Server Actions
- [ ] Create `app/(authenticated)/org/[orgId]/tekniker/actions.ts`
- [ ] Update `getTechnicians(orgId, options)`:
  - [ ] Add `orgId` parameter
  - [ ] Filter by `org_id`
  - [ ] Update cache tag
- [ ] Update `createTechnician(orgId, data)`:
  - [ ] Remove `created_by_user_id` logic
  - [ ] Use `v_technicians` view or explicit `org_id`
  - [ ] Validate with Zod
- [ ] Update `updateTechnician(orgId, technicianId, data)`:
  - [ ] Add `orgId` parameter
  - [ ] Validate ownership (belongs to org)
- [ ] Update `deleteTechnician(orgId, technicianId)`:
  - [ ] Add `orgId` parameter
  - [ ] Validate ownership

### 7.3 Technicians Components
- [ ] Copy components to org-scoped directory
- [ ] Update imports
- [ ] Update forms to pass orgId

---

## Phase 8: Update Reporters Pages 📋 PENDING

### 8.1 Reporters Page
- [ ] Create `app/(authenticated)/org/[orgId]/reporter/page.tsx`
- [ ] Copy from existing page
- [ ] Add params interface
- [ ] Pass orgId to actions

### 8.2 Reporters Server Actions
- [ ] Create `app/(authenticated)/org/[orgId]/reporter/actions.ts`
- [ ] Update `getReporters(orgId, options)`:
  - [ ] Add `orgId` parameter
  - [ ] Filter by `org_id`
- [ ] Update `createReporter(orgId, data)`:
  - [ ] Remove `created_by_user_id` logic
  - [ ] Use `v_reporters` view or explicit `org_id`
- [ ] Update `updateReporter(orgId, reporterId, data)`:
  - [ ] Add `orgId` parameter
  - [ ] Validate ownership
- [ ] Update `deleteReporter(orgId, reporterId)`:
  - [ ] Add `orgId` parameter
  - [ ] Validate ownership

### 8.3 Reporters Components
- [ ] Copy components
- [ ] Update imports
- [ ] Update forms

---

## Phase 9: Update New Report Form 📋 PENDING

### 9.1 New Report Page
- [ ] Create `app/(authenticated)/org/[orgId]/ny-rapport/page.tsx`
- [ ] Copy from existing `ny-rapport/page.tsx`
- [ ] Add params interface
- [ ] Pass orgId to form and actions

### 9.2 New Report Server Actions
- [ ] Create `app/(authenticated)/org/[orgId]/ny-rapport/actions.ts`
- [ ] Update `createReport(orgId, data)`:
  - [ ] Add `orgId` parameter as first argument
  - [ ] Use `v_reports` view for insert (auto-injects org_id)
  - [ ] Or explicitly set `org_id` in insert data
  - [ ] Validate category belongs to same org
  - [ ] Revalidate reports and dashboard caches
- [ ] Update any helper functions to filter by orgId:
  - [ ] `getCategories(orgId)` - for dropdown
  - [ ] `getTechnicians(orgId)` - for dropdown
  - [ ] `getReporters(orgId)` - for dropdown

### 9.3 Form Components
- [ ] Copy form components
- [ ] Update to fetch org-scoped data for dropdowns
- [ ] Ensure category/technician/reporter dropdowns only show org data
- [ ] Pass orgId through form submission

---

## Phase 10: Member Management 📋 PENDING

### 10.1 Settings Layout
- [ ] Create `app/(authenticated)/org/[orgId]/settings/layout.tsx`
- [ ] Add settings navigation (tabs or sidebar)
- [ ] Links: Overview, Members, (future: Billing, etc.)

### 10.2 Settings Overview Page
- [ ] Create `app/(authenticated)/org/[orgId]/settings/page.tsx`
- [ ] Display org details (name, created date, member count)
- [ ] Edit org name form (admin/owner only)
- [ ] Delete org button (owner only, with confirmation modal)
- [ ] Use `updateOrganizationName` and `deleteOrganization` actions

### 10.3 Members Management Page
- [ ] Create `app/(authenticated)/org/[orgId]/settings/members/page.tsx`
- [ ] List all organization members
- [ ] Display user info (name, email) and role badge
- [ ] Show "You" indicator for current user
- [ ] Remove member button (admin/owner, prevent removing last owner)
- [ ] Change role dropdown (owner only)
- [ ] Invite member button (admin/owner)

### 10.4 Members Server Actions
- [ ] Create `app/(authenticated)/org/[orgId]/settings/members/actions.ts`
- [ ] Implement `getOrgMembers(orgId)`:
  - [ ] Join organization_members with profiles
  - [ ] Return user details (name, email) + role
  - [ ] Order by role (owner, admin, member) then name
- [ ] Implement `addUserToOrg(orgId, userId, role)`:
  - [ ] Validate caller is admin/owner
  - [ ] Call `add_user_to_org` RPC function
  - [ ] Revalidate members page
- [ ] Implement `removeUserFromOrg(orgId, userId)`:
  - [ ] Validate caller is admin/owner
  - [ ] Prevent removing last owner
  - [ ] Call `remove_user_from_org` RPC function
  - [ ] Revalidate members page
- [ ] Implement `updateMemberRole(orgId, userId, newRole)`:
  - [ ] Validate caller is owner
  - [ ] Prevent demoting last owner
  - [ ] Call `add_user_to_org` with new role (upsert behavior)
  - [ ] Revalidate members page
- [ ] Implement `transferOwnership(orgId, newOwnerId)`:
  - [ ] Validate caller is owner
  - [ ] Call `transfer_org_ownership` RPC function
  - [ ] Revalidate members page

### 10.5 Invitation System
- [ ] Create `app/(authenticated)/org/[orgId]/settings/members/invite/actions.ts`
- [ ] Implement `createInvitation(orgId, email, role)`:
  - [ ] Validate caller is admin/owner
  - [ ] Generate secure random token (crypto.randomUUID())
  - [ ] Set expiry (e.g., 7 days from now)
  - [ ] Insert into org_invitations table
  - [ ] Return invitation link: `/invite/[token]`
  - [ ] (Optional) Send email with invitation link
- [ ] Implement `listPendingInvitations(orgId)`:
  - [ ] Filter where accepted_at IS NULL
  - [ ] Filter where expires_at > NOW()
  - [ ] Order by created_at DESC
- [ ] Implement `cancelInvitation(invitationId)`:
  - [ ] Validate caller is admin/owner
  - [ ] Delete invitation
  - [ ] Revalidate invitations list

### 10.6 Invitation Acceptance Page
- [ ] Create `app/invite/[token]/page.tsx` (public route)
- [ ] Fetch invitation by token
- [ ] Check if expired
- [ ] Check if already accepted
- [ ] If not authenticated:
  - [ ] Show message to sign up/login first
  - [ ] Redirect to login with returnUrl
- [ ] If authenticated:
  - [ ] Call `acceptInvitation(token)` action
  - [ ] Add user to org with specified role
  - [ ] Mark invitation as accepted
  - [ ] Redirect to `/org/[orgId]/oversikt`

### 10.7 Invitation Acceptance Action
- [ ] Create `app/invite/[token]/actions.ts`
- [ ] Implement `acceptInvitation(token)`:
  - [ ] Validate user is authenticated
  - [ ] Fetch invitation by token
  - [ ] Validate not expired
  - [ ] Validate not already accepted
  - [ ] Call `add_user_to_org(org_id, user.id, role)`
  - [ ] Update invitation: set accepted_at and accepted_by
  - [ ] Return success + orgId for redirect

---

## Phase 11: Role-Based UI Permissions 📋 PENDING

### 11.1 Client-Side Permission Hooks
- [x] `useIsOrgAdmin()` - Already created in context.tsx
- [x] `useIsOrgOwner()` - Already created in context.tsx
- [ ] Use hooks in client components to conditionally render:
  - [ ] Delete buttons (admin/owner only)
  - [ ] Edit buttons (admin/owner only)
  - [ ] Settings links (admin/owner only)
  - [ ] Invite member button (admin/owner only)

### 11.2 Reports Page Permissions
- [ ] Hide delete button if not admin/owner
- [ ] Hide edit button if not admin/owner (or implement edit permission)
- [ ] Show read-only view for members

### 11.3 Categories Page Permissions
- [ ] Hide "Add Category" button if not admin/owner
- [ ] Hide delete/edit actions if not admin/owner
- [ ] Show read-only table for members

### 11.4 Technicians Page Permissions
- [ ] Hide "Add Technician" button if not admin/owner
- [ ] Hide delete/edit actions if not admin/owner
- [ ] Show read-only table for members

### 11.5 Reporters Page Permissions
- [ ] Hide "Add Reporter" button if not admin/owner
- [ ] Hide delete/edit actions if not admin/owner
- [ ] Show read-only table for members

### 11.6 Settings Page Permissions
- [ ] Hide settings link in navigation if not admin/owner
- [ ] Redirect if member tries to access /settings
- [ ] Show different UI based on role:
  - [ ] Owner: Can delete org, transfer ownership, change all roles
  - [ ] Admin: Can edit org, manage members (except owner role changes)
  - [ ] Member: No access to settings

### 11.7 Server-Side Permission Validation
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

## Phase 12: Update Sidebar Navigation 📋 PENDING

### 12.1 Read Current Sidebar
- [ ] Examine `components/AppSidebar.tsx`
- [ ] Identify all navigation links
- [ ] Understand current structure

### 12.2 Update Nav Links
- [ ] Add `orgId` parameter to AppSidebar component
- [ ] Update all nav links to use `/org/${orgId}/` prefix:
  - [ ] Översikt → `/org/${orgId}/oversikt`
  - [ ] Alla Rapporter → `/org/${orgId}/alla-rapporter`
  - [ ] Ny Rapport → `/org/${orgId}/ny-rapport`
  - [ ] Kategorier → `/org/${orgId}/kategorier`
  - [ ] Tekniker → `/org/${orgId}/tekniker`
  - [ ] Reporter → `/org/${orgId}/reporter`
  - [ ] Settings → `/org/${orgId}/settings` (conditional, admin/owner only)
- [ ] Keep /anvandare as global admin-only route (no org prefix)

### 12.3 Update Layout Integration
- [ ] Pass `orgId` to AppSidebar from org layout
- [ ] Ensure sidebar highlights active route correctly
- [ ] Test navigation between pages

### 12.4 Add Org Name Display
- [ ] Show current org name in sidebar header
- [ ] (Optional) Add org avatar/logo
- [ ] Style to differentiate from user profile

---

## Phase 13: Testing & Validation ⚠️ PENDING

### 13.1 Database RLS Testing
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

### 13.2 Cross-Org Data Isolation
- [ ] Create two separate orgs
- [ ] Add test data to each org
- [ ] Verify user in Org A cannot see Org B's data
- [ ] Verify switching to Org B shows only Org B's data
- [ ] Test direct URL access with wrong orgId (should redirect)

### 13.3 Organization Switching
- [ ] Create user with multiple orgs
- [ ] Test switching via dropdown
- [ ] Verify cookie is set correctly
- [ ] Verify redirect to new org's dashboard
- [ ] Verify data refreshes for new org
- [ ] Test persistence (refresh page, should stay in same org)

### 13.4 Member Management
- [ ] Test adding existing user to org
- [ ] Test removing user from org
- [ ] Test changing user role (owner → admin → member → admin → owner)
- [ ] Test preventing last owner removal
- [ ] Test transferring ownership
- [ ] Test invitation creation
- [ ] Test invitation acceptance (as new user)
- [ ] Test expired invitation (should fail)
- [ ] Test already-accepted invitation (should fail)

### 13.5 Role-Based UI
- [ ] Login as owner → verify all actions visible
- [ ] Login as admin → verify owner-only actions hidden
- [ ] Login as member → verify delete/edit buttons hidden
- [ ] Test server-side validation (e.g., try deleting as member via API)

### 13.6 CRUD Operations
- [ ] Test creating reports in org
- [ ] Test updating reports
- [ ] Test deleting reports (as admin/owner)
- [ ] Test creating categories
- [ ] Test updating categories
- [ ] Test deleting categories
- [ ] Test same for technicians and reporters
- [ ] Verify all operations filter by org_id
- [ ] Verify cache invalidation works per-org

### 13.7 Edge Cases
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

### 13.8 Performance Testing
- [ ] Test with 100+ reports in an org
- [ ] Test with 10+ orgs for a user
- [ ] Verify queries are indexed and fast
- [ ] Check for N+1 query issues
- [ ] Verify caching works correctly per-org

---

## Phase 14: Cleanup & Documentation 📋 PENDING

### 14.1 Remove Legacy Routes
- [ ] Delete `app/(authenticated)/oversikt/` (after verifying org version works)
- [ ] Delete `app/(authenticated)/alla-rapporter/`
- [ ] Delete `app/(authenticated)/kategorier/`
- [ ] Delete `app/(authenticated)/tekniker/`
- [ ] Delete `app/(authenticated)/reporter/`
- [ ] Delete `app/(authenticated)/ny-rapport/`
- [ ] Keep `/anvandare` as global admin route

### 14.2 Update Documentation
- [ ] Update README.md with multi-tenant architecture
- [ ] Document new routing structure
- [ ] Document permission model (owner/admin/member)
- [ ] Document org creation and invitation flow
- [ ] Add screenshots/diagrams if helpful

### 14.3 Update Environment Variables
- [ ] Verify all required env vars are in `.env.example`
- [ ] Document any new env vars needed
- [ ] Verify `.env.local` has all required values

### 14.4 Migration Guide for Users
- [ ] Create user-facing guide:
  - [ ] "What's changed" summary
  - [ ] How to create an organization
  - [ ] How to invite team members
  - [ ] How to switch between organizations
  - [ ] What roles mean (owner/admin/member)
- [ ] (Optional) Create migration banner for existing users

### 14.5 Code Cleanup
- [ ] Remove any commented-out code
- [ ] Remove unused imports
- [ ] Ensure consistent formatting
- [ ] Run linter and fix issues
- [ ] Update comments and JSDoc where needed

---

## Progress Tracking

### Overall Completion
- **Completed Phases**: 4/14 (28.6%)
  - ✅ Phase 1: Foundation & Core Infrastructure
  - ✅ Phase 2: Update Dashboard & Analytics
  - ✅ Phase 3: Organization Switcher
  - ✅ Phase 4: Organization Creation

- **In Progress**: 1/14 (7.1%)
  - 🚧 Phase 5: Update Reports Pages

- **Pending**: 9/14 (64.3%)
  - 📋 Phase 6-14

### Task Completion
- **Total Tasks**: ~200+
- **Completed**: ~60+ (30%)
- **In Progress**: ~3 (1.5%)
- **Pending**: ~137+ (68.5%)

### Recent Updates
- ✅ Created database migration plan
- ✅ Implemented all foundation utilities (lib/org/*)
- ✅ Created org-scoped routing structure
- ✅ Updated proxy.ts with org validation and redirects
- ✅ Created organization switcher component
- ✅ Created organization creation page
- ✅ Migrated dashboard/oversikt page to org-scoped version

### Next Priority
1. 🎯 Complete Phase 5: Reports pages (highest user value)
2. Update sidebar navigation (enables full app navigation)
3. Implement member management (core multi-tenant feature)
4. Add role-based permissions (security requirement)

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
**Migration Status**: In Progress (Phase 5)
