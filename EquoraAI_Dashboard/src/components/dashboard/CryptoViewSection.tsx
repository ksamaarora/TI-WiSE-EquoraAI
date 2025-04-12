import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { Bitcoin, RefreshCw, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

const ALPHA_VANTAGE_KEY = 'ENVZWD4RMWCC6EVQ';
const CRYPTO_SYMBOLS = [
  { value: 'BTC', label: 'Bitcoin' },
  { value: 'ETH', label: 'Ethereum' },
  { value: 'SOL', label: 'Solana' },
  { value: 'BNB', label: 'Binance Coin' },
  { value: 'XRP', label: 'Ripple' },
  { value: 'ADA', label: 'Cardano' },
  { value: 'DOGE', label: 'Dogecoin' },
  { value: 'DOT', label: 'Polkadot' },
];

const MARKETS = [
  { value: 'USD', label: 'US Dollar' },
  { value: 'EUR', label: 'Euro' },
  { value: 'JPY', label: 'Japanese Yen' },
  { value: 'GBP', label: 'British Pound' },
];

interface CryptoData {
  metaData: {
    digitalCurrencyCode: string;
    digitalCurrencyName: string;
    marketCode: string;
    marketName: string;
    lastRefreshed: string;
  };
  timeSeries: {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[];
}

const CryptoViewSection: React.FC = () => {
  const [cryptoSymbol, setCryptoSymbol] = useState<string>('BTC');
  const [market, setMarket] = useState<string>('USD');
  const [selectedTab, setSelectedTab] = useState<string>('price');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [cryptoData, setCryptoData] = useState<CryptoData | null>(null);

  const fetchCryptoData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const url = `https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_MONTHLY&symbol=${cryptoSymbol}&market=${market}&apikey=${ALPHA_VANTAGE_KEY}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data['Error Message']) {
        throw new Error(data['Error Message']);
      }
      
      if (data['Note']) {
        throw new Error(data['Note']); // API call limit reached message
      }
      
      // Process the data into our format
      const metaData = {
        digitalCurrencyCode: data['Meta Data']['2. Digital Currency Code'],
        digitalCurrencyName: data['Meta Data']['3. Digital Currency Name'],
        marketCode: data['Meta Data']['4. Market Code'],
        marketName: data['Meta Data']['5. Market Name'],
        lastRefreshed: data['Meta Data']['6. Last Refreshed'],
      };
      
      const timeSeries = Object.entries(data['Time Series (Digital Currency Monthly)']).map(
        ([date, values]: [string, any]) => ({
          date: date,
          open: parseFloat(values['1. open']),
          high: parseFloat(values['2. high']),
          low: parseFloat(values['3. low']),
          close: parseFloat(values['4. close']),
          volume: parseFloat(values['5. volume']),
        })
      ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      // Get the most recent 12 months (or less if not available)
      const recentData = timeSeries.slice(-12);
      
      setCryptoData({ metaData, timeSeries: recentData });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Error fetching crypto data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCryptoData();
  }, [cryptoSymbol, market]);

  // Format price with appropriate decimal places
  const formatPrice = (price: number) => {
    if (price < 0.01) return `${price.toFixed(6)}`;
    if (price < 1) return `${price.toFixed(4)}`;
    if (price < 10) return `${price.toFixed(3)}`;
    return `${price.toFixed(2)}`;
  };
  
  // Format date to show month and year
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };
  
  // Calculate percentage change between the oldest and newest data points
  const calculatePercentChange = () => {
    if (!cryptoData || cryptoData.timeSeries.length < 2) return 0;
    
    const oldest = cryptoData.timeSeries[0].close;
    const newest = cryptoData.timeSeries[cryptoData.timeSeries.length - 1].close;
    
    return ((newest - oldest) / oldest) * 100;
  };
  
  const percentChange = cryptoData ? calculatePercentChange() : 0;
  
  // Calculate price statistics
  const calculateStats = () => {
    if (!cryptoData || cryptoData.timeSeries.length === 0) {
      return { avg: 0, min: 0, max: 0, current: 0 };
    }
    
    const prices = cryptoData.timeSeries.map(item => item.close);
    const avg = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const current = prices[prices.length - 1];
    
    return { avg, min, max, current };
  };
  
  const stats = calculateStats();
  
  // Calculate volume data
  const getVolumeData = () => {
    if (!cryptoData) return [];
    
    return cryptoData.timeSeries.map(item => ({
      date: formatDate(item.date),
      volume: item.volume
    }));
  };
  
  // Calculate price range data (high, low, close)
  const getPriceRangeData = () => {
    if (!cryptoData) return [];
    
    return cryptoData.timeSeries.map(item => ({
      date: formatDate(item.date),
      high: item.high,
      low: item.low,
      close: item.close
    }));
  };
  
  // Get price trend data
  const getPriceTrendData = () => {
    if (!cryptoData) return [];
    
    return cryptoData.timeSeries.map(item => ({
      date: formatDate(item.date),
      price: item.close
    }));
  };

  // Custom Tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded p-2 shadow-md">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {entry.name}: {entry.name === 'volume' 
                ? entry.value.toLocaleString() 
                : formatPrice(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bitcoin size={20} />
              Crypto Market Insights
            </CardTitle>
            <CardDescription>
              Monthly cryptocurrency performance and trends
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Select
              value={cryptoSymbol}
              onValueChange={setCryptoSymbol}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Select crypto" />
              </SelectTrigger>
              <SelectContent>
                {CRYPTO_SYMBOLS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={market}
              onValueChange={setMarket}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Select market" />
              </SelectTrigger>
              <SelectContent>
                {MARKETS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={fetchCryptoData}
              disabled={loading}
            >
              <RefreshCw size={16} className={cn(loading && "animate-spin")} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-4 rounded-md mb-4">
            <p>{error}</p>
          </div>
        ) : null}

        {/* Stats and Summary */}
        {loading ? (
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-3">
                  <Skeleton className="h-4 w-1/3 mb-2" />
                  <Skeleton className="h-6 w-2/3 mb-1" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : cryptoData ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <Card>
              <CardContent className="p-3">
                <div className="text-xs text-muted-foreground mb-1">Current Price</div>
                <div className="flex items-center">
                  <DollarSign size={14} className="mr-1" />
                  <span className="text-xl font-semibold">{formatPrice(stats.current)}</span>
                </div>
                <div className="flex items-center mt-1">
                  {percentChange >= 0 ? (
                    <TrendingUp size={14} className="text-green-500 mr-1" />
                  ) : (
                    <TrendingDown size={14} className="text-red-500 mr-1" />
                  )}
                  <span className={cn(
                    "text-xs font-medium",
                    percentChange >= 0 ? "text-green-500" : "text-red-500"
                  )}>
                    {percentChange >= 0 ? "+" : ""}{percentChange.toFixed(2)}% 
                    <span className="text-muted-foreground font-normal"> (12m)</span>
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="text-xs text-muted-foreground mb-1">Highest Price</div>
                <div className="text-xl font-semibold">{formatPrice(stats.max)}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  12-month high
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="text-xs text-muted-foreground mb-1">Lowest Price</div>
                <div className="text-xl font-semibold">{formatPrice(stats.min)}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  12-month low
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="text-xs text-muted-foreground mb-1">Average Price</div>
                <div className="text-xl font-semibold">{formatPrice(stats.avg)}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  12-month average
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {/* Chart Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="price">Price Trend</TabsTrigger>
            <TabsTrigger value="range">Price Range</TabsTrigger>
            <TabsTrigger value="volume">Volume Analysis</TabsTrigger>
          </TabsList>
          
          {loading ? (
            <div className="w-full h-[300px] flex items-center justify-center">
              <div className="flex flex-col items-center">
                <RefreshCw size={24} className="animate-spin mb-2" />
                <span>Loading data...</span>
              </div>
            </div>
          ) : !cryptoData ? (
            <div className="w-full h-[300px] flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          ) : (
            <>
              <TabsContent value="price" className="mt-0">
                <div className="w-full h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={getPriceTrendData()}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="date" />
                      <YAxis 
                        domain={['auto', 'auto']}
                        tickFormatter={(value) => formatPrice(value)}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="#8884d8"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                        name="Price"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-sm text-center mt-2 text-muted-foreground">
                  Monthly price trend for {cryptoData.metaData.digitalCurrencyName} ({cryptoData.metaData.digitalCurrencyCode}) 
                  in {cryptoData.metaData.marketName} ({cryptoData.metaData.marketCode})
                </div>
              </TabsContent>

              <TabsContent value="range" className="mt-0">
                <div className="w-full h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={getPriceRangeData()}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="date" />
                      <YAxis 
                        domain={['auto', 'auto']}
                        tickFormatter={(value) => formatPrice(value)}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="high"
                        stroke="#22c55e"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        name="High"
                      />
                      <Line
                        type="monotone"
                        dataKey="close"
                        stroke="#8884d8"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        name="Close"
                      />
                      <Line
                        type="monotone"
                        dataKey="low"
                        stroke="#ef4444"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        name="Low"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-sm text-center mt-2 text-muted-foreground">
                  Monthly price range showing high, close, and low values 
                </div>
              </TabsContent>

              <TabsContent value="volume" className="mt-0">
                <div className="w-full h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getVolumeData()}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="volume" fill="#8884d8" name="volume" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-sm text-center mt-2 text-muted-foreground">
                  Monthly trading volume in {cryptoData.metaData.marketName} ({cryptoData.metaData.marketCode})
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CryptoViewSection; 