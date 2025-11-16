import React from 'react';
import { Poll } from '@/types/poll';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PollResultsData } from '@/hooks/use-poll-results';

interface PollOptionBreakdownProps {
  poll: Poll;
  resultsData: PollResultsData;
}

// Utility to map option IDs to their text and calculate percentages
const processResults = (poll: Poll, resultsData: PollResultsData) => {
  const { voteCounts, totalVotes } = resultsData;
  
  const optionMap = new Map(poll.options.map(opt => [opt.id, opt.text]));

  const processedData = poll.options.map(option => {
    const result = voteCounts.find(r => r.option_id === option.id);
    const count = result?.count || 0;
    const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
    
    return {
      id: option.id,
      name: optionMap.get(option.id) || 'Unknown Option',
      votes: count,
      percentage: parseFloat(percentage.toFixed(1)),
    };
  }).sort((a, b) => b.votes - a.votes); // Sort by votes descending

  return { processedData, totalVotes };
};

const PollOptionBreakdown: React.FC<PollOptionBreakdownProps> = ({ poll, resultsData }) => {
  const { processedData, totalVotes } = processResults(poll, resultsData);

  if (totalVotes === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No votes have been cast yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">{poll.title}</CardTitle>
          <Badge variant="secondary" className="capitalize">
            {poll.poll_type === 'single' ? 'Single Choice' : 'Multiple Choice'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {processedData.map((data) => (
          <div key={data.id} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">{data.name}</span>
              <span className="font-semibold text-lg">{data.percentage}%</span>
            </div>
            <div className="flex items-center space-x-4">
              <Progress 
                value={data.percentage} 
                className="h-3 flex-grow" 
              />
              <span className="text-sm text-muted-foreground w-10 text-right">{data.votes}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default PollOptionBreakdown;