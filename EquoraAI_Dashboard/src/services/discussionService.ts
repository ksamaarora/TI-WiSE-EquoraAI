import { useState } from 'react';

// Types for discussions and chat
export interface User {
  id: string;
  name: string;
  avatar: string;
  role: 'user' | 'moderator' | 'admin' | 'ai-assistant';
  expertise?: string[];
  joinDate: string;
  karma: number;
}

export interface Message {
  id: string;
  userId: string;
  content: string;
  timestamp: Date;
  likes: number;
  attachments?: {
    type: 'image' | 'link' | 'document';
    url: string;
    title?: string;
  }[];
  isEdited: boolean;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface DiscussionThread {
  id: string;
  title: string;
  category: DiscussionCategory;
  tags: string[];
  createdBy: string;
  createdAt: Date;
  lastActivity: Date;
  messageCount: number;
  viewCount: number;
  isPinned: boolean;
  isLocked: boolean;
  summary?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface Chatroom {
  id: string;
  name: string;
  description: string;
  category: DiscussionCategory;
  type: 'public' | 'private';
  participants: string[];
  createdAt: Date;
  lastActivity: Date;
  messageCount: number;
  isLive: boolean;
}

export type DiscussionCategory = 
  | 'market-trends' 
  | 'stock-picks'
  | 'cryptocurrency'
  | 'economic-news'
  | 'technical-analysis'
  | 'fundamental-analysis'
  | 'options-trading'
  | 'retirement'
  | 'financial-planning'
  | 'regulatory'
  | 'general';

// Mock data - users
const mockUsers: User[] = [
  {
    id: 'u1',
    name: 'Alex Morgan',
    avatar: '/avatars/user1.png',
    role: 'admin',
    expertise: ['cryptocurrency', 'technical-analysis'],
    joinDate: '2022-03-15',
    karma: 4382
  },
  {
    id: 'u2',
    name: 'Taylor Chen',
    avatar: '/avatars/user2.png',
    role: 'moderator',
    expertise: ['fundamental-analysis', 'economic-news'],
    joinDate: '2022-04-22',
    karma: 2741
  },
  {
    id: 'u3',
    name: 'Team Claire',
    avatar: '/avatars/user3.png',
    role: 'user',
    expertise: ['stock-picks'],
    joinDate: '2022-06-10',
    karma: 895
  },
  {
    id: 'u4',
    name: 'Sam Wilson',
    avatar: '/avatars/user4.png',
    role: 'user',
    joinDate: '2022-07-05',
    karma: 452
  },
  {
    id: 'u5',
    name: 'Robin Patel',
    avatar: '/avatars/user5.png',
    role: 'user',
    expertise: ['retirement', 'financial-planning'],
    joinDate: '2022-09-18',
    karma: 1250
  },
  {
    id: 'u6',
    name: 'EquoraAI Assistant',
    avatar: '/avatars/ai-assistant.png',
    role: 'ai-assistant',
    expertise: ['market-trends', 'stock-picks', 'economic-news', 'technical-analysis', 'fundamental-analysis'],
    joinDate: '2022-01-01',
    karma: 9999
  }
];

// Mock data - discussion threads
const mockThreads: DiscussionThread[] = [
  {
    id: 't1',
    title: 'Impact of Fed Rate Decision on Tech Stocks',
    category: 'market-trends',
    tags: ['interest-rates', 'tech-sector', 'federal-reserve'],
    createdBy: 'u2',
    createdAt: new Date('2023-04-22T14:32:00'),
    lastActivity: new Date('2023-04-25T10:15:00'),
    messageCount: 28,
    viewCount: 342,
    isPinned: true,
    isLocked: false,
    summary: 'Discussion about how the Federal Reserve\'s recent interest rate decisions are impacting technology stocks and what investors should consider.',
    sentiment: 'negative'
  },
  {
    id: 't2',
    title: 'Bitcoin ETF Approval Speculation Thread',
    category: 'cryptocurrency',
    tags: ['bitcoin', 'etf', 'sec'],
    createdBy: 'u1',
    createdAt: new Date('2023-04-20T09:45:00'),
    lastActivity: new Date('2023-04-25T08:20:00'),
    messageCount: 56,
    viewCount: 890,
    isPinned: true,
    isLocked: false,
    sentiment: 'positive'
  },
  {
    id: 't3',
    title: 'Value Investing in Current Market',
    category: 'fundamental-analysis',
    tags: ['value-investing', 'fundamentals', 'warren-buffett'],
    createdBy: 'u5',
    createdAt: new Date('2023-04-18T16:05:00'),
    lastActivity: new Date('2023-04-24T13:40:00'),
    messageCount: 21,
    viewCount: 230,
    isPinned: false,
    isLocked: false,
    sentiment: 'neutral'
  },
  {
    id: 't4',
    title: 'Technical Analysis: S&P 500 Breaking Key Resistance',
    category: 'technical-analysis',
    tags: ['SPY', 'chart-patterns', 'resistance-levels'],
    createdBy: 'u3',
    createdAt: new Date('2023-04-24T10:30:00'),
    lastActivity: new Date('2023-04-25T11:05:00'),
    messageCount: 14,
    viewCount: 175,
    isPinned: false,
    isLocked: false,
    sentiment: 'positive'
  },
  {
    id: 't5',
    title: 'New SEC Regulations Impact on Brokerages',
    category: 'regulatory',
    tags: ['SEC', 'regulations', 'brokerages'],
    createdBy: 'u2',
    createdAt: new Date('2023-04-15T08:20:00'),
    lastActivity: new Date('2023-04-23T15:45:00'),
    messageCount: 32,
    viewCount: 310,
    isPinned: false,
    isLocked: false,
    sentiment: 'negative'
  },
  {
    id: 't6',
    title: 'Retirement Planning Strategies for 30-Somethings',
    category: 'retirement',
    tags: ['401k', 'IRA', 'early-retirement'],
    createdBy: 'u5',
    createdAt: new Date('2023-04-10T14:10:00'),
    lastActivity: new Date('2023-04-22T09:30:00'),
    messageCount: 43,
    viewCount: 520,
    isPinned: false,
    isLocked: false,
    sentiment: 'positive'
  }
];

// Mock data - chat rooms
const mockChatRooms: Chatroom[] = [
  {
    id: 'c1',
    name: 'Live Market Discussion',
    description: 'Real-time discussion during market hours about price movements and breaking news',
    category: 'market-trends',
    type: 'public',
    participants: ['u1', 'u2', 'u3', 'u4', 'u5', 'u6'],
    createdAt: new Date('2023-01-05T08:00:00'),
    lastActivity: new Date('2023-04-25T15:30:00'),
    messageCount: 14532,
    isLive: true
  },
  {
    id: 'c2',
    name: 'Crypto Corner',
    description: 'Discussions on cryptocurrency trends, token analysis, and blockchain technology',
    category: 'cryptocurrency',
    type: 'public',
    participants: ['u1', 'u3', 'u4', 'u6'],
    createdAt: new Date('2023-01-12T10:15:00'),
    lastActivity: new Date('2023-04-25T14:20:00'),
    messageCount: 8245,
    isLive: true
  },
  {
    id: 'c3',
    name: 'Technical Analysis Group',
    description: 'Chart patterns, technical indicators, and trading strategies',
    category: 'technical-analysis',
    type: 'public',
    participants: ['u1', 'u2', 'u3', 'u6'],
    createdAt: new Date('2023-02-08T13:30:00'),
    lastActivity: new Date('2023-04-24T19:45:00'),
    messageCount: 4521,
    isLive: false
  },
  {
    id: 'c4',
    name: 'Fundamental Research',
    description: 'Deep dives into company financials, business models, and valuation metrics',
    category: 'fundamental-analysis',
    type: 'public',
    participants: ['u2', 'u5', 'u6'],
    createdAt: new Date('2023-03-14T09:20:00'),
    lastActivity: new Date('2023-04-24T16:10:00'),
    messageCount: 3250,
    isLive: false
  }
];

// Mock messages for the first chat room
const mockMessagesForChatroom1: Message[] = [
  {
    id: 'm1',
    userId: 'u2',
    content: "Looks like we're seeing some selling pressure in tech stocks after the jobs report. What do you all think about the overall market direction today?",
    timestamp: new Date('2023-04-25T09:30:00'),
    likes: 5,
    isEdited: false,
    sentiment: 'neutral'
  },
  {
    id: 'm2',
    userId: 'u1',
    content: "The jobs report came in hotter than expected which is renewing inflation concerns. I think we might see continued pressure on growth stocks today.",
    timestamp: new Date('2023-04-25T09:32:00'),
    likes: 8,
    isEdited: false,
    sentiment: 'negative'
  },
  {
    id: 'm3',
    userId: 'u3',
    content: "But defense stocks and consumer staples are holding up well. Might be a good day for sector rotation strategies.",
    timestamp: new Date('2023-04-25T09:35:00'),
    likes: 4,
    isEdited: false,
    sentiment: 'positive'
  },
  {
    id: 'm4',
    userId: 'u6',
    content: "Based on historical patterns, when we see strong employment data alongside rising yields, the market typically experiences short-term volatility but often recovers within 5-7 trading days. Key levels to watch on the S&P 500 would be 4,150 as support and 4,280 as resistance.",
    timestamp: new Date('2023-04-25T09:38:00'),
    likes: 15,
    attachments: [
      {
        type: 'image',
        url: '/images/chart-sp500.png',
        title: 'S&P 500 Support/Resistance Levels'
      }
    ],
    isEdited: false,
    sentiment: 'neutral'
  },
  {
    id: 'm5',
    userId: 'u4',
    content: "Anyone watching NVDA today? It's down 3% pre-market despite no company-specific news.",
    timestamp: new Date('2023-04-25T09:41:00'),
    likes: 2,
    isEdited: false,
    sentiment: 'negative'
  },
  {
    id: 'm6',
    userId: 'u5',
    content: "I think it's just following the overall tech weakness. Their earnings are coming up in a few weeks though, might be a good dip-buying opportunity if you're bullish on AI.",
    timestamp: new Date('2023-04-25T09:44:00'),
    likes: 7,
    isEdited: false,
    sentiment: 'positive'
  },
  {
    id: 'm7',
    userId: 'u6',
    content: "NVDA is currently trading at 29.5x forward earnings, which is actually below its 5-year average of 32.7x. While valuation is still premium to the sector, the company's projected growth rate in data center and AI segments could justify the multiple. However, be aware that semiconductor stocks tend to be more volatile during periods of economic uncertainty.",
    timestamp: new Date('2023-04-25T09:47:00'),
    likes: 12,
    isEdited: false,
    sentiment: 'neutral'
  }
];

// Mock messages for a discussion thread
const mockMessagesForThread1: Message[] = [
  {
    id: 't1m1',
    userId: 'u2',
    content: "With the Fed signaling another rate hike next month, I'm concerned about the impact on high-growth tech stocks. Many of these companies rely on cheap capital for expansion, and their valuations are often based on future earnings potential.",
    timestamp: new Date('2023-04-22T14:32:00'),
    likes: 15,
    isEdited: false,
    sentiment: 'negative'
  },
  {
    id: 't1m2',
    userId: 'u3',
    content: "I agree this creates headwinds, but I think we need to differentiate between profitable tech companies with strong cash flows and unprofitable growth stories. Companies like MSFT and AAPL should be more resilient than unprofitable SaaS companies.",
    timestamp: new Date('2023-04-22T14:45:00'),
    likes: 21,
    isEdited: false,
    sentiment: 'neutral'
  },
  {
    id: 't1m3',
    userId: 'u5',
    content: "Historical data shows that tech tends to underperform in the early stages of a rate hiking cycle but often recovers as the cycle matures. We're already several hikes in, so we might start seeing some stabilization.",
    timestamp: new Date('2023-04-22T15:10:00'),
    likes: 18,
    attachments: [
      {
        type: 'image',
        url: '/images/fed-cycle-tech.png',
        title: 'Tech Performance During Fed Cycles'
      }
    ],
    isEdited: false,
    sentiment: 'positive'
  },
  {
    id: 't1m4',
    userId: 'u1',
    content: "Don't forget about the impact on debt refinancing. Companies with high debt loads that need to refinance in the next year or two could face significant challenges.",
    timestamp: new Date('2023-04-22T16:05:00'),
    likes: 14,
    isEdited: false,
    sentiment: 'negative'
  },
  {
    id: 't1m5',
    userId: 'u6',
    content: "An analysis of the current tech sector shows varying impacts of rising rates:\n\n1. Large-cap tech with strong cash flows (AAPL, MSFT, GOOG): Minimal direct impact on operations, but potential multiple compression.\n\n2. Mid-cap growth with path to profitability: Moderate pressure, especially if debt needs refinancing.\n\n3. Small-cap/unprofitable tech: Highest risk as funding costs increase and investor appetite for risk decreases.\n\nConsider adjusting tech exposure based on balance sheet strength and current profitability. Companies with net cash positions and strong free cash flow generation should outperform in this environment.",
    timestamp: new Date('2023-04-22T16:30:00'),
    likes: 32,
    attachments: [
      {
        type: 'link',
        url: '/reports/tech-sector-interest-rate-analysis.pdf',
        title: 'Full Sector Analysis Report'
      }
    ],
    isEdited: false,
    sentiment: 'neutral'
  }
];

class DiscussionService {
  private users: User[] = [...mockUsers];
  private threads: DiscussionThread[] = [...mockThreads];
  private chatrooms: Chatroom[] = [...mockChatRooms];
  private messages: Record<string, Message[]> = {
    'c1': [...mockMessagesForChatroom1],
    't1': [...mockMessagesForThread1],
  };
  
  // Get list of all discussion threads
  public getAllThreads(): DiscussionThread[] {
    return this.threads;
  }
  
  // Get threads by category
  public getThreadsByCategory(category: DiscussionCategory): DiscussionThread[] {
    return this.threads.filter(thread => thread.category === category);
  }
  
  // Get a specific thread by ID
  public getThreadById(threadId: string): DiscussionThread | undefined {
    return this.threads.find(thread => thread.id === threadId);
  }
  
  // Get messages for a specific thread
  public getMessagesForThread(threadId: string): Message[] {
    return this.messages[threadId] || [];
  }
  
  // Create a new thread
  public createThread(thread: Omit<DiscussionThread, 'id' | 'createdAt' | 'lastActivity' | 'messageCount' | 'viewCount'>): DiscussionThread {
    const newThread: DiscussionThread = {
      ...thread,
      id: `t${this.threads.length + 1}`,
      createdAt: new Date(),
      lastActivity: new Date(),
      messageCount: 0,
      viewCount: 0,
      isPinned: false,
      isLocked: false
    };
    
    this.threads.push(newThread);
    this.messages[newThread.id] = [];
    return newThread;
  }
  
  // Add a message to a thread
  public addMessageToThread(threadId: string, message: Omit<Message, 'id' | 'timestamp' | 'likes' | 'isEdited'>): Message {
    const newMessage: Message = {
      ...message,
      id: `${threadId}m${(this.messages[threadId]?.length || 0) + 1}`,
      timestamp: new Date(),
      likes: 0,
      isEdited: false
    };
    
    if (!this.messages[threadId]) {
      this.messages[threadId] = [];
    }
    
    this.messages[threadId].push(newMessage);
    
    // Update thread data
    const thread = this.threads.find(t => t.id === threadId);
    if (thread) {
      thread.messageCount = (thread.messageCount || 0) + 1;
      thread.lastActivity = new Date();
    }
    
    return newMessage;
  }
  
  // Get list of all chat rooms
  public getAllChatrooms(): Chatroom[] {
    return this.chatrooms;
  }
  
  // Get chat rooms by category
  public getChatroomsByCategory(category: DiscussionCategory): Chatroom[] {
    return this.chatrooms.filter(room => room.category === category);
  }
  
  // Get a specific chat room by ID
  public getChatroomById(roomId: string): Chatroom | undefined {
    return this.chatrooms.find(room => room.id === roomId);
  }
  
  // Get messages for a chat room
  public getMessagesForChatroom(roomId: string): Message[] {
    return this.messages[roomId] || [];
  }
  
  // Add a message to a chat room
  public addMessageToChatroom(roomId: string, message: Omit<Message, 'id' | 'timestamp' | 'likes' | 'isEdited'>): Message {
    const newMessage: Message = {
      ...message,
      id: `${roomId}m${(this.messages[roomId]?.length || 0) + 1}`,
      timestamp: new Date(),
      likes: 0,
      isEdited: false
    };
    
    if (!this.messages[roomId]) {
      this.messages[roomId] = [];
    }
    
    this.messages[roomId].push(newMessage);
    
    // Update chatroom data
    const chatroom = this.chatrooms.find(c => c.id === roomId);
    if (chatroom) {
      chatroom.messageCount = (chatroom.messageCount || 0) + 1;
      chatroom.lastActivity = new Date();
    }
    
    return newMessage;
  }
  
  // Get user by ID
  public getUserById(userId: string): User | undefined {
    return this.users.find(user => user.id === userId);
  }
  
  // Get current user (in a real app, this would involve authentication)
  public getCurrentUser(): User {
    // For demo purposes, we'll just return the first regular user
    return this.users.find(user => user.role === 'user') || this.users[0];
  }
  
  // Like a message
  public likeMessage(messageId: string): boolean {
    // Find the message in all message collections
    for (const [key, messages] of Object.entries(this.messages)) {
      const messageIndex = messages.findIndex(m => m.id === messageId);
      if (messageIndex >= 0) {
        this.messages[key][messageIndex].likes += 1;
        return true;
      }
    }
    return false;
  }
  
  // Get trending topics based on recent activity
  public getTrendingTopics(): { tag: string; count: number; sentiment: 'positive' | 'negative' | 'neutral' }[] {
    // In a real app, this would analyze recent messages and threads
    // For demo, we'll return static data
    return [
      { tag: 'interest-rates', count: 28, sentiment: 'negative' },
      { tag: 'bitcoin', count: 24, sentiment: 'positive' },
      { tag: 'earnings-season', count: 19, sentiment: 'neutral' },
      { tag: 'AI', count: 16, sentiment: 'positive' },
      { tag: 'inflation', count: 15, sentiment: 'negative' }
    ];
  }
  
  // Get AI-generated insights from discussions
  public getAIInsights(): { title: string; content: string; relatedThreads: string[] }[] {
    // In a real app, this would analyze discussions and generate insights
    // For demo, we'll return static data
    return [
      {
        title: 'Investor Sentiment Turning Cautious on Tech',
        content: 'Analysis of recent discussions shows growing concern about tech valuations in the face of rising interest rates. Common themes include worries about multiple compression and impacts on unprofitable growth companies.',
        relatedThreads: ['t1', 't4']
      },
      {
        title: 'Increasing Interest in Value Stocks',
        content: 'Community discussions reveal growing interest in traditional value sectors including energy, financials, and consumer staples as inflation concerns persist.',
        relatedThreads: ['t3', 't5']
      },
      {
        title: 'Cryptocurrency Sentiment Improving',
        content: 'Despite recent market volatility, discussion sentiment around cryptocurrencies has become increasingly positive, with particular focus on regulatory developments and institutional adoption.',
        relatedThreads: ['t2']
      }
    ];
  }
}

// Create singleton instance
export const discussionService = new DiscussionService();

// React hook for using discussions
export function useDiscussions() {
  const [threads, setThreads] = useState<DiscussionThread[]>(discussionService.getAllThreads());
  const [chatrooms, setChatrooms] = useState<Chatroom[]>(discussionService.getAllChatrooms());
  const [currentUser, setCurrentUser] = useState<User>(discussionService.getCurrentUser());
  const [trendingTopics, setTrendingTopics] = useState(discussionService.getTrendingTopics());
  const [aiInsights, setAiInsights] = useState(discussionService.getAIInsights());
  
  // Get threads by category
  const getThreadsByCategory = (category: DiscussionCategory): DiscussionThread[] => {
    return discussionService.getThreadsByCategory(category);
  };
  
  // Get thread details including messages
  const getThreadDetails = (threadId: string): { thread?: DiscussionThread; messages: Message[] } => {
    const thread = discussionService.getThreadById(threadId);
    const messages = discussionService.getMessagesForThread(threadId);
    return { thread, messages };
  };
  
  // Create a new thread
  const createThread = (thread: Omit<DiscussionThread, 'id' | 'createdAt' | 'lastActivity' | 'messageCount' | 'viewCount'>): DiscussionThread => {
    const newThread = discussionService.createThread(thread);
    setThreads(discussionService.getAllThreads());
    return newThread;
  };
  
  // Add message to thread
  const addMessageToThread = (threadId: string, message: Omit<Message, 'id' | 'timestamp' | 'likes' | 'isEdited'>): Message => {
    const newMessage = discussionService.addMessageToThread(threadId, message);
    return newMessage;
  };
  
  // Get chatroom details including messages
  const getChatroomDetails = (roomId: string): { chatroom?: Chatroom; messages: Message[] } => {
    const chatroom = discussionService.getChatroomById(roomId);
    const messages = discussionService.getMessagesForChatroom(roomId);
    return { chatroom, messages };
  };
  
  // Add message to chatroom
  const addMessageToChatroom = (roomId: string, message: Omit<Message, 'id' | 'timestamp' | 'likes' | 'isEdited'>): Message => {
    const newMessage = discussionService.addMessageToChatroom(roomId, message);
    return newMessage;
  };
  
  // Get user details
  const getUserDetails = (userId: string): User | undefined => {
    return discussionService.getUserById(userId);
  };
  
  // Like a message
  const likeMessage = (messageId: string): boolean => {
    return discussionService.likeMessage(messageId);
  };
  
  return {
    threads,
    chatrooms,
    currentUser,
    trendingTopics,
    aiInsights,
    getThreadsByCategory,
    getThreadDetails,
    createThread,
    addMessageToThread,
    getChatroomDetails,
    addMessageToChatroom,
    getUserDetails,
    likeMessage
  };
} 