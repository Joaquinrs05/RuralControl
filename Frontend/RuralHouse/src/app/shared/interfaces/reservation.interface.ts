export interface ReservationsByMonthItem {
  month: string;
  reservations: number;
  guests: number;
}

export interface HouseTop {
  id: number;
  name: string;
  reservations_count: number;
  total_guests: number;
  average_rating: number;
  photo_path: string;
}

export interface RecentReservation {
  id: number;
  house_name: string;
  house_photo: string;
  guest_name: string;
  guest_email: string;
  fecha_inicio: string;
  fecha_fin: string;
  num_personas: number;
  estado: string;
  created_at: string;
}
