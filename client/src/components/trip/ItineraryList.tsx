import React from 'react';
import { ItineraryListProps } from '@/types/trip';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { useIsMobile } from '@/hooks/use-mobile';

/**
 * ItineraryList displays the day-by-day itinerary for a trip
 * It shows each day's activities and details with optimizations for mobile
 */
const ItineraryList: React.FC<ItineraryListProps> = ({ itinerary, suggestedGuides, onActivityClick, onActivityHover, journey }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`space-y-4 ${isMobile ? 'text-sm' : 'space-y-6'}`}>
      <div>
        <h3 className={`font-medium ${isMobile ? 'text-base mb-2' : 'mb-3'}`}>
          Day-by-Day Itinerary
          <span className="text-xs text-gray-500 ml-2">({itinerary.length} days)</span>
        </h3>
        <div className={`${isMobile ? 'space-y-3' : 'space-y-4'}`}>
          {itinerary.map((day) => (
            <div key={day.day} className={`border-l-2 border-[#655590]/30 ${isMobile ? 'pl-3 pb-2' : 'pl-4'}`}>
              <h4 className="font-medium text-[#655590]">
                Day {day.day}: {day.title}
              </h4>
              <p className={`text-gray-600 ${isMobile ? 'text-xs mb-1.5' : 'text-sm mb-2'}`}>
                {day.description}
              </p>
              <div className={isMobile ? 'space-y-0.5' : 'space-y-1'}>
                {day.activities.map((activity, index) => {
                  // Check if activity has details (contains a colon)
                  const hasDetails = activity.includes(':');
                  const activityTitle = hasDetails ? activity.split(':')[0].trim() : activity;
                  const activityDetails = hasDetails ? activity.split(':').slice(1).join(':').trim() : '';

                  // Handle clicking or hovering on an activity
                  const handleClick = () => {
                    if (onActivityClick && journey) {
                      // Find matching coordinates in the journey if possible
                      for (const segment of journey.segments) {
                        if (segment.from.includes(activityTitle) || 
                            segment.to.includes(activityTitle) ||
                            activityTitle.includes(segment.from) || 
                            activityTitle.includes(segment.to)) {
                          onActivityClick(activityTitle, segment.geometry.coordinates as [number, number][]);
                          break;
                        }
                      }
                    }
                  };

                  const handleHover = (isHovering: boolean) => {
                    if (onActivityHover) {
                      onActivityHover(activityTitle, isHovering);
                    }
                  };

                  return hasDetails ? (
                    <Accordion 
                      key={index} 
                      type="single" 
                      collapsible 
                      className="border-0 mb-0.5"
                    >
                      <AccordionItem value={`activity-${index}`} className="border-0">
                        <AccordionTrigger 
                          className={`${isMobile ? 'py-0.5' : 'py-1'} pr-0 hover:no-underline`}
                          onClick={handleClick}
                          onMouseEnter={() => handleHover(true)}
                          onMouseLeave={() => handleHover(false)}
                        >
                          <div className="flex items-start text-left w-full">
                            <span className="text-[#655590] mr-2 mt-0.5 text-xs flex-shrink-0">•</span>
                            <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-700 font-medium`}>
                              {activityTitle}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className={`${isMobile ? 'pl-5 text-xs' : 'pl-6 text-sm'} text-gray-600 pt-0`}>
                          {activityDetails}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ) : (
                    <div 
                      key={index} 
                      className={`flex items-start ${isMobile ? 'space-x-1.5 py-0.5' : 'space-x-2 py-1'}`}
                      onClick={handleClick}
                      onMouseEnter={() => handleHover(true)}
                      onMouseLeave={() => handleHover(false)}
                    >
                      <span className="text-[#655590] mt-0.5 text-xs">•</span>
                      <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-700`}>
                        {activity}
                      </span>
                    </div>
                  );
                })}
              </div>
                
              {day.accommodations && (
                <div className={`flex items-start ${isMobile ? 'space-x-1.5 mt-1.5' : 'space-x-2 mt-2'}`}>
                  <span className="text-blue-500 mt-0.5 text-xs">🏠</span>
                  <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-700 italic`}>
                    Stay: {day.accommodations}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {suggestedGuides && suggestedGuides.length > 0 && (
        <div className={isMobile ? 'mt-2' : ''}>
          <h3 className={`font-medium ${isMobile ? 'text-sm mb-1' : 'mb-2'}`}>
            Suggested Guides & Operators
          </h3>
          <ul className={`list-disc list-inside ${isMobile ? 'text-xs' : 'text-sm'} text-gray-700 pl-1`}>
            {suggestedGuides.map((guide, index) => (
              <li key={index} className={isMobile ? 'mb-0.5' : ''}>
                {guide}
              </li>
            ))}
          </ul>
          <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-gray-500 mt-1`}>
            *Note: These are recommendations only. Make sure to research operators before booking.
          </p>
        </div>
      )}
    </div>
  );
};

export default ItineraryList;