import { useRef, useEffect } from "react";
import MessageItem from "./ChatMessage";
import { ChatMessage } from "@/lib/types";

interface ChatContainerProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

export default function ChatContainer({ messages, isLoading }: ChatContainerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <main className="flex-1 overflow-y-auto px-4 pb-20 pt-4 max-w-3xl mx-auto w-full">
      <div className="space-y-6" id="chat-messages">
        {messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}
        
        {isLoading && (
          <div className="flex items-center justify-center h-12 mb-4">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-primary/30 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </main>
  );
}
