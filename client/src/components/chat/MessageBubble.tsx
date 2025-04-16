import React from 'react';
import { Message } from '@/types/chat';
import TripCard from '../trip/TripCard';
import { formatThinking } from '@/lib/openai';

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
      <div className="ai-message bg-white p-4 max-w-[85%] sm:max-w-[75%] md:max-w-[65%] lg:max-w-[100%] shadow-sm border border-gray-100 rounded-[1.25rem] rounded-bl-[0.25rem]">
        <div className="flex items-start space-x-2">
          <div className="w-8 h-8 bg-[#655590] flex-shrink-0 flex items-center justify-center rounded-full">
            <span className="text-white text-sm font-semibold">AI</span>
          </div>
          <div className={`w-full ${hasTripData ? 'max-w-full' : ''}`}>
            <div className="text-gray-800">
              {formatMessageContent(message.content)}
            </div>
            
            {hasThinking && (
              <button 
                onClick={onShowThinking}
                className="mt-2 text-xs text-primary hover:text-primary/80 underline"
              >
                View thinking process
              </button>
            )}

            {/* Render trip cards if available */}
            {hasTripData && message.tripData && (
              <>
                <div className="mt-4 mb-1 text-xs text-gray-500 text-right italic">
                  Reply in chat to modify these suggestions
                </div>
                <div className="flex flex-col items-center w-full gap-6 mt-4">
                  {message.tripData.map(trip => (
                    <div key={trip.id} className="w-[90%] max-w-7xl">
                      <TripCard
                        id={trip.id}
                        title={trip.title}
                        description={trip.description}
                        whyWeChoseThis={trip.whyWeChoseThis}
                        difficultyLevel={trip.difficultyLevel}
                        priceEstimate={trip.priceEstimate}
                        duration={trip.duration}
                        location={trip.location}
                        suggestedGuides={trip.suggestedGuides}
                        mapCenter={trip.mapCenter}
                        markers={trip.markers}
                        journey={trip.journey}
                        itinerary={trip.itinerary}
                        onModifyRequest={onModifyRequest}
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
      <div className="user-message ml-auto p-4 max-w-[85%] sm:max-w-[75%] md:max-w-[65%] lg:max-w-[60%] rounded-[1.25rem] rounded-br-[0.25rem]">
        <div className="text-white">
          {formatMessageContent(message.content)}
        </div>
      </div>
    );
  }
};

export default MessageBubble;
