import React, { useState, useRef, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useDiscussions, DiscussionCategory, Message, DiscussionThread, Chatroom, User } from '@/services/discussionService';
import { useAccessibility } from '@/lib/accessibility';
import { cn } from '@/lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { useChatRooms } from '@/services/chatRoomService';

// Import UI components
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Import icons
import {
  MessageSquare,
  Users,
  TrendingUp,
  Search,
  Clock,
  Eye,
  ThumbsUp,
  Share,
  Send,
  PlusCircle,
  Tag,
  Sparkles,
  MessageCircle,
  MessageSquareText,
  CircleUser,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Filter,
  BrainCircuit,
  BarChart
} from 'lucide-react';

// Format date function
const formatDate = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  
  if (diff < minute) {
    return 'Just now';
  } else if (diff < hour) {
    const minutes = Math.floor(diff / minute);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else if (diff < day) {
    const hours = Math.floor(diff / hour);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else if (diff < week) {
    const days = Math.floor(diff / day);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }
};

// Thread list item component
const ThreadListItem: React.FC<{ 
  thread: DiscussionThread; 
  onClick: () => void;
  users: Record<string, User>;
}> = ({ thread, onClick, users }) => {
  const creator = users[thread.createdBy];
  
  return (
    <div 
      onClick={onClick}
      className="p-4 border-b hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <Avatar>
            <AvatarImage src={creator?.avatar} alt={creator?.name || 'User'} />
            <AvatarFallback>{creator?.name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <h3 className="font-medium text-base truncate">{thread.title}</h3>
            {thread.isPinned && (
              <Badge variant="outline" className="ml-2 shrink-0">Pinned</Badge>
            )}
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground gap-2 mt-1">
            <span>{creator?.name || 'Unknown user'}</span>
            <span>·</span>
            <span>{formatDate(thread.lastActivity)}</span>
          </div>
          
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>{thread.messageCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              <span>{thread.viewCount}</span>
            </div>
            {thread.sentiment && (
              <Badge variant={
                thread.sentiment === 'positive' ? 'secondary' : 
                thread.sentiment === 'negative' ? 'destructive' : 
                'outline'
              } className="text-xs">
                {thread.sentiment}
              </Badge>
            )}
          </div>
          
          <div className="flex flex-wrap gap-1 mt-2">
            {thread.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
            {thread.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">+{thread.tags.length - 3}</Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Message component
const MessageItem: React.FC<{ 
  message: Message; 
  user?: User;
  isCurrentUser: boolean;
  onLike: () => void;
}> = ({ message, user, isCurrentUser, onLike }) => {
  return (
    <div className={cn(
      "flex gap-3 mb-4 p-3 rounded-lg",
      isCurrentUser ? "bg-primary/5" : "bg-muted/30",
      user?.role === 'ai-assistant' ? "border border-primary/20" : ""
    )}>
      <Avatar className="h-8 w-8 mt-1">
        <AvatarImage src={user?.avatar} alt={user?.name || 'User'} />
        <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium">{user?.name || 'Unknown user'}</span>
            {user?.role === 'admin' && <Badge variant="default" className="text-xs">Admin</Badge>}
            {user?.role === 'moderator' && <Badge variant="outline" className="text-xs">Mod</Badge>}
            {user?.role === 'ai-assistant' && <Badge variant="default" className="text-xs bg-indigo-500">AI</Badge>}
          </div>
          <span className="text-xs text-muted-foreground">{formatDate(message.timestamp)}</span>
        </div>
        
        <div className="mt-1 whitespace-pre-wrap">{message.content}</div>
        
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 space-y-2">
            {message.attachments.map((attachment, index) => (
              <div key={index} className="rounded border p-2 bg-background">
                {attachment.type === 'image' && (
                  <div>
                    <img 
                      src={attachment.url} 
                      alt={attachment.title || 'Attachment'} 
                      className="rounded max-h-60 object-contain"
                    />
                    {attachment.title && (
                      <p className="text-xs text-muted-foreground mt-1">{attachment.title}</p>
                    )}
                  </div>
                )}
                {attachment.type === 'link' && (
                  <a 
                    href={attachment.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-primary hover:underline"
                  >
                    <span>{attachment.title || attachment.url}</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
        
        <div className="flex items-center gap-4 mt-2">
          <button 
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
            onClick={onLike}
          >
            <ThumbsUp className="h-3.5 w-3.5" />
            <span>{message.likes}</span>
          </button>
          <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
            <Share className="h-3.5 w-3.5" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Chatroom card component
const ChatroomCard: React.FC<{ chatroom: Chatroom; onClick: () => void }> = ({ chatroom, onClick }) => {
  return (
    <Card onClick={onClick} className="cursor-pointer hover:shadow-md transition-all">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base">{chatroom.name}</CardTitle>
          {chatroom.isLive && (
            <Badge variant="destructive" className="animate-pulse">Live</Badge>
          )}
        </div>
        <CardDescription className="text-xs">{chatroom.description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span>{chatroom.participants.length} participants</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>{chatroom.messageCount} messages</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex justify-between items-center border-t pt-3">
        <Badge variant="secondary" className="capitalize">
          {chatroom.category.replace(/-/g, ' ')}
        </Badge>
        <span className="text-xs text-muted-foreground">
          Last activity: {formatDate(chatroom.lastActivity)}
        </span>
      </CardFooter>
    </Card>
  );
};

// Trending topic card component
const TrendingTopicCard: React.FC<{ 
  tag: string; 
  count: number; 
  sentiment: 'positive' | 'negative' | 'neutral';
}> = ({ tag, count, sentiment }) => {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg bg-card">
      <div className="flex items-center gap-2">
        <Tag className="h-4 w-4 text-primary" />
        <span className="font-medium">{tag.replace(/-/g, ' ')}</span>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={
          sentiment === 'positive' ? 'secondary' : 
          sentiment === 'negative' ? 'destructive' : 
          'outline'
        } className="text-xs">
          {sentiment}
        </Badge>
        <div className="flex items-center gap-1 text-muted-foreground text-sm">
          <MessageSquare className="h-3.5 w-3.5" />
          <span>{count}</span>
        </div>
      </div>
    </div>
  );
};

// AI insight card component
const AiInsightCard: React.FC<{ 
  title: string; 
  content: string; 
  relatedThreads: string[];
  threads: DiscussionThread[];
  onThreadClick: (threadId: string) => void;
}> = ({ title, content, relatedThreads, threads, onThreadClick }) => {
  const relatedThreadObjects = threads.filter(t => relatedThreads.includes(t.id));
  
  return (
    <Card className="border-indigo-200 dark:border-indigo-800">
      <CardHeader className="pb-2 bg-indigo-50/50 dark:bg-indigo-950/50">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-sm text-muted-foreground">{content}</p>
        
        {relatedThreadObjects.length > 0 && (
          <div className="mt-3">
            <h4 className="text-sm font-medium mb-2">Related Discussions:</h4>
            <div className="space-y-2">
              {relatedThreadObjects.map(thread => (
                <div 
                  key={thread.id}
                  className="text-sm p-2 rounded bg-muted flex justify-between items-center cursor-pointer hover:bg-muted/80"
                  onClick={() => onThreadClick(thread.id)}
                >
                  <span className="truncate">{thread.title}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Create Thread Dialog content component
const CreateThreadForm: React.FC<{ 
  onSubmit: (data: Omit<DiscussionThread, 'id' | 'createdAt' | 'lastActivity' | 'messageCount' | 'viewCount'>) => void;
  userId: string;
}> = ({ onSubmit, userId }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DiscussionCategory>('general');
  const [tagsInput, setTagsInput] = useState('');
  const [message, setMessage] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const tags = tagsInput
      .split(',')
      .map(tag => tag.trim().toLowerCase().replace(/\s+/g, '-'))
      .filter(tag => tag.length > 0);
    
    onSubmit({
      title,
      category,
      tags,
      createdBy: userId,
      isPinned: false,
      isLocked: false
    });
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="Enter a descriptive title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select value={category} onValueChange={(value) => setCategory(value as DiscussionCategory)}>
          <SelectTrigger id="category">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="market-trends">Market Trends</SelectItem>
            <SelectItem value="stock-picks">Stock Picks</SelectItem>
            <SelectItem value="cryptocurrency">Cryptocurrency</SelectItem>
            <SelectItem value="economic-news">Economic News</SelectItem>
            <SelectItem value="technical-analysis">Technical Analysis</SelectItem>
            <SelectItem value="fundamental-analysis">Fundamental Analysis</SelectItem>
            <SelectItem value="options-trading">Options Trading</SelectItem>
            <SelectItem value="retirement">Retirement</SelectItem>
            <SelectItem value="financial-planning">Financial Planning</SelectItem>
            <SelectItem value="regulatory">Regulatory</SelectItem>
            <SelectItem value="general">General</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="tags">Tags (comma separated)</Label>
        <Input
          id="tags"
          placeholder="e.g., stocks, investing, technical-analysis"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="message">Initial message</Label>
        <Textarea
          id="message"
          placeholder="Start the discussion..."
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </div>
      
      <DialogFooter>
        <Button type="submit">Create Thread</Button>
      </DialogFooter>
    </form>
  );
};

// Main Discussions Page Component
const Discussions: React.FC = () => {
  const { 
    threads, 
    chatrooms, 
    currentUser, 
    trendingTopics, 
    aiInsights, 
    getThreadDetails, 
    getChatroomDetails, 
    createThread, 
    addMessageToThread,
    addMessageToChatroom,
    getUserDetails,
    likeMessage
  } = useDiscussions();
  
  const { speakText } = useAccessibility();
  
  // UI State
  const [activeTab, setActiveTab] = useState('threads');
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [selectedChatroomId, setSelectedChatroomId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isCreateThreadOpen, setIsCreateThreadOpen] = useState(false);
  const [threadCategoryFilter, setThreadCategoryFilter] = useState<DiscussionCategory | 'all'>('all');
  
  // Cache all users for easier access
  const [usersCache, setUsersCache] = useState<Record<string, User>>({});
  
  // Messages for current thread or chatroom
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  
  // Current thread or chatroom
  const [currentThread, setCurrentThread] = useState<DiscussionThread | null>(null);
  const [currentChatroom, setCurrentChatroom] = useState<Chatroom | null>(null);
  
  // Ref for message container scroll
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Effect to load users
  useEffect(() => {
    const usersToLoad = new Set<string>();
    
    // Add all thread creators
    threads.forEach(thread => usersToLoad.add(thread.createdBy));
    
    // Add all message users if selected thread or chatroom
    if (currentMessages.length > 0) {
      currentMessages.forEach(message => usersToLoad.add(message.userId));
    }
    
    // Load all users we don't have yet
    usersToLoad.forEach(userId => {
      if (!usersCache[userId]) {
        const user = getUserDetails(userId);
        if (user) {
          setUsersCache(prev => ({ ...prev, [userId]: user }));
        }
      }
    });
  }, [threads, currentMessages, getUserDetails, usersCache]);
  
  // Effect to load selected thread
  useEffect(() => {
    if (selectedThreadId) {
      const { thread, messages } = getThreadDetails(selectedThreadId);
      setCurrentThread(thread || null);
      setCurrentMessages(messages);
      setCurrentChatroom(null);
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [selectedThreadId, getThreadDetails]);
  
  // Effect to load selected chatroom
  useEffect(() => {
    if (selectedChatroomId) {
      const { chatroom, messages } = getChatroomDetails(selectedChatroomId);
      setCurrentChatroom(chatroom || null);
      setCurrentMessages(messages);
      setCurrentThread(null);
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [selectedChatroomId, getChatroomDetails]);
  
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Reset selections when changing tabs
    if (value === 'threads') {
      setSelectedChatroomId(null);
    } else if (value === 'chatrooms') {
      setSelectedThreadId(null);
    }
    speakText(`Switched to ${value} tab`);
  };
  
  // Handle selecting a thread
  const handleSelectThread = (threadId: string) => {
    setSelectedThreadId(threadId);
    speakText('Thread selected');
  };
  
  // Handle selecting a chatroom
  const handleSelectChatroom = (chatroomId: string) => {
    setSelectedChatroomId(chatroomId);
    speakText('Chatroom selected');
  };
  
  // Handle back button from thread or chatroom
  const handleBackToList = () => {
    if (selectedThreadId) {
      setSelectedThreadId(null);
      setCurrentThread(null);
    }
    if (selectedChatroomId) {
      setSelectedChatroomId(null);
      setCurrentChatroom(null);
    }
    setCurrentMessages([]);
    speakText('Returned to list view');
  };
  
  // Handle sending a message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    if (selectedThreadId) {
      const message = addMessageToThread(selectedThreadId, {
        userId: currentUser.id,
        content: newMessage,
      });
      
      setCurrentMessages(prev => [...prev, message]);
      setNewMessage('');
      setTimeout(() => scrollToBottom(), 100);
    } else if (selectedChatroomId) {
      const message = addMessageToChatroom(selectedChatroomId, {
        userId: currentUser.id,
        content: newMessage,
      });
      
      setCurrentMessages(prev => [...prev, message]);
      setNewMessage('');
      setTimeout(() => scrollToBottom(), 100);
    }
  };
  
  // Handle creating a new thread
  const handleCreateThread = (data: Omit<DiscussionThread, 'id' | 'createdAt' | 'lastActivity' | 'messageCount' | 'viewCount'>) => {
    const newThread = createThread(data);
    
    // Add initial message
    addMessageToThread(newThread.id, {
      userId: currentUser.id,
      content: 'Starting this thread to discuss...',
    });
    
    // Close dialog and select the new thread
    setIsCreateThreadOpen(false);
    setSelectedThreadId(newThread.id);
    speakText('New thread created');
  };
  
  // Handle liking a message
  const handleLikeMessage = (messageId: string) => {
    likeMessage(messageId);
    setCurrentMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, likes: msg.likes + 1 } : msg
      )
    );
  };
  
  // Filter threads by category
  const filteredThreads = threadCategoryFilter === 'all' 
    ? threads 
    : threads.filter(thread => thread.category === threadCategoryFilter);
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Community Discussions</h1>
            <p className="text-muted-foreground">
              Connect with other investors and discuss market trends
            </p>
          </div>
          
          {!selectedThreadId && !selectedChatroomId && (
            <Dialog open={isCreateThreadOpen} onOpenChange={setIsCreateThreadOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Thread
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create a New Discussion Thread</DialogTitle>
                  <DialogDescription>
                    Start a new conversation with the community.
                  </DialogDescription>
                </DialogHeader>
                <CreateThreadForm onSubmit={handleCreateThread} userId={currentUser.id} />
              </DialogContent>
            </Dialog>
          )}
          
          {(selectedThreadId || selectedChatroomId) && (
            <Button variant="outline" onClick={handleBackToList}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to List
            </Button>
          )}
        </div>
        
        {/* Main content */}
        {!selectedThreadId && !selectedChatroomId ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Main content area */}
            <div className="md:col-span-3">
              <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsList className="grid grid-cols-4 mb-6">
                  <TabsTrigger value="threads" className="flex items-center justify-center gap-2">
                    <MessageSquareText className="h-4 w-4" />
                    <span>Discussion Threads</span>
                  </TabsTrigger>
                  <TabsTrigger value="chatrooms" className="flex items-center justify-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    <span>Chat Rooms</span>
                  </TabsTrigger>
                  <TabsTrigger value="realtime-chat" className="flex items-center justify-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Real-time Chat</span>
                  </TabsTrigger>
                  <TabsTrigger value="insights" className="flex items-center justify-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    <span>AI Insights</span>
                  </TabsTrigger>
                </TabsList>
                
                {/* Threads Tab */}
                <TabsContent value="threads" className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search threads..."
                        className="pl-8"
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Select 
                        value={threadCategoryFilter} 
                        onValueChange={(value) => setThreadCategoryFilter(value as DiscussionCategory | 'all')}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Filter by category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="market-trends">Market Trends</SelectItem>
                          <SelectItem value="stock-picks">Stock Picks</SelectItem>
                          <SelectItem value="cryptocurrency">Cryptocurrency</SelectItem>
                          <SelectItem value="economic-news">Economic News</SelectItem>
                          <SelectItem value="technical-analysis">Technical Analysis</SelectItem>
                          <SelectItem value="fundamental-analysis">Fundamental Analysis</SelectItem>
                          <SelectItem value="options-trading">Options Trading</SelectItem>
                          <SelectItem value="regulatory">Regulatory</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Card className="overflow-hidden">
                    <ScrollArea className="h-[calc(100vh-300px)]">
                      {filteredThreads.map(thread => (
                        <ThreadListItem 
                          key={thread.id} 
                          thread={thread} 
                          onClick={() => handleSelectThread(thread.id)}
                          users={usersCache}
                        />
                      ))}
                      
                      {filteredThreads.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground">
                          <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-20" />
                          <p>No threads found in this category.</p>
                          <Button 
                            variant="outline" 
                            className="mt-4"
                            onClick={() => setIsCreateThreadOpen(true)}
                          >
                            Create a new thread
                          </Button>
                        </div>
                      )}
                    </ScrollArea>
                  </Card>
                </TabsContent>
                
                {/* Chatrooms Tab */}
                <TabsContent value="chatrooms" className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {chatrooms.map(chatroom => (
                      <ChatroomCard 
                        key={chatroom.id} 
                        chatroom={chatroom} 
                        onClick={() => handleSelectChatroom(chatroom.id)}
                      />
                    ))}
                  </div>
                </TabsContent>
                
                {/* Real-time Chat Tab */}
                <TabsContent value="realtime-chat" className="space-y-6">
                  <Card className="overflow-hidden">
                    <CardHeader className="pb-0">
                      <CardTitle className="text-lg">Real-time Chat Rooms</CardTitle>
                      <CardDescription>
                        Create and join real-time chat rooms with WebSocket support for instant messaging
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex flex-col items-center justify-center p-6 text-center bg-muted/50 rounded-lg">
                          <BrainCircuit className="h-10 w-10 mb-4 text-primary opacity-70" />
                          <h3 className="text-lg font-medium mb-2">Enhanced Chat Experience</h3>
                          <p className="text-muted-foreground max-w-md mb-6">
                            Our new real-time chat feature lets you create shareable chat rooms with WebSocket support for instant messaging.
                          </p>
                          <div className="flex gap-4">
                            <Button asChild>
                              <Link to="/chat">Browse Chat Rooms</Link>
                            </Button>
                            <Button variant="outline" asChild>
                              <Link to="/chat">Create New Room</Link>
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base">Create Custom Rooms</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-muted-foreground">
                                Create chat rooms for specific topics and invite others by sharing a unique URL.
                              </p>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base">Real-time Messaging</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-muted-foreground">
                                Exchange messages instantly with WebSockets technology for a seamless experience.
                              </p>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base">Shareable Links</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-muted-foreground">
                                Easily share your chat rooms via email or by copying a direct link.
                              </p>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base">Private Discussions</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-muted-foreground">
                                Only those with the link can join your chat room, ensuring privacy for your discussions.
                              </p>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Insights Tab */}
                <TabsContent value="insights" className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    {aiInsights.map((insight, i) => (
                      <AiInsightCard 
                        key={i}
                        title={insight.title}
                        content={insight.content}
                        relatedThreads={insight.relatedThreads}
                        threads={threads}
                        onThreadClick={handleSelectThread}
                      />
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Sidebar */}
            <div>
              <div className="space-y-6">
                {/* User Profile */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">My Profile</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                        <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{currentUser.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <CircleUser className="h-3 w-3" />
                          <span className="capitalize">{currentUser.role}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-3 pt-3 border-t text-sm">
                      <div className="text-muted-foreground">Karma</div>
                      <div className="font-medium">{currentUser.karma}</div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Trending Topics */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Trending Topics</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {trendingTopics.map((topic, i) => (
                        <TrendingTopicCard 
                          key={i}
                          tag={topic.tag}
                          count={topic.count}
                          sentiment={topic.sentiment}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Market Stats */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Market Pulse</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="text-sm">S&P 500</div>
                        <div className="font-medium text-green-600">+0.45%</div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm">Nasdaq</div>
                        <div className="font-medium text-green-600">+0.83%</div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm">Dow Jones</div>
                        <div className="font-medium text-red-600">-0.12%</div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm">Bitcoin</div>
                        <div className="font-medium text-green-600">+1.76%</div>
                      </div>
                      <Separator className="my-2" />
                      <div className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Last updated: 5 minutes ago</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Thread or Chatroom View */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>
                      {currentThread?.title || currentChatroom?.name || 'Loading...'}
                    </CardTitle>
                    <CardDescription>
                      {currentChatroom?.description ||
                        (currentThread?.category && (
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="capitalize">
                              {currentThread.category.replace(/-/g, ' ')}
                            </Badge>
                            {currentThread.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        ))
                      }
                    </CardDescription>
                  </div>
                  
                  {currentThread && (
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>{currentThread.messageCount}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        <span>{currentThread.viewCount}</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {/* Messages */}
                <ScrollArea className="h-[calc(100vh-350px)] mb-4">
                  <div className="space-y-1">
                    {currentMessages.map(message => (
                      <MessageItem 
                        key={message.id} 
                        message={message}
                        user={usersCache[message.userId]}
                        isCurrentUser={message.userId === currentUser.id}
                        onLike={() => handleLikeMessage(message.id)}
                      />
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                
                {/* Message input */}
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Discussions; 