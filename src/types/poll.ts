export type PollType = 'single' | 'multiple';

export interface PollOption {
  id: string; // Client-side ID for form management and database storage
  text: string;
}

export interface Poll {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  poll_type: PollType;
  options: PollOption[];
  created_at: string;
}