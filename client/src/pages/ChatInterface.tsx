import React from 'react';
import { Settings, Map } from 'lucide-react';
import ChatContainer from '@/components/chat/ChatContainer';
import ChatInput from '@/components/chat/ChatInput';
import { useChat } from '@/hooks/useChat';
import { LogoFull } from '@/components/ui/Logo';
import { Link } from 'wouter';

const ChatInterface: React.FC = () => {
  const { chatState, sendMessage, messagesEndRef, requestTripModification } = useChat();

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-3 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-[0_0_10px_0_rgba(0,0,0,0.05)]">
        <Link href="/">
          <a className="cursor-pointer">
            <LogoFull />
          </a>
        </Link>
        <div className="flex items-center space-x-4">
          <Link href="/map-test">
            <a className="flex items-center gap-2 text-secondary hover:text-primary transition-all px-3 py-1.5 rounded-md hover:bg-gray-50">
              <Map className="h-4 w-4" />
              <span className="hidden sm:inline">View Map</span>
            </a>
          </Link>
          <button 
            className="p-2 rounded-full hover:bg-gray-100" 
            aria-label="Settings"
          >
            <Settings className="h-5 w-5 text-gray-600" />
          </button>
        </div>
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
