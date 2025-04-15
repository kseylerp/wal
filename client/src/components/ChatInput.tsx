import { useState, useRef, useEffect, FormEvent } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export default function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;
    
    onSendMessage(message);
    setMessage("");
    
    // Reset height after sending
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize the textarea
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    
    // Add scrollbar if exceeds max height
    if (textarea.scrollHeight > 150) {
      textarea.style.overflowY = "auto";
    } else {
      textarea.style.overflowY = "hidden";
    }
  };

  // Autosize the textarea on mount if there's text
  useEffect(() => {
    if (textareaRef.current && message) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [message]);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 p-4">
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            className="w-full border border-neutral-300 rounded-xl py-3 pl-4 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="Send a message..."
            rows={1}
            disabled={isLoading}
          />
          <button
            type="submit"
            className={`absolute right-3 bottom-2.5 text-white bg-primary rounded-full p-1.5 flex items-center justify-center ${
              isLoading || !message.trim()
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-primary/90"
            }`}
            disabled={isLoading || !message.trim()}
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
        <div className="mt-2 text-center text-xs text-neutral-500">
          TripChat uses AI to help plan adventures. Your conversation may be reviewed to improve our services.
        </div>
      </div>
    </div>
  );
}
