export interface RouteDetails {
  distance_miles: number;
  elevation_gain_ft: number;
  elevation_loss_ft: number;
  high_point_ft: number;
  route_type: string;
}

export interface Activity {
  title: string;
  type: string;
  difficulty: string;
  duration_hours: number;
  location?: string;
  start_location?: string;
  end_location?: string;
  distance?: number;
  day?: number;
  highlights?: string[];
  hazards?: string[];
  description?: string;
  route_details?: RouteDetails;
  route_geometry?: {
    type: string;
    coordinates: [number, number][];
  };
}

export interface TripData {
  id: string;
  title: string;
  description: string;
  location: string;
  duration: string;
  difficultyLevel: string;
  priceEstimate: string;
  mapCenter: [number, number];
  activities: Activity[];
  themes?: string[];
  bestSeasons?: string[];
  recommendedMonths?: string[];
  weather?: string;
  historical?: string;
  intensity?: string;
  notes?: string[];
  warnings?: string[];
  priceRange?: {
    min: number;
    max: number;
    currency: string;
  };
}