import { useState, useEffect } from 'react';

export interface CryptoCurrency {
  id: string;
  symbol: string;
  name: string;
  image: string;
  currentPrice: number;
  marketCap: number;
  volume24h: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
  circulatingSupply: number;
  totalSupply: number;
  ath: number;
  athChangePercentage: number;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  sentimentScore: number;
  lastUpdated: Date;
}

export interface CryptoMarketStats {
  totalMarketCap: number;
  totalVolume24h: number;
  btcDominance: number;
  ethDominance: number;
  marketCapChange24h: number;
  activeCoins: number;
  averageSentimentScore: number;
  overallMarketSentiment: 'bullish' | 'bearish' | 'neutral';
}

export interface CryptoNewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: Date;
  sentiment: 'positive' | 'negative' | 'neutral';
  relevance: number;
  coins: string[]; // Related coin symbols
}

// Mock cryptocurrency data
const mockCryptoData: CryptoCurrency[] = [
  {
    id: 'bitcoin',
    symbol: 'btc',
    name: 'Bitcoin',
    image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    currentPrice: 56732.48,
    marketCap: 1112456789012,
    volume24h: 38297456123,
    priceChange24h: 1257.34,
    priceChangePercentage24h: 2.27,
    circulatingSupply: 19584325,
    totalSupply: 21000000,
    ath: 69045,
    athChangePercentage: -17.82,
    sentiment: 'bullish',
    sentimentScore: 0.72,
    lastUpdated: new Date()
  },
  {
    id: 'ethereum',
    symbol: 'eth',
    name: 'Ethereum',
    image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    currentPrice: 3045.29,
    marketCap: 365812456789,
    volume24h: 19845123678,
    priceChange24h: -89.43,
    priceChangePercentage24h: -2.85,
    circulatingSupply: 120234567,
    totalSupply: null,
    ath: 4878.26,
    athChangePercentage: -37.58,
    sentiment: 'neutral',
    sentimentScore: 0.48,
    lastUpdated: new Date()
  },
  {
    id: 'binancecoin',
    symbol: 'bnb',
    name: 'Binance Coin',
    image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
    currentPrice: 587.34,
    marketCap: 90367890123,
    volume24h: 2345678901,
    priceChange24h: 12.56,
    priceChangePercentage24h: 2.19,
    circulatingSupply: 153856789,
    totalSupply: 165116760,
    ath: 686.31,
    athChangePercentage: -14.41,
    sentiment: 'bullish',
    sentimentScore: 0.65,
    lastUpdated: new Date()
  },
  {
    id: 'solana',
    symbol: 'sol',
    name: 'Solana',
    image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
    currentPrice: 142.68,
    marketCap: 62578123456,
    volume24h: 3287456123,
    priceChange24h: -5.34,
    priceChangePercentage24h: -3.61,
    circulatingSupply: 438567890,
    totalSupply: null,
    ath: 259.96,
    athChangePercentage: -45.12,
    sentiment: 'bearish',
    sentimentScore: 0.32,
    lastUpdated: new Date()
  },
  {
    id: 'ripple',
    symbol: 'xrp',
    name: 'XRP',
    image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
    currentPrice: 0.5478,
    marketCap: 29956789012,
    volume24h: 1568923456,
    priceChange24h: 0.0123,
    priceChangePercentage24h: 2.3,
    circulatingSupply: 54678234567,
    totalSupply: 100000000000,
    ath: 3.40,
    athChangePercentage: -83.9,
    sentiment: 'neutral',
    sentimentScore: 0.51,
    lastUpdated: new Date()
  },
  {
    id: 'cardano',
    symbol: 'ada',
    name: 'Cardano',
    image: 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
    currentPrice: 0.45,
    marketCap: 15862345678,
    volume24h: 798123456,
    priceChange24h: -0.0098,
    priceChangePercentage24h: -2.13,
    circulatingSupply: 35267890123,
    totalSupply: 45000000000,
    ath: 3.09,
    athChangePercentage: -85.44,
    sentiment: 'neutral',
    sentimentScore: 0.47,
    lastUpdated: new Date()
  },
  {
    id: 'dogecoin',
    symbol: 'doge',
    name: 'Dogecoin',
    image: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png',
    currentPrice: 0.1234,
    marketCap: 17345678901,
    volume24h: 987234567,
    priceChange24h: 0.0087,
    priceChangePercentage24h: 7.59,
    circulatingSupply: 140567890123,
    totalSupply: null,
    ath: 0.731578,
    athChangePercentage: -83.13,
    sentiment: 'bullish',
    sentimentScore: 0.78,
    lastUpdated: new Date()
  },
  {
    id: 'polkadot',
    symbol: 'dot',
    name: 'Polkadot',
    image: 'https://assets.coingecko.com/coins/images/12171/large/polkadot.png',
    currentPrice: 6.78,
    marketCap: 9876543210,
    volume24h: 456789012,
    priceChange24h: -0.32,
    priceChangePercentage24h: -4.5,
    circulatingSupply: 1458123456,
    totalSupply: null,
    ath: 54.98,
    athChangePercentage: -87.67,
    sentiment: 'bearish',
    sentimentScore: 0.29,
    lastUpdated: new Date()
  }
];

// Mock crypto market stats
const mockMarketStats: CryptoMarketStats = {
  totalMarketCap: 2185456789012,
  totalVolume24h: 98765432109,
  btcDominance: 50.9,
  ethDominance: 16.7,
  marketCapChange24h: 1.2,
  activeCoins: 10426,
  averageSentimentScore: 0.58,
  overallMarketSentiment: 'bullish'
};

// Mock crypto news
const mockCryptoNews: CryptoNewsItem[] = [
  {
    id: '1',
    title: 'Bitcoin ETFs see record inflows as price surges above $55K',
    url: 'https://www.coindesk.com/markets/2024/03/02/bitcoin-etfs-record-inflows/',
    source: 'CoinDesk',
    publishedAt: new Date(Date.now() - 3600000 * 2), // 2 hours ago
    sentiment: 'positive',
    relevance: 0.95,
    coins: ['btc']
  },
  {
    id: '2',
    title: 'Ethereum developer activity reaches all-time high ahead of ETH2 upgrades',
    url: 'https://cointelegraph.com/news/ethereum-devs-activity-all-time-high',
    source: 'Cointelegraph',
    publishedAt: new Date(Date.now() - 3600000 * 5), // 5 hours ago
    sentiment: 'positive',
    relevance: 0.92,
    coins: ['eth']
  },
  {
    id: '3',
    title: 'Regulatory concerns weigh on crypto market as governments signal tighter control',
    url: 'https://www.reuters.com/technology/crypto-regulation-global-tightening-2024-05-08/',
    source: 'Reuters',
    publishedAt: new Date(Date.now() - 3600000 * 10), // 10 hours ago
    sentiment: 'negative',
    relevance: 0.88,
    coins: ['btc', 'eth', 'xrp']
  },
  {
    id: '4',
    title: 'Solana experiences network outage, SOL price drops',
    url: 'https://www.theblock.co/post/265876/solana-network-outage-sol-price',
    source: 'The Block',
    publishedAt: new Date(Date.now() - 3600000 * 24), // 1 day ago
    sentiment: 'negative',
    relevance: 0.87,
    coins: ['sol']
  },
  {
    id: '5',
    title: 'Dogecoin rallies after celebrity endorsements on social media',
    url: 'https://decrypt.co/214368/dogecoin-rallies-after-celebrity-endorsement',
    source: 'Decrypt',
    publishedAt: new Date(Date.now() - 3600000 * 36), // 1.5 days ago
    sentiment: 'positive',
    relevance: 0.81,
    coins: ['doge']
  },
  {
    id: '6',
    title: 'Cardano completes Hydra upgrade, promises improved transaction throughput',
    url: 'https://ambcrypto.com/cardano-hydra-update-transaction-throughput/',
    source: 'AMBCrypto',
    publishedAt: new Date(Date.now() - 3600000 * 48), // 2 days ago
    sentiment: 'positive',
    relevance: 0.79,
    coins: ['ada']
  },
  {
    id: '7',
    title: 'NFT marketplace sees surge in trading volume as digital collectibles gain momentum',
    url: 'https://nftevening.com/opensea-trading-volume-surge-2024/',
    source: 'NFT Evening',
    publishedAt: new Date(Date.now() - 3600000 * 60), // 2.5 days ago
    sentiment: 'positive',
    relevance: 0.75,
    coins: ['eth', 'sol']
  }
];

// Calculate time-series data for charts
const generateTimeSeriesData = (cryptos: CryptoCurrency[], days: number) => {
  const now = new Date();
  const data = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - (days - i - 1));
    
    const dataPoint: any = {
      date: date.toISOString().split('T')[0], // YYYY-MM-DD format
    };
    
    cryptos.forEach(crypto => {
      // Generate somewhat realistic price simulations with some randomness
      // but maintaining general trend directions
      const trend = crypto.priceChangePercentage24h > 0 ? 1 : -1;
      const volatility = Math.random() * 0.1; // 0-10% daily volatility
      const dailyChange = trend * (0.5 + Math.random()) * volatility;
      
      const basePrice = crypto.currentPrice / (1 + (crypto.priceChangePercentage24h / 100));
      const factor = 1 + (dailyChange * (days - i - 1) / days);
      
      // Add some random noise to make the chart less uniform
      const noise = (Math.random() - 0.5) * 0.02 * basePrice;
      
      dataPoint[crypto.symbol] = basePrice * factor + noise;
    });
    
    data.push(dataPoint);
  }
  
  return data;
};

const mockTimeSeriesData = generateTimeSeriesData(mockCryptoData, 30); // 30 days of data

// Custom hook for crypto data and functionality
export const useCrypto = () => {
  const [cryptos, setCryptos] = useState<CryptoCurrency[]>(mockCryptoData);
  const [marketStats, setMarketStats] = useState<CryptoMarketStats>(mockMarketStats);
  const [news, setNews] = useState<CryptoNewsItem[]>(mockCryptoNews);
  const [timeSeriesData, setTimeSeriesData] = useState(mockTimeSeriesData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('30d');

  // Function to refresh cryptocurrency data
  const refreshData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real application, this would be an API call
      // For now, we'll simulate some random price changes
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
      
      const updatedCryptos = cryptos.map(crypto => {
        // Generate random price change (between -5% and +5%)
        const priceChangePercent = (Math.random() - 0.5) * 10;
        const priceChange = crypto.currentPrice * (priceChangePercent / 100);
        const newPrice = crypto.currentPrice + priceChange;
        
        // Generate sentiment based on price movement and some randomness
        let sentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral';
        let sentimentScore = 0.5 + (priceChangePercent / 20); // Base sentiment on price change
        
        // Add some randomness to sentiment
        sentimentScore += (Math.random() - 0.5) * 0.2;
        
        // Clamp sentiment score
        sentimentScore = Math.max(0, Math.min(1, sentimentScore));
        
        if (sentimentScore > 0.6) sentiment = 'bullish';
        else if (sentimentScore < 0.4) sentiment = 'bearish';
        
        return {
          ...crypto,
          currentPrice: parseFloat(newPrice.toFixed(2)),
          priceChange24h: parseFloat(priceChange.toFixed(2)),
          priceChangePercentage24h: parseFloat(priceChangePercent.toFixed(2)),
          sentiment,
          sentimentScore: parseFloat(sentimentScore.toFixed(2)),
          lastUpdated: new Date()
        };
      });
      
      // Update market stats
      const totalMarketCap = updatedCryptos.reduce((sum, crypto) => sum + crypto.marketCap, 0);
      const averageSentiment = updatedCryptos.reduce((sum, crypto) => sum + crypto.sentimentScore, 0) / updatedCryptos.length;
      
      let overallSentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral';
      if (averageSentiment > 0.6) overallSentiment = 'bullish';
      else if (averageSentiment < 0.4) overallSentiment = 'bearish';
      
      const updatedMarketStats = {
        ...marketStats,
        totalMarketCap,
        averageSentimentScore: parseFloat(averageSentiment.toFixed(2)),
        overallMarketSentiment: overallSentiment,
        marketCapChange24h: parseFloat(((totalMarketCap - marketStats.totalMarketCap) / marketStats.totalMarketCap * 100).toFixed(2))
      };
      
      // Update the state
      setCryptos(updatedCryptos);
      setMarketStats(updatedMarketStats);
      
      // Update time series data with latest prices
      const latestDate = new Date().toISOString().split('T')[0];
      const updatedTimeSeriesData = [...timeSeriesData];
      
      // Update the last data point if it's today, otherwise add a new one
      if (updatedTimeSeriesData[updatedTimeSeriesData.length - 1].date === latestDate) {
        updatedCryptos.forEach(crypto => {
          updatedTimeSeriesData[updatedTimeSeriesData.length - 1][crypto.symbol] = crypto.currentPrice;
        });
      } else {
        const newDataPoint: any = { date: latestDate };
        updatedCryptos.forEach(crypto => {
          newDataPoint[crypto.symbol] = crypto.currentPrice;
        });
        updatedTimeSeriesData.push(newDataPoint);
      }
      
      setTimeSeriesData(updatedTimeSeriesData);
      
    } catch (err) {
      setError('Failed to refresh cryptocurrency data');
      console.error('Error refreshing crypto data:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to get price history data based on selected time range
  const getPriceHistoryData = () => {
    const days = selectedTimeRange === '24h' ? 1 : 
                 selectedTimeRange === '7d' ? 7 : 
                 selectedTimeRange === '30d' ? 30 : 90;
                 
    // For 24h, we need to generate hourly data instead of daily
    if (selectedTimeRange === '24h') {
      const hourlyData = [];
      const now = new Date();
      
      for (let i = 0; i < 24; i++) {
        const date = new Date(now);
        date.setHours(date.getHours() - (24 - i - 1));
        
        const dataPoint: any = {
          date: `${date.getHours()}:00`,
        };
        
        cryptos.forEach(crypto => {
          const basePrice = crypto.currentPrice;
          const hourlyVolatility = Math.random() * 0.02; // 0-2% hourly volatility
          const hourlyChange = (Math.random() - 0.5) * hourlyVolatility;
          const noise = (Math.random() - 0.5) * 0.005 * basePrice;
          
          dataPoint[crypto.symbol] = basePrice * (1 + hourlyChange * (24 - i) / 24) + noise;
        });
        
        hourlyData.push(dataPoint);
      }
      
      return hourlyData;
    }
    
    // Otherwise return a slice of the daily data
    return timeSeriesData.slice(-days);
  };

  // Effect to initialize with random data when the component mounts
  useEffect(() => {
    // This would be replaced with real API calls in a production application
  }, []);

  return {
    cryptos,
    marketStats,
    news,
    loading,
    error,
    selectedTimeRange,
    setSelectedTimeRange,
    refreshData,
    getPriceHistoryData
  };
};

// Singleton export for use in components
export const cryptoService = {
  getCryptocurrencies: () => mockCryptoData,
  getMarketStats: () => mockMarketStats,
  getCryptoNews: () => mockCryptoNews
}; 