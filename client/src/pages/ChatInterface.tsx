import React, { useState } from 'react';
import ChatContainer from '@/components/chat/ChatContainer';
import ChatInput from '@/components/chat/ChatInput';
import VoiceFeedback from '@/components/chat/VoiceFeedback';
import { useChat } from '@/hooks/useChat';
import { Volume2, VolumeX } from 'lucide-react';

const ChatInterface: React.FC = () => {
  const { chatState, sendMessage, messagesEndRef, requestTripModification } = useChat();
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);

  return (
    <div className="flex flex-col h-screen">
      {/* Voice Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors"
          aria-label={isVoiceEnabled ? "Disable voice feedback" : "Enable voice feedback"}
        >
          {isVoiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
      </div>
      
      {/* Voice Feedback (invisible component) */}
      <VoiceFeedback 
        messages={chatState.messages}
        isVoiceEnabled={isVoiceEnabled}
      />
      
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
        isVoiceEnabled={isVoiceEnabled}
      />
    </div>
  );
};

export default ChatInterface;
