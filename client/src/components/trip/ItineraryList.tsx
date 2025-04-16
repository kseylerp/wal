import React from 'react';
import { ItineraryListProps } from '@/types/trip';

/**
 * ItineraryList displays the day-by-day itinerary for a trip
 * It shows each day's activities and details
 */
const ItineraryList: React.FC<ItineraryListProps> = ({ itinerary, suggestedGuides }) => {
  console.log("Itinerary data:", itinerary);
  
  // Safety check for empty itinerary
  if (!itinerary || itinerary.length === 0) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <h3 className="font-medium mb-2">Preparing Your Itinerary</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((day) => (
              <div key={day} className="border-l-2 border-primary/30 pl-4 mb-5">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-100 rounded w-3/4 mb-3"></div>
                <div className="space-y-2">
                  <div className="h-2 bg-gray-100 rounded w-5/6"></div>
                  <div className="h-2 bg-gray-100 rounded w-4/6"></div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-sm text-primary/70 italic mt-4">
            <p className="mb-1">Planning your perfect offbeat experience...</p>
            <p className="mb-1">Finding alternatives to overcrowded places...</p>
            <p className="mb-1">Calculating optimal travel times...</p>
            <p className="mb-1">Retrieving map details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium mb-2">Day-by-Day Itinerary</h3>
        <div className="space-y-4">
          {itinerary.map((day, dayIndex) => (
            <div key={day.day || dayIndex} className="border-l-2 border-primary/30 pl-4 mb-5">
              <h4 className="font-medium">Day {day.day}: {day.title}</h4>
              <p className="text-gray-600 text-sm mb-2">{day.description}</p>
              <div className="space-y-1">
                {Array.isArray(day.activities) && day.activities.length > 0 ? (
                  day.activities.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <span className="text-primary mt-0.5 text-xs">•</span>
                      <span className="text-sm text-gray-700">{activity}</span>
                    </div>
                  ))
                ) : (
                  <div className="animate-pulse">
                    <div className="h-2 bg-gray-100 rounded w-5/6 mb-2"></div>
                    <div className="h-2 bg-gray-100 rounded w-3/4"></div>
                  </div>
                )}
                
                {day.accommodations && (
                  <div className="flex items-start space-x-2 mt-2">
                    <span className="text-blue-500 mt-0.5 text-xs">🏠</span>
                    <span className="text-sm text-gray-700 italic">
                      Stay: {day.accommodations}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {suggestedGuides && suggestedGuides.length > 0 && (
        <div>
          <h3 className="font-medium mb-2">Suggested Guides & Operators</h3>
          <ul className="list-disc list-inside text-sm text-gray-700 pl-1">
            {suggestedGuides.map((guide, index) => (
              <li key={index}>{guide}</li>
            ))}
          </ul>
          <p className="text-xs text-gray-500 mt-2">
            *Note: These are recommendations only. Make sure to research operators before booking.
          </p>
        </div>
      )}
    </div>
  );
};

export default ItineraryList;