import { useSupabaseSession } from "@/integrations/supabase/session-context";
import { useUserDashboard, UserPollStat } from "@/hooks/use-user-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, ListChecks, Users, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import StatCard from "@/components/dashboard/StatCard";
import { formatDistanceToNow } from 'date-fns';
import { Progress } from "@/components/ui/progress";
import { useUserRole } from "@/hooks/use-user-role";
import PollList from "@/components/PollList";

const RecentPollItem: React.FC<{ poll: UserPollStat }> = ({ poll }) => {
  // Placeholder logic for progress bar as its meaning is ambiguous
  const progressValue = (poll.total_responses * 13) % 100;

  return (
    <Link to={`/polls/${poll.id}`} className="block">
      <Card className="hover:bg-muted/50 transition-colors">
        <CardContent className="p-4 flex items-center space-x-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <ListChecks className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-grow">
            <p className="font-semibold">{poll.title}</p>
            <p className="text-sm text-muted-foreground">
              {poll.total_responses} responses • {formatDistanceToNow(new Date(poll.created_at), { addSuffix: true })}
            </p>
          </div>
          <div className="w-24 text-right">
            <p className="font-semibold">{progressValue}%</p>
            <Progress value={progressValue} className="h-2 mt-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

const UserDashboard = () => {
  const { user } = useSupabaseSession();
  const navigate = useNavigate();
  const { data, isLoading } = useUserDashboard();

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User";

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <Card className="bg-primary text-primary-foreground">
        <CardContent className="p-6">
          <h2 className="text-3xl font-bold">Welcome Back, {userName}!</h2>
          <p className="mt-2 text-primary-foreground/80">
            Ready to create your next survey or poll? Let's get started!
          </p>
          <Button 
            variant="secondary" 
            className="mt-4"
            onClick={() => navigate('/create-poll')}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Poll
          </Button>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div>
        <h3 className="text-2xl font-semibold mb-4">Quick Stats</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Polls Created"
            value={data?.stats.total_polls ?? 0}
            icon={<ListChecks className="h-5 w-5 text-muted-foreground" />}
            isLoading={isLoading}
          />
          <StatCard
            title="Total Responses"
            value={data?.stats.total_responses ?? 0}
            icon={<Users className="h-5 w-5 text-muted-foreground" />}
            isLoading={isLoading}
          />
          <Link to="/poll-results" className="block">
            <Card className="hover:bg-muted/50 transition-colors h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Explore Polls</CardTitle>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">&nbsp;</div>
                <p className="text-xs text-muted-foreground">View results from all public polls.</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Recent Surveys */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-semibold">My Recent Polls</h3>
        </div>
        <div className="space-y-4">
          {isLoading ? (
            [...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
          ) : data?.recentPolls && data.recentPolls.length > 0 ? (
            data.recentPolls.map(poll => <RecentPollItem key={poll.id} poll={poll} />)
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                You haven't created any polls yet. Get started by creating one!
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

const AdminDashboard = () => {
  const { user } = useSupabaseSession();
  const userName = user?.email?.split('@')[0] || "User";

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Welcome back, {userName}!
          <span className="text-sm text-muted-foreground ml-2">(Admin)</span>
        </h1>
        <p className="text-muted-foreground">Here are the currently active polls across the platform.</p>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-4">All Available Polls</h3>
        <PollList />
      </div>
    </div>
  );
}

const Index = () => {
  const { role, isLoading: isRoleLoading } = useUserRole();

  if (isRoleLoading) {
    return <div className="text-center p-10">Loading dashboard...</div>;
  }

  return role === 'admin' ? <AdminDashboard /> : <UserDashboard />;
};

export default Index;