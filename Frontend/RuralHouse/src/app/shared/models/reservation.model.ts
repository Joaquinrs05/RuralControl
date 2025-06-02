export interface Reservation {
  id?: number;
  user_id: number;
  house_id: number;
  start_date: string; // antes estaba como "fecha_inicio"
  end_date: string; // antes estaba como "fecha_fin"
  num_people: number; // antes "num_personas"
  price_per_night?: number;
  total_price?: number;
  status?: string;
}
