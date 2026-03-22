export interface Review {
  id: number;
  user_id: number;
  house_id: number;
  rating: number;
  comment: string | null;
  userName?: string;
  created_at?: string;
  updated_at?: string;
}
