-- Remote Procedure Call (RPC) for atomic campaign saving
-- saves campaign metadata and posts in a single transaction

CREATE OR REPLACE FUNCTION upsert_campaign_with_posts(
    campaign_data JSONB,
    posts_data JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
-- Use SECURITY DEFINER to ensure the function runs with necessary privileges,
-- but restrict actions to the authenticated user's data via logic.
SECURITY DEFINER
AS $$
DECLARE
    v_campaign_id UUID;
    v_new_campaign JSONB;
    v_user_id UUID;
BEGIN
    -- Get the authenticated user ID
    v_user_id := auth.uid();
    
    -- Validate user is authenticated
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
    END IF;

    -- Extract ID if present (for updates)
    v_campaign_id := (campaign_data->>'id')::UUID;

    -- 1. Campaign Operation
    IF v_campaign_id IS NOT NULL THEN
        -- UPDATE valid existing campaign owned by user
        UPDATE campaigns
        SET
            name = campaign_data->>'name',
            description = campaign_data->>'description',
            -- Handle array conversion properly
            target_platforms = (
                SELECT ARRAY(
                    SELECT jsonb_array_elements_text(campaign_data->'target_platforms')
                )
            ),
            status = campaign_data->>'status',
            campaign_type = campaign_data->>'campaign_type',
            source_type = campaign_data->>'source_type',
            source_data = campaign_data->'source_data',
            ai_provider = campaign_data->>'ai_provider',
            tone = campaign_data->>'tone',
            updated_at = NOW()
        WHERE id = v_campaign_id AND user_id = v_user_id
        RETURNING id INTO v_campaign_id;

        IF v_campaign_id IS NULL THEN
             RETURN jsonb_build_object('success', false, 'error', 'Campaign not found or permission denied');
        END IF;

        -- Delete existing posts for this campaign (full replacement strategy)
        -- Only delete posts belonging to this campaign
        DELETE FROM scheduled_posts WHERE campaign_id = v_campaign_id;
    ELSE
        -- INSERT new campaign
        INSERT INTO campaigns (
            user_id,
            name,
            description,
            target_platforms,
            status,
            campaign_type,
            source_type,
            source_data,
            ai_provider,
            tone
        )
        VALUES (
            v_user_id,
            campaign_data->>'name',
            campaign_data->>'description',
            (
                SELECT ARRAY(
                    SELECT jsonb_array_elements_text(campaign_data->'target_platforms')
                )
            ),
            campaign_data->>'status',
            campaign_data->>'campaign_type',
            campaign_data->>'source_type',
            campaign_data->'source_data',
            campaign_data->>'ai_provider',
            campaign_data->>'tone'
        )
        RETURNING id INTO v_campaign_id;
    END IF;

    -- 2. Posts Operation
    IF posts_data IS NOT NULL AND jsonb_array_length(posts_data) > 0 THEN
        INSERT INTO scheduled_posts (
            user_id,
            campaign_id,
            title,
            content,
            platform,
            post_type,
            scheduled_at,
            status
        )
        SELECT
            v_user_id,
            v_campaign_id,
            p->>'title',
            p->>'content',
            p->>'platform',
            COALESCE(p->>'post_type', 'text'),
            NULLIF(p->>'scheduled_at', '')::TIMESTAMPTZ, -- Handle empty strings safely
            p->>'status'
        FROM jsonb_array_elements(posts_data) AS p;
    END IF;

    RETURN jsonb_build_object('success', true, 'campaign_id', v_campaign_id);
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Security: Revoke from public, grant only to authenticated users and service role
REVOKE EXECUTE ON FUNCTION upsert_campaign_with_posts(JSONB, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION upsert_campaign_with_posts(JSONB, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_campaign_with_posts(JSONB, JSONB) TO service_role;
