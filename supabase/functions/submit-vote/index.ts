import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface VotePayload {
  poll_id: string;
  option_ids: string[];
  voter_name?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const payload: VotePayload = await req.json();
    const { poll_id, option_ids, voter_name } = payload;

    if (!poll_id || !option_ids || option_ids.length === 0) {
      return new Response(JSON.stringify({ error: 'Missing poll_id or option_ids' }), { status: 400, headers: corsHeaders })
    }

    // Use Service Role Key for admin privileges
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if poll is active
    const { data: poll, error: pollError } = await supabaseAdmin
      .from('polls')
      .select('is_active, due_at')
      .eq('id', poll_id)
      .single();

    if (pollError || !poll) {
      return new Response(JSON.stringify({ error: 'Poll not found' }), { status: 404, headers: corsHeaders });
    }

    const isExpired = poll.due_at && new Date(poll.due_at) < new Date();
    if (!poll.is_active || isExpired) {
      return new Response(JSON.stringify({ error: 'This poll is closed and cannot accept new votes.' }), { status: 403, headers: corsHeaders });
    }

    let userId: string | null = null;
    let displayName: string | null = voter_name || null;

    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } }
      );
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        userId = user.id;
        // Fetch profile name for display
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('full_name, username')
          .eq('id', userId)
          .single();
        displayName = profile?.full_name || profile?.username || 'Authenticated User';

        // Delete previous votes for this user on this poll
        await supabaseAdmin
          .from('votes')
          .delete()
          .eq('poll_id', poll_id)
          .eq('user_id', userId);
      }
    }

    if (!userId && !displayName) {
      return new Response(JSON.stringify({ error: 'Voter name is required for anonymous voting' }), { status: 400, headers: corsHeaders });
    }

    const votesToInsert = option_ids.map(option_id => ({
      poll_id,
      option_id,
      user_id: userId,
      voter_display_name: displayName,
    }));

    const { error: insertError } = await supabaseAdmin.from('votes').insert(votesToInsert);
    if (insertError) throw insertError;

    return new Response(JSON.stringify({ message: 'Vote submitted successfully' }), {
      status: 201,
      headers: corsHeaders,
    })
  } catch (error) {
    console.error('Error submitting vote:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
  }
})