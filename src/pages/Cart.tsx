import React from 'react';
import { usePollCart } from '@/hooks/use-poll-cart';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import PollResultSummaryCard from '@/components/PollResultSummaryCard';
import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

const CartPage: React.FC = () => {
  const { cartPolls, isLoading } = usePollCart();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <ShoppingCart className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">My Poll Cart</h1>
          <p className="text-muted-foreground">
            Here are the polls you've saved. You can share them as a collection from the cart panel.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-32 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : cartPolls.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center">
            <p className="text-lg text-muted-foreground">Your cart is empty.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Click the <ShoppingCart className="inline h-4 w-4" /> icon on any poll on the{' '}
              <Link to="/poll-results" className="text-primary underline">Results</Link> page to add it here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cartPolls.map(poll => (
            <PollResultSummaryCard key={poll.id} poll={poll} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CartPage;