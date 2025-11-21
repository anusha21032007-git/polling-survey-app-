import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { User } from 'lucide-react';

interface AnonymousVoterGateProps {
  onNameProvided: (name: string) => void;
}

const AnonymousVoterGate: React.FC<AnonymousVoterGateProps> = ({ onNameProvided }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onNameProvided(name.trim());
    }
  };

  return (
    <div className="flex items-center justify-center">
      <Card className="w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-6 w-6" />
              Enter Your Name to Vote
            </CardTitle>
            <CardDescription>
              Please provide a name to participate in this poll. This name will be visible to the poll creator.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="voter-name">Your Name</Label>
              <Input
                id="voter-name"
                placeholder="e.g., Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={!name.trim()}>
              Continue to Poll
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AnonymousVoterGate;