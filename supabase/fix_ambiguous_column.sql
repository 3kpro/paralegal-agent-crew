-- Fix ambiguous column reference in get_user_daily_usage
-- Force DROP and recreate to bypass any caching issues

-- Drop the problematic function
DROP FUNCTION IF EXISTS public.get_user_daily_usage(UUID);

-- Recreate with explicit table aliases and type casts
CREATE OR REPLACE FUNCTION public.get_user_daily_usage(p_user_id UUID)
RETURNS TABLE (
  generations_count integer,
  tokens_used integer,
  campaigns_created integer,
  usage_date date
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(du.generations_count, 0)::integer as generations_count,
    COALESCE(du.tokens_used, 0)::integer as tokens_used,
    COALESCE(du.campaigns_created, 0)::integer as campaigns_created,
    COALESCE(du.usage_date, CURRENT_DATE)::date as usage_date
  FROM public.daily_usage du
  WHERE du.user_id = p_user_id
    AND du.usage_date = CURRENT_DATE
  UNION ALL
  SELECT 0::integer, 0::integer, 0::integer, CURRENT_DATE::date
  WHERE NOT EXISTS (
    SELECT 1 FROM public.daily_usage du2
    WHERE du2.user_id = p_user_id AND du2.usage_date = CURRENT_DATE
  )
  LIMIT 1;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_user_daily_usage(UUID) TO authenticated;

-- Verify the fix
SELECT proname, prosrc FROM pg_proc WHERE proname = 'get_user_daily_usage';
