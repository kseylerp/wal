import React, { useState, useEffect } from 'react';
import { Thinking } from '@/types/chat';

interface ThinkingIndicatorProps {
  thinking: Thinking;
}

const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({ thinking }) => {
  if (!thinking.isActive) return null;
  
  const [thinkingSteps, setThinkingSteps] = useState<string[]>([]);
  const allThinkingSteps = [
    "Analyzing travel preferences...",
    "Researching off-the-beaten-path destinations...",
    "Finding alternatives to crowded tourist spots...",
    "Checking seasonal recommendations...",
    "Calculating optimal travel routes...",
    "Identifying local insider experiences...",
    "Consulting weather patterns...",
    "Finding authentic accommodations...",
    "Evaluating local guide options...",
    "Planning outdoor activities based on timing...",
    "Checking for sustainable travel options...",
    "Finding hidden scenic viewpoints...",
    "Preparing map visualization...",
    "Formatting detailed itinerary..."
  ];
  
  useEffect(() => {
    if (thinking.isActive) {
      const interval = setInterval(() => {
        setThinkingSteps(prevSteps => {
          if (prevSteps.length < 5) {
            const availableSteps = allThinkingSteps.filter(step => !prevSteps.includes(step));
            const randomIndex = Math.floor(Math.random() * availableSteps.length);
            return [...prevSteps, availableSteps[randomIndex]];
          }
          return prevSteps;
        });
      }, 2000);
      
      return () => clearInterval(interval);
    } else {
      setThinkingSteps([]);
    }
  }, [thinking.isActive]);

  return (
    <div className="ai-message bg-white p-4 max-w-[85%] sm:max-w-[75%] md:max-w-[65%] lg:max-w-[60%] shadow-sm border border-gray-100 rounded-[1.25rem] rounded-bl-[0.25rem]">
      <div className="flex items-start space-x-2">
        <div className="w-8 h-8 bg-primary rounded-full flex-shrink-0 flex items-center justify-center">
          <span className="text-white text-sm font-semibold">AI</span>
        </div>
        <div className="w-full">
          <div className="flex items-center space-x-1 mb-2">
            <div className="text-sm font-medium text-gray-700">Planning your trip</div>
            <div className="flex space-x-1 ml-2">
              <div className="message-dot w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
              <div className="message-dot w-1.5 h-1.5 bg-primary rounded-full animate-pulse delay-100"></div>
              <div className="message-dot w-1.5 h-1.5 bg-primary rounded-full animate-pulse delay-200"></div>
            </div>
          </div>
          
          <div className="px-3 py-2 bg-gray-50 rounded-lg">
            {thinking.content ? (
              <p className="text-sm text-gray-700">{thinking.content}</p>
            ) : (
              <div className="space-y-2">
                {thinkingSteps.map((step, index) => (
                  <div key={index} className="flex items-start space-x-2 text-sm text-gray-600">
                    <span className="text-primary">✓</span>
                    <span>{step}</span>
                  </div>
                ))}
                <div className="h-5 w-full bg-gray-100 rounded animate-pulse mt-2"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThinkingIndicator;
