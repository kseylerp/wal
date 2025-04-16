import React, { useState, useEffect } from 'react';
import { MapPin, Settings } from 'lucide-react';
import ChatContainer from '@/components/chat/ChatContainer';
import ChatInput from '@/components/chat/ChatInput';
import { useChat } from '@/hooks/useChat';

const ChatInterface: React.FC = () => {
  const { chatState, sendMessage, messagesEndRef, requestTripModification } = useChat();
  const [hasStartedConversation, setHasStartedConversation] = useState(false);
  
  useEffect(() => {
    // Check if conversation has already started
    if (chatState.messages.length > 0 && !hasStartedConversation) {
      setHasStartedConversation(true);
    }
  }, [chatState.messages, hasStartedConversation]);
  
  // Custom sendMessage handler to track conversation start
  const handleSendMessage = (message: string) => {
    if (!hasStartedConversation) {
      setHasStartedConversation(true);
    }
    sendMessage(message);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header removed as we now have a sidebar */}

      {/* Conditional rendering based on conversation state */}
      {hasStartedConversation ? (
        <>
          {/* Chat Container - shown when conversation has started */}
          <ChatContainer 
            messages={chatState.messages}
            thinking={chatState.thinking}
            messagesEndRef={messagesEndRef}
            onModifyRequest={requestTripModification}
          />

          {/* Chat Input at the bottom */}
          <ChatInput 
            onSendMessage={handleSendMessage}
            isDisabled={chatState.isWaitingForResponse}
          />
        </>
      ) : (
        /* Centered prompt when no conversation */
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-2xl px-4">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Discover Your Next Adventure</h1>
              <p className="text-gray-600">
                Ask about outdoor trips, off-the-beaten-path destinations, or specific activities.
              </p>
            </div>
            <ChatInput 
              onSendMessage={handleSendMessage}
              isDisabled={chatState.isWaitingForResponse}
              isCentered={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
