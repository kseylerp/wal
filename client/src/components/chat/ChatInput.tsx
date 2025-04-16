import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, MicOff, Mic, AudioWaveform } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isDisabled: boolean;
}

// Define the SpeechRecognition interface for TypeScript
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

// This ensures TypeScript recognizes the global SpeechRecognition object
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isDisabled }) => {
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Check if speech recognition is supported by the browser
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
    } else {
      console.warn('Speech recognition not supported in this browser');
    }
  }, []);

  // Initialize speech recognition
  const initializeSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;
    
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    // Handle speech recognition results
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const results = Array.from(event.results);
      const transcript = results
        .map((result: SpeechRecognitionResult) => result[0])
        .map((result: SpeechRecognitionAlternative) => result.transcript)
        .join('');
      
      setMessage(transcript);
      
      // Auto-resize textarea with new content
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
      
      // If the last result is final (user stopped speaking), auto-send after a short delay
      const lastResult = results[results.length - 1];
      if (lastResult.isFinal && transcript.trim().length > 0) {
        // Stop recognition first
        recognition.stop();
        
        // Short delay before sending to allow user to see what was transcribed
        setTimeout(() => {
          if (transcript.trim()) {
            onSendMessage(transcript);
            setMessage('');
            setIsListening(false);
          }
        }, 1500);
      }
    };
    
    // Handle speech recognition errors
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };
    
    // Handle when speech recognition ends
    recognition.onend = () => {
      if (isListening) {
        // If we're still supposed to be listening, restart it
        // (it can end automatically after silence)
        recognition.start();
      }
    };
    
    return recognition;
  };

  // Auto-resize textarea as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);
  
  // Toggle speech recognition on/off
  const toggleListening = () => {
    if (isDisabled) return;
    
    if (isListening) {
      // Stop listening
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      setIsListening(false);
    } else {
      // Start listening
      const recognition = initializeSpeechRecognition();
      if (recognition) {
        recognition.start();
        recognitionRef.current = recognition;
        setIsListening(true);
      }
    }
  };

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

  // Cleanup effect for speech recognition
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, []);

  return (
    <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200 p-3 sm:p-4 shadow-[0_0_10px_0_rgba(0,0,0,0.05)]">
      <form onSubmit={handleSubmit} className="flex items-center space-x-3 max-w-4xl mx-auto">
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about adventures or modify trip suggestions..."
            disabled={isDisabled || isListening}
            rows={1}
            className={`w-full border border-gray-300 rounded-xl py-3 px-4 pr-8 focus:ring-2 focus:ring-[#655590] focus:border-[#655590] resize-none overflow-hidden text-gray-900 
              ${isListening ? 'bg-pink-50 border-pink-300' : ''}`}
          />
          {isListening && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
              <span className="animate-pulse flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-[#FB8C9A] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FB8C9A]"></span>
              </span>
              <span className="text-xs text-[#FB8C9A] font-medium">Listening...</span>
            </div>
          )}
        </div>
        
        {/* Voice input button */}
        {speechSupported && (
          <button
            type="button"
            onClick={toggleListening}
            disabled={isDisabled}
            className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full text-white 
              ${isListening ? 'bg-[#FB8C9A] hover:bg-[#FB8C9A]/90' : 'bg-[#8C76C7] hover:bg-[#8C76C7]/90'} 
              ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#655590] transition-colors duration-150 ease-in-out shadow-md`}
            aria-label={isListening ? "Stop voice input" : "Start voice input"}
          >
            {isListening ? <MicOff className="h-5 w-5" /> : <AudioWaveform className="h-5 w-5" />}
          </button>
        )}
        
        {/* Send button */}
        <button
          type="submit"
          disabled={isDisabled || !message.trim()}
          className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-[#655590] text-white shadow-md
            ${isDisabled || !message.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#655590]/90'}
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#655590] transition-colors duration-150 ease-in-out`}
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
