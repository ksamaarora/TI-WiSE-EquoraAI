import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSocketService, ChatMessage } from '@/services/socketService';
import { useChatRooms, ChatRoom as ChatRoomType } from '@/services/chatRoomService';

// Import UI components
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Import icons
import { Send, Copy, Mail, Share2, ArrowLeft, Users } from 'lucide-react';

// Message component
const ChatMessageItem = ({ message, isCurrentUser }: { message: ChatMessage; isCurrentUser: boolean }) => {
  return (
    <div className={`flex gap-3 mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      {!isCurrentUser && (
        <Avatar className="h-8 w-8 mt-1">
          <AvatarImage src={message.avatar} alt={message.username} />
          <AvatarFallback>{message.username.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      )}
      
      <div className={`max-w-[80%] p-3 rounded-lg ${isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
        {!isCurrentUser && (
          <div className="text-xs font-medium mb-1">{message.username}</div>
        )}
        <div className="whitespace-pre-wrap">{message.content}</div>
        <div className="text-xs opacity-70 mt-1 text-right">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      
      {isCurrentUser && (
        <Avatar className="h-8 w-8 mt-1">
          <AvatarImage src={message.avatar} alt={message.username} />
          <AvatarFallback>{message.username.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

interface ChatRoomProps {
  roomId?: string;
  room?: ChatRoomType;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  onBack?: () => void;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ roomId, room, user, onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [participants, setParticipants] = useState<number>(1);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [messageMap, setMessageMap] = useState<Record<string, boolean>>({});
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { getRoomById, getShareableUrl, shareRoomViaEmail } = useChatRooms();
  
  // Fetch room info if only the ID is provided
  const roomInfo = room || (roomId ? getRoomById(roomId) : undefined);
  const shareableUrl = roomInfo ? getShareableUrl(roomInfo.id) : '';
  
  // Helper function to add a message without duplicates
  const addUniqueMessage = useCallback((message: ChatMessage) => {
    // Check if this message is already in our list
    if (messageMap[message.id]) {
      return; // Skip duplicates
    }
    
    // Check for content+user duplicates (messages sent within 3 seconds with same content)
    const isDuplicate = messages.some(existingMsg => 
      existingMsg.content === message.content && 
      existingMsg.userId === message.userId &&
      Math.abs(new Date(existingMsg.timestamp).getTime() - new Date(message.timestamp).getTime()) < 3000
    );
    
    if (!isDuplicate) {
      setMessageMap(prev => ({ ...prev, [message.id]: true }));
      setMessages(prev => [...prev, message]);
      
      // Scroll to bottom when message added
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages, messageMap]);
  
  // Socket connection with event handlers
  const { isConnected, currentRoom, joinRoom, sendMessage } = useSocketService({
    onConnect: () => {
      if (roomInfo) {
        joinRoom(roomInfo.id, user);
      }
    },
    onJoinRoom: () => {
      setIsJoined(true);
      setParticipants(prev => prev + 1);
    },
    onLeaveRoom: () => {
      setParticipants(prev => Math.max(1, prev - 1));
    },
    onMessage: (message) => {
      addUniqueMessage(message);
    }
  });
  
  // Load messages from local storage when joining a room
  useEffect(() => {
    if (roomInfo && isJoined) {
      try {
        const storedRooms = localStorage.getItem('equora-chat-rooms');
        if (storedRooms) {
          const roomsData = JSON.parse(storedRooms);
          const roomData = roomsData[roomInfo.id];
          if (roomData && roomData.messages && Array.isArray(roomData.messages)) {
            // Create a new map to track message IDs
            const newMessageMap: Record<string, boolean> = {};
            
            // Add loaded messages to the state
            const loadedMessages: ChatMessage[] = roomData.messages;
            loadedMessages.forEach(msg => {
              newMessageMap[msg.id] = true;
            });
            
            setMessageMap(newMessageMap);
            setMessages(loadedMessages);
            
            // Scroll to bottom after loading messages
            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }
        }
      } catch (error) {
        console.error('Error loading messages from storage:', error);
      }
    }
  }, [roomInfo, isJoined]);
  
  // Join the room when component mounts
  useEffect(() => {
    if (isConnected && roomInfo && !currentRoom) {
      // Clear messages when joining a new room
      setMessages([]);
      setMessageMap({});
      joinRoom(roomInfo.id, user);
    }
  }, [isConnected, roomInfo, currentRoom, joinRoom, user]);
  
  // Handle sending a message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !isJoined) return;
    
    if (sendMessage(newMessage, user)) {
      setNewMessage('');
    }
  };
  
  // Copy URL to clipboard
  const copyUrlToClipboard = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };
  
  // Share via email
  const shareViaEmail = () => {
    if (roomInfo) {
      shareRoomViaEmail(roomInfo.id, roomInfo.name);
    }
  };
  
  // If no room is found
  if (!roomInfo) {
    return (
      <Card className="h-full">
        <CardContent className="flex flex-col items-center justify-center h-[60vh]">
          <h3 className="text-xl font-medium mb-2">Chat Room Not Found</h3>
          <p className="text-muted-foreground mb-4">The chat room you're looking for doesn't exist or has been deactivated.</p>
          {onBack && (
            <Button onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Discussions
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-3 flex-row justify-between items-start border-b">
        <div>
          <CardTitle className="flex items-center">
            {onBack && (
              <Button variant="ghost" size="sm" className="mr-2" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            {roomInfo.name}
          </CardTitle>
          <CardDescription className="flex items-center mt-1">
            <Users className="h-3.5 w-3.5 mr-1" />
            <span>{participants} participant{participants !== 1 ? 's' : ''}</span>
          </CardDescription>
        </div>
        
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="outline" onClick={copyUrlToClipboard}>
                  <Copy className="h-4 w-4" />
                  {copiedUrl ? 'Copied!' : 'Copy Link'}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy room link to clipboard</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="outline" onClick={shareViaEmail}>
                  <Mail className="h-4 w-4" />
                  Share
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share via email</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 h-[calc(100vh-300px)]">
        {messages.length > 0 ? (
          <ScrollArea className="h-full pr-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <ChatMessageItem 
                  key={message.id || index}
                  message={message}
                  isCurrentUser={message.userId === user.id}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
            <Share2 className="h-12 w-12 mb-4 opacity-20" />
            <h3 className="text-lg font-medium mb-1">
              {roomInfo.createdById === 'system' 
                ? 'Welcome to the shared chat room!' 
                : 'No messages yet'}
            </h3>
            <p className="max-w-md">
              {roomInfo.createdById === 'system'
                ? 'This room was created via a shared link. Start chatting to connect with others!'
                : 'Share this room with others to start chatting in real-time!'}
            </p>
            <div className="mt-4 flex flex-col items-center">
              <div className="text-sm mb-2">Room URL:</div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="px-3 py-1 text-xs">
                  {shareableUrl}
                </Badge>
                <Button size="sm" variant="ghost" onClick={copyUrlToClipboard}>
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-3 border-t">
        <form onSubmit={handleSendMessage} className="w-full flex gap-2">
          <Input
            placeholder={isJoined ? "Type your message..." : "Connecting..."}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={!isJoined}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!isJoined || !newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default ChatRoom; 