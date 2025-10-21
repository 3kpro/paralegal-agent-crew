# 🎯 ZEN AGENT HANDOFF: Database Schema Fix Required

## **Issue Summary**
- **Error**: `Failed to save campaign: Could not find the 'metadata' column of 'campaigns' in the schema cache`
- **Location**: `/campaigns/new` page when saving campaigns
- **Root Cause**: Missing `metadata` column in Supabase `campaigns` table

## **Quick Fix Required** ⚡

### **Option 1: Add Missing Column (Recommended)**
Go to Supabase Dashboard → SQL Editor and run:
```sql
ALTER TABLE campaigns 
ADD COLUMN metadata JSONB;
```

### **Option 2: Remove Metadata from Code (Faster)**
In `app/(portal)/campaigns/new/page.tsx` line ~150-160, remove metadata from the insert:

**Change this:**
```typescript
const { data: campaign, error: campaignError } = await supabase
  .from('campaigns')
  .insert({
    user_id: user.id,
    name: campaignName,
    target_platforms: targetPlatforms,
    status: 'draft',
    metadata: {           // ← REMOVE THIS
      trend: selectedTrend,
      ai_provider: aiProvider
    }
  })
```

**To this:**
```typescript
const { data: campaign, error: campaignError } = await supabase
  .from('campaigns')
  .insert({
    user_id: user.id,
    name: campaignName,
    target_platforms: targetPlatforms,
    status: 'draft'
    // metadata removed - store in separate table if needed later
  })
```

## **Current Status** ✅
- All UI/UX issues fixed
- Google API key working
- Search functionality restored  
- Accessibility errors resolved
- Only database schema blocking campaign saves

## **Priority**: HIGH - Blocks core campaign functionality

---
*Created: Oct 19, 2025 | Agent: GitHub Copilot*