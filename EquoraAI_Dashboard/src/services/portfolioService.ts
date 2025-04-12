import { useState, useEffect } from 'react';

export interface PortfolioStock {
  symbol: string;
  companyName: string;
  shares: number;
  purchasePrice: number;
  currentPrice: number;
  change: number;
  changePercent: number;
  sector: string;
  lastUpdated: Date;
}

export interface PortfolioSummary {
  totalValue: number;
  totalInvestment: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  topPerformer: PortfolioStock | null;
  worstPerformer: PortfolioStock | null;
  sectorAllocation: { sector: string; percentage: number }[];
}

// Mock portfolio data
const mockPortfolioData: PortfolioStock[] = [
  {
    symbol: 'AAPL',
    companyName: 'Apple Inc.',
    shares: 10,
    purchasePrice: 150.75,
    currentPrice: 184.32,
    change: 33.57,
    changePercent: 22.27,
    sector: 'Technology',
    lastUpdated: new Date()
  },
  {
    symbol: 'MSFT',
    companyName: 'Microsoft Corporation',
    shares: 5,
    purchasePrice: 280.45,
    currentPrice: 315.78,
    change: 35.33,
    changePercent: 12.60,
    sector: 'Technology',
    lastUpdated: new Date()
  },
  {
    symbol: 'AMZN',
    companyName: 'Amazon.com Inc.',
    shares: 3,
    purchasePrice: 135.22,
    currentPrice: 128.91,
    change: -6.31,
    changePercent: -4.67,
    sector: 'Consumer Cyclical',
    lastUpdated: new Date()
  },
  {
    symbol: 'GOOGL',
    companyName: 'Alphabet Inc.',
    shares: 4,
    purchasePrice: 120.50,
    currentPrice: 142.89,
    change: 22.39,
    changePercent: 18.58,
    sector: 'Technology',
    lastUpdated: new Date()
  },
  {
    symbol: 'META',
    companyName: 'Meta Platforms Inc.',
    shares: 8,
    purchasePrice: 318.25,
    currentPrice: 475.12,
    change: 156.87,
    changePercent: 49.29,
    sector: 'Technology',
    lastUpdated: new Date()
  },
  {
    symbol: 'TSLA',
    companyName: 'Tesla Inc.',
    shares: 6,
    purchasePrice: 260.50,
    currentPrice: 175.34,
    change: -85.16,
    changePercent: -32.69,
    sector: 'Automotive',
    lastUpdated: new Date()
  },
  {
    symbol: 'NFLX',
    companyName: 'Netflix Inc.',
    shares: 2,
    purchasePrice: 380.75,
    currentPrice: 615.95,
    change: 235.2,
    changePercent: 61.77,
    sector: 'Entertainment',
    lastUpdated: new Date()
  },
  {
    symbol: 'DIS',
    companyName: 'The Walt Disney Company',
    shares: 7,
    purchasePrice: 120.30,
    currentPrice: 107.45,
    change: -12.85,
    changePercent: -10.68,
    sector: 'Entertainment',
    lastUpdated: new Date()
  }
];

// Calculate portfolio summary
const calculatePortfolioSummary = (stocks: PortfolioStock[]): PortfolioSummary => {
  if (!stocks.length) {
    return {
      totalValue: 0,
      totalInvestment: 0,
      totalGainLoss: 0,
      totalGainLossPercent: 0,
      topPerformer: null,
      worstPerformer: null,
      sectorAllocation: []
    };
  }

  const totalValue = stocks.reduce((sum, stock) => sum + (stock.currentPrice * stock.shares), 0);
  const totalInvestment = stocks.reduce((sum, stock) => sum + (stock.purchasePrice * stock.shares), 0);
  const totalGainLoss = totalValue - totalInvestment;
  const totalGainLossPercent = (totalGainLoss / totalInvestment) * 100;

  // Find top and worst performers
  const sortedByPerformance = [...stocks].sort((a, b) => b.changePercent - a.changePercent);
  const topPerformer = sortedByPerformance[0];
  const worstPerformer = sortedByPerformance[sortedByPerformance.length - 1];

  // Calculate sector allocation
  const sectorMap = new Map<string, number>();
  stocks.forEach(stock => {
    const stockValue = stock.currentPrice * stock.shares;
    const currentSectorValue = sectorMap.get(stock.sector) || 0;
    sectorMap.set(stock.sector, currentSectorValue + stockValue);
  });

  const sectorAllocation = Array.from(sectorMap.entries()).map(([sector, value]) => ({
    sector,
    percentage: (value / totalValue) * 100
  }));

  return {
    totalValue,
    totalInvestment,
    totalGainLoss,
    totalGainLossPercent,
    topPerformer,
    worstPerformer,
    sectorAllocation
  };
};

// Custom hook for portfolio data
export const usePortfolio = () => {
  const [portfolioStocks, setPortfolioStocks] = useState<PortfolioStock[]>(mockPortfolioData);
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary>(
    calculatePortfolioSummary(mockPortfolioData)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add a new stock to portfolio
  const addStock = (newStock: Omit<PortfolioStock, 'change' | 'changePercent' | 'lastUpdated'>) => {
    try {
      const change = newStock.currentPrice - newStock.purchasePrice;
      const changePercent = (change / newStock.purchasePrice) * 100;
      
      const stockWithCalculations: PortfolioStock = {
        ...newStock,
        change,
        changePercent,
        lastUpdated: new Date()
      };
      
      const updatedPortfolio = [...portfolioStocks, stockWithCalculations];
      setPortfolioStocks(updatedPortfolio);
      setPortfolioSummary(calculatePortfolioSummary(updatedPortfolio));
      
      return true;
    } catch (err) {
      setError('Failed to add stock to portfolio');
      return false;
    }
  };

  // Update an existing stock
  const updateStock = (symbol: string, updates: Partial<PortfolioStock>) => {
    try {
      const stockIndex = portfolioStocks.findIndex(stock => stock.symbol === symbol);
      
      if (stockIndex === -1) {
        setError(`Stock with symbol ${symbol} not found`);
        return false;
      }
      
      const updatedStock = {
        ...portfolioStocks[stockIndex],
        ...updates,
        lastUpdated: new Date()
      };
      
      // Recalculate change and percent if needed
      if (updates.currentPrice || updates.purchasePrice) {
        const purchasePrice = updates.purchasePrice || portfolioStocks[stockIndex].purchasePrice;
        const currentPrice = updates.currentPrice || portfolioStocks[stockIndex].currentPrice;
        
        updatedStock.change = currentPrice - purchasePrice;
        updatedStock.changePercent = (updatedStock.change / purchasePrice) * 100;
      }
      
      const updatedPortfolio = [...portfolioStocks];
      updatedPortfolio[stockIndex] = updatedStock;
      
      setPortfolioStocks(updatedPortfolio);
      setPortfolioSummary(calculatePortfolioSummary(updatedPortfolio));
      
      return true;
    } catch (err) {
      setError(`Failed to update stock ${symbol}`);
      return false;
    }
  };

  // Remove a stock from portfolio
  const removeStock = (symbol: string) => {
    try {
      const updatedPortfolio = portfolioStocks.filter(stock => stock.symbol !== symbol);
      setPortfolioStocks(updatedPortfolio);
      setPortfolioSummary(calculatePortfolioSummary(updatedPortfolio));
      return true;
    } catch (err) {
      setError(`Failed to remove stock ${symbol}`);
      return false;
    }
  };

  // Refresh stock prices (in a real app, this would fetch from an API)
  const refreshPrices = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate random price changes for simulation
      const updatedStocks = portfolioStocks.map(stock => {
        const priceChange = (Math.random() * 10) - 5; // Random change between -5 and +5
        const newPrice = Math.max(stock.currentPrice + priceChange, 0.01); // Ensure price doesn't go below 0.01
        
        const change = newPrice - stock.purchasePrice;
        const changePercent = (change / stock.purchasePrice) * 100;
        
        return {
          ...stock,
          currentPrice: parseFloat(newPrice.toFixed(2)),
          change: parseFloat(change.toFixed(2)),
          changePercent: parseFloat(changePercent.toFixed(2)),
          lastUpdated: new Date()
        };
      });
      
      setPortfolioStocks(updatedStocks);
      setPortfolioSummary(calculatePortfolioSummary(updatedStocks));
    } catch (err) {
      setError('Failed to refresh stock prices');
    } finally {
      setLoading(false);
    }
  };

  return {
    portfolioStocks,
    portfolioSummary,
    loading,
    error,
    addStock,
    updateStock,
    removeStock,
    refreshPrices
  };
};

// Singleton export for use in components
export const portfolioService = {
  getPortfolioStocks: () => mockPortfolioData,
  getPortfolioSummary: () => calculatePortfolioSummary(mockPortfolioData)
}; 