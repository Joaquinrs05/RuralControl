export interface Reservation {
  id?: number;
  user_id: number;
  house_id: number;
  start_date: string; 
  end_date: string; 
  num_people: number; 
  price_per_night?: number;
  total_price?: number;
  status?: string;
}
