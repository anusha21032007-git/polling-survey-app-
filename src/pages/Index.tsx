import { useSupabaseSession } from "@/integrations/supabase/session-context";
import PollList from "@/components/PollList";
import { useUserRole } from "@/hooks/use-user-role";

const Index = () => {
  const { user } = useSupabaseSession();
  const { role, isLoading: isRoleLoading } = useUserRole();

  if (isRoleLoading) {
    return <div className="text-center p-10">Loading dashboard...</div>;
  }

  const userName = user?.email?.split('@')[0] || "User";

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Welcome back, {userName}!
          {role === 'admin' && <span className="text-sm text-muted-foreground ml-2">(Admin)</span>}
        </h1>
        <p className="text-muted-foreground">Here are the currently active polls. You can create a new one using the sidebar.</p>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-4">Available Polls</h3>
        <PollList />
      </div>
    </div>
  );
};

export default Index;