import React from 'react';
import { Poll } from '@/types/poll';
import { usePollResults } from '@/hooks/use-poll-results';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface PollResultsViewProps {
  poll: Poll;
}

// Utility to map option IDs to their text and calculate percentages
const processResults = (poll: Poll, results: { option_id: string; count: number }[]) => {
  const totalVotes = results.reduce((sum, result) => sum + result.count, 0);
  
  const optionMap = new Map(poll.options.map(opt => [opt.id, opt.text]));

  const processedData = poll.options.map(option => {
    const result = results.find(r => r.option_id === option.id);
    const count = result?.count || 0;
    const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
    
    return {
      id: option.id,
      name: optionMap.get(option.id) || 'Unknown Option',
      votes: count,
      percentage: parseFloat(percentage.toFixed(1)),
    };
  });

  return { processedData, totalVotes };
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const PollResultsView: React.FC<PollResultsViewProps> = ({ poll }) => {
  const { data: results, isLoading, isError, error } = usePollResults(poll.id);

  if (isLoading) {
    return (
      <Card className="p-6 space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-64 w-full" />
      </Card>
    );
  }

  if (isError) {
    return <div className="text-destructive">Error loading results: {error?.message}</div>;
  }

  const { processedData, totalVotes } = processResults(poll, results || []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-3xl">{poll.title} - Results</CardTitle>
        <p className="text-muted-foreground">Total Votes: {totalVotes}</p>
      </CardHeader>
      <CardContent className="space-y-8">
        
        {totalVotes === 0 ? (
          <div className="text-center p-10 border rounded-lg bg-muted/50">
            <p className="text-lg text-muted-foreground">No votes have been cast yet.</p>
          </div>
        ) : (
          <>
            {/* Bar Chart Visualization */}
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={processedData}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--foreground))" />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke="hsl(var(--foreground))" 
                    width={100} 
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                    }}
                    formatter={(value, name, props) => [`${value} votes (${props.payload.percentage}%)`, 'Votes']}
                  />
                  <Bar dataKey="votes" radius={[4, 4, 0, 0]}>
                    {processedData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Detailed Breakdown */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold border-b pb-2">Detailed Breakdown</h3>
              {processedData.map((data, index) => (
                <div key={data.id} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{data.name}</span>
                    <Badge variant="secondary">
                      {data.votes} votes ({data.percentage}%)
                    </Badge>
                  </div>
                  <Progress value={data.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PollResultsView;