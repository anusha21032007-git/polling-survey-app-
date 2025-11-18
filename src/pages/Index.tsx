import { useSupabaseSession } from "@/integrations/supabase/session-context";
import PollList from "@/components/PollList";
import { useUserRole } from "@/hooks/use-user-role";
import { useProfile } from "@/hooks/use-profile"; // Import useProfile

const Index = () => {
  const { user } = useSupabaseSession();
  const { role, isLoading: isRoleLoading } = useUserRole();
  const { profile, isLoading: isProfileLoading } = useProfile(); // Fetch profile data

  if (isRoleLoading || isProfileLoading) {
    return <div className="text-center p-10">Loading dashboard...</div>;
  }

  // Use full_name if available, otherwise fall back to email prefix
  const userName = profile?.full_name || user?.email?.split('@')[0] || "User";

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Welcome, {userName}! 
          {role === 'admin' && <span className="text-sm text-muted-foreground ml-2">(Admin)</span>}
        </h1>
      </div>
      
      <h2 className="text-2xl font-semibold mb-6">Available Polls</h2>
      <PollList />
    </div>
  );
};

export default Index;