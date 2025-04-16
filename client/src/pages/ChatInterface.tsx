import React from 'react';
import ChatContainer from '@/components/chat/ChatContainer';
import ChatInput from '@/components/chat/ChatInput';
import { useChat } from '@/hooks/useChat';

const ChatInterface: React.FC = () => {
  const { chatState, sendMessage, messagesEndRef, requestTripModification } = useChat();

  return (
    <div className="flex flex-col h-screen">
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
