-- Add social_account_id to scheduled_posts table
-- This allows us to track which specific social account should be used for posting

ALTER TABLE scheduled_posts
ADD COLUMN social_account_id UUID REFERENCES social_accounts(id) ON DELETE SET NULL;

-- Create index for faster queries
CREATE INDEX idx_scheduled_posts_social_account ON scheduled_posts(social_account_id);

-- Add comment for documentation
COMMENT ON COLUMN scheduled_posts.social_account_id IS 'The specific social account to use for posting. NULL means use any active account for the platform.';
