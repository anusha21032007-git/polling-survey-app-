import { MadeWithDyad } from "@/components/made-with-dyad";
import { useSupabaseSession } from "@/integrations/supabase/session-context";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, BarChart3 } from "lucide-react";
import PollList from "@/components/PollList";

const Index = () => {
  const { user } = useSupabaseSession();
  const userName = user?.email || "User";
  
  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Welcome back, {userName.split('@')[0]}!</h1>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Available Polls</h2>
        <div className="flex space-x-3">
          <Link to="/poll-results">
            <Button variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" /> View Results
            </Button>
          </Link>
          <Link to="/create-poll">
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Create Poll
            </Button>
          </Link>
        </div>
      </div>
      
      <PollList />

      <MadeWithDyad />
    </div>
  );
};

export default Index;