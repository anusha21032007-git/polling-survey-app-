import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, PlusSquare, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useUserRole } from '@/hooks/use-user-role';
import { Skeleton } from '@/components/ui/skeleton';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/create-poll', label: 'Create', icon: PlusSquare },
  { href: '/poll-results', label: 'Results', icon: BarChart3 },
];

const MobileFooterNav: React.FC = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const { isLoading: isRoleLoading } = useUserRole();

  if (isRoleLoading) {
    return (
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t flex items-center justify-around p-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-1/4 rounded-full" />
        ))}
      </div>
    );
  }

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-card border-t border-border md:hidden">
      <nav className="flex h-full items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} to={item.href} className="flex-1 text-center">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'flex flex-col h-full w-full p-1 text-xs transition-colors',
                  isActive
                    ? 'text-primary font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <item.icon className="h-5 w-5 mb-0.5" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>
    </footer>
  );
};

export default MobileFooterNav;