import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  AlertCircle, 
  RefreshCw, 
  ArrowUp, 
  ArrowDown,
  LineChart as LineChartIcon,
  BarChart2,
  Calendar,
  TrendingUp,
  TrendingDown,
  BarChart,
  DollarSign
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
  ComposedChart,
  Bar,
} from 'recharts';
import { cn } from '@/lib/utils';

const ALPHA_VANTAGE_KEY = 'ENVZWD4RMWCC6EVQ';

// Popular currency pairs
const CURRENCY_PAIRS = [
  { from: 'EUR', to: 'USD', name: 'Euro / US Dollar' },
  { from: 'USD', to: 'JPY', name: 'US Dollar / Japanese Yen' },
  { from: 'GBP', to: 'USD', name: 'British Pound / US Dollar' },
  { from: 'USD', to: 'CHF', name: 'US Dollar / Swiss Franc' },
  { from: 'AUD', to: 'USD', name: 'Australian Dollar / US Dollar' },
  { from: 'USD', to: 'CAD', name: 'US Dollar / Canadian Dollar' },
  { from: 'NZD', to: 'USD', name: 'New Zealand Dollar / US Dollar' },
  { from: 'USD', to: 'CNY', name: 'US Dollar / Chinese Yuan' },
  { from: 'USD', to: 'INR', name: 'US Dollar / Indian Rupee' },
  { from: 'USD', to: 'MXN', name: 'US Dollar / Mexican Peso' },
  { from: 'USD', to: 'SGD', name: 'US Dollar / Singapore Dollar' },
  { from: 'USD', to: 'HKD', name: 'US Dollar / Hong Kong Dollar' },
  { from: 'EUR', to: 'GBP', name: 'Euro / British Pound' },
  { from: 'EUR', to: 'JPY', name: 'Euro / Japanese Yen' },
  { from: 'GBP', to: 'JPY', name: 'British Pound / Japanese Yen' },
];

interface MetaData {
  information: string;
  fromSymbol: string;
  toSymbol: string;
  lastRefreshed: string;
  timeZone: string;
}

interface TimeSeriesEntry {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  change: number;
  changePercent: number;
}

const ForexAnalysis: React.FC = () => {
  const [fromCurrency, setFromCurrency] = useState<string>('EUR');
  const [toCurrency, setToCurrency] = useState<string>('USD');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [metaData, setMetaData] = useState<MetaData | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesEntry[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>('overview');
  const [timeFrame, setTimeFrame] = useState<string>('weekly');

  // Fetch data when currencies change
  useEffect(() => {
    if (fromCurrency && toCurrency) {
      fetchForexData();
    }
  }, [fromCurrency, toCurrency, timeFrame]);

  const fetchForexData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Determine the API function based on timeFrame
      const apiFunction = timeFrame === 'weekly' ? 'FX_WEEKLY' : 'FX_DAILY';
      
      const url = `https://www.alphavantage.co/query?function=${apiFunction}&from_symbol=${fromCurrency}&to_symbol=${toCurrency}&apikey=${ALPHA_VANTAGE_KEY}`;
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
      
      // Extract meta data
      const meta = data['Meta Data'];
      if (meta) {
        setMetaData({
          information: meta['1. Information'],
          fromSymbol: meta['2. From Symbol'],
          toSymbol: meta['3. To Symbol'],
          lastRefreshed: meta['4. Last Refreshed'],
          timeZone: meta['5. Time Zone'],
        });
      }
      
      // Extract time series data
      const timeSeriesKey = timeFrame === 'weekly' ? 'Time Series FX (Weekly)' : 'Time Series FX (Daily)';
      const timeSeries = data[timeSeriesKey];
      
      if (timeSeries) {
        const timeSeriesArray = Object.entries(timeSeries).map(([date, values]: [string, any]) => {
          const open = parseFloat(values['1. open']);
          const high = parseFloat(values['2. high']);
          const low = parseFloat(values['3. low']);
          const close = parseFloat(values['4. close']);
          return {
            date,
            open,
            high,
            low,
            close,
            change: close - open,
            changePercent: ((close - open) / open) * 100,
          };
        });
        
        // Sort by date in ascending order
        timeSeriesArray.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        setTimeSeriesData(timeSeriesArray);
      } else {
        setTimeSeriesData([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Error fetching forex data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate performance metrics
  const calculatePerformanceMetrics = () => {
    if (timeSeriesData.length === 0) return null;
    
    const last = timeSeriesData[timeSeriesData.length - 1];
    const first = timeSeriesData[0];
    
    // Calculate overall change
    const overallChange = last.close - first.open;
    const overallChangePercent = (overallChange / first.open) * 100;
    
    // Calculate max and min
    let maxPrice = -Infinity;
    let minPrice = Infinity;
    let maxDaily = -Infinity;
    let minDaily = Infinity;
    
    timeSeriesData.forEach(item => {
      // Max and min prices
      maxPrice = Math.max(maxPrice, item.high);
      minPrice = Math.min(minPrice, item.low);
      
      // Max and min daily changes
      maxDaily = Math.max(maxDaily, item.change);
      minDaily = Math.min(minDaily, item.change);
    });
    
    // Calculate volatility (standard deviation of price changes)
    const changeValues = timeSeriesData.map(item => item.change);
    const meanChange = changeValues.reduce((sum, val) => sum + val, 0) / changeValues.length;
    const squaredDiffs = changeValues.map(val => Math.pow(val - meanChange, 2));
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / squaredDiffs.length;
    const volatility = Math.sqrt(variance);
    
    return {
      currentRate: last.close,
      overallChange,
      overallChangePercent,
      maxPrice,
      minPrice,
      maxDaily,
      minDaily,
      volatility,
      timePeriod: `${first.date} to ${last.date}`,
    };
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded p-3 shadow-md">
          <p className="font-medium mb-1">{formatDate(data.date)}</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            <div>Open:</div>
            <div className="font-medium text-right">{data.open.toFixed(5)}</div>
            <div>High:</div>
            <div className="font-medium text-right">{data.high.toFixed(5)}</div>
            <div>Low:</div>
            <div className="font-medium text-right">{data.low.toFixed(5)}</div>
            <div>Close:</div>
            <div className="font-medium text-right">{data.close.toFixed(5)}</div>
            <div>Change:</div>
            <div className={cn(
              "font-medium text-right",
              data.change > 0 ? "text-green-600" : "text-red-600"
            )}>
              {data.change > 0 ? "+" : ""}{data.change.toFixed(5)} 
              ({data.change > 0 ? "+" : ""}{data.changePercent.toFixed(2)}%)
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Get formatted data for candlestick chart
  const getCandlestickData = () => {
    return timeSeriesData.slice(-30); // Last 30 data points
  };
  
  // Get performance metrics
  const performanceMetrics = calculatePerformanceMetrics();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">Forex Analysis</h1>
            <p className="text-muted-foreground">
              Analyze foreign exchange rate data and trends
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Currency Pair Selector */}
            <Select
              value={`${fromCurrency}-${toCurrency}`}
              onValueChange={(value) => {
                const [from, to] = value.split('-');
                setFromCurrency(from);
                setToCurrency(to);
              }}
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Select currency pair" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Popular Currency Pairs</SelectLabel>
                  {CURRENCY_PAIRS.map((pair) => (
                    <SelectItem key={`${pair.from}-${pair.to}`} value={`${pair.from}-${pair.to}`}>
                      {pair.from}/{pair.to} - {pair.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            
            {/* Time Frame Selector */}
            <Select
              value={timeFrame}
              onValueChange={setTimeFrame}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Time frame" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline"
              onClick={fetchForexData}
              disabled={loading}
            >
              {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
              Refresh
            </Button>
          </div>
        </div>
        
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {/* Currency Pair Info */}
        {metaData && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                {metaData.fromSymbol}/{metaData.toSymbol} Exchange Rate
              </CardTitle>
              <CardDescription>
                {metaData.information} - Last updated: {formatDate(metaData.lastRefreshed)}
              </CardDescription>
            </CardHeader>
            
            {loading ? (
              <CardContent>
                <div className="flex justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin" />
                </div>
              </CardContent>
            ) : performanceMetrics ? (
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="border">
                    <CardContent className="p-4">
                      <div className="text-xs font-medium text-muted-foreground mb-1">Current Rate</div>
                      <div className="text-2xl font-bold">{performanceMetrics.currentRate.toFixed(5)}</div>
                      <div className={cn(
                        "flex items-center text-sm mt-1",
                        performanceMetrics.overallChange > 0 ? "text-green-600" : "text-red-600"
                      )}>
                        {performanceMetrics.overallChange > 0 ? (
                          <ArrowUp className="h-4 w-4 mr-1" />
                        ) : (
                          <ArrowDown className="h-4 w-4 mr-1" />
                        )}
                        {performanceMetrics.overallChange > 0 ? "+" : ""}
                        {performanceMetrics.overallChange.toFixed(5)} 
                        ({performanceMetrics.overallChangePercent > 0 ? "+" : ""}
                        {performanceMetrics.overallChangePercent.toFixed(2)}%)
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border">
                    <CardContent className="p-4">
                      <div className="text-xs font-medium text-muted-foreground mb-1">Range</div>
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-sm">Low</div>
                          <div className="font-semibold">{performanceMetrics.minPrice.toFixed(5)}</div>
                        </div>
                        <div className="text-muted-foreground mx-2">—</div>
                        <div>
                          <div className="text-sm">High</div>
                          <div className="font-semibold">{performanceMetrics.maxPrice.toFixed(5)}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border">
                    <CardContent className="p-4">
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        {timeFrame === 'weekly' ? 'Weekly' : 'Daily'} Change
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-sm text-red-600">Min</div>
                          <div className="font-semibold">{performanceMetrics.minDaily.toFixed(5)}</div>
                        </div>
                        <div className="text-muted-foreground mx-2">—</div>
                        <div>
                          <div className="text-sm text-green-600">Max</div>
                          <div className="font-semibold">{performanceMetrics.maxDaily.toFixed(5)}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border">
                    <CardContent className="p-4">
                      <div className="text-xs font-medium text-muted-foreground mb-1">Volatility</div>
                      <div className="text-2xl font-bold">{performanceMetrics.volatility.toFixed(5)}</div>
                      <div className="text-xs mt-1 text-muted-foreground">
                        Standard Deviation
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            ) : null}
          </Card>
        )}
        
        {/* Data Visualization Tabs */}
        {timeSeriesData.length > 0 && (
          <Card>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <CardHeader className="pb-0">
                <div className="flex items-center justify-between">
                  <CardTitle>Exchange Rate Analysis</CardTitle>
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="price-chart">Price Chart</TabsTrigger>
                    <TabsTrigger value="change-analysis">Change Analysis</TabsTrigger>
                  </TabsList>
                </div>
              </CardHeader>
              
              <CardContent className="pt-6">
                {/* Overview Tab */}
                <TabsContent value="overview" className="mt-0">
                  <div className="grid grid-cols-1 gap-6">
                    {/* Price Overview Chart */}
                    <div>
                      <h3 className="text-lg font-medium mb-4">Price Trend Overview</h3>
                      <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart
                            data={timeSeriesData}
                            margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                            <XAxis 
                              dataKey="date" 
                              tickFormatter={formatDate}
                              angle={-45}
                              textAnchor="end"
                              height={60}
                              interval="preserveStartEnd"
                            />
                            <YAxis 
                              domain={['auto', 'auto']}
                              tickFormatter={(value) => value.toFixed(4)}
                            />
                            <RechartsTooltip content={<CustomTooltip />} />
                            <Area 
                              type="monotone" 
                              dataKey="close" 
                              fill="rgba(59, 130, 246, 0.2)" 
                              stroke="#3b82f6" 
                              name="Close Price"
                            />
                            <Bar 
                              dataKey="change" 
                              fill="#4F46E5"
                              name="Change"
                            />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    {/* Recent Data Table */}
                    <div>
                      <h3 className="text-lg font-medium mb-4">Recent {timeFrame === 'weekly' ? 'Weekly' : 'Daily'} Data</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 px-4">Date</th>
                              <th className="text-right py-2 px-4">Open</th>
                              <th className="text-right py-2 px-4">High</th>
                              <th className="text-right py-2 px-4">Low</th>
                              <th className="text-right py-2 px-4">Close</th>
                              <th className="text-right py-2 px-4">Change</th>
                            </tr>
                          </thead>
                          <tbody>
                            {timeSeriesData.slice(-10).reverse().map((entry) => (
                              <tr key={entry.date} className="border-b">
                                <td className="py-2 px-4">{formatDate(entry.date)}</td>
                                <td className="text-right py-2 px-4">{entry.open.toFixed(5)}</td>
                                <td className="text-right py-2 px-4">{entry.high.toFixed(5)}</td>
                                <td className="text-right py-2 px-4">{entry.low.toFixed(5)}</td>
                                <td className="text-right py-2 px-4">{entry.close.toFixed(5)}</td>
                                <td className={cn(
                                  "text-right py-2 px-4",
                                  entry.change > 0 ? "text-green-600" : "text-red-600"
                                )}>
                                  {entry.change > 0 ? "+" : ""}
                                  {entry.change.toFixed(5)} ({entry.change > 0 ? "+" : ""}{entry.changePercent.toFixed(2)}%)
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Price Chart Tab */}
                <TabsContent value="price-chart" className="mt-0">
                  <div className="grid grid-cols-1 gap-6">
                    {/* OHLC Chart */}
                    <div>
                      <h3 className="text-lg font-medium mb-4">OHLC Chart ({timeFrame === 'weekly' ? 'Weekly' : 'Daily'})</h3>
                      <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={getCandlestickData()}
                            margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                            <XAxis 
                              dataKey="date" 
                              tickFormatter={formatDate}
                              angle={-45}
                              textAnchor="end"
                              height={60}
                              interval="preserveStartEnd"
                            />
                            <YAxis 
                              domain={['auto', 'auto']}
                              tickFormatter={(value) => value.toFixed(4)}
                            />
                            <RechartsTooltip content={<CustomTooltip />} />
                            <Legend />
                            <Line type="monotone" dataKey="open" stroke="#1d4ed8" name="Open" dot={false} />
                            <Line type="monotone" dataKey="high" stroke="#16a34a" name="High" dot={false} />
                            <Line type="monotone" dataKey="low" stroke="#dc2626" name="Low" dot={false} />
                            <Line type="monotone" dataKey="close" stroke="#9333ea" name="Close" dot={false} strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    {/* Moving Averages */}
                    <div>
                      <h3 className="text-lg font-medium mb-4">Price with Moving Averages</h3>
                      <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={timeSeriesData.map((item, index, arr) => {
                              // Calculate 7-period moving average
                              let ma7 = null;
                              if (index >= 6) {
                                const values = arr.slice(index - 6, index + 1).map(d => d.close);
                                ma7 = values.reduce((sum, val) => sum + val, 0) / values.length;
                              }
                              
                              // Calculate 21-period moving average
                              let ma21 = null;
                              if (index >= 20) {
                                const values = arr.slice(index - 20, index + 1).map(d => d.close);
                                ma21 = values.reduce((sum, val) => sum + val, 0) / values.length;
                              }
                              
                              return {
                                ...item,
                                ma7,
                                ma21,
                              };
                            })}
                            margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                            <XAxis 
                              dataKey="date" 
                              tickFormatter={formatDate}
                              angle={-45}
                              textAnchor="end"
                              height={60}
                              interval="preserveStartEnd"
                            />
                            <YAxis 
                              domain={['auto', 'auto']}
                              tickFormatter={(value) => value.toFixed(4)}
                            />
                            <RechartsTooltip />
                            <Legend />
                            <Line type="monotone" dataKey="close" stroke="#3b82f6" name="Close Price" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="ma7" stroke="#f97316" name="7-Period MA" dot={false} strokeWidth={1.5} />
                            <Line type="monotone" dataKey="ma21" stroke="#84cc16" name="21-Period MA" dot={false} strokeWidth={1.5} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Change Analysis Tab */}
                <TabsContent value="change-analysis" className="mt-0">
                  <div className="grid grid-cols-1 gap-6">
                    {/* Change Chart */}
                    <div>
                      <h3 className="text-lg font-medium mb-4">Price Change Analysis</h3>
                      <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={timeSeriesData.slice(-30)}
                            margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                            <XAxis 
                              dataKey="date" 
                              tickFormatter={formatDate}
                              angle={-45}
                              textAnchor="end"
                              height={60}
                              interval={0}
                            />
                            <YAxis 
                              tickFormatter={(value) => value.toFixed(4)}
                              label={{ value: 'Change', angle: -90, position: 'insideLeft' }}
                            />
                            <RechartsTooltip content={<CustomTooltip />} />
                            <Bar 
                              dataKey="change" 
                              name="Price Change"
                              fill="#4F46E5"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    {/* Percent Change Chart */}
                    <div>
                      <h3 className="text-lg font-medium mb-4">Percentage Change</h3>
                      <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={timeSeriesData.slice(-30)}
                            margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                            <XAxis 
                              dataKey="date" 
                              tickFormatter={formatDate}
                              angle={-45}
                              textAnchor="end"
                              height={60}
                              interval={0}
                            />
                            <YAxis 
                              tickFormatter={(value) => `${value.toFixed(2)}%`}
                              label={{ value: 'Change (%)', angle: -90, position: 'insideLeft' }}
                            />
                            <RechartsTooltip content={<CustomTooltip />} />
                            <Bar 
                              dataKey="changePercent" 
                              name="Percent Change"
                              fill="#4F46E5"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ForexAnalysis; 