import React from 'react';
import { ItineraryListProps } from '@/types/trip';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';

/**
 * ItineraryList displays the day-by-day itinerary for a trip
 * It shows each day's activities and details
 */
const ItineraryList: React.FC<ItineraryListProps> = ({ itinerary, suggestedGuides }) => {
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

                  return hasDetails ? (
                    <Accordion 
                      key={index} 
                      type="single" 
                      collapsible 
                      className="border-0 mb-1"
                    >
                      <AccordionItem value={`activity-${index}`} className="border-0">
                        <AccordionTrigger className="py-1 pr-0 hover:no-underline">
                          <div className="flex items-start text-left w-full">
                            <span className="text-primary mr-2 mt-0.5 text-xs flex-shrink-0">•</span>
                            <span className="text-sm text-gray-700 font-medium">{activityTitle}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pl-6 text-sm text-gray-600 pt-0">
                          {activityDetails}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ) : (
                    <div key={index} className="flex items-start space-x-2 py-1">
                      <span className="text-primary mt-0.5 text-xs">•</span>
                      <span className="text-sm text-gray-700">{activity}</span>
                    </div>
                  );
                })}
              </div>
                
              {day.accommodations && (
                <div className="flex items-start space-x-2 mt-2">
                  <span className="text-blue-500 mt-0.5 text-xs">🏠</span>
                  <span className="text-sm text-gray-700 italic">
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