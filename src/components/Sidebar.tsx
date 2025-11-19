import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, PlusSquare, BarChart3, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useUserRole } from '@/hooks/use-user-role';
import { Skeleton } from '@/components/ui/skeleton';

const SidebarNav = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const { isLoading: isRoleLoading } = useUserRole();

  if (isRoleLoading) {
    return (
      <div className="space-y-2 p-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/create-poll', label: 'Create Poll', icon: PlusSquare },
    { href: '/poll-results', label: 'Results', icon: BarChart3 },
    { href: '/saved-polls', label: 'Saved Polls', icon: Bookmark },
  ];

  return (
    <nav className="flex flex-col space-y-2">
      {navItems.map((item) => (
        <Link key={item.href} to={item.href}>
          <Button
            variant="ghost"
            className={cn(
              'w-full justify-start text-base p-6',
              pathname === item.href
                ? 'bg-muted hover:bg-muted font-semibold'
                : 'hover:bg-muted/50 hover:text-foreground'
            )}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.label}
          </Button>
        </Link>
      ))}
    </nav>
  );
};

const Sidebar = () => {
  return (
    <aside className="hidden md:block w-64 flex-shrink-0 border-r bg-background h-[calc(100vh-4rem)] fixed top-16 left-0">
       <div className="p-4">
         <SidebarNav />
       </div>
    </aside>
  );
};

export default Sidebar;