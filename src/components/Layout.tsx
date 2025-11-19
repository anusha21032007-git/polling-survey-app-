import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { User as UserIcon } from 'lucide-react';
import { useSupabaseSession } from '@/integrations/supabase/session-context';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ProfilePopoverContent from './ProfilePopoverContent';
import MobileFooterNav from './MobileFooterNav';
import { useIsMobile } from '@/hooks/use-mobile';

const Layout: React.FC = () => {
  const { user } = useSupabaseSession();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-card/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between py-4">
          <h1 className="text-xl font-bold">
            <a href="/">Polling App</a>
          </h1>
          <div className="flex items-center space-x-2">
            {user && (
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {user.email}
              </span>
            )}
            <Popover open={isProfileOpen} onOpenChange={setIsProfileOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" title="User Menu" className="hover:text-primary transition-all">
                  <UserIcon className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-96 p-0">
                <ProfilePopoverContent onClose={() => setIsProfileOpen(false)} />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </header>
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-grow p-4 md:p-8 overflow-auto animate-fade-in pb-24 md:pb-8 md:ml-64">
          <Outlet />
        </main>
      </div>
      {isMobile && <MobileFooterNav />}
      <footer className="hidden md:block text-center p-4 text-sm text-muted-foreground border-t md:ml-64">
        Developed By Anusha N
      </footer>
    </div>
  );
};

export default Layout;