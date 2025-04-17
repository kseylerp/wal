// Point of Interest for activities
export interface PointOfInterest {
  name: string;
  description?: string;
  coordinates: [number, number]; // [longitude, latitude]
  type?: 'viewpoint' | 'rest' | 'water' | 'photo' | 'landmark' | 'danger';
}

// Activity interface
export interface Activity {
  id?: string;
  title: string;
  type?: string;
  description?: string;
  day?: number;
  difficulty?: string;
  duration_hours?: number;
  distance?: number;
  elevation_gain?: number;
  location?: string;
  route?: [number, number][]; // Array of [longitude, latitude] coordinates
  start_location?: [number, number];
  end_location?: [number, number];
  highlights?: string[];
  hazards?: string[];
  water_sources?: string[];
  photo_spots?: string[];
  points_of_interest?: PointOfInterest[];
  requiresPermit?: boolean;
  bestTimeOfDay?: string;
  bestTimeOfYear?: string;
}

// Trip interface (simplified for this component)
export interface TripData {
  id: string;
  title: string;
  description: string;
  location: string;
  mapCenter: [number, number]; // [longitude, latitude]
  journeyData: {
    markers: any[];
    segments: any[];
    bounds: [[number, number], [number, number]];
  };
  activities?: Activity[];
  // Other trip properties...
}