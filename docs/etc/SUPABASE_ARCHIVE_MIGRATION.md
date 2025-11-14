# Supabase Database Handoff - Campaign Archive Feature

**Project**: Content Cascade AI (CCAI) - TrendPulse
**Date**: November 5, 2025
**For**: ChatGPT at Supabase.com

---

## 🎯 **Task: Add Campaign Archive Functionality**

We need to add the **archive column** to the campaigns table so users can soft-delete campaigns without losing data.

---

## 📋 **What To Do**

### **Option 1: Use Supabase CLI (Recommended)**

```bash
cd c:\DEV\3K-Pro-Services\landing-page
npx supabase db push
```

### **Option 2: SQL Editor (Manual)**

Copy the entire file `supabase/migrations/011_add_campaign_archive.sql` and paste into Supabase SQL Editor, then click "Run".

---

## 📄 **Migration File**

**Location**: `supabase/migrations/011_add_campaign_archive.sql`
**Size**: 17 lines

### **What It Creates**:

1. ✅ **Column**: `archived` (boolean, default false)
   - Soft delete flag for campaigns
   - NOT NULL with default value

2. ✅ **Composite Index**: `idx_campaigns_archived`
   - Indexes: (user_id, archived, created_at DESC)
   - Enables fast filtering of active vs archived campaigns
   - Optimizes queries with WHERE user_id = X AND archived = false ORDER BY created_at

3. ✅ **Partial Index**: `idx_campaigns_archived_only`
   - Indexes: (user_id, created_at DESC) WHERE archived = true
   - Optimizes "show archived" view queries
   - Only indexes archived records (saves space)

4. ✅ **Documentation**: Column comment explaining purpose

---

## 📝 **SQL to Run**

```sql
-- Migration: Add archive functionality to campaigns
-- Description: Adds archived column and index for soft-delete archive feature
-- Date: 2025-11-05

-- Add archived column to campaigns table
ALTER TABLE public.campaigns
ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false NOT NULL;

-- Add index for efficient filtering of archived/active campaigns
CREATE INDEX IF NOT EXISTS idx_campaigns_archived
ON public.campaigns(user_id, archived, created_at DESC);

-- Add index for archived campaigns only (for "show archived" view)
CREATE INDEX IF NOT EXISTS idx_campaigns_archived_only
ON public.campaigns(user_id, created_at DESC)
WHERE archived = true;

-- Add comment for documentation
COMMENT ON COLUMN public.campaigns.archived IS 'Soft delete flag - archived campaigns are hidden from main view but not deleted';
```

---

## ✅ **Verification Checklist**

After running migration, verify these work:

### 1. Check Column Exists
```sql
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'campaigns' AND column_name = 'archived';
```
**Expected**:
- column_name: `archived`
- data_type: `boolean`
- column_default: `false`
- is_nullable: `NO`

### 2. Check Composite Index
```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'campaigns' AND indexname = 'idx_campaigns_archived';
```
**Expected**: Index on `(user_id, archived, created_at DESC)`

### 3. Check Partial Index
```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'campaigns' AND indexname = 'idx_campaigns_archived_only';
```
**Expected**: Index on `(user_id, created_at DESC)` with WHERE clause

### 4. Test Column Works
```sql
-- Check existing campaigns (should all default to false)
SELECT id, name, archived
FROM campaigns
LIMIT 5;
```
**Expected**: All campaigns show `archived: false`

### 5. Test Archive Update
```sql
-- Test updating a campaign to archived (replace with real campaign ID)
UPDATE campaigns
SET archived = true
WHERE id = '00000000-0000-0000-0000-000000000000'
LIMIT 1;

-- Verify it worked
SELECT id, name, archived
FROM campaigns
WHERE archived = true
LIMIT 1;
```
**Expected**: Campaign shows `archived: true`

---

## 🔍 **Query Performance Test**

After migration, test query performance:

```sql
-- This query should be FAST (uses idx_campaigns_archived)
EXPLAIN ANALYZE
SELECT id, name, status, created_at
FROM campaigns
WHERE user_id = '00000000-0000-0000-0000-000000000000'
  AND archived = false
ORDER BY created_at DESC
LIMIT 20;
```

**Expected in Query Plan**:
- Uses `idx_campaigns_archived` index
- Index Scan (not Seq Scan)
- Execution time < 5ms for typical dataset

---

## 🚨 **Safety Checks**

Before running, confirm:
- ✅ Column name `archived` doesn't conflict with existing columns
- ✅ Default value `false` is appropriate (won't hide existing campaigns)
- ✅ `IF NOT EXISTS` prevents errors if run multiple times
- ✅ No data loss (adding column, not dropping)

---

## 📊 **Impact Analysis**

**Existing Data**:
- All existing campaigns will get `archived = false` (default)
- No campaigns will be hidden after migration
- Users can start archiving campaigns immediately

**Application Code**:
- UI already deployed with archive functionality
- API endpoint `/api/campaigns/[id]` PATCH handler ready
- Will work immediately after migration runs

**Performance**:
- Indexes added for optimal query performance
- No impact on existing queries (new column has default)
- Archive queries will be fast even with thousands of campaigns

---

## ❓ **Troubleshooting**

### Issue: "Column already exists"
**Solution**: Migration uses `IF NOT EXISTS`, safe to re-run

### Issue: "Index already exists"
**Solution**: Migration uses `IF NOT EXISTS`, safe to re-run

### Issue: Slow queries after migration
**Solution**: Run `ANALYZE campaigns;` to update query planner statistics

### Issue: Column shows NULL instead of false
**Problem**: Default not applied
**Solution**: Run update query:
```sql
UPDATE campaigns SET archived = false WHERE archived IS NULL;
```

---

## 📞 **Contact**

If issues occur, check:
1. Migration file at: `supabase/migrations/011_add_campaign_archive.sql`
2. CHANGELOG entry for context
3. GitHub commit: `46f676a`

---

## ✨ **Success Criteria**

Migration successful when:
- ✅ Column `archived` exists in campaigns table
- ✅ Two indexes created (composite and partial)
- ✅ Existing campaigns show `archived = false`
- ✅ Can update campaigns to `archived = true`
- ✅ UI shows "Show Archived" button (after refresh)
- ✅ Archive/restore functionality works in production

---

**Ready to run!** 🚀
