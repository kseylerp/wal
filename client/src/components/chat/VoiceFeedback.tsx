import React, { useEffect, useRef, useState } from 'react';
import { Message } from '../../types/chat';

interface VoiceFeedbackProps {
  messages: Message[];
  isVoiceEnabled: boolean;
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

declare global {
  interface Window {
    speechSynthesis: SpeechSynthesis;
  }
}

const VoiceFeedback: React.FC<VoiceFeedbackProps> = ({ messages, isVoiceEnabled }) => {
  const lastMessageRef = useRef<string | null>(null);
  const [synthSupported, setSynthSupported] = useState(false);
  
  // Check if speech synthesis is supported
  useEffect(() => {
    if (window.speechSynthesis) {
      setSynthSupported(true);
      
      // Load voices (they might not be available immediately)
      const loadVoices = () => {
        window.speechSynthesis.getVoices();
      };
      
      loadVoices();
      
      // Chrome loads voices asynchronously
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    } else {
      console.warn('Speech synthesis not supported in this browser');
    }
  }, []);
  
  // Helper function to speak text
  const speak = (text: string) => {
    if (!synthSupported || !isVoiceEnabled || !window.speechSynthesis) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
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
  
  // Process messages for speech output
  useEffect(() => {
    if (!isVoiceEnabled || !synthSupported || messages.length === 0) return;
    
    const lastMessage = messages[messages.length - 1];
    
    // Only speak assistant messages that we haven't spoken before
    if (
      lastMessage.role === 'assistant' && 
      lastMessage.content !== lastMessageRef.current
    ) {
      lastMessageRef.current = lastMessage.content;
      
      // Extract a shorter version of the message to speak
      let textToSpeak = lastMessage.content;
      
      // If there's trip data, create a more concise announcement
      if (lastMessage.tripData && lastMessage.tripData.length > 0) {
        const trip = lastMessage.tripData[0];
        textToSpeak = `I've found a great trip idea for you: ${trip.title} in ${trip.location}. ${
          trip.description.split('.')[0]
        }.`;
      } else {
        // For regular messages, limit length for better UX
        // Get first two sentences or 150 chars
        const sentences = textToSpeak.split(/[.!?]/).filter(Boolean);
        if (sentences.length > 2) {
          textToSpeak = sentences.slice(0, 2).join('. ') + '.';
        }
        if (textToSpeak.length > 150) {
          textToSpeak = textToSpeak.substring(0, 150) + '...';
        }
      }
      
      // Speak the text with a small delay to avoid overlapping with UI updates
      setTimeout(() => {
        speak(textToSpeak);
      }, 500);
    }
  }, [messages, isVoiceEnabled, synthSupported]);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);
  
  // This is a non-visual component, so return null
  return null;
};

export default VoiceFeedback;