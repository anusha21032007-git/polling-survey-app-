import React from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { LogOut, Plus, BarChart3 } from 'lucide-react';
import { useSupabaseSession } from '@/integrations/supabase/session-context';
import { useNavigate, Link } from 'react-router-dom';
import { showError } from '@/utils/toast';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user } = useSupabaseSession();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
      showError('Failed to sign out.');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-card">
        <div className="container flex h-16 items-center justify-between py-4">
          <h1 className="text-xl font-bold">Polling App</h1>
          
          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-4 mx-auto">
            <Link to="/">
              <Button variant="ghost">Home</Button>
            </Link>
            <Link to="/create-poll">
              <Button variant="ghost">
                <Plus className="h-4 w-4 mr-2" /> Create Poll
              </Button>
            </Link>
            <Link to="/poll-results">
              <Button variant="ghost">
                <BarChart3 className="h-4 w-4 mr-2" /> Results
              </Button>
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {user && (
              <span className="text-sm text-muted-foreground hidden sm:inline">
                Logged in as: {user.email}
              </span>
            )}
            <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign Out">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-grow container py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;