import React, { useState } from 'react';
import { ItineraryListProps } from '@/types/trip';
import { Calendar, MapPin, Home, Coffee, ChevronDown, ChevronUp } from 'lucide-react';

const ItineraryList: React.FC<ItineraryListProps> = ({ itinerary, suggestedGuides }) => {
  const [expandedDays, setExpandedDays] = useState<number[]>([]);

  const toggleDayExpand = (dayNumber: number) => {
    if (expandedDays.includes(dayNumber)) {
      setExpandedDays(expandedDays.filter(day => day !== dayNumber));
    } else {
      setExpandedDays([...expandedDays, dayNumber]);
    }
  };

  return (
    <div className="mt-4 border-t border-gray-200 pt-4">
      <div className="flex items-center mb-3">
        <Calendar className="w-5 h-5 text-primary mr-2" />
        <h4 className="font-medium text-gray-900">Detailed Itinerary</h4>
      </div>
      
      <div className="space-y-4">
        {itinerary.map((day) => {
          const isExpanded = expandedDays.includes(day.day);
          
          return (
            <div key={day.day} className="border border-gray-200 rounded-lg overflow-hidden">
              <div 
                className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer"
                onClick={() => toggleDayExpand(day.day)}
              >
                <div className="flex items-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-primary text-white text-xs font-medium rounded-full mr-2">
                    {day.day}
                  </span>
                  <span className="font-medium text-gray-900">{day.title}</span>
                </div>
                
                <button className="text-gray-500 hover:text-gray-700 p-1">
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
              
              {isExpanded && (
                <div className="p-3 text-sm">
                  <p className="text-gray-700 mb-3">{day.description}</p>
                  
                  {day.activities.length > 0 && (
                    <div className="mb-3">
                      <h5 className="font-medium text-gray-900 mb-1 flex items-center">
                        <Coffee className="w-4 h-4 mr-1" />
                        Activities
                      </h5>
                      <ul className="list-disc pl-5 text-gray-700 space-y-1">
                        {day.activities.map((activity, index) => (
                          <li key={index}>{activity}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {day.accommodations && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-1 flex items-center">
                        <Home className="w-4 h-4 mr-1" />
                        Accommodation
                      </h5>
                      <p className="text-gray-700">{day.accommodations}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {suggestedGuides.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center mb-2">
            <MapPin className="w-5 h-5 text-primary mr-2" />
            <h4 className="font-medium text-gray-900">Recommended Guides</h4>
          </div>
          <ul className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 space-y-1">
            {suggestedGuides.map((guide, index) => (
              <li key={index} className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>{guide}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ItineraryList;
