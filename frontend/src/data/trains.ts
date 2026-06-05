export interface TrainClass {
  code: string;
  price: string;
  availability: string;
  bookable: boolean;
}

export interface Train {
  id: number;
  train_number: string;
  train_name: string;
  source: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  total_seats: number;
  available_seats: number;
  price_sleeper: number;
  price_ac3: number;
  price_ac2: number;
  price_ac1: number;
  price_general: number;
  days_of_operation: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Train data is fetched from the API, not stored here
// See trainsAPI in lib/api.ts for data fetching
export const trainsData: Train[] = [];
