import { Journey, ItineraryDay, Marker } from './chat';

export interface TripCardProps {
  id: string;
  title: string;
  description: string;
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
  zoom: number;
  markers: Marker[];
  journey: Journey;
  selectedSegment?: string;
  onSegmentChange?: (segmentId: string) => void;
  isExpanded: boolean;
  toggleExpand: () => void;
}

export interface ItineraryListProps {
  itinerary: ItineraryDay[];
  suggestedGuides: string[];
  onSelectActivity?: (day: number, activityIndex: number, activityName: string) => void;
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
