export interface Reservation {
  id?: number;
  user_id: number;
  house_id: number;
  fecha_inicio: string;
  fecha_fin: string;
  num_personas?: number;
  estado?: string;
}
