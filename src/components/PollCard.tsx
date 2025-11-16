import React from 'react';
import { Poll } from '@/types/poll';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

interface PollCardProps {
  poll: Poll;
}

const PollCard: React.FC<PollCardProps> = ({ poll }) => {
  return (
    <Link to={`/polls/${poll.id}`} className="block group">
      <Card className="hover:shadow-lg transition-all duration-300 group-hover:scale-[1.02] cursor-pointer h-full flex flex-col">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl">{poll.title}</CardTitle>
            <Badge variant="secondary" className="capitalize">
              {poll.poll_type === 'single' ? 'Single Choice' : 'Multiple Choice'}
            </Badge>
          </div>
          {poll.description && (
            <CardDescription className="mt-1 line-clamp-2">{poll.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="mt-auto">
          <p className="text-sm text-muted-foreground mb-2">
            {poll.options.length} options available.
          </p>
          <div className="mt-4">
            <Badge variant={poll.is_active ? "default" : "destructive"}>
              {poll.is_active ? "Active" : "Closed"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default PollCard;