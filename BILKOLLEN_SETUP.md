# Bilkollen Setup Guide

## Prerequisites

The Bilkollen feature has been fully implemented in the frontend and backend. However, before using it, you need to set up organization locations.

## Step 1: Create Organization Locations

Each organization needs at least one location (preferably a default one) for vehicle dropoffs.

### Using Supabase SQL Editor

Run this SQL to create locations for an organization (replace `YOUR_ORG_ID` with your actual organization ID):

```sql
-- Example: Create locations for Bilia organization
INSERT INTO public.org_locations (org_id, name, is_default)
VALUES
  ('YOUR_ORG_ID', 'Nacka', true),
  ('YOUR_ORG_ID', 'Södertälje', false),
  ('YOUR_ORG_ID', 'Stockholm', false);
```

**Important**: One location must have `is_default = true`. This is used when creating new vehicle cases.

### Using Supabase MCP (if available)

```bash
# List your organizations to get the org_id
SELECT id, name FROM public.organizations;

# Create locations
INSERT INTO public.org_locations (org_id, name, is_default)
VALUES
  ('org-id-here', 'Nacka', true),
  ('org-id-here', 'Södertälje', false);
```

## Step 2: Verify Setup

1. Navigate to `/org/[orgId]/bilkollen` in your application
2. Click "Lägg till bil" (Add Vehicle)
3. If the dialog opens successfully and you can enter a registration number, the setup is complete

## Features Overview

### Pågående (Ongoing) Tab
- View all active vehicle cases
- Add new vehicles
- Edit case details inline:
  - Change dropoff location
  - Update funding source (insurance/internal/customer)
  - Mark photo inspection as done
  - Update insurance status
  - Assign handler or add notes
- Mark vehicles as "klar" (complete) when ready

### Arkiv (Archive) Tab
- View all completed vehicles
- See days to completion
- View detailed history timeline
- See milestones (insurance approved, photo done, marked klar)

### Business Rules for Marking "Klar"

A vehicle can only be marked as complete if:
1. Photo inspection is done (`photo_inspection_done = true`)
2. **AND** one of:
   - Insurance is approved (`insurance_status = 'approved'`)
   - **OR** Funding source is internal (`funding_source = 'internal'`)

If these conditions aren't met, the "Markera klar" dialog will show warnings.

## Data Model

### Tables Used
- `org_locations` - Locations where vehicles are dropped off
- `vehicle_cases` - Main table for vehicle tracking
- `vehicle_case_audits` - Audit trail of all changes
- `vehicle_cases_view` - Denormalized view for UI (auto-joined)
- `vehicle_case_status_summary` - Materialized view for analytics (refreshed every 15 min via cron)

### Immutability Rules
- ❌ Registration numbers **cannot** be edited after creation
- ❌ Cases **cannot** be deleted (soft delete via `archived_at`)
- ❌ Audit logs **cannot** be modified or deleted
- ✅ All other fields can be updated

## Troubleshooting

### "Ingen standardplats hittades"
**Problem**: Error when creating a new vehicle case.

**Solution**: Create at least one location with `is_default = true` for your organization.

### Empty table / No vehicles showing
**Problem**: Table shows "Inga fordon hittades" (No vehicles found).

**Solution**: This is normal if no vehicles have been added yet. Click "Lägg till bil" to add your first vehicle.

### Cannot mark as "klar"
**Problem**: The "Markera klar" dialog shows validation errors.

**Solution**:
1. Check that photo inspection is marked as done
2. Ensure insurance is approved (unless funding source is "internal")
3. Fix the indicated issues before marking as complete

## Next Steps

1. **Add locations** for your organization(s)
2. **Test the feature** by adding a test vehicle
3. **Verify workflows** by editing fields and marking a vehicle as complete
4. **Check the archive** to see the history and timeline
