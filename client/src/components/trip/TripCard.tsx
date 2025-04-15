import React, { useState } from 'react';
import { TripCardProps } from '@/types/trip';
import JourneyMap from './JourneyMap';
import ItineraryList from './ItineraryList';
import { ChevronDown, ChevronUp } from 'lucide-react';

const TripCard: React.FC<TripCardProps> = ({
  id,
  title,
  description,
  difficultyLevel,
  priceEstimate,
  duration,
  location,
  suggestedGuides,
  mapCenter,
  markers,
  journey,
  itinerary,
  onModifyRequest
}) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(true); // Default to open
  const [selectedSegment, setSelectedSegment] = useState('segment1');
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    name: string;
    coordinates: [number, number];
  } | null>(null);

  const toggleDetails = () => {
    setIsDetailsOpen(!isDetailsOpen);
  };

  const toggleMapExpand = () => {
    setIsMapExpanded(!isMapExpanded);
  };

  const handleSegmentChange = (segmentId: string) => {
    setSelectedSegment(segmentId);
  };
  
  const handleActivitySelect = (day: number, activityIndex: number, activityName: string) => {
    // Find a marker that matches this activity by name (approximate match)
    const activityLower = activityName.toLowerCase();
    const matchingMarker = markers.find(marker => 
      marker.name.toLowerCase().includes(activityLower) || 
      activityLower.includes(marker.name.toLowerCase())
    );
    
    if (matchingMarker) {
      setSelectedLocation(matchingMarker);
    } else {
      // If no direct marker match, look for locations mentioned in the activity
      for (const marker of markers) {
        if (activityLower.includes(marker.name.toLowerCase())) {
          setSelectedLocation(marker);
          break;
        }
      }
    }
    
    // If activity contains "hike", "walk", "trek", let's select a related segment
    if (activityLower.includes('hike') || activityLower.includes('walk') || activityLower.includes('trek')) {
      // Find a related segment
      const segmentIndex = journey.segments.findIndex(segment => 
        segment.mode === 'walking' || 
        segment.mode === 'hiking' || 
        segment.mode === 'trekking'
      );
      
      if (segmentIndex >= 0) {
        setSelectedSegment(`segment${segmentIndex + 1}`);
      }
    }
    
    // Ensure the map is expanded when an activity is selected
    if (!isMapExpanded) {
      setIsMapExpanded(true);
    }
  };

  return (
    <div className="trip-card bg-white border border-gray-200 overflow-hidden rounded-2xl transition-transform duration-200 hover:translate-y-[-2px] hover:shadow-lg">
      <div className="relative">
        {/* Use background color instead of image */}
        <div className="w-full h-48 bg-gradient-to-r from-primary/50 to-primary/70 flex items-center justify-center">
          <span className="text-white text-xl font-bold">{location}</span>
        </div>
        <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-sm font-medium rounded-bl-lg">
          {duration}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center mt-1 mb-2">
          <span className="text-sm font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full mr-2">
            {difficultyLevel}
          </span>
          <span className="text-sm font-medium text-amber-600">{priceEstimate}</span>
        </div>
        
        <p className="text-gray-700 text-sm mb-4">{description}</p>
        
        <JourneyMap
          mapId={id}
          center={mapCenter}
          zoom={6}
          markers={markers}
          journey={journey}
          selectedSegment={selectedSegment}
          onSegmentChange={handleSegmentChange}
          isExpanded={isMapExpanded}
          toggleExpand={toggleMapExpand}
        />
        
        {/* Expand/Collapse Button */}
        <button
          type="button"
          className="w-full mt-2 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-50 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          onClick={toggleDetails}
        >
          <span>{isDetailsOpen ? 'Hide Itinerary' : 'Show Itinerary'}</span>
          {isDetailsOpen ? (
            <ChevronUp className="ml-2 h-4 w-4" />
          ) : (
            <ChevronDown className="ml-2 h-4 w-4" />
          )}
        </button>
        
        {/* Collapsible Details */}
        {isDetailsOpen && (
          <ItineraryList 
            itinerary={itinerary} 
            suggestedGuides={suggestedGuides}
            onSelectActivity={handleActivitySelect}
          />
        )}
        
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => onModifyRequest(id)}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Modify This Trip
          </button>
        </div>
      </div>
    </div>
  );
};

export default TripCard;
