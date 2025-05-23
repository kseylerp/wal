import { useState, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChatState, Message, TripData } from '../types/chat';
import { sendChatMessage, parseTripsFromResponse } from '../lib/openai';

export function useChat() {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    thinking: {
      isActive: false,
      content: '',
    },
    isWaitingForResponse: false,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      // Scroll to bottom with a better view of the new message at the top of viewport
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      // For mobile devices, sometimes we need to force scroll after a short delay
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 200);
    }
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || chatState.isWaitingForResponse) return;

    // Add user message to chat
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    setChatState((prevState) => ({
      ...prevState,
      messages: [...prevState.messages, userMessage],
      isWaitingForResponse: true,
    }));

    // Scroll to bottom after adding user message
    setTimeout(scrollToBottom, 100);

    try {
      // Start thinking state
      setChatState((prevState) => ({
        ...prevState,
        thinking: {
          isActive: true,
          content: 'Analyzing your request...',
        },
      }));

      // Scroll to show thinking indicator
      setTimeout(scrollToBottom, 100);

      // Send to API
      const response = await sendChatMessage(chatState.messages, content);
      
      // Parse trips from response if available
      const tripData = parseTripsFromResponse(response);

      // Add AI response to chat
      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: response.answer,
        thinking: response.thinking || '',
        timestamp: new Date().toISOString(),
        tripData,
      };

      setChatState((prevState) => ({
        ...prevState,
        messages: [...prevState.messages, assistantMessage],
        thinking: {
          isActive: false,
          content: '',
        },
        isWaitingForResponse: false,
      }));

      // Scroll to bottom after adding AI response
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: "I'm sorry, but I encountered an error processing your request. Please try again.",
        timestamp: new Date().toISOString(),
      };

      setChatState((prevState) => ({
        ...prevState,
        messages: [...prevState.messages, errorMessage],
        thinking: {
          isActive: false,
          content: '',
        },
        isWaitingForResponse: false,
      }));

      // Scroll to bottom after adding error message
      setTimeout(scrollToBottom, 100);
    }
  }, [chatState.messages, chatState.isWaitingForResponse, scrollToBottom]);

  const requestTripModification = useCallback((tripId: string) => {
    // Generate a prompt to modify the specified trip
    sendMessage(`I'd like to modify the trip with ID ${tripId}. Please help me refine it.`);
  }, [sendMessage]);

  return {
    chatState,
    sendMessage,
    messagesEndRef,
    requestTripModification,
  };
}
