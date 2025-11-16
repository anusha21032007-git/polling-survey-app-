import { MadeWithDyad } from "@/components/made-with-dyad";
import { useSupabaseSession } from "@/integrations/supabase/session-context";
import PollList from "@/components/PollList";

const Index = () => {
  const { user } = useSupabaseSession();
  const userName = user?.email || "User";
  
  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back, {userName.split('@')[0]}!</h1>
      </div>
      
      <h2 className="text-2xl font-semibold mb-6">Available Polls</h2>
      
      <PollList />

      <MadeWithDyad />
    </div>
  );
};

export default Index;