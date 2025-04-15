import React, { useEffect, useState } from 'react';
import { JourneyMapProps } from '@/types/trip'; 
// Using static MapBox API instead of dynamic map component

// Static map implementation for reliability
const JourneyMap: React.FC<JourneyMapProps> = ({
  mapId,
  center,
  markers,
  journey,
  isExpanded,
  toggleExpand
}) => {
  const [mapUrl, setMapUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch MapBox token and create static map URL
  useEffect(() => {
    const getMapToken = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/config');
        const { mapboxToken } = await response.json();
        
        if (!mapboxToken) {
          setError('MapBox token is not available');
          console.error('MapBox token is not available');
          return;
        }
        
        // Create static map URL
        let url = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/`;
        
        // Add markers
        if (markers.length > 0) {
          const markerParams = markers.map((marker, index) => {
            // Use pin-s for small markers
            return `pin-s+7c3aed(${marker.coordinates[0]},${marker.coordinates[1]})`;
          }).join(',');
          
          url += markerParams;
        }
        
        // Add auto zoom and center
        if (markers.length > 1) {
          // Create a path
          const path = `path-4+7c3aed(${markers.map(m => m.coordinates.join(',')).join(';')})`;
          url += `,${path}`;
          
          // Auto position the map to show all markers
          url += `/auto/500x300@2x`;
        } else {
          // Use center and zoom if only one marker or no markers
          url += `/`;
          url += `${center[0]},${center[1]},9,0/500x300@2x`;
        }
        
        // Add access token
        url += `?access_token=${mapboxToken}`;
        
        setMapUrl(url);
        setLoading(false);
      } catch (err) {
        console.error('Error creating static map:', err);
        setError('Failed to create map');
        setLoading(false);
      }
    };
    
    getMapToken();
  }, [center, markers]);

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
        {loading ? (
          <div className="flex items-center justify-center h-full bg-gray-100">
            <p>Loading map...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full bg-gray-100">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <img 
            src={mapUrl} 
            alt="Trip Map" 
            className="w-full h-full object-cover rounded-md"
          />
        )}
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
