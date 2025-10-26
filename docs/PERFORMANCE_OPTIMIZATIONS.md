# Performance Optimizations for Bilkollen Page

## Issues Identified

Based on the logs showing 2-second load times with significant proxy (670ms) and render (1.2s+) times, we've identified and fixed several performance bottlenecks.

## React/Client-Side Optimizations

### 1. Consolidated useEffect Calls
**Before:** Three separate useEffect hooks ran sequentially
- First: Fetch user
- Second: Fetch locations/members
- Third: Fetch cases

**After:** Reduced to two optimized useEffect hooks
- First: Fetch user + locations/members in parallel
- Second: Fetch cases (only after initial data is ready)

**Impact:** Eliminates one full render cycle and auth call

### 2. Stable Filter References
**Before:** `filters` object was recreated on every render with imperative field assignments
```typescript
const f: VehicleCaseFilters = { page: currentPage, pageSize };
if (searchValue) f.search = searchValue;
```

**After:** Using object spread with conditional inclusion
```typescript
return {
  page: currentPage,
  pageSize,
  ...(searchValue && { search: searchValue }),
}
```

**Impact:** Prevents unnecessary re-fetches when filter object reference changes

### 3. Memoized No-Op Functions
**Before:** Anonymous functions created on every render for archive columns
```typescript
onUpdate: () => Promise.resolve(),
onMarkKlar: () => {},
```

**After:** Stable useCallback references
```typescript
const noOpUpdate = React.useCallback(() => Promise.resolve(), []);
const noOpMarkKlar = React.useCallback(() => {}, []);
```

**Impact:** Prevents column re-creation and table re-renders

### 4. Conditional Case Fetching
**Before:** Cases would try to fetch even before locations/members were loaded
**After:** Added guard condition
```typescript
if (locations.length === 0 || members.length === 0) return;
```

**Impact:** Prevents wasted API calls and render cycles

## Database Optimizations Needed

### Required Indexes (Run via Supabase MCP)

The following indexes should be added to improve query performance:

```sql
-- Index for filtering by org_id and archived_at (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_vehicle_cases_org_archived
ON vehicle_cases(org_id, archived_at)
WHERE archived_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_vehicle_cases_org_active
ON vehicle_cases(org_id, created_at DESC)
WHERE archived_at IS NULL;

-- Index for handler filtering
CREATE INDEX IF NOT EXISTS idx_vehicle_cases_handler
ON vehicle_cases(org_id, handler_user_id, archived_at);

-- Index for location filtering
CREATE INDEX IF NOT EXISTS idx_vehicle_cases_location
ON vehicle_cases(org_id, dropoff_location_id, archived_at);

-- Index for insurance status filtering
CREATE INDEX IF NOT EXISTS idx_vehicle_cases_insurance
ON vehicle_cases(org_id, insurance_status, archived_at);

-- Index for funding source filtering
CREATE INDEX IF NOT EXISTS idx_vehicle_cases_funding
ON vehicle_cases(org_id, funding_source, archived_at);

-- Composite index for registration number search
CREATE INDEX IF NOT EXISTS idx_vehicle_cases_reg_search
ON vehicle_cases(org_id, registration_number);
```

### View Materialization (Future Optimization)

If `vehicle_cases_view` is a standard view, consider converting it to a materialized view:

```sql
-- This requires recreating as MATERIALIZED VIEW
-- Should only be done if real-time updates aren't critical
CREATE MATERIALIZED VIEW vehicle_cases_view_materialized AS
SELECT
  vc.*,
  ol.name as dropoff_location_name,
  ol.is_default as dropoff_location_is_default,
  p.name as handler_user_name,
  CASE
    WHEN vc.archived_at IS NOT NULL THEN
      EXTRACT(EPOCH FROM (vc.archived_at - vc.created_at)) / 86400.0
    ELSE NULL
  END as days_to_klar
FROM vehicle_cases vc
LEFT JOIN org_locations ol ON vc.dropoff_location_id = ol.id
LEFT JOIN profiles p ON vc.handler_user_id = p.user_id;

-- Refresh strategy (choose one):
-- Option 1: Manual refresh via trigger
-- Option 2: Scheduled refresh via pg_cron
-- Option 3: Keep as regular view (current approach)
```

## Server-Side Optimizations (Future)

### 1. Implement Proper Caching
Currently using `updateTag` but not leveraging Next.js cache fully.

```typescript
// Add to getVehicleCases
export async function getVehicleCases(...) {
  'use server';
  // Add cache tags
  const cacheKey = `vehicle-cases-${orgId}-${archived}-${JSON.stringify(filters)}`;

  // ... existing code
}
```

### 2. Reduce Auth Calls
Every server action calls `await supabase.auth.getUser()`. Consider:
- Passing user ID from client (with server-side validation)
- Caching user session in middleware
- Using server components to pass authenticated context

### 3. Batch Operations
For bulk updates (like auto-setting raknad_pa), consider database-level triggers instead of application logic.

## Expected Performance Improvements

### Current Performance
```
POST /bilkollen 200 in 2.0s (compile: 10ms, proxy: 670ms, render: 1.3s)
```

### Expected After Optimizations
- **Client optimizations**: 30-40% reduction in render time (1.3s → ~0.8s)
- **Database indexes**: 50-70% reduction in proxy time (670ms → ~200-300ms)
- **Combined**: Total load time 2.0s → ~1.1-1.2s (45% improvement)

### Additional Gains with Future Optimizations
- **Materialized views**: Another 30-50% query speedup
- **Proper caching**: Repeat visits near-instant
- **Target**: First load ~1s, cached loads < 300ms

## Monitoring

Add performance tracking:

```typescript
// Add to page.tsx
React.useEffect(() => {
  const start = performance.now();

  fetchCases().then(() => {
    const duration = performance.now() - start;
    console.log(`Case fetch took ${duration.toFixed(0)}ms`);
  });
}, [filters]);
```

## Implementation Checklist

- [x] Consolidate useEffect hooks
- [x] Stable filter references
- [x] Memoize no-op functions
- [x] Add conditional fetching guards
- [ ] Add database indexes (via Supabase MCP)
- [ ] Test query performance with EXPLAIN ANALYZE
- [ ] Add performance monitoring
- [ ] Consider materialized views
- [ ] Implement proper cache strategy
