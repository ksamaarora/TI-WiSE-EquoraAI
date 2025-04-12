import { toast } from "sonner";

// Event types
export type EventType = 'earnings' | 'dividend' | 'split' | 'conference' | 'ipo' | 'economic';

// Calendar event interface
export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO date string
  time?: string; // Optional time string
  type: EventType;
  symbol?: string; // Stock symbol if applicable
  description?: string;
  expectedMove?: number; // Expected price movement in percentage
  importance: 'high' | 'medium' | 'low';
  confirmed: boolean;
}

// Interface for subscribers
type CalendarSubscriber = (data: CalendarEvent[]) => void;

class CalendarService {
  private events: CalendarEvent[] = [];
  private subscribers: CalendarSubscriber[] = [];
  private updateInterval: NodeJS.Timeout | null = null;
  
  constructor() {
    // Initialize with mock data
    this.generateMockData();
  }
  
  // Subscribe to calendar updates
  public subscribe(callback: CalendarSubscriber): () => void {
    this.subscribers.push(callback);
    callback(this.events);
    
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }
  
  // Notify all subscribers of updates
  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback(this.events));
  }
  
  // Start real-time updates
  public startRealTimeUpdates(interval = 3600000): () => void {
    // Update every hour by default
    this.updateInterval = setInterval(() => {
      this.fetchLatestEvents();
    }, interval);
    
    return () => {
      if (this.updateInterval) {
        clearInterval(this.updateInterval);
        this.updateInterval = null;
      }
    };
  }
  
  // Fetch latest calendar events
  public async fetchLatestEvents(): Promise<void> {
    try {
      // In a real implementation, this would fetch from an API
      // For now, we'll just refresh our mock data occasionally
      this.generateMockData();
      this.notifySubscribers();
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      toast.error("Failed to update calendar events");
    }
  }
  
  // Get events by date range
  public getEventsByDateRange(startDate: Date, endDate: Date): CalendarEvent[] {
    return this.events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= startDate && eventDate <= endDate;
    });
  }
  
  // Get events by type
  public getEventsByType(type: EventType): CalendarEvent[] {
    return this.events.filter(event => event.type === type);
  }
  
  // Get events by symbol
  public getEventsBySymbol(symbol: string): CalendarEvent[] {
    return this.events.filter(event => event.symbol === symbol);
  }
  
  // Get upcoming events (next 7 days by default)
  public getUpcomingEvents(days = 7): CalendarEvent[] {
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + days);
    
    return this.getEventsByDateRange(today, endDate);
  }
  
  // Get high importance upcoming events
  public getHighImportanceEvents(): CalendarEvent[] {
    return this.getUpcomingEvents().filter(event => event.importance === 'high');
  }
  
  // Generate mock calendar data
  private generateMockData(): void {
    const now = new Date();
    const events: CalendarEvent[] = [];
    
    // Company list for mock data
    const companies = [
      { symbol: 'AAPL', name: 'Apple Inc.' },
      { symbol: 'MSFT', name: 'Microsoft Corporation' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.' },
      { symbol: 'AMZN', name: 'Amazon.com Inc.' },
      { symbol: 'META', name: 'Meta Platforms Inc.' },
      { symbol: 'TSLA', name: 'Tesla Inc.' },
      { symbol: 'NVDA', name: 'NVIDIA Corporation' },
      { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
      { symbol: 'V', name: 'Visa Inc.' },
      { symbol: 'WMT', name: 'Walmart Inc.' },
      { symbol: 'JNJ', name: 'Johnson & Johnson' },
      { symbol: 'PG', name: 'Procter & Gamble Co.' },
      { symbol: 'DIS', name: 'The Walt Disney Company' },
      { symbol: 'BAC', name: 'Bank of America Corp.' },
      { symbol: 'NFLX', name: 'Netflix Inc.' }
    ];
    
    // Generate earnings events
    for (let i = 0; i < 20; i++) {
      const company = companies[Math.floor(Math.random() * companies.length)];
      const daysAhead = Math.floor(Math.random() * 30);
      const eventDate = new Date(now);
      eventDate.setDate(eventDate.getDate() + daysAhead);
      
      const hour = 16 + Math.floor(Math.random() * 4); // 4:00 PM to 8:00 PM
      const timeStr = `${hour}:${Math.random() > 0.5 ? '30' : '00'} ${hour >= 12 ? 'PM' : 'AM'}`;
      
      events.push({
        id: `e-${i}-${Date.now()}`,
        title: `${company.name} Earnings Release`,
        date: eventDate.toISOString().split('T')[0],
        time: timeStr,
        type: 'earnings',
        symbol: company.symbol,
        description: `Q${1 + Math.floor(Math.random() * 4)} Earnings Release`,
        expectedMove: Number((4 + Math.random() * 6).toFixed(2)),
        importance: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
        confirmed: Math.random() > 0.2
      });
    }
    
    // Generate dividend events
    for (let i = 0; i < 15; i++) {
      const company = companies[Math.floor(Math.random() * companies.length)];
      const daysAhead = Math.floor(Math.random() * 45);
      const eventDate = new Date(now);
      eventDate.setDate(eventDate.getDate() + daysAhead);
      
      events.push({
        id: `d-${i}-${Date.now()}`,
        title: `${company.name} Dividend`,
        date: eventDate.toISOString().split('T')[0],
        type: 'dividend',
        symbol: company.symbol,
        description: `Quarterly dividend payout`,
        importance: 'medium',
        confirmed: true
      });
    }
    
    // Generate conference events
    const conferences = [
      'Annual Shareholders Meeting',
      'Tech Conference',
      'Product Reveal',
      'Industry Summit',
      'Financial Analyst Day'
    ];
    
    for (let i = 0; i < 10; i++) {
      const company = companies[Math.floor(Math.random() * companies.length)];
      const daysAhead = Math.floor(Math.random() * 60);
      const eventDate = new Date(now);
      eventDate.setDate(eventDate.getDate() + daysAhead);
      
      const conferenceType = conferences[Math.floor(Math.random() * conferences.length)];
      
      events.push({
        id: `c-${i}-${Date.now()}`,
        title: `${company.name} ${conferenceType}`,
        date: eventDate.toISOString().split('T')[0],
        type: 'conference',
        symbol: company.symbol,
        description: `${company.name} will host its ${conferenceType}`,
        expectedMove: Number((1 + Math.random() * 3).toFixed(2)),
        importance: Math.random() > 0.7 ? 'high' : Math.random() > 0.5 ? 'medium' : 'low',
        confirmed: Math.random() > 0.1
      });
    }
    
    // Generate economic events
    const economicEvents = [
      'Fed Interest Rate Decision',
      'Unemployment Report',
      'GDP Data Release',
      'Inflation Report',
      'Consumer Confidence Index',
      'Retail Sales Data',
      'Housing Market Data',
      'Manufacturing Index',
      'Trade Balance Report'
    ];
    
    for (let i = 0; i < 12; i++) {
      const daysAhead = Math.floor(Math.random() * 30);
      const eventDate = new Date(now);
      eventDate.setDate(eventDate.getDate() + daysAhead);
      
      const eventTitle = economicEvents[Math.floor(Math.random() * economicEvents.length)];
      
      events.push({
        id: `econ-${i}-${Date.now()}`,
        title: eventTitle,
        date: eventDate.toISOString().split('T')[0],
        time: `${8 + Math.floor(Math.random() * 8)}:${Math.random() > 0.5 ? '30' : '00'} AM`,
        type: 'economic',
        description: `Release of ${eventTitle}`,
        expectedMove: Number((0.5 + Math.random() * 2).toFixed(2)),
        importance: Math.random() > 0.6 ? 'high' : Math.random() > 0.3 ? 'medium' : 'low',
        confirmed: true
      });
    }
    
    // Generate IPO events
    const ipoCompanies = [
      'QuantumTech Solutions',
      'GreenEnergy Dynamics',
      'NextGen Biomedical',
      'CyberSecurity Innovations',
      'Smart Mobility Systems',
      'Cloud Integration Platforms',
      'Sustainable Materials Inc.',
      'AI Research Group',
      'Consumer Experience Labs'
    ];
    
    for (let i = 0; i < 5; i++) {
      const daysAhead = Math.floor(Math.random() * 60);
      const eventDate = new Date(now);
      eventDate.setDate(eventDate.getDate() + daysAhead);
      
      const company = ipoCompanies[Math.floor(Math.random() * ipoCompanies.length)];
      
      events.push({
        id: `ipo-${i}-${Date.now()}`,
        title: `${company} IPO`,
        date: eventDate.toISOString().split('T')[0],
        type: 'ipo',
        description: `Initial Public Offering for ${company}`,
        importance: 'high',
        confirmed: Math.random() > 0.3
      });
    }
    
    // Sort events by date
    this.events = events.sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }
}

export const calendarService = new CalendarService(); 