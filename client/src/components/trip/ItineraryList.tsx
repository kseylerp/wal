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
    return <div className="text-gray-500 italic">No itinerary information available.</div>;
  }

  // Create a full itinerary with all days (in case we're missing some)
  const totalDays = Math.max(...itinerary.map(d => d.day || 0));
  const fullItinerary = Array.from({ length: totalDays }, (_, i) => {
    const existingDay = itinerary.find(d => d.day === i + 1);
    if (existingDay) return existingDay;
    
    // If we don't have data for this day, create a placeholder
    return {
      day: i + 1,
      title: `Day ${i + 1}`,
      description: "Details for this day will be available soon.",
      activities: ["Flexible time - details coming soon"]
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium mb-2">Day-by-Day Itinerary</h3>
        <div className="space-y-4">
          {fullItinerary.map((day, dayIndex) => (
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
                  <div className="flex items-start space-x-2">
                    <span className="text-primary mt-0.5 text-xs">•</span>
                    <span className="text-sm text-gray-500">
                      Activities to be determined based on your preferences and local conditions
                    </span>
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