import React from 'react';
import { MapPin, Settings } from 'lucide-react';
import ChatContainer from '@/components/chat/ChatContainer';
import ChatInput from '@/components/chat/ChatInput';
import { useChat } from '@/hooks/useChat';

const ChatInterface: React.FC = () => {
  const { chatState, sendMessage, messagesEndRef, requestTripModification } = useChat();

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-3 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-[0_0_10px_0_rgba(0,0,0,0.05)]">
        <div className="flex items-center space-x-2">
          <span className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <MapPin className="h-5 w-5 text-white" />
          </span>
          <h1 className="text-lg font-semibold">Adventure Trip Planner</h1>
        </div>
        <button 
          className="p-2 rounded-full hover:bg-gray-100" 
          aria-label="Settings"
        >
          <Settings className="h-5 w-5 text-gray-600" />
        </button>
      </header>

      {/* Chat Container */}
      <ChatContainer 
        messages={chatState.messages}
        thinking={chatState.thinking}
        messagesEndRef={messagesEndRef}
        onModifyRequest={requestTripModification}
      />

      {/* Chat Input */}
      <ChatInput 
        onSendMessage={sendMessage}
        isDisabled={chatState.isWaitingForResponse}
      />
    </div>
  );
};

export default ChatInterface;
