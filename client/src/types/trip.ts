import { Journey, ItineraryDay, Marker } from './chat';

export interface TripCardProps {
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
  onModifyRequest: (tripId: string) => void;
}

export interface JourneyMapProps {
  mapId: string;
  center: [number, number];
  markers: Marker[];
  journey: Journey;
  isExpanded: boolean;
  toggleExpand: () => void;
}

export interface ItineraryListProps {
  itinerary: ItineraryDay[];
  suggestedGuides: string[];
}

export interface SegmentOption {
  id: string;
  label: string;
  mode: string;
  from: string;
  to: string;
}

export interface ActivityOption {
  type: string;
  duration: string;
}
