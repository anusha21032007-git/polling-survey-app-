-- =================================================================
-- TABLES
-- =================================================================

-- Table: profiles
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  username TEXT,
  bio TEXT,
  avatar_url TEXT,
  organization TEXT,
  receive_emails BOOLEAN DEFAULT TRUE NOT NULL,
  role TEXT DEFAULT 'user'::text NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Table: polls
CREATE TABLE public.polls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  poll_type TEXT DEFAULT 'single'::text NOT NULL,
  options JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  due_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;

-- Table: votes
CREATE TABLE public.votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE,
  option_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- =================================================================
-- FUNCTIONS & TRIGGERS
-- =================================================================

-- Function: handle_new_user (Trigger function for profile creation)
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  RETURN new;
END;
$function$;

-- Trigger: on_auth_user_created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function: get_user_dashboard_stats
CREATE OR REPLACE FUNCTION public.get_user_dashboard_stats(p_user_id uuid)
 RETURNS TABLE(total_polls bigint, total_responses bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM polls WHERE user_id = p_user_id) AS total_polls,
    (SELECT COUNT(*) FROM votes WHERE poll_id IN (SELECT id FROM polls WHERE user_id = p_user_id)) AS total_responses;
END;
$function$;

-- Function: get_user_polls_with_stats
CREATE OR REPLACE FUNCTION public.get_user_polls_with_stats(p_user_id uuid)
 RETURNS TABLE(id uuid, title text, created_at timestamp with time zone, total_responses bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.title,
    p.created_at,
    COUNT(v.id) AS total_responses
  FROM
    polls p
  LEFT JOIN
    votes v ON p.id = v.poll_id
  WHERE
    p.user_id = p_user_id
  GROUP BY
    p.id
  ORDER BY
    p.created_at DESC
  LIMIT 5; -- Limit to 5 recent polls for the dashboard
END;
$function$;

-- =================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =================================================================

-- Policies for profiles
CREATE POLICY "Authenticated users can read public profile data" ON public.profiles 
FOR SELECT USING (true);
CREATE POLICY "profiles_delete_policy" ON public.profiles 
FOR DELETE TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_update_policy" ON public.profiles 
FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_insert_policy" ON public.profiles 
FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Policies for polls
CREATE POLICY "Authenticated users can view all polls" ON public.polls 
FOR SELECT USING (true);
CREATE POLICY "Users can create polls" ON public.polls 
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own polls" ON public.polls 
FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own polls" ON public.polls 
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Policies for votes
CREATE POLICY "Authenticated users can view all votes" ON public.votes 
FOR SELECT USING (true);
CREATE POLICY "Users can insert votes" ON public.votes 
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own votes" ON public.votes 
FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own votes" ON public.votes 
FOR DELETE TO authenticated USING (auth.uid() = user_id);