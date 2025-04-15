import { useState, useEffect } from "react";
import AppHeader from "@/components/AppHeader";
import ChatContainer from "@/components/ChatContainer";
import ChatInput from "@/components/ChatInput";
import { ChatMessage } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { nanoid } from "nanoid";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: nanoid(),
      role: "assistant",
      content: "Welcome to TripChat! Tell me about your dream adventure, and I'll help you plan it. Just describe where you'd like to go and what activities interest you.",
      timestamp: Date.now(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const { toast } = useToast();
  
  // Create or retrieve a session ID for this user
  useEffect(() => {
    // Check if a session ID exists in localStorage
    let existingSessionId = localStorage.getItem('tripChatSessionId');
    
    // If no session ID exists, create one
    if (!existingSessionId) {
      existingSessionId = nanoid();
      localStorage.setItem('tripChatSessionId', existingSessionId);
    }
    
    setSessionId(existingSessionId);
  }, []);

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      return apiRequest("POST", "/api/chat", { message, sessionId });
    },
    onSuccess: async (response) => {
      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          id: nanoid(),
          role: "assistant",
          content: data.content,
          timestamp: Date.now(),
        },
      ]);
      setIsLoading(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to send message: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
      setIsLoading(false);
    },
  });

  const handleSendMessage = (message: string) => {
    if (!message.trim()) return;
    
    const newMessage: ChatMessage = {
      id: nanoid(),
      role: "user",
      content: message,
      timestamp: Date.now(),
    };
    
    setMessages((prev) => [...prev, newMessage]);
    setIsLoading(true);
    sendMessageMutation.mutate(message);
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50">
      <AppHeader title="TripChat" />
      <ChatContainer messages={messages} isLoading={isLoading} />
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
}
