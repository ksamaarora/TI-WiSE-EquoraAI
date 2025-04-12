import React, { createContext, useContext, useState, useEffect } from 'react';

// TypeScript definitions for SpeechRecognition API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal?: boolean;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

class SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

interface AccessibilityContextType {
  // Theme
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  
  // Font size
  fontSize: 'normal' | 'large' | 'x-large';
  setFontSize: (size: 'normal' | 'large' | 'x-large') => void;
  
  // Contrast
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
  
  // Text to speech
  speakText: (text: string) => void;
  isSpeaking: boolean;
  stopSpeaking: () => void;
  
  // Navigation voice
  navigationVoice: boolean;
  setNavigationVoice: (enabled: boolean) => void;
  
  // Speech to text
  startListening: () => void;
  stopListening: () => void;
  isListening: boolean;
  transcript: string;
  resetTranscript: () => void;
  
  // Language
  language: string;
  setLanguage: (lang: string) => void;
  translate: (text: string, targetLang: string) => Promise<string>;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>('system');
  
  // Font Size
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'x-large'>('normal');
  
  // High Contrast
  const [highContrast, setHighContrast] = useState(false);
  
  // Text to Speech
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Navigation Voice
  const [navigationVoice, setNavigationVoice] = useState(false);
  
  // Speech to Text
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  // Language
  const [language, setLanguage] = useState('en');
  
  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement;
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.remove('light', 'dark');
      root.classList.add(systemTheme);
    } else {
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
    }
  }, [theme]);
  
  // Apply font size to document
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('text-normal', 'text-large', 'text-x-large');
    root.classList.add(`text-${fontSize}`);
  }, [fontSize]);
  
  // Apply high contrast to document
  useEffect(() => {
    const root = window.document.documentElement;
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  }, [highContrast]);
  
  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);
  
  // Text to speech function
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any previous speaking
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
      
      // Store the utterance in window for stopping later
      window.currentUtterance = utterance;
    }
  };
  
  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      // Force clear all utterances
      window.speechSynthesis.cancel();
      // Reset the speaking state
      setIsSpeaking(false);
    }
  };
  
  // Speech to text functions
  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognitionAPI();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onresult = (event) => {
        const currentTranscript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        
        setTranscript(currentTranscript);
      };
      
      recognition.onerror = () => {
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.start();
      
      // Store the recognition instance for stopping later
      window.currentRecognition = recognition;
    }
  };
  
  const stopListening = () => {
    if (window.currentRecognition) {
      window.currentRecognition.stop();
      setIsListening(false);
    }
  };
  
  const resetTranscript = () => {
    setTranscript('');
  };
  
  // Function to set theme with localStorage
  const setTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };
  
  // Translation function using LibreText API (mock implementation for now)
  const translate = async (text: string, targetLang: string): Promise<string> => {
    try {
      // In a real implementation, you would call the LibreText API here
      // This is a mock implementation
      const response = await fetch('https://api.libretext.org/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          targetLang,
        }),
      });
      
      const data = await response.json();
      return data.translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Return original text on error
    }
  };
  
  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    if (savedTheme) {
      setThemeState(savedTheme);
    }
  }, []);
  
  const value = {
    theme,
    setTheme,
    fontSize,
    setFontSize,
    highContrast,
    setHighContrast,
    speakText,
    isSpeaking,
    stopSpeaking,
    navigationVoice,
    setNavigationVoice,
    startListening,
    stopListening,
    isListening,
    transcript,
    resetTranscript,
    language,
    setLanguage,
    translate,
  };
  
  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};

// Create a custom hook to use the accessibility context
export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

// Add TypeScript support for webkitSpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
    currentRecognition?: SpeechRecognition;
    currentUtterance?: SpeechSynthesisUtterance;
  }
} 