import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { pollId } = await req.json();
    if (!pollId) {
      throw new Error("Poll ID is required.");
    }

    // Use the Service Role Key for admin privileges
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create a client with the user's auth context to verify ownership
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing auth header');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not found');

    // Verify ownership
    const { data: poll, error: ownerCheckError } = await supabaseAdmin
      .from('polls')
      .select('user_id')
      .eq('id', pollId)
      .single();

    if (ownerCheckError) throw ownerCheckError;
    if (!poll || poll.user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'You do not have permission to delete this poll.' }), { status: 403, headers: corsHeaders });
    }

    // Delete associated votes
    const { error: votesError } = await supabaseAdmin.from('votes').delete().eq('poll_id', pollId);
    if (votesError) throw votesError;

    // Delete associated saved polls
    const { error: savedPollsError } = await supabaseAdmin.from('saved_polls').delete().eq('poll_id', pollId);
    if (savedPollsError) throw savedPollsError;

    // Finally, delete the poll
    const { error: deletePollError } = await supabaseAdmin.from('polls').delete().eq('id', pollId);
    if (deletePollError) throw deletePollError;

    return new Response(JSON.stringify({ message: 'Poll deleted successfully' }), {
      status: 200,
      headers: corsHeaders,
    });

  } catch (error) {
    console.error('Error deleting poll:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
})