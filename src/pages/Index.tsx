import { MadeWithDyad } from "@/components/made-with-dyad";
import { useSupabaseSession } from "@/integrations/supabase/session-context";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import PollList from "@/components/PollList";

const Index = () => {
  const { user } = useSupabaseSession();
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Polling Dashboard</h1>
        <Link to="/create-poll">
          <Button>
            <Plus className="h-4 w-4 mr-2" /> Create Poll
          </Button>
        </Link>
      </div>
      
      <h2 className="text-2xl font-semibold">Available Polls</h2>
      
      <PollList />

      <MadeWithDyad />
    </div>
  );
};

export default Index;