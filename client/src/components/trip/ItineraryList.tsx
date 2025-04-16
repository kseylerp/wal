import React, { useState } from 'react';
import { ItineraryListProps } from '@/types/trip';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';

// Define the coordinates type
type Coordinates = [number, number][];

/**
 * ItineraryList displays the day-by-day itinerary for a trip
 * It shows each day's activities and details with interactive features
 * that control the map view when clicked or hovered
 */
const ItineraryList: React.FC<ItineraryListProps> = ({ 
  itinerary, 
  suggestedGuides, 
  onActivityClick,
  onActivityHover,
  journey
}) => {
  // Function to extract coordinates from journey segments based on activity name
  const getCoordinatesForActivity = (activityName: string): Coordinates => {
    if (!journey?.segments || !activityName) return [];
    
    // Look for segments that might match this activity
    const segment = journey.segments.find(seg => 
      seg.from?.toLowerCase().includes(activityName.toLowerCase()) || 
      activityName.toLowerCase().includes(seg.from?.toLowerCase() || '') ||
      seg.to?.toLowerCase().includes(activityName.toLowerCase()) ||
      activityName.toLowerCase().includes(seg.to?.toLowerCase() || '')
    );
    
    if (segment?.geometry?.coordinates) {
      return segment.geometry.coordinates as Coordinates;
    }
    
    return [];
  };
  
  // Function to handle click on activity
  const handleActivityClick = (text: string) => {
    if (onActivityClick) {
      const coords = getCoordinatesForActivity(text);
      onActivityClick(text, coords);
    }
  };
  
  // Function to handle hover on activity
  const handleActivityHover = (text: string, isHovering: boolean) => {
    if (onActivityHover) {
      onActivityHover(text, isHovering);
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium mb-2">Day-by-Day Itinerary</h3>
        <div className="space-y-4">
          {itinerary.map((day) => (
            <div key={day.day} className="border-l-2 border-primary/30 pl-4">
              <h4 className="font-medium">Day {day.day}: {day.title}</h4>
              <p className="text-gray-600 text-sm mb-2">{day.description}</p>
              <div className="space-y-1">
                {day.activities.map((activity, index) => {
                  // Check if activity has details (contains a colon)
                  const hasDetails = activity.includes(':');
                  const activityTitle = hasDetails ? activity.split(':')[0].trim() : activity;
                  const activityDetails = hasDetails ? activity.split(':').slice(1).join(':').trim() : '';

                  // Find if this activity matches a segment name
                  const isInteractive = onActivityClick && onActivityHover;
                  
                  // Determine if elevation data can be extracted
                  const elevationMatch = activityDetails.match(/(?:elevation|altitude)[:\s]+(\d+)(?:\s*-\s*(\d+))?\s*(?:ft|feet|meters|m)/i);
                  const hasElevationData = elevationMatch !== null;
                  
                  return hasDetails ? (
                    <Accordion 
                      key={index} 
                      type="single" 
                      collapsible 
                      className="border-0 mb-1"
                    >
                      <AccordionItem value={`activity-${index}`} className="border-0">
                        <AccordionTrigger 
                          className="py-1 pr-0 hover:no-underline group"
                          onClick={(e) => {
                            // Prevent the accordion from toggling when clicking with intent to focus on map
                            if (onActivityClick) {
                              e.preventDefault();
                              e.stopPropagation();
                              handleActivityClick(activityTitle);
                            }
                          }}
                        >
                          <div 
                            className="flex items-start text-left w-full"
                            onMouseEnter={() => handleActivityHover(activityTitle, true)}
                            onMouseLeave={() => handleActivityHover(activityTitle, false)}
                          >
                            <span className="text-primary mr-2 mt-0.5 text-xs flex-shrink-0 
                              group-hover:text-blue-600 transition-colors">•</span>
                            <span className="text-sm text-gray-700 font-medium 
                              group-hover:text-blue-700 transition-colors">{activityTitle}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pl-6 text-sm text-gray-600 pt-0">
                          {activityDetails}
                          
                          {/* Show elevation data if available */}
                          {hasElevationData && (
                            <div className="mt-2 text-xs bg-gray-50 p-2 rounded">
                              <span className="font-medium">Elevation: </span>
                              {elevationMatch[2] 
                                ? `${elevationMatch[1]}-${elevationMatch[2]} ft` 
                                : `${elevationMatch[1]} ft`}
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ) : (
                    <div 
                      key={index} 
                      className="flex items-start space-x-2 py-1 group cursor-pointer hover:bg-gray-50 rounded px-1"
                      onClick={() => isInteractive && onActivityClick(activity)}
                      onMouseEnter={() => isInteractive && onActivityHover(activity, true)}
                      onMouseLeave={() => isInteractive && onActivityHover(activity, false)}
                    >
                      <span className="text-primary mt-0.5 text-xs group-hover:text-blue-600 transition-colors">•</span>
                      <span className="text-sm text-gray-700 group-hover:text-blue-700 transition-colors">{activity}</span>
                    </div>
                  );
                })}
              </div>
                
              {day.accommodations && (
                <div 
                  className="flex items-start space-x-2 mt-2 group cursor-pointer hover:bg-gray-50 rounded px-1 py-1"
                  onClick={() => isInteractive && onActivityClick(`Stay: ${day.accommodations}`)}
                  onMouseEnter={() => isInteractive && onActivityHover(`Stay: ${day.accommodations}`, true)}
                  onMouseLeave={() => isInteractive && onActivityHover(`Stay: ${day.accommodations}`, false)}
                >
                  <span className="text-blue-500 mt-0.5 text-xs group-hover:text-blue-600 transition-colors">🏠</span>
                  <span className="text-sm text-gray-700 italic group-hover:text-blue-700 transition-colors">
                    Stay: {day.accommodations}
                  </span>
                </div>
              )}
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