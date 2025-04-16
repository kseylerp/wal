import React from 'react';
import { Thinking } from '@/types/chat';

interface ThinkingIndicatorProps {
  thinking: Thinking;
}

const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({ thinking }) => {
  if (!thinking.isActive) return null;

  return (
    <div className="ai-message bg-white p-4 max-w-[85%] sm:max-w-[75%] md:max-w-[65%] lg:max-w-[60%] shadow-sm border border-gray-100 rounded-[1.25rem] rounded-bl-[0.25rem]">
      <div className="flex items-start space-x-2">
        <div className="w-8 h-8 bg-primary rounded-full flex-shrink-0 flex items-center justify-center">
          <span className="text-white text-sm font-semibold">AI</span>
        </div>
        <div>
          <div className="flex items-center space-x-1 mb-2">
            <div className="text-sm font-medium text-gray-700">Thinking</div>
            <div className="flex space-x-1 ml-2">
              <div className="message-dot w-1.5 h-1.5 bg-primary rounded-full"></div>
              <div className="message-dot w-1.5 h-1.5 bg-primary rounded-full"></div>
              <div className="message-dot w-1.5 h-1.5 bg-primary rounded-full"></div>
            </div>
          </div>
          {thinking.content && (
            <div className="px-3 py-2 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">{thinking.content}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThinkingIndicator;
