import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isDisabled: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isDisabled }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isDisabled) {
      onSendMessage(message);
      setMessage('');
      // Reset height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200 p-3 sm:p-4 shadow-[0_0_10px_0_rgba(0,0,0,0.05)]">
      <form onSubmit={handleSubmit} className="flex items-end space-x-2 max-w-4xl mx-auto">
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about adventures or modify trip suggestions..."
            disabled={isDisabled}
            rows={1}
            className="w-full border border-gray-300 rounded-xl py-3 px-4 focus:ring-2 focus:ring-gray-700 focus:border-gray-700 resize-none overflow-hidden text-gray-900"
          />
        </div>
        <button
          type="submit"
          disabled={isDisabled || !message.trim()}
          className={`flex-shrink-0 bg-gray-700 p-2.5 rounded-xl text-white ${
            isDisabled || !message.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700 transition-colors duration-150 ease-in-out`}
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
