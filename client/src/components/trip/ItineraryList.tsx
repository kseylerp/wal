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
              <Accordion type="multiple" className="w-full space-y-1">
                {day.activities.map((activity, index) => {
                  // Split activity into title and details if it contains a colon
                  const hasDetails = activity.includes(':');
                  const activityTitle = hasDetails ? activity.split(':')[0].trim() : activity;
                  const activityDetails = hasDetails ? activity.split(':').slice(1).join(':').trim() : '';
                  
                  return (
                    <AccordionItem key={index} value={`day-${day.day}-activity-${index}`} className="border-b-0 border-t-0 py-0">
                      <AccordionTrigger className="py-1 hover:no-underline">
                        <div className="flex items-start space-x-2 w-full">
                          <span className="text-primary mt-0.5 text-xs flex-shrink-0">•</span>
                          <span className="text-sm text-gray-700 text-left font-medium">{activityTitle}</span>
                        </div>
                      </AccordionTrigger>
                      {hasDetails && (
                        <AccordionContent className="pl-6 pr-2 pb-1 pt-0 text-sm text-gray-600">
                          {activityDetails}
                        </AccordionContent>
                      )}
                    </AccordionItem>
                  );
                })}
              </Accordion>
                
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