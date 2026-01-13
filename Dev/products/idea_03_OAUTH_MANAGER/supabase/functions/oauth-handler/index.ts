import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

console.log("OAuth Handler function started!");

serve(async (req) => {
  const url = new URL(req.url);
  const path = url.pathname.replace(/\/+$/, ""); // Remove trailing slashes
  
  // CORS Headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Handle OAuth Callback
    // Expecting: GET /oauth-handler/callback?code=...&state=...
    if (path.endsWith('/callback')) {
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state'); // should contain platform and userId
      
      if (!code) throw new Error("Missing code parameter");
      
      // For POC, we'll extract platform from state (e.g., "linkedin:123")
      const [platform, userId] = (state || "").split(':');
      
      if (platform === 'linkedin') {
        console.log(`Exchanging LinkedIn code for user: ${userId}`);
        
        const clientId = Deno.env.get('LINKEDIN_CLIENT_ID');
        const clientSecret = Deno.env.get('LINKEDIN_CLIENT_SECRET');
        const redirectUri = Deno.env.get('OAUTH_REDIRECT_URI');

        const params = new URLSearchParams();
        params.append('grant_type', 'authorization_code');
        params.append('code', code);
        params.append('redirect_uri', redirectUri || "");
        params.append('client_id', clientId || "");
        params.append('client_secret', clientSecret || "");

        const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString(),
        });

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok) {
          throw new Error(`LinkedIn Token Error: ${tokenData.error_description || tokenData.error}`);
        }

        // Initialize Supabase Client with service role for DB/Vault operations
        const supabaseAdmin = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // TODO: Map userId to an existing connection or create a new one
        // For POC, we assume a connection exists for this user/platform
        const { data: connection, error: connError } = await supabaseAdmin
          .from('connections')
          .select('id')
          .eq('user_id', userId)
          .eq('platform', 'linkedin')
          .single();

        if (connError || !connection) {
          // If no connection, create one
          const { data: newConn, error: createError } = await supabaseAdmin
            .from('connections')
            .insert({ user_id: userId, platform: 'linkedin', status: 'active' })
            .select()
            .single();
          
          if (createError) throw createError;
          connection.id = newConn.id;
        }

        // Call the RPC defined in SCHEMA.md to securely store tokens
        const { error: rpcError } = await supabaseAdmin.rpc('update_tokens', {
          p_connection_id: connection.id,
          p_access_token: tokenData.access_token,
          p_refresh_token: tokenData.refresh_token || null,
          p_expires_in: tokenData.expires_in
        });

        if (rpcError) throw rpcError;

        return new Response(
          JSON.stringify({ message: "LinkedIn connected successfully!" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }

      if (platform === 'tiktok') {
        console.log(`Exchanging TikTok code for user: ${userId}`);
        
        const clientKey = Deno.env.get('TIKTOK_CLIENT_KEY');
        const clientSecret = Deno.env.get('TIKTOK_CLIENT_SECRET');
        const redirectUri = Deno.env.get('OAUTH_REDIRECT_URI');

        const params = new URLSearchParams();
        params.append('client_key', clientKey || "");
        params.append('client_secret', clientSecret || "");
        params.append('code', code);
        params.append('grant_type', 'authorization_code');
        params.append('redirect_uri', redirectUri || "");

        const tokenResponse = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString(),
        });

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok) {
          throw new Error(`TikTok Token Error: ${tokenData.error_description || tokenData.error}`);
        }

        const supabaseAdmin = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const { data: connection, error: connError } = await supabaseAdmin
          .from('connections')
          .select('id')
          .eq('user_id', userId)
          .eq('platform', 'tiktok')
          .single();

        let connectionId = connection?.id;

        if (connError || !connection) {
          const { data: newConn, error: createError } = await supabaseAdmin
            .from('connections')
            .insert({ user_id: userId, platform: 'tiktok', status: 'active' })
            .select()
            .single();
          
          if (createError) throw createError;
          connectionId = newConn.id;
        }

        const { error: rpcError } = await supabaseAdmin.rpc('update_tokens', {
          p_connection_id: connectionId,
          p_access_token: tokenData.access_token,
          p_refresh_token: tokenData.refresh_token || null,
          p_expires_in: tokenData.expires_in
        });

        if (rpcError) throw rpcError;

        return new Response(
          JSON.stringify({ message: "TikTok connected successfully!" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }
      
      if (platform === 'instagram') {
        console.log(`Exchanging Instagram code for user: ${userId}`);
        
        const clientId = Deno.env.get('INSTAGRAM_CLIENT_ID');
        const clientSecret = Deno.env.get('INSTAGRAM_CLIENT_SECRET');
        const redirectUri = Deno.env.get('OAUTH_REDIRECT_URI');

        // 1. Exchange code for short-lived access token
        const shortTokenParams = new URLSearchParams();
        shortTokenParams.append('client_id', clientId || "");
        shortTokenParams.append('client_secret', clientSecret || "");
        shortTokenParams.append('grant_type', 'authorization_code');
        shortTokenParams.append('redirect_uri', redirectUri || "");
        shortTokenParams.append('code', code);

        const shortTokenResponse = await fetch('https://graph.instagram.com/access_token', {
          method: 'POST',
          body: shortTokenParams,
        });

        const shortTokenData = await shortTokenResponse.json();

        if (!shortTokenResponse.ok) {
          throw new Error(`Instagram Short Token Error: ${shortTokenData.error_message || shortTokenData.error.message}`);
        }

        // 2. Exchange short-lived for long-lived access token
        const longTokenParams = new URLSearchParams();
        longTokenParams.append('grant_type', 'ig_exchange_token');
        longTokenParams.append('client_secret', clientSecret || "");
        longTokenParams.append('access_token', shortTokenData.access_token);

        const longTokenResponse = await fetch(
          `https://graph.instagram.com/access_token?${longTokenParams.toString()}`,
          { method: 'GET' }
        );

        const longTokenData = await longTokenResponse.json();

        if (!longTokenResponse.ok) {
          throw new Error(`Instagram Long Token Error: ${longTokenData.error_message || longTokenData.error.message}`);
        }

        const supabaseAdmin = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const { data: connection, error: connError } = await supabaseAdmin
          .from('connections')
          .select('id')
          .eq('user_id', userId)
          .eq('platform', 'instagram')
          .single();

        let connectionId = connection?.id;

        if (connError || !connection) {
          const { data: newConn, error: createError } = await supabaseAdmin
            .from('connections')
            .insert({ user_id: userId, platform: 'instagram', status: 'active' })
            .select()
            .single();
          
          if (createError) throw createError;
          connectionId = newConn.id;
        }

        const { error: rpcError } = await supabaseAdmin.rpc('update_tokens', {
          p_connection_id: connectionId,
          p_access_token: longTokenData.access_token,
          p_refresh_token: null, // Instagram long-lived tokens are refreshed via re-exchange
          p_expires_in: longTokenData.expires_in
        });

        if (rpcError) throw rpcError;

        return new Response(
          JSON.stringify({ message: "Instagram connected successfully!" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Unsupported platform", platform }),
        { headers: corsHeaders, status: 400 }
      );

    }

    // 2. Handle Token Refresh
    // Expecting: POST /oauth-handler/refresh { connection_id: "..." }
    if (path.endsWith('/refresh') && req.method === 'POST') {
      const { connection_id } = await req.json();
      
      if (!connection_id) throw new Error("Missing connection_id");
      
      console.log(`Refreshing connection: ${connection_id}`);

      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      // Fetch connection info
      const { data: connection, error: connError } = await supabaseAdmin
        .from('connections')
        .select('*')
        .eq('id', connection_id)
        .single();

      if (connError || !connection) throw new Error("Connection not found");

      let tokenData;

      if (connection.platform === 'linkedin') {
        const refreshToken = await supabaseAdmin.rpc('get_refresh_token', { p_connection_id: connection_id });
        if (!refreshToken.data) throw new Error("No refresh token found for LinkedIn");

        const params = new URLSearchParams();
        params.append('grant_type', 'refresh_token');
        params.append('refresh_token', refreshToken.data);
        params.append('client_id', Deno.env.get('LINKEDIN_CLIENT_ID') || "");
        params.append('client_secret', Deno.env.get('LINKEDIN_CLIENT_SECRET') || "");

        const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString(),
        });
        tokenData = await response.json();
      } 
      else if (connection.platform === 'tiktok') {
        const refreshToken = await supabaseAdmin.rpc('get_refresh_token', { p_connection_id: connection_id });
        if (!refreshToken.data) throw new Error("No refresh token found for TikTok");

        const params = new URLSearchParams();
        params.append('client_key', Deno.env.get('TIKTOK_CLIENT_KEY') || "");
        params.append('client_secret', Deno.env.get('TIKTOK_CLIENT_SECRET') || "");
        params.append('grant_type', 'refresh_token');
        params.append('refresh_token', refreshToken.data);

        const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString(),
        });
        tokenData = await response.json();
      }
      else if (connection.platform === 'instagram') {
        const accessToken = await supabaseAdmin.rpc('get_access_token', { p_connection_id: connection_id });
        if (!accessToken.data) throw new Error("No access token found for Instagram");

        const params = new URLSearchParams();
        params.append('grant_type', 'ig_refresh_token');
        params.append('access_token', accessToken.data);

        const response = await fetch(`https://graph.instagram.com/refresh_access_token?${params.toString()}`);
        tokenData = await response.json();
      }

      if (tokenData && (tokenData.access_token || tokenData.ig_access_token)) {
        // Update tokens in vault
        const { error: rpcError } = await supabaseAdmin.rpc('update_tokens', {
          p_connection_id: connection_id,
          p_access_token: tokenData.access_token || tokenData.ig_access_token,
          p_refresh_token: tokenData.refresh_token || null,
          p_expires_in: tokenData.expires_in
        });

        if (rpcError) throw rpcError;

        // Log success
        await supabaseAdmin.from('refresh_logs').insert({
          connection_id,
          status: 'success',
          response_body: tokenData
        });

        return new Response(
          JSON.stringify({ success: true, message: "Token refreshed" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      } else {
        // Log failure
        await supabaseAdmin.from('refresh_logs').insert({
          connection_id,
          status: 'failure',
          response_body: tokenData
        });
        throw new Error(`Refresh failed: ${JSON.stringify(tokenData)}`);
      }
    }

    // Default 404
    return new Response(
      JSON.stringify({ error: "Not Found", path }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
    );

  } catch (error) {
    console.error("Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
})
