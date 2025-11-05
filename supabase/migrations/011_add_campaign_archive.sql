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
