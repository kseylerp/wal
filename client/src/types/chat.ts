export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  thinking?: string;
  timestamp: string;
  tripData?: TripData[];
}

export interface Thinking {
  isActive: boolean;
  content: string;
}

export interface ChatState {
  messages: Message[];
  thinking: Thinking;
  isWaitingForResponse: boolean;
}

export interface TripData {
  id: string;
  title: string;
  description: string;
  whyWeChoseThis: string;
  difficultyLevel: string;
  priceEstimate: string;
  duration: string;
  location: string;
  suggestedGuides: string[];
  mapCenter: [number, number];
  markers: Marker[];
  journey: Journey;
  itinerary: ItineraryDay[];
}

export interface Marker {
  name: string;
  coordinates: [number, number];
}

export interface Journey {
  segments: JourneySegment[];
  totalDistance: number;
  totalDuration: number;
  bounds: [[number, number], [number, number]];
}

export interface JourneySegment {
  mode: 'walking' | 'driving' | 'cycling' | 'transit' | 'biking' | 'hiking' | 'rafting';
  from: string;
  to: string;
  distance: number;
  duration: number;
  geometry: {
    type: 'LineString';
    coordinates: [number, number][];
  };
  terrain?: 'trail' | 'paved' | 'rocky' | 'mixed';
  steps?: JourneyStep[];
}

export interface JourneyStep {
  maneuver: {
    instruction: string;
    location: [number, number];
  };
  distance: number;
  duration: number;
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  activities: string[];
  accommodations?: string;
}
