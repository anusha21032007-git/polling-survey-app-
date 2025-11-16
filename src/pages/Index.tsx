import { MadeWithDyad } from "@/components/made-with-dyad";
import { useSupabaseSession } from "@/integrations/supabase/session-context";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const Index = () => {
  const { user } = useSupabaseSession();
  
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Welcome to the Polling Dashboard, {user?.email}!</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Poll Creation Card */}
        <div className="p-6 border rounded-lg shadow-sm bg-card flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2">Create a New Poll</h2>
            <p className="text-muted-foreground mb-4">Start gathering opinions right away.</p>
          </div>
          <Link to="/create-poll">
            <Button className="w-full">
              <Plus className="h-4 w-4 mr-2" /> Create Poll
            </Button>
          </Link>
        </div>
        
        {/* Placeholder for My Polls Card */}
        <div className="p-6 border rounded-lg shadow-sm bg-card">
          <h2 className="text-xl font-semibold mb-2">My Active Polls</h2>
          <p className="text-muted-foreground">View, manage, and delete your existing polls.</p>
        </div>

        {/* Placeholder for Available Polls Card */}
        <div className="p-6 border rounded-lg shadow-sm bg-card">
          <h2 className="text-xl font-semibold mb-2">Available Polls</h2>
          <p className="text-muted-foreground">Vote on polls created by others.</p>
        </div>
      </div>

      <MadeWithDyad />
    </div>
  );
};

export default Index;