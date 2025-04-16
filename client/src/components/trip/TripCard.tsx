import React, { useState } from 'react';
import { TripCardProps } from '@/types/trip';
import JourneyMap from './JourneyMap';
import ItineraryList from './ItineraryList';

/**
 * TripCard displays a complete trip suggestion generated by the AI
 * It includes an interactive map, trip information, and a day-by-day itinerary
 */
const TripCard: React.FC<TripCardProps> = ({
  id,
  title,
  description,
  whyWeChoseThis,
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
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'itinerary'>('info');

  // Toggle map expansion
  const toggleMapExpand = () => {
    setIsMapExpanded(!isMapExpanded);
  };

  // Calculate actual distance by summing up segment distances if available
  const calculateTotalDistance = () => {
    if (!journey?.segments || journey.segments.length === 0) return '0.0';

    let totalMeters = 0;
    journey.segments.forEach(segment => {
      if (segment.distance) {
        totalMeters += segment.distance;
      }
    });

    // Convert to miles (1 meter = 0.000621371 miles)
    return totalMeters > 0 ? (totalMeters * 0.000621371).toFixed(1) : '0.0';
  };

  // Calculate actual duration by summing up segment durations if available
  const calculateTotalDuration = () => {
    if (!journey?.segments || journey.segments.length === 0) return '0.0';

    let totalMinutes = 0;
    journey.segments.forEach(segment => {
      if (segment.duration) {
        // Convert seconds to minutes
        totalMinutes += segment.duration / 60;
      }
    });

    // Convert to hours and format
    return totalMinutes > 0 ? (totalMinutes / 60).toFixed(1) : '0.0';
  };

  // Get distance and duration from actual data
  const totalDistanceMiles = journey && journey.totalDistance 
    ? (journey.totalDistance * 0.000621371).toFixed(1) 
    : calculateTotalDistance();
  
  const totalDurationHours = journey && journey.totalDuration 
    ? (journey.totalDuration / 3600).toFixed(1) 
    : calculateTotalDuration();

  // Function to save trip to localStorage
  const saveTrip = () => {
    try {
      // Get existing saved trips or initialize empty array
      const savedTripsJSON = localStorage.getItem('savedTrips') || '[]';
      const savedTrips = JSON.parse(savedTripsJSON);
      
      // Check if this trip is already saved
      const isAlreadySaved = savedTrips.some((trip: any) => trip.id === id);
      
      if (!isAlreadySaved) {
        // Add this trip to saved trips with complete data
        savedTrips.push({
          id,
          title,
          description,
          whyWeChoseThis,
          difficultyLevel,
          priceEstimate,
          location,
          duration,
          mapCenter,
          markers,
          journey,
          itinerary,
          suggestedGuides,
          dateAdded: new Date().toISOString()
        });
        
        // Save back to localStorage
        localStorage.setItem('savedTrips', JSON.stringify(savedTrips));
        
        // Could show toast notification here
        alert('Trip saved successfully!');
      } else {
        alert('This trip is already saved!');
      }
    } catch (err) {
      console.error('Error saving trip:', err);
    }
  };

  return (
    <div className="w-full mb-10 border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="w-full bg-white">
        <div className="md:flex">
          {/* Left side: Trip details */}
          <div className="p-6 md:w-1/2">
            <h2 className="text-2xl font-bold mb-3 text-gray-800">{title}</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {location && (
                <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full">
                  {location}
                </span>
              )}
              {duration && (
                <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
                  {duration}
                </span>
              )}
              {difficultyLevel && (
                <span className="bg-amber-100 text-amber-700 text-xs px-3 py-1 rounded-full">
                  {difficultyLevel}
                </span>
              )}
              {priceEstimate && (
                <span className="bg-emerald-100 text-emerald-700 text-xs px-3 py-1 rounded-full">
                  {priceEstimate}
                </span>
              )}
            </div>
            
            <p className="text-gray-700 mb-5 text-base">{description}</p>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-6 text-sm">
              <div>
                <span className="font-medium">Distance:</span> {totalDistanceMiles} miles
              </div>
              <div>
                <span className="font-medium">Duration:</span> ~{totalDurationHours} hrs
              </div>
            </div>
            
            {/* Tab navigation */}
            <div className="flex border-b mb-5">
              <button
                onClick={() => setActiveTab('info')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'info' 
                    ? 'border-b-2 border-gray-700 text-gray-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Why We Chose This
              </button>
              <button
                onClick={() => setActiveTab('itinerary')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'itinerary' 
                    ? 'border-b-2 border-gray-700 text-gray-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Itinerary
              </button>
            </div>
            
            {/* Tab content */}
            <div className="text-sm max-h-96 overflow-y-auto">
              {activeTab === 'info' ? (
                <div>
                  <h3 className="font-medium text-base mb-2">Why We Chose This For You</h3>
                  <p className="text-gray-600">{whyWeChoseThis}</p>
                </div>
              ) : (
                <ItineraryList itinerary={itinerary} suggestedGuides={suggestedGuides} />
              )}
            </div>
          </div>
          
          {/* Right side: Map */}
          <div className="md:w-1/2">
            <JourneyMap
              mapId={`map-${id}`}
              center={mapCenter}
              markers={markers}
              journey={journey}
              isExpanded={isMapExpanded}
              toggleExpand={toggleMapExpand}
            />
          </div>
        </div>
      </div>
      {/* Save trip button outside the card */}
      <div className="flex justify-end mt-3">
        <button
          onClick={saveTrip}
          className="bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-md transition-colors text-sm"
        >
          Save Trip
        </button>
      </div>
    </div>
  );
};

export default TripCard;