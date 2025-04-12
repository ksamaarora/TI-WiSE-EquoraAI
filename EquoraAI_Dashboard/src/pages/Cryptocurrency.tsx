import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart,
  Bar
} from 'recharts';
import { 
  CryptoCurrency, 
  CryptoMarketStats, 
  CryptoNewsItem, 
  useCrypto 
} from '@/services/cryptoService';
import { cn } from '@/lib/utils';
import { useAccessibility } from '@/lib/accessibility';

// Icons
import { 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  PieChart as PieChartIcon,
  Clock,
  Newspaper,
  AlertCircle,
  ArrowRight,
  Bitcoin,
  Coins
} from 'lucide-react';

// UI Components
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Avatar } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import Newsy from '@/components/dashboard/Newsy';

// Constants
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#A4DE6C', '#D0ED57'];
const SENTIMENT_COLORS = {
  bullish: 'bg-green-500',
  bearish: 'bg-red-500',
  neutral: 'bg-blue-500'
};
const NEWS_SENTIMENT_COLORS = {
  positive: 'text-green-500',
  negative: 'text-red-500',
  neutral: 'text-blue-500'
};

const Cryptocurrency: React.FC = () => {
  const { 
    cryptos, 
    marketStats, 
    news, 
    loading, 
    error, 
    selectedTimeRange, 
    setSelectedTimeRange, 
    refreshData, 
    getPriceHistoryData
  } = useCrypto();

  const { speakText } = useAccessibility();
  const [selectedCrypto, setSelectedCrypto] = useState<string>('btc');
  const [chartData, setChartData] = useState<any[]>([]);
  const [topCoins, setTopCoins] = useState<CryptoCurrency[]>([]);
  const [worstCoins, setWorstCoins] = useState<CryptoCurrency[]>([]);

  // Process and prepare chart data
  useEffect(() => {
    const data = getPriceHistoryData();
    setChartData(data);
  }, [selectedTimeRange, cryptos]);

  // Sort and filter top/worst performers
  useEffect(() => {
    const sortedByPerformance = [...cryptos].sort(
      (a, b) => b.priceChangePercentage24h - a.priceChangePercentage24h
    );
    setTopCoins(sortedByPerformance.slice(0, 3));
    setWorstCoins(sortedByPerformance.slice(-3).reverse());
  }, [cryptos]);

  // Format large numbers
  const formatNumber = (num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  // Format price
  const formatPrice = (price: number) => {
    if (price < 0.01) return `$${price.toFixed(6)}`;
    if (price < 1) return `$${price.toFixed(4)}`;
    if (price < 10) return `$${price.toFixed(3)}`;
    return `$${price.toFixed(2)}`;
  };

  // Format percentage
  const formatPercent = (percent: number) => {
    return `${percent > 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  // Format time ago
  const timeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = Math.floor(seconds / 31536000);
  
    if (interval >= 1) {
      return `${interval} year${interval === 1 ? '' : 's'} ago`;
    }
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
      return `${interval} month${interval === 1 ? '' : 's'} ago`;
    }
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
      return `${interval} day${interval === 1 ? '' : 's'} ago`;
    }
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
      return `${interval} hour${interval === 1 ? '' : 's'} ago`;
    }
    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
      return `${interval} minute${interval === 1 ? '' : 's'} ago`;
    }
    return `${Math.floor(seconds)} second${Math.floor(seconds) === 1 ? '' : 's'} ago`;
  };

  // Handle refresh
  const handleRefresh = () => {
    refreshData();
    speakText('Refreshing cryptocurrency data');
  };

  // Chart formatters
  const formatXAxis = (value: string) => {
    if (selectedTimeRange === '24h') {
      return value; // It's already in HH:MM format
    }
    // For other time ranges, display shortened month-day
    const date = new Date(value);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const formatYAxis = (value: number) => {
    return formatPrice(value);
  };

  const formatTooltipValue = (value: number) => {
    return formatPrice(value);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-1">Cryptocurrency Insights</h1>
            <p className="text-muted-foreground">
              Live updates, market sentiment, and trends
            </p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={handleRefresh} 
              disabled={loading}
              className="flex items-center"
            >
              <RefreshCw size={16} className={cn("mr-2", loading && "animate-spin")} />
              {loading ? "Refreshing..." : "Refresh Data"}
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-4 rounded-md">
            <p className="text-red-700 dark:text-red-300 flex items-center">
              <AlertCircle size={16} className="mr-2" />
              {error}
            </p>
          </div>
        )}

        {/* Market Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Market Cap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(marketStats.totalMarketCap)}</div>
              <div className="flex items-center mt-1">
                <span className={cn(
                  "text-sm",
                  marketStats.marketCapChange24h >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {marketStats.marketCapChange24h >= 0 ? (
                    <TrendingUp size={14} className="inline mr-1" />
                  ) : (
                    <TrendingDown size={14} className="inline mr-1" />
                  )}
                  {formatPercent(marketStats.marketCapChange24h)} (24h)
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                24h Trading Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(marketStats.totalVolume24h)}</div>
              <div className="text-sm text-muted-foreground mt-1">
                <Clock size={14} className="inline mr-1" />
                {marketStats.activeCoins.toLocaleString()} active coins
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                BTC Dominance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{marketStats.btcDominance.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground mt-1">
                <Bitcoin size={14} className="inline mr-1" />
                ETH: {marketStats.ethDominance.toFixed(1)}%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Market Sentiment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className={cn(
                  "w-3 h-3 rounded-full mr-2",
                  SENTIMENT_COLORS[marketStats.overallMarketSentiment]
                )}></div>
                <div className="text-2xl font-bold capitalize">
                  {marketStats.overallMarketSentiment}
                </div>
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Score: {marketStats.averageSentimentScore.toFixed(2)} / 1.00
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Price Chart and Coins List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2" size={20} />
                  <span>Price Charts</span>
                </CardTitle>
                <div className="flex space-x-2">
                  <Select 
                    value={selectedCrypto} 
                    onValueChange={setSelectedCrypto}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Select coin" />
                    </SelectTrigger>
                    <SelectContent>
                      {cryptos.map(crypto => (
                        <SelectItem key={crypto.id} value={crypto.symbol}>
                          <div className="flex items-center">
                            <img 
                              src={crypto.image} 
                              alt={crypto.name} 
                              className="w-4 h-4 mr-2" 
                            />
                            {crypto.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select 
                    value={selectedTimeRange} 
                    onValueChange={(value: any) => setSelectedTimeRange(value)}
                  >
                    <SelectTrigger className="w-[80px]">
                      <SelectValue placeholder="Period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24h">24h</SelectItem>
                      <SelectItem value="7d">7d</SelectItem>
                      <SelectItem value="30d">30d</SelectItem>
                      <SelectItem value="90d">90d</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <CardDescription>
                Price history for the selected cryptocurrency
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatXAxis} 
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      tickFormatter={formatYAxis} 
                      domain={['auto', 'auto']}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      formatter={formatTooltipValue}
                      labelFormatter={(label) => selectedTimeRange === '24h' ? `Time: ${label}` : `Date: ${label}`}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey={selectedCrypto}
                      stroke="#4f46e5"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top/Worst Coins */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Coins className="mr-2" size={20} />
                <span>Top Cryptocurrencies</span>
              </CardTitle>
              <CardDescription>Best and worst performing coins</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="px-4 py-2 bg-primary/5">
                <h3 className="text-sm font-medium">Top Performers (24h)</h3>
              </div>
              <div className="divide-y">
                {topCoins.map(coin => (
                  <div key={coin.id} className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <img src={coin.image} alt={coin.name} className="w-6 h-6 mr-3" />
                      <div>
                        <div className="font-medium">{coin.name}</div>
                        <div className="text-xs text-muted-foreground">{coin.symbol.toUpperCase()}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div>{formatPrice(coin.currentPrice)}</div>
                      <div className="text-green-600 text-sm flex items-center justify-end">
                        <TrendingUp size={12} className="mr-1" />
                        {formatPercent(coin.priceChangePercentage24h)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-4 py-2 bg-primary/5 mt-3">
                <h3 className="text-sm font-medium">Worst Performers (24h)</h3>
              </div>
              <div className="divide-y">
                {worstCoins.map(coin => (
                  <div key={coin.id} className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <img src={coin.image} alt={coin.name} className="w-6 h-6 mr-3" />
                      <div>
                        <div className="font-medium">{coin.name}</div>
                        <div className="text-xs text-muted-foreground">{coin.symbol.toUpperCase()}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div>{formatPrice(coin.currentPrice)}</div>
                      <div className="text-red-600 text-sm flex items-center justify-end">
                        <TrendingDown size={12} className="mr-1" />
                        {formatPercent(coin.priceChangePercentage24h)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Market Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Market Sentiment Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChartIcon className="mr-2" size={20} />
                <span>Sentiment Analysis</span>
              </CardTitle>
              <CardDescription>Distribution of market sentiment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Bullish', value: cryptos.filter(c => c.sentiment === 'bullish').length },
                        { name: 'Neutral', value: cryptos.filter(c => c.sentiment === 'neutral').length },
                        { name: 'Bearish', value: cryptos.filter(c => c.sentiment === 'bearish').length }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#3b82f6" />
                      <Cell fill="#ef4444" />
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [value, 'Number of coins']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="text-center">
                  <div className="text-green-500 text-sm font-medium">Bullish</div>
                  <div className="text-lg font-bold">
                    {cryptos.filter(c => c.sentiment === 'bullish').length}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    coins
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-blue-500 text-sm font-medium">Neutral</div>
                  <div className="text-lg font-bold">
                    {cryptos.filter(c => c.sentiment === 'neutral').length}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    coins
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-red-500 text-sm font-medium">Bearish</div>
                  <div className="text-lg font-bold">
                    {cryptos.filter(c => c.sentiment === 'bearish').length}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    coins
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* News & Impact */}
          <Newsy maxItems={5} />
        </div>

        {/* Cryptocurrency Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Cryptocurrencies</CardTitle>
            <CardDescription>
              Complete list of tracked cryptocurrencies and their performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr className="text-left">
                    <th className="p-3">Coin</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">24h Change</th>
                    <th className="p-3">Market Cap</th>
                    <th className="p-3">Volume (24h)</th>
                    <th className="p-3">Sentiment</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {cryptos.map(crypto => (
                    <tr key={crypto.id} className="hover:bg-muted/30">
                      <td className="p-3">
                        <div className="flex items-center">
                          <img src={crypto.image} alt={crypto.name} className="w-6 h-6 mr-3" />
                          <div>
                            <div className="font-medium">{crypto.name}</div>
                            <div className="text-xs text-muted-foreground">{crypto.symbol.toUpperCase()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-medium">
                        {formatPrice(crypto.currentPrice)}
                      </td>
                      <td className="p-3">
                        <div className={cn(
                          "flex items-center",
                          crypto.priceChangePercentage24h >= 0 ? "text-green-600" : "text-red-600"
                        )}>
                          {crypto.priceChangePercentage24h >= 0 ? (
                            <TrendingUp size={16} className="mr-1" />
                          ) : (
                            <TrendingDown size={16} className="mr-1" />
                          )}
                          {formatPercent(crypto.priceChangePercentage24h)}
                        </div>
                      </td>
                      <td className="p-3">
                        {formatNumber(crypto.marketCap)}
                      </td>
                      <td className="p-3">
                        {formatNumber(crypto.volume24h)}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center">
                          <div className={cn(
                            "w-2 h-2 rounded-full mr-2",
                            SENTIMENT_COLORS[crypto.sentiment]
                          )}></div>
                          <span className="capitalize">{crypto.sentiment}</span>
                          <span className="text-xs text-muted-foreground ml-1">
                            ({crypto.sentimentScore.toFixed(2)})
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Cryptocurrency; 