import { useState, useEffect } from 'react';

// Define types for stock visualization data
export interface StockDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjClose?: number;
}

export interface SectorPerformance {
  sector: string;
  oneDay: number;
  oneWeek: number;
  oneMonth: number;
  threeMonth: number;
  sixMonth: number;
  ytd: number;
  oneYear: number;
}

export interface StockMetric {
  ticker: string;
  name: string;
  sector: string;
  industry: string;
  marketCap: number;
  pe: number;
  forwardPE: number;
  eps: number;
  beta: number;
  dividend: number;
  yield: number;
  avgVolume: number;
  volume: number;
}

export interface CorrelationData {
  stock1: string;
  stock2: string;
  correlation: number;
}

export interface MarketCapData {
  name: string;
  ticker: string;
  marketCap: number;
  sector: string;
  change: number;
}

export interface CandlestickData extends StockDataPoint {}

// Stock comparison metrics
export interface ComparisonMetric {
  metric: string;
  description: string;
  stock1Value: number;
  stock2Value: number;
}

// Mock data generation utilities
const generateTimeSeries = (days: number, volatility: number, trend: number, startPrice: number): StockDataPoint[] => {
  const today = new Date();
  const result: StockDataPoint[] = [];
  let price = startPrice;

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    // Add some random movement plus trend
    const change = (Math.random() - 0.5) * volatility + trend;
    const percentChange = 1 + change / 100;
    
    // Calculate new price
    price = price * percentChange;
    
    // Generate daily range
    const open = price * (1 + (Math.random() - 0.5) * 0.01);
    const close = price;
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);
    const volume = Math.floor(500000 + Math.random() * 5000000);
    
    result.push({
      date: date.toISOString().split('T')[0],
      open,
      high,
      low,
      close,
      volume,
      adjClose: close
    });
  }
  
  return result;
};

// Mock data for stocks
const mockStocks = [
  { ticker: 'AAPL', name: 'Apple Inc.', sector: 'Technology', startPrice: 180, volatility: 1.2, trend: 0.05 },
  { ticker: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology', startPrice: 340, volatility: 1.0, trend: 0.08 },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology', startPrice: 130, volatility: 1.5, trend: 0.03 },
  { ticker: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer Cyclical', startPrice: 125, volatility: 1.8, trend: 0.02 },
  { ticker: 'TSLA', name: 'Tesla, Inc.', sector: 'Automotive', startPrice: 240, volatility: 3.0, trend: -0.04 },
  { ticker: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Financial Services', startPrice: 150, volatility: 1.2, trend: 0.01 },
  { ticker: 'V', name: 'Visa Inc.', sector: 'Financial Services', startPrice: 235, volatility: 0.9, trend: 0.03 },
  { ticker: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare', startPrice: 160, volatility: 0.7, trend: -0.01 },
  { ticker: 'PG', name: 'Procter & Gamble Co.', sector: 'Consumer Defensive', startPrice: 145, volatility: 0.6, trend: 0.02 },
  { ticker: 'XOM', name: 'Exxon Mobil Corporation', sector: 'Energy', startPrice: 105, volatility: 1.3, trend: 0.04 },
  { ticker: 'BAC', name: 'Bank of America Corp.', sector: 'Financial Services', startPrice: 32, volatility: 1.4, trend: 0.01 },
  { ticker: 'DIS', name: 'Walt Disney Co.', sector: 'Communication Services', startPrice: 85, volatility: 1.6, trend: -0.02 },
  { ticker: 'NFLX', name: 'Netflix, Inc.', sector: 'Communication Services', startPrice: 385, volatility: 2.0, trend: 0.06 },
  { ticker: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology', startPrice: 410, volatility: 2.5, trend: 0.1 },
  { ticker: 'ADBE', name: 'Adobe Inc.', sector: 'Technology', startPrice: 530, volatility: 1.7, trend: 0.03 }
];

// Generate mock sector performance data
const mockSectorPerformance: SectorPerformance[] = [
  { sector: 'Technology', oneDay: 0.8, oneWeek: 2.3, oneMonth: 5.6, threeMonth: 8.9, sixMonth: 15.2, ytd: 22.5, oneYear: 28.7 },
  { sector: 'Healthcare', oneDay: -0.2, oneWeek: 1.2, oneMonth: 3.5, threeMonth: 6.8, sixMonth: 10.2, ytd: 15.5, oneYear: 18.7 },
  { sector: 'Financial Services', oneDay: 0.5, oneWeek: 1.8, oneMonth: 4.2, threeMonth: 7.5, sixMonth: 12.8, ytd: 16.3, oneYear: 22.1 },
  { sector: 'Consumer Cyclical', oneDay: -0.3, oneWeek: -0.8, oneMonth: 2.1, threeMonth: 5.3, sixMonth: 9.5, ytd: 14.2, oneYear: 17.8 },
  { sector: 'Communication Services', oneDay: 0.6, oneWeek: 1.5, oneMonth: 3.8, threeMonth: 7.2, sixMonth: 11.5, ytd: 16.8, oneYear: 20.3 },
  { sector: 'Industrials', oneDay: 0.3, oneWeek: 1.1, oneMonth: 2.9, threeMonth: 6.1, sixMonth: 10.8, ytd: 14.7, oneYear: 19.2 },
  { sector: 'Consumer Defensive', oneDay: -0.1, oneWeek: 0.7, oneMonth: 2.5, threeMonth: 5.2, sixMonth: 8.7, ytd: 12.3, oneYear: 15.6 },
  { sector: 'Energy', oneDay: 1.2, oneWeek: 3.1, oneMonth: 6.8, threeMonth: 10.2, sixMonth: 16.5, ytd: 23.1, oneYear: 27.5 },
  { sector: 'Utilities', oneDay: -0.4, oneWeek: -0.2, oneMonth: 1.8, threeMonth: 4.3, sixMonth: 7.2, ytd: 9.8, oneYear: 12.4 },
  { sector: 'Real Estate', oneDay: -0.6, oneWeek: -1.0, oneMonth: 1.2, threeMonth: 3.5, sixMonth: 6.8, ytd: 8.9, oneYear: 11.2 },
  { sector: 'Basic Materials', oneDay: 0.7, oneWeek: 2.0, oneMonth: 4.5, threeMonth: 8.3, sixMonth: 13.7, ytd: 18.2, oneYear: 22.8 },
];

// Generate mock stock metrics
const generateStockMetrics = (): StockMetric[] => {
  return mockStocks.map(stock => {
    const pe = 10 + Math.random() * 40;
    return {
      ticker: stock.ticker,
      name: stock.name,
      sector: stock.sector,
      industry: `${stock.sector} Subcategory`,
      marketCap: Math.floor(10000000000 + Math.random() * 2000000000000) / 1000000000,
      pe: pe,
      forwardPE: pe * (0.8 + Math.random() * 0.4),
      eps: stock.startPrice / pe,
      beta: 0.5 + Math.random() * 1.5,
      dividend: Math.random() < 0.8 ? 0.1 + Math.random() * 3 : 0,
      yield: Math.random() < 0.8 ? 0.5 + Math.random() * 3.5 : 0,
      avgVolume: Math.floor(1000000 + Math.random() * 10000000),
      volume: Math.floor(500000 + Math.random() * 15000000)
    };
  });
};

// Generate mock correlation data
const generateCorrelationMatrix = (): CorrelationData[] => {
  const result: CorrelationData[] = [];
  
  for (let i = 0; i < mockStocks.length; i++) {
    for (let j = i + 1; j < mockStocks.length; j++) {
      // Higher correlation for stocks in the same sector
      const baseLine = mockStocks[i].sector === mockStocks[j].sector ? 0.7 : 0.3;
      const correlation = baseLine + (Math.random() * 0.5 - 0.25);
      
      result.push({
        stock1: mockStocks[i].ticker,
        stock2: mockStocks[j].ticker,
        correlation: Math.min(Math.max(correlation, -1), 1)
      });
    }
  }
  
  return result;
};

// Generate market cap data for treemap
const generateMarketCapData = (): MarketCapData[] => {
  return mockStocks.map(stock => {
    return {
      name: stock.name,
      ticker: stock.ticker,
      marketCap: Math.floor(10000000000 + Math.random() * 2000000000000) / 1000000000,
      sector: stock.sector,
      change: (Math.random() * 10 - 3)
    };
  });
};

// Generate comparison metrics
const generateComparisonMetrics = (stock1: string, stock2: string): ComparisonMetric[] => {
  const metrics = [
    { metric: 'P/E Ratio', description: 'Price to Earnings Ratio' },
    { metric: 'Revenue Growth', description: 'Year-over-year revenue growth' },
    { metric: 'Profit Margin', description: 'Net profit as percentage of revenue' },
    { metric: 'ROE', description: 'Return on Equity' },
    { metric: 'Debt to Equity', description: 'Total debt divided by equity' },
    { metric: 'Current Ratio', description: 'Current assets divided by current liabilities' },
    { metric: 'Beta', description: 'Stock volatility compared to the market' },
    { metric: 'Dividend Yield', description: 'Annual dividend per share divided by stock price' },
  ];
  
  return metrics.map(metric => ({
    ...metric,
    stock1Value: Number((1 + Math.random() * 40).toFixed(2)),
    stock2Value: Number((1 + Math.random() * 40).toFixed(2))
  }));
};

// Visualization service
export class VisualizationService {
  private stockData: Map<string, StockDataPoint[]> = new Map();
  private sectorPerformance: SectorPerformance[] = [...mockSectorPerformance];
  private stockMetrics: StockMetric[] = generateStockMetrics();
  private correlationData: CorrelationData[] = generateCorrelationMatrix();
  private marketCapData: MarketCapData[] = generateMarketCapData();
  
  constructor() {
    // Initialize stock data for all stocks
    mockStocks.forEach(stock => {
      this.stockData.set(
        stock.ticker, 
        generateTimeSeries(365, stock.volatility, stock.trend, stock.startPrice)
      );
    });
  }
  
  // Force regeneration of data for a specific stock
  forceRegenerateData(ticker: string, comparisonTicker?: string) {
    const stock = mockStocks.find(s => s.ticker === ticker);
    
    if (stock) {
      // Regenerate data for the selected stock
      this.stockData.set(
        stock.ticker, 
        generateTimeSeries(365, stock.volatility, stock.trend, stock.startPrice)
      );
    }
    
    // If comparison ticker is provided, regenerate its data too
    if (comparisonTicker) {
      const comparisonStock = mockStocks.find(s => s.ticker === comparisonTicker);
      if (comparisonStock) {
        this.stockData.set(
          comparisonStock.ticker, 
          generateTimeSeries(365, comparisonStock.volatility, comparisonStock.trend, comparisonStock.startPrice)
        );
      }
    }
    
    // Regenerate market data as well
    this.marketCapData = generateMarketCapData();
    this.correlationData = generateCorrelationMatrix();
  }
  
  // Get stock price data for a specific ticker
  getStockData(ticker: string, days: number = 90): StockDataPoint[] {
    const data = this.stockData.get(ticker);
    if (!data) return [];
    return data.slice(-days);
  }
  
  // Get candlestick data
  getCandlestickData(ticker: string, days: number = 30): CandlestickData[] {
    return this.getStockData(ticker, days);
  }
  
  // Get sector performance
  getSectorPerformance(): SectorPerformance[] {
    return [...this.sectorPerformance];
  }
  
  // Get stock metrics
  getStockMetrics(): StockMetric[] {
    return [...this.stockMetrics];
  }
  
  // Get stock list
  getStockList(): { ticker: string; name: string; sector: string }[] {
    return mockStocks.map(stock => ({
      ticker: stock.ticker,
      name: stock.name,
      sector: stock.sector
    }));
  }
  
  // Get correlation data
  getCorrelationData(): CorrelationData[] {
    return [...this.correlationData];
  }
  
  // Get market cap data for treemap
  getMarketCapData(): MarketCapData[] {
    return [...this.marketCapData];
  }
  
  // Get comparison metrics for two stocks
  getComparisonMetrics(stock1: string, stock2: string): ComparisonMetric[] {
    return generateComparisonMetrics(stock1, stock2);
  }
}

// Create singleton instance
export const visualizationService = new VisualizationService();

// React hook for using visualizations
export function useStockVisualization() {
  const [selectedStock, setSelectedStock] = useState<string>('AAPL');
  const [timeRange, setTimeRange] = useState<number>(90);
  const [comparisonStock, setComparisonStock] = useState<string | null>(null);
  
  // Force reload of stock data
  const reloadData = (ticker: string = selectedStock, comparisonTicker: string | null = null) => {
    visualizationService.forceRegenerateData(ticker, comparisonTicker || undefined);
  };
  
  // Get data for the selected stock
  const stockData = visualizationService.getStockData(selectedStock, timeRange);
  const candlestickData = visualizationService.getCandlestickData(selectedStock, timeRange);
  const stockList = visualizationService.getStockList();
  const sectorPerformance = visualizationService.getSectorPerformance();
  const stockMetrics = visualizationService.getStockMetrics();
  const correlationData = visualizationService.getCorrelationData();
  const marketCapData = visualizationService.getMarketCapData();
  
  // Get comparison data if a comparison stock is selected
  const comparisonData = comparisonStock 
    ? visualizationService.getStockData(comparisonStock, timeRange) 
    : null;
  
  // Get comparison metrics
  const comparisonMetrics = comparisonStock 
    ? visualizationService.getComparisonMetrics(selectedStock, comparisonStock)
    : [];
  
  return {
    selectedStock,
    setSelectedStock,
    timeRange,
    setTimeRange,
    comparisonStock,
    setComparisonStock,
    stockData,
    candlestickData,
    stockList,
    sectorPerformance,
    stockMetrics,
    correlationData,
    marketCapData,
    comparisonData,
    comparisonMetrics,
    reloadData
  };
} 