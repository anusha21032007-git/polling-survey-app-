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
    const { pollSetId } = await req.json();
    if (!pollSetId) {
      throw new Error("Poll Set ID is required.");
    }

    // Use the Service Role Key to perform deletions securely
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
    const { data: pollSet, error: ownerCheckError } = await supabaseAdmin
      .from('poll_sets')
      .select('user_id')
      .eq('id', pollSetId)
      .single();

    if (ownerCheckError) throw ownerCheckError;
    if (!pollSet || pollSet.user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'You do not have permission to delete this poll set.' }), { status: 403, headers: corsHeaders });
    }

    // Find all poll IDs within the set
    const { data: polls, error: pollsError } = await supabaseAdmin
      .from('polls')
      .select('id')
      .eq('poll_set_id', pollSetId);

    if (pollsError) throw pollsError;
    const pollIds = polls.map(p => p.id);

    if (pollIds.length > 0) {
      // Delete associated votes
      const { error: votesError } = await supabaseAdmin.from('votes').delete().in('poll_id', pollIds);
      if (votesError) throw votesError;

      // Delete associated saved polls
      const { error: savedPollsError } = await supabaseAdmin.from('saved_polls').delete().in('poll_id', pollIds);
      if (savedPollsError) throw savedPollsError;
    }

    // Delete the polls themselves
    const { error: deletePollsError } = await supabaseAdmin.from('polls').delete().eq('poll_set_id', pollSetId);
    if (deletePollsError) throw deletePollsError;

    // Finally, delete the poll set
    const { error: deleteSetError } = await supabaseAdmin.from('poll_sets').delete().eq('id', pollSetId);
    if (deleteSetError) throw deleteSetError;

    return new Response(JSON.stringify({ message: 'Poll set deleted successfully' }), {
      status: 200,
      headers: corsHeaders,
    });

  } catch (error) {
    console.error('Error deleting poll set:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
})