import React, { useState } from 'react';
import { Message } from '@/types/chat';
import MessageBubble from './MessageBubble';
import ThinkingIndicator from './ThinkingIndicator';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import hikerImage from '@/assets/hiker_mountain.png';
// Create local formatThinking function
const formatThinking = (thinking: string): string => {
  if (!thinking) return '';
  return thinking.replace(/\n/g, '<br />');
};

interface ChatContainerProps {
  messages: Message[];
  thinking: {
    isActive: boolean;
    content: string;
  };
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onModifyRequest: (tripId: string) => void;
}

const ChatContainer: React.FC<ChatContainerProps> = ({ 
  messages, 
  thinking, 
  messagesEndRef,
  onModifyRequest
}) => {
  const [thinkingDialog, setThinkingDialog] = useState<{
    isOpen: boolean;
    content: string;
  }>({
    isOpen: false,
    content: '',
  });

  const handleShowThinking = (thinking: string | undefined) => {
    if (thinking) {
      setThinkingDialog({
        isOpen: true,
        content: thinking,
      });
    }
  };

  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      <div className="chat-container flex-1 overflow-y-auto p-4 sm:px-6 space-y-6">
        {/* Title when no messages */}
        {messages.length === 0 && (
          <div className="flex justify-between items-center h-full px-6">
            <div className="flex-shrink-0 max-w-sm">
              <h1 className="font-jost text-[70px] leading-[65px] text-gray-800 text-left font-black mb-6">
                GO BEYOND<br />THE POST
              </h1>
            </div>
            <div className="flex-shrink-0 ml-8">
              <img 
                src={hikerImage} 
                alt="Hiker on mountain trail" 
                className="rounded-lg h-[400px] w-auto object-cover shadow-lg"
              />
            </div>
          </div>
        )}
        
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onShowThinking={() => handleShowThinking(message.thinking)}
            onModifyRequest={onModifyRequest}
          />
        ))}
        
        {/* Thinking indicator */}
        <ThinkingIndicator thinking={thinking} />
        
        {/* Invisible element to help with scrolling to bottom */}
        <div ref={messagesEndRef} />
      </div>

      {/* Thinking dialog */}
      <Dialog open={thinkingDialog.isOpen} onOpenChange={(open) => setThinkingDialog(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">AI Thinking Process</h3>
            <div className="text-sm text-gray-700 whitespace-pre-wrap">
              {thinkingDialog.content.split('\n').map((line, i) => {
                return (
                  <div key={i}>
                    {line}
                    {i < thinkingDialog.content.split('\n').length - 1 && <br />}
                  </div>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default ChatContainer;
