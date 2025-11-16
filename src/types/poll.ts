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
  is_active: boolean;
  due_at: string | null; // Replaced starts_at and ends_at
  created_at: string;
}