import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Maximize2, Minimize2, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Drawer, DrawerClose, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { sentimentService } from '@/services/sentimentService';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// Function to convert markdown-style text to HTML
const formatMessage = (text: string) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text
    .replace(/\n\n/g, '<br/><br/>') // Double line breaks
    .replace(/\n-\s(.*)/g, '<br/>• $1') // Bullet points
    .replace(/\n(\d+)\.\s(.*)/g, '<br/>$1. $2') // Numbered lists
    .replace(/\n(?!\<br\/\>)/g, '<br/>'); // Single line breaks that aren't already converted
};

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial',
      content: 'Hello! I\'m your Equora.AI assistant. I can help you understand market trends, analyze sentiment data, explain technical indicators, and answer any questions about the dashboard data. How can I assist you today?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  // Auto-scroll to the bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    // Show thinking state
    setIsThinking(true);
    
    // Call the backend API to get a response
    fetchBotResponse(input);
  };
  
  const fetchBotResponse = async (userQuery: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/chatbot/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: userQuery }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }
      
      const data = await response.json();
      
      // Format answer based on response type
      let formattedAnswer = data.answer;
      
      // If there's dashboard data, format it nicely
      if (data.data) {
        const dashboardData = data.data;
        
        // Only append data if it's relevant and not too large
        if (Object.keys(dashboardData).length > 0 && Object.keys(dashboardData).length < 10) {
          formattedAnswer += '\n\n**Current Values:**\n';
          
          // Format the values in a readable way
          Object.entries(dashboardData).forEach(([key, value]) => {
            // Handle nested objects
            if (typeof value === 'object' && value !== null) {
              // Skip arrays or complex nested objects to keep response clean
              if (!Array.isArray(value) && Object.keys(value).length < 5) {
                formattedAnswer += `\n${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:`;
                Object.entries(value as Record<string, any>).forEach(([subKey, subValue]) => {
                  if (typeof subValue === 'number') {
                    formattedAnswer += `\n  - ${subKey}: ${parseFloat(subValue.toFixed(2))}`;
                  } else {
                    formattedAnswer += `\n  - ${subKey}: ${subValue}`;
                  }
                });
              }
            } else if (typeof value === 'number') {
              // Format numeric values to 2 decimal places
              formattedAnswer += `\n- ${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: ${parseFloat((value as number).toFixed(2))}`;
            } else {
              formattedAnswer += `\n- ${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: ${value}`;
            }
          });
        }
      }
      
      // Add bot response
      const botMessage: Message = {
        id: Date.now().toString(),
        content: formattedAnswer,
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error fetching bot response:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: 'Sorry, I had trouble connecting to my services. Please try again later.',
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };
  
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };
  
  // Add this component definition after the AIAssistant function starts but before renderDesktopChat
  const ChatMessage = ({ message }: { message: Message }) => {
    return (
      <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
        <div 
          className={cn(
            "px-3 py-2 rounded-lg max-w-[85%]",
            message.sender === 'user' 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted"
          )}
        >
          {message.sender === 'user' ? (
            <p>{message.content}</p>
          ) : (
            <div 
              dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
              className="chatbot-message"
            />
          )}
        </div>
      </div>
    );
  };
  
  // For desktop: use Popover component
  const renderDesktopChat = () => (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="default" 
          size="icon" 
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 z-50"
        >
          <Bot size={24} />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 md:w-96 p-0 rounded-xl shadow-xl border-border/50" 
        align="end"
        side="top"
        sideOffset={20}
      >
        <div className="flex flex-col h-[500px] max-h-[80vh]">
          {/* Chat header */}
          <div className="flex items-center justify-between p-3 border-b bg-primary text-primary-foreground rounded-t-xl">
            <div className="flex items-center gap-2">
              <Bot size={18} />
              <span className="font-medium">Equora.AI Assistant</span>
            </div>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-primary-foreground hover:bg-primary/90 rounded-full"
                onClick={toggleMinimize}
              >
                {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-primary-foreground hover:bg-primary/90 rounded-full"
                onClick={() => setIsOpen(false)}
              >
                <X size={14} />
              </Button>
            </div>
          </div>
          
          {/* Chat messages */}
          <div className={cn(
            "flex-1 overflow-y-auto p-3 bg-background/50 space-y-3",
            isMinimized && "hidden"
          )}>
            {!isMinimized && (
              <div className="flex-1 p-3 overflow-y-auto">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {isThinking && (
                  <div className="flex justify-start mb-3">
                    <div className="bg-muted px-3 py-2 rounded-lg">
                      <div className="flex items-center gap-1">
                        <div className="animate-pulse">•</div>
                        <div className="animate-pulse animation-delay-300">•</div>
                        <div className="animate-pulse animation-delay-600">•</div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          
          {/* Input area */}
          {!isMinimized && (
            <div className="p-3 border-t">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Ask about your dashboard data..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1"
                  disabled={isThinking}
                />
                <Button 
                  size="icon" 
                  onClick={handleSend}
                  disabled={!input.trim() || isThinking}
                >
                  <Send size={18} />
                </Button>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                <p className="flex items-center gap-1">
                  <HelpCircle size={12} />
                  Try asking: "Explain the price correlation chart" or "What's the current market sentiment?"
                </p>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
  
  // For mobile: use Drawer component
  const renderMobileChat = () => (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button 
          variant="default" 
          size="icon" 
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 z-50"
        >
          <Bot size={24} />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[85vh] p-0">
        <div className="flex flex-col h-full">
          {/* Chat header */}
          <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <span className="font-medium">Equora.AI Assistant</span>
            </div>
            <DrawerClose asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-primary-foreground hover:bg-primary/90 rounded-full"
              >
                <X size={16} />
              </Button>
            </DrawerClose>
          </div>
          
          {/* Chat messages */}
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isThinking && (
              <div className="flex justify-start mb-3">
                <div className="bg-muted px-3 py-2 rounded-lg">
                  <div className="flex items-center gap-1">
                    <div className="animate-pulse">•</div>
                    <div className="animate-pulse animation-delay-300">•</div>
                    <div className="animate-pulse animation-delay-600">•</div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input area */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Ask about your dashboard data..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1"
                disabled={isThinking}
              />
              <Button 
                size="icon" 
                onClick={handleSend}
                disabled={!input.trim() || isThinking}
              >
                <Send size={18} />
              </Button>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              <p className="flex items-center gap-1">
                <HelpCircle size={12} />
                Try asking: "What's the market sentiment today?" or "Explain technical indicators"
              </p>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
  
  return isMobile ? renderMobileChat() : renderDesktopChat();
};

export default AIAssistant;
