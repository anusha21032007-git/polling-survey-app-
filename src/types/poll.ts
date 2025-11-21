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
  due_at: string | null;
  created_at: string;
  poll_set_id: string;
}

export interface ProfileInfo {
  full_name: string | null;
  username: string | null;
}

export interface PollSet {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  created_at: string;
  polls: Poll[]; // Contains the array of polls within this set
  profiles: ProfileInfo | null;
}