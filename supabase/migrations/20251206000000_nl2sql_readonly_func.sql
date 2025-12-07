-- Create a function to execute read-only SQL queries
-- This function is intended to be called by the NL2SQL agent
-- It includes a safeguard against non-SELECT statements, but should ideally execute as a restricted user

CREATE OR REPLACE FUNCTION execute_readonly_sql(query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with the privileges of the creator (usually postgres/superuser, so be careful!)
AS $$
DECLARE
  result json;
BEGIN
  -- 1. Validate: Ensure the query starts with SELECT (case-insensitive)
  --    and strictly block common write keywords to prevent injection of multiple statements via ;
  IF lower(trim(query)) !~ '^select\s' THEN
    RAISE EXCEPTION 'Only SELECT queries are allowed.';
  END IF;

  IF lower(query) ~ ';\s*(insert|update|delete|drop|alter|create|grant|revoke|truncate)' THEN
    RAISE EXCEPTION 'Multiple statements/Write operations are not allowed.';
  END IF;
  
  -- 2. Execute the query and return the result as JSON
  --    We wrap it in a subquery to aggregate rows into a single JSON array
  EXECUTE format('SELECT coalesce(json_agg(t), ''[]''::json) FROM (%s) t', query) INTO result;
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    -- Return the error message as a JSON object instead of crashing the transaction hard
    RETURN json_build_object('error', SQLERRM);
END;
$$;

-- Grant execute permission to authenticated users (so the API can call it)
GRANT EXECUTE ON FUNCTION execute_readonly_sql(text) TO authenticated;
GRANT EXECUTE ON FUNCTION execute_readonly_sql(text) TO service_role;
