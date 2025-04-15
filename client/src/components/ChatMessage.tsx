import { Bot, User } from "lucide-react";
import { ChatMessage } from "@/lib/types";
import TripCardTabs from "./TripCardTabs";
import { useMemo } from "react";

interface MessageItemProps {
  message: ChatMessage;
}

function extractJSON(text: string): any | null {
  try {
    const jsonRegex = /{[\s\S]*}/g;
    const match = text.match(jsonRegex);
    if (match) {
      const jsonString = match[0];
      return JSON.parse(jsonString);
    }
    return null;
  } catch (error) {
    console.error("Failed to parse JSON from message:", error);
    return null;
  }
}

export default function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === "user";
  
  // Check if the message content contains trip data in JSON format
  const tripData = useMemo(() => {
    if (message.role === "assistant") {
      return extractJSON(message.content);
    }
    return null;
  }, [message.content, message.role]);

  const renderMessageContent = () => {
    // Regular text content (may include HTML formatting like lists)
    const textContent = tripData 
      ? message.content.replace(/{[\s\S]*}/g, '') // Remove JSON if present
      : message.content;
      
    return (
      <>
        <div dangerouslySetInnerHTML={{ __html: textContent }} />
        
        {tripData?.trip && tripData.trip.length > 0 && (
          <div className="mt-6 mb-3">
            <TripCardTabs trips={tripData.trip} />
          </div>
        )}
      </>
    );
  };

  if (isUser) {
    return (
      <div className="flex items-start justify-end mb-4">
        <div className="bg-primary/10 text-neutral-800 rounded-2xl rounded-tr-sm py-3 px-4 max-w-[85%]">
          <p>{message.content}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center ml-2 mt-1">
          <User className="text-neutral-500 h-4 w-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start mb-4">
      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-2 mt-1">
        <Bot className="text-primary h-4 w-4" />
      </div>
      <div className="bg-white shadow-sm rounded-2xl rounded-tl-sm py-3 px-4 max-w-[85%]">
        {renderMessageContent()}
      </div>
    </div>
  );
}
