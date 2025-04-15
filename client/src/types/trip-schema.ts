// Define the new trip schema types based on the requirements

export type LocationType = 'city' | 'town' | 'trailhead' | 'campsite' | 'peak' | 'lake' | 'river' | 'viewpoint' | 'lodging';
export type ActivityType = 'hiking' | 'biking' | 'cycling' | 'driving' | 'rafting' | 'kayaking' | 'walking' | 'climbing' | 'sightseeing';
export type DifficultyLevel = 'easy' | 'moderate' | 'difficult' | 'technical';
export type IntensityLevel = 'low' | 'moderate' | 'high' | 'extreme';
export type Season = 'spring' | 'summer' | 'fall' | 'winter';
export type LodgingType = 'camping' | 'hotel' | 'hostel' | 'cabin' | 'backcountry';
export type RouteType = 'out_and_back' | 'loop' | 'point_to_point' | 'shuttle';

export interface Price {
  min: number;
  max: number;
  currency: string;
}

export interface WeatherHistorical {
  avg_high_f: number;
  avg_low_f: number;
  avg_precipitation_inches: number;
  typical_conditions: string[];
}

export interface WeatherForecastDay {
  date: string; // ISO date
  high_f: number;
  low_f: number;
  conditions: string;
  precipitation_chance: number;
  wind_mph: number;
}

export interface WeatherForecast {
  source: string;
  updated_at: string; // ISO date
  daily: WeatherForecastDay[];
}

export interface Weather {
  historical: WeatherHistorical;
  current_forecast: WeatherForecast;
}

export interface KeyLocation {
  id: string;
  name: string;
  type: LocationType;
  coordinates: [number, number]; // [longitude, latitude]
  elevation_ft: number;
  description: string;
}

export interface RouteDetails {
  distance_miles: number;
  elevation_gain_ft: number;
  elevation_loss_ft: number;
  high_point_ft: number;
  terrain: string;
  route_type: RouteType;
}

export interface RouteGeometry {
  type: 'LineString';
  coordinates: [number, number][]; // Array of [longitude, latitude] points
}

export interface Activity {
  id: string;
  title: string;
  type: ActivityType;
  difficulty: DifficultyLevel;
  duration_hours: number;
  start_location: string; // References location id
  end_location: string; // References location id
  highlights: string[];
  hazards: string[];
  route_details: RouteDetails;
  route_geometry: RouteGeometry;
}

export interface Lodging {
  type: LodgingType;
  name: string;
  location: string;
  coordinates: [number, number]; // [longitude, latitude]
  booking_link: string;
  notes: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  lodging: Lodging;
  activities: Activity[];
}

export interface Outfitter {
  name: string;
  specialty: string;
  location: string;
  website: string;
  phone: string;
  description: string;
}

export interface Trip {
  id: string;
  title: string;
  description: string;
  themes: string[];
  region: string;
  duration_days: number;
  
  intensity: IntensityLevel;
  price_range: Price;
  
  best_seasons: Season[];
  recommended_months: number[]; // 1-12
  weather: Weather;
  
  map_center: [number, number]; // [longitude, latitude]
  bounds: [[number, number], [number, number]]; // [[min_lng, min_lat], [max_lng, max_lat]]
  
  key_locations: KeyLocation[];
  itinerary: ItineraryDay[];
  
  whyWeChoseThis: string[];
  
  recommended_outfitters: Outfitter[];
  
  notes: string[];
  warnings: string[];
}

export interface TripResponse {
  trips: Trip[];
}