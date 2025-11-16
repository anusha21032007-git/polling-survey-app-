import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json',
}

// Define the expected input structure
interface PollCreationPayload {
  title: string;
  description: string | null;
  poll_type: 'single' | 'multiple';
  options: { id: string; text: string }[];
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  // 1. Authentication: Get user ID from JWT
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized: Missing Authorization header' }), { 
      status: 401, 
      headers: corsHeaders 
    })
  }
  
  const token = authHeader.replace('Bearer ', '')
  
  // Initialize Supabase client with Service Role Key for server-side operations
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: {
        headers: { Authorization: authHeader },
      },
    }
  )

  let payload: PollCreationPayload;
  try {
    payload = await req.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), { status: 400, headers: corsHeaders })
  }

  const { title, description, poll_type, options, is_active, starts_at, ends_at } = payload;

  // Basic Server-side Validation
  if (!title || options.length < 2) {
    return new Response(JSON.stringify({ error: 'Missing required fields: title and at least two options.' }), { status: 400, headers: corsHeaders })
  }

  // Get the authenticated user's ID
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('Auth error:', userError?.message);
    return new Response(JSON.stringify({ error: 'Unauthorized: Invalid or expired token.' }), { status: 401, headers: corsHeaders })
  }

  const newPoll = {
    user_id: user.id,
    title: title.trim(),
    description: description?.trim() || null,
    poll_type,
    options: options.map(opt => ({ id: opt.id, text: opt.text.trim() })),
    is_active,
    starts_at,
    ends_at,
  };

  // Insert the poll
  const { data: insertedPolls, error: insertError } = await supabase
    .from('polls')
    .insert([newPoll])
    .select('id')
    .single();

  if (insertError) {
    console.error('Database insert error:', insertError);
    return new Response(JSON.stringify({ error: 'Failed to create poll in database.' }), { 
      status: 500, 
      headers: corsHeaders 
    })
  }

  return new Response(JSON.stringify({ 
    message: 'Poll created successfully', 
    pollId: insertedPolls.id 
  }), {
    status: 201,
    headers: corsHeaders,
  })
})