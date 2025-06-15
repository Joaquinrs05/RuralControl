export interface House {
  id: number;
  name: string;
  description: string;
  photo_path: string;
  owner_id: number;
  latitude: number;
  longitude: number;
  address: string;
  province: string;

  visits: number;
  price_per_night: number;
  created_at: string;
  updated_at: string;
}
