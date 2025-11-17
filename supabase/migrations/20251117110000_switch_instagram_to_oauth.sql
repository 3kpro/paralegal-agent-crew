-- ============================================================================
-- Switch Instagram to Centralized OAuth
-- ============================================================================
-- Changes Instagram from custom_app to oauth for better UX
-- Users will now use standard OAuth flow instead of manual app setup
-- ============================================================================

-- Update Instagram provider to use OAuth
UPDATE public.social_providers
SET
  auth_type = 'oauth',
  updated_at = NOW()
WHERE provider_key = 'instagram';

-- Note: Existing user connections with custom app credentials will continue to work
-- New connections will use the centralized OAuth flow
