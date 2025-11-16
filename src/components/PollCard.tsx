import React from 'react';
import { Poll } from '@/types/poll';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PollCardProps {
  poll: Poll;
}

const PollCard: React.FC<PollCardProps> = ({ poll }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{poll.title}</CardTitle>
          <Badge variant="secondary" className="capitalize">
            {poll.poll_type === 'single' ? 'Single Choice' : 'Multiple Choice'}
          </Badge>
        </div>
        {poll.description && (
          <CardDescription className="mt-1">{poll.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-2">
          {poll.options.length} options available.
        </p>
        {/* Placeholder for voting UI */}
        <div className="mt-4">
          <p className="text-sm font-medium text-primary">Click to view/vote</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PollCard;