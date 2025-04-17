export interface RouteDetails {
  distance_miles: number;
  elevation_gain_ft: number;
  elevation_loss_ft: number;
  high_point_ft: number;
  terrain: string;
  route_type: string;
}

export interface Activity {
  title: string;
  type: string;
  difficulty: string;
  duration_hours: number;
  start_location: string;
  end_location: string;
  highlights: string[];
  hazards: string[];
  route_details: RouteDetails;
  day?: number;
  route_geometry?: {
    type: string;
    coordinates: [number, number][];
  };
}

export interface TripDay {
  day: number;
  title?: string;
  description?: string;
  activities: string[];
  accommodations?: string;
}

export interface Trip {
  id: number | string;
  title: string;
  description: string;
  location: string;
  duration: string;
  difficultyLevel: string;
  createdAt: string;
  mapCenter: [number, number];
  itinerary: TripDay[];
  journey: {
    markers?: {
      position: [number, number];
      label?: string;
      type?: string;
    }[];
    route?: {
      type: string;
      coordinates: [number, number][];
    };
  };
  priceEstimate?: string;
  themes?: string[];
  bestSeasons?: string[];
  recommendedMonths?: string[];
  weather?: string;
  historical?: string;
  intensity?: string;
  whyWeChoseThis?: string;
  recommendedOutfitters?: {
    name: string;
    website?: string;
    description?: string;
  }[];
  notes?: string[];
  warnings?: string[];
  activities?: Activity[];
  priceRange?: {
    min: number;
    max: number;
    currency: string;
  };
  sharing?: {
    isShared: boolean;
    shareableId?: string;
    shareableLink?: string;
  };
  offlineId?: string;
  syncStatus?: 'pending' | 'synced' | 'failed';
  lastModified?: string;
}