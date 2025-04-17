import React from 'react';
import { Message } from '@/types/chat';
import TripCard from '../trip/TripCard';
import { formatThinking } from '@/lib/openai';
import { useIsMobile } from '@/hooks/use-mobile';

interface MessageBubbleProps {
  message: Message;
  onShowThinking?: () => void;
  onModifyRequest: (tripId: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  onShowThinking,
  onModifyRequest 
}) => {
  const isMobile = useIsMobile();
  const isAiMessage = message.role === 'assistant';
  const hasThinking = Boolean(message.thinking);
  const hasTripData = Boolean(message.tripData && message.tripData.length > 0);

  const formatMessageContent = (content: string) => {
    return content.split('\n').map((line, index) => (
      <div key={index} className="inline">
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </div>
    ));
  };

  if (isAiMessage) {
    return (
      <div className={`ai-message bg-white ${isMobile ? 'p-3' : 'p-4'} max-w-[95%] sm:max-w-[75%] md:max-w-[65%] lg:max-w-[100%] shadow-sm border border-gray-100 rounded-[1.25rem] rounded-bl-[0.25rem]`}>
        <div className={`flex items-start ${isMobile ? 'space-x-1.5' : 'space-x-2'}`}>
          <div className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} bg-[#655590] flex-shrink-0 flex items-center justify-center rounded-full`}>
            <span className={`text-white ${isMobile ? 'text-xs' : 'text-sm'} font-semibold`}>AI</span>
          </div>
          <div className={`w-full ${hasTripData ? 'max-w-full' : ''}`}>
            <div className={`text-gray-800 ${isMobile ? 'text-sm' : ''}`}>
              {formatMessageContent(message.content)}
            </div>
            
            {hasThinking && (
              <button 
                onClick={onShowThinking}
                className={`${isMobile ? 'mt-1 text-[10px]' : 'mt-2 text-xs'} text-gray-700 hover:text-gray-900 underline`}
              >
                View thinking process
              </button>
            )}

            {/* Render trip cards if available */}
            {hasTripData && message.tripData && (
              <>
                <div className={`flex flex-col items-center w-full ${isMobile ? 'gap-4 mt-3' : 'gap-6 mt-4'}`}>
                  {message.tripData.map(trip => (
                    <div key={trip.id} className={`${isMobile ? 'w-full' : 'w-[90%]'} max-w-7xl`}>
                      <TripCard
                        id={trip.id}
                        title={trip.title}
                        description={trip.description}
                        whyWeChoseThis={trip.whyWeChoseThis}
                        difficultyLevel={trip.difficultyLevel}
                        priceEstimate={trip.priceEstimate}
                        duration={trip.duration}
                        location={trip.location}
                        mapCenter={trip.mapCenter}
                        journey={trip.journey}
                        itinerary={trip.itinerary}
                        createdAt={new Date().toISOString()}
                        // Added fields
                        themes={trip.themes}
                        bestSeasons={trip.bestSeasons}
                        recommendedMonths={trip.recommendedMonths}
                        weather={trip.weather}
                        historical={trip.historical}
                        intensity={trip.difficultyLevel}
                        recommendedOutfitters={trip.recommendedOutfitters}
                        notes={trip.notes}
                        warnings={trip.warnings}
                        activities={trip.activities}
                        priceRange={trip.priceRange}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className={`user-message ml-auto ${isMobile ? 'p-3 text-sm' : 'p-4'} max-w-[95%] sm:max-w-[75%] md:max-w-[65%] lg:max-w-[60%] bg-[#655590] rounded-[1.25rem] rounded-br-[0.25rem]`}>
        <div className="text-white">
          {formatMessageContent(message.content)}
        </div>
      </div>
    );
  }
};

export default MessageBubble;
