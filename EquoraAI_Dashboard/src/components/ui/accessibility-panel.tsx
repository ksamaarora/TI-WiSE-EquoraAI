import React, { useState, useEffect } from 'react';
import { Accessibility, Moon, Sun, MoonStar, Type, Languages, Mic, Volume2, VolumeX, X } from 'lucide-react';
import { useAccessibility } from '@/lib/accessibility';
import { Button } from './button';
import { Switch } from './switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Slider } from './slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { cn } from '@/lib/utils';

const AccessibilityPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    theme,
    setTheme,
    fontSize,
    setFontSize,
    highContrast,
    setHighContrast,
    isSpeaking,
    stopSpeaking,
    isListening,
    startListening,
    stopListening,
    transcript,
    resetTranscript,
    language,
    setLanguage,
    speakText,
    navigationVoice,
    setNavigationVoice
  } = useAccessibility();

  // Listen for toggle events from the header button
  useEffect(() => {
    const handleToggleEvent = () => {
      setIsOpen(prevState => !prevState);
    };

    document.addEventListener('toggle-accessibility', handleToggleEvent);
    return () => {
      document.removeEventListener('toggle-accessibility', handleToggleEvent);
    };
  }, []);

  // Close panel when Escape key is pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);
  
  const togglePanel = () => {
    setIsOpen(!isOpen);
  };
  
  // Available Indian languages for translation
  const languages = [
    { value: 'en', label: 'English' },
    { value: 'hi', label: 'Hindi' },
    { value: 'bn', label: 'Bengali' },
    { value: 'te', label: 'Telugu' },
    { value: 'mr', label: 'Marathi' },
    { value: 'ta', label: 'Tamil' },
    { value: 'ur', label: 'Urdu' },
    { value: 'gu', label: 'Gujarati' },
    { value: 'kn', label: 'Kannada' },
    { value: 'ml', label: 'Malayalam' },
    { value: 'pa', label: 'Punjabi' }
  ];
  
  // Handle text to speech for main content
  const handleReadPage = () => {
    // Force stop any previous speech first
    if (isSpeaking) {
      stopSpeaking();
      // Small delay to ensure previous speech is stopped
      setTimeout(() => {
        const mainContent = document.querySelector('main')?.textContent || '';
        speakText(mainContent);
      }, 100);
    } else {
      const mainContent = document.querySelector('main')?.textContent || '';
      speakText(mainContent);
    }
  };
  
  return (
    <>
      {/* Accessibility Panel */}
      <div 
        className={cn(
          "fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-800 shadow-lg z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto",
          isOpen ? "translate-x-0" : "translate-x-full"
        )} 
        aria-hidden={!isOpen}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold flex items-center">
            <Accessibility className="mr-2" size={20} />
            Accessibility
          </h2>
          <Button variant="ghost" size="icon" onClick={togglePanel} aria-label="Close panel">
            <X size={18} />
          </Button>
        </div>
        
        <div className="p-4">
          <Tabs defaultValue="display" className="w-full">
            <TabsList className="w-full mb-4 grid grid-cols-3">
              <TabsTrigger value="display" className="flex-1">Display</TabsTrigger>
              <TabsTrigger value="speech" className="flex-1">Speech</TabsTrigger>
              <TabsTrigger value="language" className="flex-1">Language</TabsTrigger>
            </TabsList>
            
            {/* Display Settings */}
            <TabsContent value="display" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-3">Theme</h3>
                  <div className="flex space-x-2">
                    <Button 
                      variant={theme === 'light' ? 'default' : 'outline'} 
                      onClick={() => setTheme('light')}
                      className="flex items-center space-x-2"
                      aria-pressed={theme === 'light'}
                    >
                      <Sun size={16} />
                      <span>Light</span>
                    </Button>
                    <Button 
                      variant={theme === 'dark' ? 'default' : 'outline'} 
                      onClick={() => setTheme('dark')}
                      className="flex items-center space-x-2"
                      aria-pressed={theme === 'dark'}
                    >
                      <Moon size={16} />
                      <span>Dark</span>
                    </Button>
                    <Button 
                      variant={theme === 'system' ? 'default' : 'outline'} 
                      onClick={() => setTheme('system')}
                      className="flex items-center space-x-2"
                      aria-pressed={theme === 'system'}
                    >
                      <MoonStar size={16} />
                      <span>System</span>
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-3">Font Size</h3>
                  <div className="flex space-x-2">
                    <Button 
                      variant={fontSize === 'normal' ? 'default' : 'outline'} 
                      onClick={() => setFontSize('normal')}
                      aria-pressed={fontSize === 'normal'}
                    >
                      A
                    </Button>
                    <Button 
                      variant={fontSize === 'large' ? 'default' : 'outline'} 
                      onClick={() => setFontSize('large')}
                      className="text-lg"
                      aria-pressed={fontSize === 'large'}
                    >
                      A
                    </Button>
                    <Button 
                      variant={fontSize === 'x-large' ? 'default' : 'outline'} 
                      onClick={() => setFontSize('x-large')}
                      className="text-xl"
                      aria-pressed={fontSize === 'x-large'}
                    >
                      A
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                  <div className="flex items-center space-x-2">
                    <Type size={16} />
                    <span>High Contrast</span>
                  </div>
                  <Switch 
                    checked={highContrast} 
                    onCheckedChange={setHighContrast}
                    aria-label="Toggle high contrast mode"
                  />
                </div>
              </div>
            </TabsContent>
            
            {/* Speech Settings */}
            <TabsContent value="speech" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-3">Text to Speech</h3>
                  {!isSpeaking ? (
                    <Button 
                      onClick={handleReadPage}
                      variant="outline"
                      className="w-full flex items-center justify-center space-x-2"
                    >
                      <Volume2 size={16} />
                      <span>Read Page Content</span>
                    </Button>
                  ) : (
                    <Button 
                      onClick={stopSpeaking}
                      variant="destructive"
                      className="w-full flex items-center justify-center space-x-2"
                    >
                      <VolumeX size={16} />
                      <span>Stop Reading</span>
                    </Button>
                  )}
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                  <div>
                    <h3 className="font-medium">Navigation Announcements</h3>
                    <p className="text-sm text-muted-foreground">
                      Voice announcements when navigating pages
                    </p>
                  </div>
                  <Switch 
                    checked={navigationVoice}
                    onCheckedChange={setNavigationVoice}
                    aria-label="Toggle navigation voice announcements"
                  />
                </div>
                
                <div>
                  <h3 className="font-medium mb-3">Speech to Text</h3>
                  {isListening ? (
                    <Button 
                      onClick={stopListening}
                      variant="destructive"
                      className="w-full flex items-center justify-center space-x-2"
                    >
                      <Mic size={16} />
                      <span>Stop Listening</span>
                    </Button>
                  ) : (
                    <Button 
                      onClick={startListening}
                      variant="outline"
                      className="w-full flex items-center justify-center space-x-2"
                    >
                      <Mic size={16} />
                      <span>Start Listening</span>
                    </Button>
                  )}
                  
                  {transcript && (
                    <div className="mt-3">
                      <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md max-h-24 overflow-y-auto">
                        <p className="text-sm">{transcript}</p>
                      </div>
                      <Button 
                        onClick={resetTranscript}
                        variant="ghost"
                        size="sm"
                        className="mt-2 text-xs"
                      >
                        Clear
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            {/* Language Settings */}
            <TabsContent value="language" className="space-y-6">
              <div>
                <h3 className="font-medium mb-3">Display Language</h3>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-2">
                  Changes the language for text-to-speech and speech-to-text features.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Speech Recognition Indicator */}
      {isListening && (
        <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 z-50">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span>Listening...</span>
        </div>
      )}
      
      {/* Skip Link for Keyboard Users */}
      <a href="#main-content" className="skip-link">Skip to main content</a>
    </>
  );
};

export default AccessibilityPanel; 