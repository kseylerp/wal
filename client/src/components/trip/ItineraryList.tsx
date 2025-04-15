import React from 'react';
import { ItineraryListProps } from '@/types/trip';

const ItineraryList: React.FC<ItineraryListProps> = ({ itinerary, suggestedGuides }) => {
  return (
    <div className="mt-4 border-t border-gray-200 pt-4">
      <h4 className="font-medium text-gray-900 mb-2">Detailed Itinerary</h4>
      <ul className="space-y-3 text-sm text-gray-700">
        {itinerary.map((day) => (
          <li key={day.day} className="flex">
            <span className="text-primary font-medium mr-2">
              Day {day.day}:
            </span>
            <span>{day.description}</span>
          </li>
        ))}
      </ul>
      
      {suggestedGuides.length > 0 && (
        <>
          <h4 className="font-medium text-gray-900 mt-4 mb-2">Recommended Guides</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            {suggestedGuides.map((guide, index) => (
              <li key={index}>• {guide}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default ItineraryList;
