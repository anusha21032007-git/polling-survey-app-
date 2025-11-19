import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PollData {
  title: string;
  description: string | null;
  poll_type: 'single' | 'multiple';
  options: { id: string; text: string }[];
  is_active: boolean;
  due_at: string | null;
}

interface PollSetPayload {
  setTitle: string;
  setDescription: string | null;
  polls: PollData[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing auth header')

    // Use the Service Role Key to perform multiple inserts securely
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not found');

    const payload: PollSetPayload = await req.json();
    const { setTitle, setDescription, polls } = payload;

    if (!setTitle || !polls || polls.length === 0) {
      return new Response(JSON.stringify({ error: 'Missing set title or polls' }), { status: 400, headers: corsHeaders })
    }

    // 1. Create the poll set
    const { data: pollSet, error: setInsertError } = await supabase
      .from('poll_sets')
      .insert({
        user_id: user.id,
        title: setTitle,
        description: setDescription,
      })
      .select('id')
      .single();

    if (setInsertError) throw setInsertError;

    // 2. Prepare individual polls with the new set ID
    const pollsToInsert = polls.map(poll => ({
      ...poll,
      user_id: user.id,
      poll_set_id: pollSet.id,
    }));

    // 3. Insert all polls in a single batch
    const { error: pollsInsertError } = await supabase
      .from('polls')
      .insert(pollsToInsert);

    if (pollsInsertError) {
      // If polls fail to insert, roll back the poll set creation for consistency
      await supabase.from('poll_sets').delete().eq('id', pollSet.id);
      throw pollsInsertError;
    }

    return new Response(JSON.stringify({ message: 'Poll set created successfully', pollSetId: pollSet.id }), {
      status: 201,
      headers: corsHeaders,
    })
  } catch (error) {
    console.error('Error creating poll set:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
  }
})