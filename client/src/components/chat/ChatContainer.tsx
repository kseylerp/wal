import React, { useState } from 'react';
import { Message } from '@/types/chat';
import MessageBubble from './MessageBubble';
import ThinkingIndicator from './ThinkingIndicator';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import hikerImage from '@/assets/hiker_mountain.png';
import { useIsMobile } from '@/hooks/use-mobile';
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
  const isMobile = useIsMobile();
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
      <div className="chat-container flex-1 overflow-y-auto p-3 sm:p-4 sm:px-6 space-y-4 sm:space-y-6">
        {/* Title when no messages */}
        {messages.length === 0 && (
          <div className={`${isMobile ? 'flex-col' : 'flex justify-between'} items-center h-full ${isMobile ? 'px-4' : 'px-10'}`}>
            <div className={`flex-shrink-0 ${isMobile ? 'max-w-full text-center mb-6' : 'max-w-md pr-8 text-left'}`}>
              <h1 className={`font-jost ${isMobile ? 'text-[40px] leading-[42px]' : 'text-[70px] leading-[65px]'} text-gray-800 font-black mb-3`}>
                GO BEYOND<br />THE POST
              </h1>
              <h2 className={`font-jost ${isMobile ? 'text-[20px] leading-[24px]' : 'text-[30px] leading-[36px]'} text-gray-800 font-semibold`}>
                Meet <span className="text-[#FB8C9A]">Wally</span>: powered by local guides.
              </h2>
            </div>
            <div className={`flex-shrink-0 ${isMobile ? '' : 'pl-4'}`}>
              <img 
                src={hikerImage} 
                alt="Hiker on mountain trail" 
                className={`rounded-lg ${isMobile ? 'h-[240px]' : 'h-[380px]'} w-auto object-cover shadow-lg`}
              />
            </div>
          </div>
        )}
        
        {messages.length > 0 && (
          <div className="flex flex-col gap-4 sm:gap-6">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onShowThinking={() => handleShowThinking(message.thinking)}
                onModifyRequest={onModifyRequest}
              />
            ))}
          </div>
        )}
        
        {/* Thinking indicator */}
        {thinking.isActive && (
          <div className="mt-2">
            <ThinkingIndicator thinking={thinking} />
          </div>
        )}
        
        {/* Invisible element to help with scrolling to latest message 
             Positioned after the last message to ensure it scrolls to show the newest message */}
        <div ref={messagesEndRef} className="h-12" />
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
