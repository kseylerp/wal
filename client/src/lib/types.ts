export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface Trip {
  id: string;
  title: string;
  description: string;
  whyWeChoseThis: string;
  difficultyLevel: string;
  priceEstimate: string;
  duration: string;
  location: string;
  suggestedGuides: string[];
  mapCenter: [number, number]; // [longitude, latitude]
  markers: {
    coordinates: [number, number];
    name: string;
  }[];
  journey: {
    segments: JourneySegment[];
    totalDistance: number;
    totalDuration: number;
    bounds: [[number, number], [number, number]]; // [[southwest], [northeast]]
  };
  itinerary: {
    day: number;
    title: string;
    description: string;
    activities: string[];
    accommodation?: string;
  }[];
}

export interface JourneySegment {
  mode: "walking" | "driving" | "cycling" | "transit";
  from: string;
  to: string;
  distance: number; // in meters
  duration: number; // in seconds
  terrain?: "trail" | "paved" | "rocky" | "mixed";
  geometry?: {
    coordinates: [number, number][];
    type: "LineString";
  };
  steps?: {
    maneuver: {
      instruction: string;
      location: [number, number];
    };
    distance: number;
    duration: number;
  }[];
}
