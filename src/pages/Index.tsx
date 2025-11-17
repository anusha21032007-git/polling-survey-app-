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
          Welcome, {userName.split('@')[0]}! 
          {role === 'admin' && <span className="text-sm text-muted-foreground ml-2">(Admin)</span>}
        </h1>
      </div>
      
      <h2 className="text-2xl font-semibold mb-6">Available Polls</h2>
      <PollList />
    </div>
  );
};

export default Index;