import { MadeWithDyad } from "@/components/made-with-dyad";
import { useSupabaseSession } from "@/integrations/supabase/session-context";
import PollList from "@/components/PollList";
import { useUserRole } from "@/hooks/use-user-role";

const Index = () => {
  const { user } = useSupabaseSession();
  const { role, isLoading: isRoleLoading } = useUserRole();
  
  if (isRoleLoading) {
    return <div className="text-center p-10">Loading dashboard...</div>;
  }

  const userName = user?.email || "User";
  
  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Welcome back, {userName.split('@')[0]}! 
          {role === 'admin' && <span className="text-sm text-muted-foreground ml-2">(Admin View)</span>}
        </h1>
      </div>
      
      {role === 'user' ? (
        <>
          <h2 className="text-2xl font-semibold mb-6">Available Polls</h2>
          <PollList />
        </>
      ) : (
        <div className="p-10 border rounded-lg bg-muted/50 text-center">
          <p className="text-lg text-muted-foreground">
            Admin Dashboard: Content specific to administrators will be displayed here.
          </p>
        </div>
      )}

      <MadeWithDyad />
    </div>
  );
};

export default Index;