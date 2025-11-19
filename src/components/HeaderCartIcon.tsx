import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { usePollCart } from '@/hooks/use-poll-cart';
import PollCart from './PollCart';

const HeaderCartIcon: React.FC = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cartPollIds } = usePollCart();
  const itemCount = cartPollIds.length;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        title="Poll Cart"
        className="relative hover:text-primary transition-all"
        onClick={() => setIsCartOpen(true)}
      >
        <ShoppingCart className="h-5 w-5" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {itemCount}
          </span>
        )}
      </Button>
      <PollCart isOpen={isCartOpen} onOpenChange={setIsCartOpen} />
    </>
  );
};

export default HeaderCartIcon;