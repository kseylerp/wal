import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Mic, MicOff } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isDisabled: boolean;
  isVoiceEnabled?: boolean;
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

// This ensures TypeScript recognizes the global SpeechRecognition and SpeechSynthesis objects
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
    speechSynthesis: SpeechSynthesis;
  }
}

// Speech synthesis interfaces
interface SpeechSynthesis {
  pending: boolean;
  speaking: boolean;
  paused: boolean;
  onvoiceschanged: ((this: SpeechSynthesis, ev: Event) => any) | null;
  getVoices(): SpeechSynthesisVoice[];
  speak(utterance: SpeechSynthesisUtterance): void;
  cancel(): void;
  pause(): void;
  resume(): void;
}

interface SpeechSynthesisUtterance extends EventTarget {
  text: string;
  lang: string;
  voice: SpeechSynthesisVoice | null;
  volume: number;
  rate: number;
  pitch: number;
  onstart: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any) | null;
  onend: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any) | null;
  onerror: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any) | null;
  onpause: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any) | null;
  onresume: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any) | null;
  onboundary: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any) | null;
  onmark: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any) | null;
}

interface SpeechSynthesisVoice {
  readonly voiceURI: string;
  readonly name: string;
  readonly lang: string;
  readonly localService: boolean;
  readonly default: boolean;
}

interface SpeechSynthesisEvent extends Event {
  readonly utterance: SpeechSynthesisUtterance;
  readonly charIndex?: number;
  readonly charLength?: number;
  readonly elapsedTime?: number;
  readonly name?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isDisabled }) => {
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [synthSupported, setSynthSupported] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  // Helper function to speak text using Speech Synthesis
  const speak = (text: string, rate = 1) => {
    if (!synthSupported || !window.speechSynthesis) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    // Try to find a female voice if available
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(voice => 
      voice.name.includes('Female') || 
      voice.name.includes('Samantha') || 
      voice.name.includes('Google UK English Female')
    );
    
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }
    
    // Speak the text
    window.speechSynthesis.speak(utterance);
  };

  // Check if speech recognition and synthesis are supported by the browser
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
    } else {
      console.warn('Speech recognition not supported in this browser');
    }
    
    // Check speech synthesis support
    if (window.speechSynthesis) {
      setSynthSupported(true);
      
      // Load voices (they might not be available immediately)
      const loadVoices = () => {
        window.speechSynthesis.getVoices();
      };
      
      loadVoices();
      
      // Chrome loads voices asynchronously
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices;
      }
    } else {
      console.warn('Speech synthesis not supported in this browser');
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
      
      // Speak feedback when stopping
      if (synthSupported) {
        speak("Voice input stopped.");
      }
    } else {
      // Start listening
      const recognition = initializeSpeechRecognition();
      if (recognition) {
        // Speak feedback before starting
        if (synthSupported) {
          // Using a faster rate for system messages
          speak("Hi, I'm wally, your travel assistant. How can I help plan your adventure today?", 1.1);
          
          // Short delay to let the intro finish before starting recognition
          setTimeout(() => {
            recognition.start();
            recognitionRef.current = recognition;
            setIsListening(true);
          }, 2500);
        } else {
          recognition.start();
          recognitionRef.current = recognition;
          setIsListening(true);
        }
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
      <form onSubmit={handleSubmit} className="flex items-end space-x-2 max-w-4xl mx-auto">
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about adventures or modify trip suggestions..."
            disabled={isDisabled || isListening}
            rows={1}
            className={`w-full border border-gray-300 rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#655590] focus:border-[#655590] resize-none overflow-hidden text-gray-900 
              ${isListening ? 'bg-pink-50 border-pink-300' : ''}`}
          />
          {isListening && (
            <div className="absolute right-3 top-3 flex items-center">
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
            className={`flex-shrink-0 p-2.5 rounded-xl text-white 
              ${isListening ? 'bg-[#FB8C9A] hover:bg-[#FB8C9A]/90' : 'bg-gray-400 hover:bg-gray-500'} 
              ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#655590] transition-colors duration-150 ease-in-out`}
            aria-label={isListening ? "Stop voice input" : "Start voice input"}
          >
            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>
        )}
        
        {/* Send button */}
        <button
          type="submit"
          disabled={isDisabled || !message.trim()}
          className={`flex-shrink-0 bg-[#655590] p-2.5 rounded-xl text-white ${
            isDisabled || !message.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#655590]/90'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#655590] transition-colors duration-150 ease-in-out`}
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
