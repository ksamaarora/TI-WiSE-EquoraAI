import { toast } from "sonner";

// Types for our sentiment data
export interface SentimentData {
  timestamp: string;
  overallSentiment: number; // -1 to 1 scale
  marketIndex: string;
  currentValue: number;
  previousClose: number;
  percentChange: number;
  volume: number;
  sectors: SectorSentiment[];
  topStocks: StockSentiment[];
  recentNews: NewsItem[];
  sentimentTrend: TrendPoint[];
  volatilityIndex: number;
  marketBreadth: MarketBreadth;
  technicalIndicators: TechnicalIndicators;
  globalMarkets: GlobalMarket[];
  
  // New fields for advanced analysis
  priceCorrelation: {
    stocks: {
      symbol: string;
      name: string;
      price: number;
      percentChange: number;
      marketCap: number;
      correlationIndex: number;
    }[];
  };
  sentimentPrediction: {
    historicalData: {
      date: string;
      actual: number;
      predicted?: number;
      lower?: number;
      upper?: number;
    }[];
    predictions: {
      date: string;
      predicted: number;
      lower: number;
      upper: number;
    }[];
    confidenceLevel: number;
  };
  clusterAnalysis: {
    stocks: {
      symbol: string;
      name: string;
      volatility: number;
      momentum: number;
      marketCap: number;
      cluster: 'highGrowth' | 'value' | 'cyclical' | 'defensive';
    }[];
  };
}

export interface SectorSentiment {
  name: string;
  sentiment: number;
  percentChange: number;
  volume: number;
}

export interface StockSentiment {
  symbol: string;
  name: string;
  sentiment: number;
  price: number;
  percentChange: number;
  volume: number;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  url: string;
  sentiment: number;
  impactScore: number;
}

export interface TrendPoint {
  timestamp: string;
  sentiment: number;
  indexValue: number;
}

export interface MarketBreadth {
  advancers: number;
  decliners: number;
  unchanged: number;
  newHighs: number;
  newLows: number;
}

export interface TechnicalIndicators {
  rsi: number;
  macd: number;
  movingAverages: {
    ma50: number;
    ma200: number;
  };
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
  };
}

export interface GlobalMarket {
  name: string;
  index: string;
  value: number;
  percentChange: number;
}

// API service for fetching real financial data
class FinancialAPIService {
  private API_KEY = "demo"; // Using demo key for Alpha Vantage API
  private BASE_URL = "https://www.alphavantage.co/query";

  async fetchGlobalQuote(symbol: string): Promise<any> {
    try {
      const response = await fetch(`${this.BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.API_KEY}`);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching global quote:", error);
      return null;
    }
  }

  async fetchSectorPerformance(): Promise<any> {
    try {
      const response = await fetch(`${this.BASE_URL}?function=SECTOR&apikey=${this.API_KEY}`);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching sector performance:", error);
      return null;
    }
  }

  async fetchTimeSeriesIntraday(symbol: string): Promise<any> {
    try {
      const response = await fetch(`${this.BASE_URL}?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&apikey=${this.API_KEY}`);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching time series data:", error);
      return null;
    }
  }
}

// Generate mock data with some real data integrated
const generateMockData = async (): Promise<SentimentData> => {
  const now = new Date();
  const api = new FinancialAPIService();
  let realSPYData = null;
  let realSectorData = null;
  let realTimeSeriesData = null;

  try {
    // Attempt to fetch real data
    realSPYData = await api.fetchGlobalQuote("SPY");
    realSectorData = await api.fetchSectorPerformance();
    realTimeSeriesData = await api.fetchTimeSeriesIntraday("SPY");
    
    if (realSPYData || realSectorData || realTimeSeriesData) {
      console.log("Successfully integrated some real financial data");
    }
  } catch (error) {
    console.error("Error fetching real financial data:", error);
  }

  // Generate overall sentiment, slightly influenced by real data if available
  let currentValue, previousClose, percentChange;
  
  if (realSPYData && realSPYData["Global Quote"]) {
    const quote = realSPYData["Global Quote"];
    currentValue = parseFloat(quote["05. price"]) || 0;
    previousClose = parseFloat(quote["08. previous close"]) || 0;
    percentChange = parseFloat(quote["10. change percent"].replace("%", "")) || 0;
  } else {
    currentValue = parseFloat((26000 + Math.random() * 2000).toFixed(2));
    previousClose = parseFloat((currentValue * (1 - (Math.random() * 0.1 - 0.05))).toFixed(2));
    percentChange = parseFloat(((currentValue - previousClose) / previousClose * 100).toFixed(2));
  }

  // Calculate sentiment based on real/simulated market data
  const overallSentiment = Math.min(Math.max(percentChange / 5, -1), 1); // Scale to -1 to 1
  
  // Create time points for the past 24 hours (hourly)
  const trendPoints = await createTrendPoints(realTimeSeriesData, now);
  
  // Generate sector sentiments, using real data if available
  const sectors = generateSectorData(realSectorData);
  
  // Generate top stocks data
  const topStocks = generateStockData(percentChange);
  
  // Generate news data
  const recentNews = generateNewsData(now);

  // Generate market breadth data
  const marketBreadth = {
    advancers: Math.floor(Math.random() * 300) + 200,
    decliners: Math.floor(Math.random() * 200) + 100,
    unchanged: Math.floor(Math.random() * 50) + 20,
    newHighs: Math.floor(Math.random() * 30) + 5,
    newLows: Math.floor(Math.random() * 15) + 3
  };

  // Generate technical indicators data
  const technicalIndicators = {
    rsi: parseFloat((Math.random() * 60 + 20).toFixed(2)),
    macd: parseFloat((Math.random() * 2 - 1).toFixed(3)),
    movingAverages: {
      ma50: currentValue * (1 + Math.random() * 0.05 - 0.025),
      ma200: currentValue * (1 + Math.random() * 0.1 - 0.05)
    },
    bollingerBands: {
      upper: currentValue * 1.05,
      middle: currentValue,
      lower: currentValue * 0.95
    }
  };

  // Generate global markets data
  const globalMarkets = [
    { name: "US", index: "S&P 500", value: currentValue, percentChange },
    { name: "Japan", index: "Nikkei 225", value: parseFloat((28000 + Math.random() * 2000).toFixed(2)), percentChange: parseFloat((Math.random() * 6 - 3).toFixed(2)) },
    { name: "UK", index: "FTSE 100", value: parseFloat((7000 + Math.random() * 500).toFixed(2)), percentChange: parseFloat((Math.random() * 4 - 2).toFixed(2)) },
    { name: "Germany", index: "DAX", value: parseFloat((15000 + Math.random() * 1000).toFixed(2)), percentChange: parseFloat((Math.random() * 5 - 2.5).toFixed(2)) },
    { name: "China", index: "Shanghai", value: parseFloat((3300 + Math.random() * 300).toFixed(2)), percentChange: parseFloat((Math.random() * 4 - 2).toFixed(2)) }
  ];

  // Generate price correlation data
  const priceCorrelation = {
    stocks: topStocks.map(stock => ({
      symbol: stock.symbol,
      name: stock.name,
      price: stock.price,
      percentChange: stock.percentChange,
      marketCap: Math.floor(Math.random() * 500000000000) + 10000000000,
      correlationIndex: parseFloat((Math.random() * 2 - 1).toFixed(2))
    }))
  };

  // Generate sentiment prediction data
  const sentimentPrediction = generateSentimentPredictionData(overallSentiment, now);
  
  // Generate cluster analysis data
  const clusterAnalysis = {
    stocks: topStocks.map(stock => ({
      symbol: stock.symbol,
      name: stock.name,
      volatility: parseFloat((Math.random() * 1.5).toFixed(2)),
      momentum: parseFloat((Math.random() * 2 - 1).toFixed(2)),
      marketCap: Math.floor(Math.random() * 500000000000) + 10000000000,
      cluster: ['highGrowth', 'value', 'cyclical', 'defensive'][Math.floor(Math.random() * 4)] as 'highGrowth' | 'value' | 'cyclical' | 'defensive'
    }))
  };

  return {
    timestamp: now.toISOString(),
    overallSentiment,
    marketIndex: "S&P 500",
    currentValue,
    previousClose,
    percentChange,
    volume: Math.floor(Math.random() * 1000000000) + 500000000,
    sectors,
    topStocks,
    recentNews,
    sentimentTrend: trendPoints,
    volatilityIndex: parseFloat((Math.random() * 10 + 15).toFixed(2)),
    marketBreadth,
    technicalIndicators,
    globalMarkets,
    priceCorrelation,
    sentimentPrediction,
    clusterAnalysis
  };
};

// Helper function to create trend points, integrating real data when available
const createTrendPoints = async (realTimeSeriesData: any, now: Date): Promise<TrendPoint[]> => {
  if (realTimeSeriesData && realTimeSeriesData["Time Series (5min)"]) {
    try {
      const timeSeriesData = realTimeSeriesData["Time Series (5min)"];
      const timestamps = Object.keys(timeSeriesData).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      
      // Take latest 24 data points (approx. 2 hours of 5-min data)
      const points = timestamps.slice(0, 24).map(timestamp => {
        const entry = timeSeriesData[timestamp];
        const indexValue = parseFloat(entry["4. close"]);
        // Calculate a sentiment value based on price movement
        const open = parseFloat(entry["1. open"]);
        const sentiment = ((indexValue - open) / open) * 5; // Scale to approximately -1 to 1
        
        return {
          timestamp,
          sentiment: Math.min(Math.max(sentiment, -1), 1),
          indexValue
        };
      });
      
      return points;
    } catch (error) {
      console.error("Error processing time series data:", error);
    }
  }
  
  // Fallback to generated data
  return Array.from({ length: 24 }, (_, i) => {
    const trendTime = new Date(now);
    trendTime.setHours(now.getHours() - 23 + i);
    return {
      timestamp: trendTime.toISOString(),
      sentiment: parseFloat((Math.random() * 2 - 1).toFixed(2)),
      indexValue: parseFloat((25000 + Math.random() * 3000).toFixed(2))
    };
  });
};

// Helper function to generate sector data
const generateSectorData = (realSectorData: any): SectorSentiment[] => {
  const sectorNames = [
    "Technology", "Healthcare", "Financials", 
    "Consumer Discretionary", "Communication Services",
    "Industrials", "Energy", "Utilities", "Materials", "Real Estate"
  ];
  
  if (realSectorData && realSectorData["Rank A: Real-Time Performance"]) {
    try {
      return Object.entries(realSectorData["Rank A: Real-Time Performance"])
        .filter(([key]) => key !== "Information Technology")
        .map(([name, changeStr]) => {
          const percentChange = parseFloat(changeStr.toString().replace("%", ""));
          const sentiment = percentChange / 5; // Scale to approximately -1 to 1 range
          
          return {
            name,
            sentiment: Math.min(Math.max(sentiment, -1), 1),
            percentChange,
            volume: Math.floor(Math.random() * 10000000) + 500000
          };
        });
    } catch (error) {
      console.error("Error processing sector data:", error);
    }
  }
  
  // Fallback to generated data
  return sectorNames.map(name => ({
    name,
    sentiment: parseFloat((Math.random() * 2 - 1).toFixed(2)),
    percentChange: parseFloat((Math.random() * 10 - 5).toFixed(2)),
    volume: Math.floor(Math.random() * 10000000) + 500000
  }));
};

// Helper function to generate stock data
const generateStockData = (marketPercentChange: number): StockSentiment[] => {
  const stockNames = [
    { symbol: "AAPL", name: "Apple Inc." },
    { symbol: "MSFT", name: "Microsoft Corporation" },
    { symbol: "GOOGL", name: "Alphabet Inc." },
    { symbol: "AMZN", name: "Amazon.com Inc." },
    { symbol: "META", name: "Meta Platforms Inc." },
    { symbol: "TSLA", name: "Tesla Inc." },
    { symbol: "NVDA", name: "NVIDIA Corporation" },
    { symbol: "JPM", name: "JPMorgan Chase & Co." },
    { symbol: "V", name: "Visa Inc." },
    { symbol: "JNJ", name: "Johnson & Johnson" }
  ];
  
  // Generate stock data with some correlation to overall market
  return stockNames.map(stock => {
    const baseChange = marketPercentChange * (0.5 + Math.random());
    const deviation = (Math.random() * 6) - 3; // Random component
    const percentChange = parseFloat((baseChange + deviation).toFixed(2));
    
    return {
      symbol: stock.symbol,
      name: stock.name,
      sentiment: Math.min(Math.max(percentChange / 10, -1), 1), // Scale to -1 to 1
      price: parseFloat((100 + Math.random() * 900).toFixed(2)),
      percentChange,
      volume: Math.floor(Math.random() * 5000000) + 100000
    };
  });
};

// Helper function to generate news data
const generateNewsData = (now: Date): NewsItem[] => {
  const newsTitles = [
    "Federal Reserve Signals Interest Rate Decision",
    "Major Tech Companies Report Quarterly Earnings",
    "Oil Prices Surge Amid Global Supply Concerns",
    "Inflation Data Shows Unexpected Trend",
    "New Government Policy Impacts Market Sectors",
    "Retail Sales Data Exceeds Analyst Expectations",
    "Global Markets React to Economic Indicator Release",
    "Trade Negotiations Affect International Markets",
    "Banking Sector Faces Regulatory Changes",
    "Technology Innovation Drives Stock Movements"
  ];
  
  const newsSources = ["Bloomberg", "Reuters", "CNBC", "Financial Times", "Wall Street Journal"];
  
  return newsTitles.map((title, idx) => ({
    id: `news-${idx}`,
    title,
    source: newsSources[Math.floor(Math.random() * newsSources.length)],
    publishedAt: new Date(now.getTime() - Math.random() * 86400000).toISOString(),
    url: "#",
    sentiment: parseFloat((Math.random() * 2 - 1).toFixed(2)),
    impactScore: parseFloat((Math.random()).toFixed(2))
  }));
};

// Helper function to generate sentiment prediction data
const generateSentimentPredictionData = (currentSentiment: number, now: Date) => {
  // Generate 14 days of historical data (past 2 weeks)
  const historicalData = Array.from({ length: 14 }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (14 - i));
    
    // Create a somewhat realistic pattern with some randomness
    const basePattern = Math.sin((i / 14) * Math.PI) * 0.3;
    const randomNoise = (Math.random() * 0.4 - 0.2); 
    const actual = Math.min(Math.max(basePattern + randomNoise, -1), 1);
    
    return {
      date: date.toISOString().split('T')[0],
      actual,
      // Only add predictions for the last few days
      predicted: i >= 10 ? parseFloat((actual * 0.9 + Math.random() * 0.2 - 0.1).toFixed(2)) : undefined,
      lower: i >= 10 ? parseFloat((actual * 0.9 - 0.15).toFixed(2)) : undefined,
      upper: i >= 10 ? parseFloat((actual * 0.9 + 0.15).toFixed(2)) : undefined
    };
  });
  
  // Generate 5 days of predictions (next week)
  const predictions = Array.from({ length: 5 }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() + (i + 1));
    
    // Base the prediction on the current sentiment with a trend and uncertainty
    const trend = Math.random() > 0.5 ? 0.05 * (i + 1) : -0.05 * (i + 1);
    const predicted = parseFloat(Math.min(Math.max(currentSentiment + trend, -1), 1).toFixed(2));
    const uncertainty = 0.1 + (i * 0.02); // Uncertainty increases with time
    
    return {
      date: date.toISOString().split('T')[0],
      predicted,
      lower: parseFloat(Math.max(predicted - uncertainty, -1).toFixed(2)),
      upper: parseFloat(Math.min(predicted + uncertainty, 1).toFixed(2))
    };
  });
  
  return {
    historicalData,
    predictions,
    confidenceLevel: 85 // Confidence level in percentage
  };
};

// Interval reference for real-time updates
let updateInterval: NodeJS.Timeout | null = null;

// Service class for fetching and managing sentiment data
class SentimentService {
  private data: SentimentData | null = null;
  private listeners: ((data: SentimentData) => void)[] = [];

  constructor() {
    // Initialize with mock data immediately
    generateMockData().then(data => {
      this.data = data;
    });
  }

  // Start real-time updates (using a mix of real API and simulated data)
  startRealTimeUpdates(interval = 30000) {
    if (updateInterval) {
      clearInterval(updateInterval);
    }
    
    // Initial data fetch
    this.fetchLatestData();
    
    // Set up interval for updates
    updateInterval = setInterval(() => {
      this.fetchLatestData();
    }, interval);
    
    return () => {
      if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
      }
    };
  }
  
  // Stop real-time updates
  stopRealTimeUpdates() {
    if (updateInterval) {
      clearInterval(updateInterval);
      updateInterval = null;
    }
  }
  
  // Fetch latest data
  async fetchLatestData() {
    try {
      // This integrates real API data where possible
      this.data = await generateMockData();
      
      // Notify listeners
      this.notifyListeners();
      
      return this.data;
    } catch (error) {
      console.error("Error fetching sentiment data:", error);
      toast.error("Failed to fetch latest market data", {
        description: "Please check your connection and try again."
      });
      return null;
    }
  }
  
  // Get current data
  getCurrentData(): SentimentData | null {
    return this.data;
  }
  
  // Subscribe to data updates
  subscribe(listener: (data: SentimentData) => void) {
    this.listeners.push(listener);
    
    // If we already have data, notify the new listener immediately
    if (this.data) {
      listener(this.data);
    }
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  
  // Notify all listeners of data changes
  private notifyListeners() {
    if (!this.data) return;
    
    this.listeners.forEach(listener => {
      listener(this.data!);
    });
  }
}

// Create and export a singleton instance
export const sentimentService = new SentimentService();
