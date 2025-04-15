import React, { useState } from 'react';
import { ItineraryListProps } from '@/types/trip';

// Define filter types
type FilterType = 'all' | 'hotels' | 'restaurants' | 'activities';

const ItineraryList: React.FC<ItineraryListProps> = ({ itinerary, suggestedGuides, onSelectActivity }) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  
  // Function to determine if an activity should be shown based on the current filter
  const shouldShowActivity = (activity: string): boolean => {
    if (activeFilter === 'all') return true;
    
    const activityLower = activity.toLowerCase();
    
    switch (activeFilter) {
      case 'hotels':
        return activityLower.includes('hotel') || 
               activityLower.includes('stay') || 
               activityLower.includes('accommodat') ||
               activityLower.includes('lodge');
      case 'restaurants':
        return activityLower.includes('restaurant') || 
               activityLower.includes('dining') || 
               activityLower.includes('breakfast') || 
               activityLower.includes('lunch') || 
               activityLower.includes('dinner') ||
               activityLower.includes('café') ||
               activityLower.includes('cafe') ||
               activityLower.includes('food');
      case 'activities':
        return !activityLower.includes('hotel') && 
               !activityLower.includes('stay') && 
               !activityLower.includes('accommodat') &&
               !activityLower.includes('lodge') &&
               !activityLower.includes('restaurant') && 
               !activityLower.includes('dining') && 
               !activityLower.includes('breakfast') && 
               !activityLower.includes('lunch') && 
               !activityLower.includes('dinner') &&
               !activityLower.includes('café') &&
               !activityLower.includes('cafe') &&
               !activityLower.includes('food');
      default:
        return true;
    }
  };
  
  return (
    <div className="mt-4 border-t border-gray-200 pt-4">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-medium text-gray-900">Detailed Itinerary</h4>
        
        {/* Filter buttons */}
        <div className="flex space-x-1 text-xs">
          <FilterButton 
            active={activeFilter === 'all'} 
            onClick={() => setActiveFilter('all')}
            label="All"
          />
          <FilterButton 
            active={activeFilter === 'hotels'} 
            onClick={() => setActiveFilter('hotels')}
            label="Hotels"
          />
          <FilterButton 
            active={activeFilter === 'restaurants'} 
            onClick={() => setActiveFilter('restaurants')}
            label="Restaurants"
          />
          <FilterButton 
            active={activeFilter === 'activities'} 
            onClick={() => setActiveFilter('activities')}
            label="Activities"
          />
        </div>
      </div>
      
      {/* Day-by-day itinerary */}
      <div className="space-y-6">
        {itinerary.map((day) => {
          // Filter activities based on the current filter
          const filteredActivities = day.activities.filter(shouldShowActivity);
          
          // Only show days that have activities matching the current filter
          if (activeFilter !== 'all' && filteredActivities.length === 0) {
            return null;
          }
          
          return (
            <div key={day.day} className="pb-4 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center mb-2">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-medium mr-2">
                  {day.day}
                </div>
                <h5 className="font-medium text-gray-900">{day.title}</h5>
              </div>
              
              {day.description && (
                <p className="text-sm text-gray-600 mb-3">{day.description}</p>
              )}
              
              <ul className="space-y-3">
                {filteredActivities.map((activity, idx) => {
                  // Determine activity type icons
                  let icon = '🏋️‍';
                  let duration = '';
                  
                  if (activity.toLowerCase().includes('hotel') || 
                      activity.toLowerCase().includes('stay') || 
                      activity.toLowerCase().includes('accommodat') ||
                      activity.toLowerCase().includes('lodge')) {
                    icon = '🏨';
                  } else if (activity.toLowerCase().includes('restaurant') || 
                            activity.toLowerCase().includes('dining') || 
                            activity.toLowerCase().includes('breakfast') || 
                            activity.toLowerCase().includes('lunch') || 
                            activity.toLowerCase().includes('dinner') ||
                            activity.toLowerCase().includes('café') ||
                            activity.toLowerCase().includes('cafe') ||
                            activity.toLowerCase().includes('food')) {
                    icon = '🍽️';
                  } else if (activity.toLowerCase().includes('visit') || 
                            activity.toLowerCase().includes('tour') || 
                            activity.toLowerCase().includes('museum') || 
                            activity.toLowerCase().includes('explore')) {
                    icon = '🏛️';
                  } else if (activity.toLowerCase().includes('hike') || 
                            activity.toLowerCase().includes('walk') || 
                            activity.toLowerCase().includes('trek')) {
                    icon = '🥾';
                  }
                  
                  // Extract duration information if available
                  const durationMatch = activity.match(/\((\d+)\s*(min|hour|hr)s?.*?\)/i);
                  if (durationMatch) {
                    const value = durationMatch[1];
                    const unit = durationMatch[2].toLowerCase() === 'min' ? 'min' : 'hr';
                    duration = `${value}${unit}`;
                  }
                  
                  return (
                    <li 
                      key={idx} 
                      className="flex items-start p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => onSelectActivity && onSelectActivity(day.day, idx, activity)}
                    >
                      <span className="mr-2 text-lg">{icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{activity}</p>
                        {duration && (
                          <div className="flex items-center mt-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs text-gray-500">{duration}</span>
                          </div>
                        )}
                      </div>
                      <button 
                        className="text-gray-400 hover:text-gray-600"
                        aria-label="More options"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                    </li>
                  );
                })}
              </ul>
              
              {day.accommodations && (
                <div className="mt-3 flex items-center text-sm text-gray-600">
                  <span className="mr-2 text-lg">🏨</span>
                  <span>Stay: {day.accommodations}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {suggestedGuides.length > 0 && (
        <div className="mt-6 bg-gray-50 p-3 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Recommended Guides</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            {suggestedGuides.map((guide, index) => (
              <li key={index} className="flex items-center">
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

// Filter button component
const FilterButton: React.FC<{
  active: boolean;
  onClick: () => void;
  label: string;
}> = ({ active, onClick, label }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1 rounded-full text-xs font-medium ${
      active
        ? 'bg-primary text-white'
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`}
  >
    {label}
  </button>
);

export default ItineraryList;
