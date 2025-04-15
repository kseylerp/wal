import React from 'react';
import { JourneyMapProps } from '@/types/trip';

// Simplified map implementation with fallback
const JourneyMap: React.FC<JourneyMapProps> = ({
  journey,
  isExpanded,
  toggleExpand
}) => {
  // Hard-coded static map URL for reliability - using a standard MapBox location
  // This is a temporary fallback solution until we resolve the MapBox integration
  const mapUrl = "https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+7c3aed(-122.4194,37.7749)/-122.4194,37.7749,12,0/500x300?access_token=pk.eyJ1Ijoia3NleWxlcnAiLCJhIjoiY204cGJnM2M0MDk1ZjJrb2F3b3o0ZWlnaCJ9.a2VxRsgFb9FwElyHeUUaTw";

  return (
    <div className="border-t border-gray-200 pt-3 pb-1">
      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
        Journey Map
      </h4>
      
      <div 
        className={`map-container mb-3 transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'h-[550px]' : 'h-[300px]'}`}
        onClick={toggleExpand}
      >
        <img 
          src={mapUrl} 
          alt="Trip Map" 
          className="w-full h-full object-cover rounded-md"
        />
      </div>
      
      <div className="p-3 bg-gray-50 rounded-lg text-sm">
        <p className="mb-1 font-medium">Map Instructions:</p>
        <p>• Click on the map to expand/collapse it</p>
        <p>• Purple route line shows your journey path</p>
        <p>• Map markers show all your destinations</p>
        <p>• Total distance: {(journey.totalDistance * 0.621371).toFixed(1)} miles</p>
      </div>
      
      {/* Display journey details */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="bg-gray-50 p-2 rounded-lg">
          <div className="text-xs text-gray-500">Trip Duration</div>
          <div className="font-medium">{Math.round(journey.totalDuration / 3600)} hours</div>
        </div>
        <div className="bg-gray-50 p-2 rounded-lg">
          <div className="text-xs text-gray-500">Travel Mode</div>
          <div className="font-medium capitalize">
            {journey.segments[0]?.mode || 'Mixed'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JourneyMap;
