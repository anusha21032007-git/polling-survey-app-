import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
    }

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error
      }

      return new Response(JSON.stringify(data), { status: 200, headers: corsHeaders })
    }

    if (req.method === 'PUT') {
      const profileData = await req.json()
      const { full_name, username, bio, organization, receive_emails, avatar_url } = profileData;

      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name,
          username: username || null, // Store empty string as null
          bio,
          organization,
          receive_emails,
          avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        if (error.code === '23505') {
             return new Response(JSON.stringify({ error: 'Username is already taken.' }), { status: 409, headers: corsHeaders })
        }
        throw error
      }

      return new Response(JSON.stringify(data), { status: 200, headers: corsHeaders })
    }

    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: corsHeaders })

  } catch (error) {
    console.error('Function Error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
  }
})