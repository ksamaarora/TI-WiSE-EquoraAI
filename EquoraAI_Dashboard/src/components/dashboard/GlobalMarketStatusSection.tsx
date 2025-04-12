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
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadialBarChart,
  RadialBar,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import { Globe, RefreshCw, Clock, Search, MapPin, Filter, BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const ALPHA_VANTAGE_KEY = 'ENVZWD4RMWCC6EVQ';

// Filter options
const MARKET_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'Equity', label: 'Equity' },
  { value: 'Forex', label: 'Forex' },
  { value: 'Crypto', label: 'Crypto' },
  { value: 'Bond', label: 'Bond' },
];

const REGIONS = [
  { value: 'all', label: 'All Regions' },
  { value: 'United States', label: 'United States' },
  { value: 'Europe', label: 'Europe' },
  { value: 'Asia', label: 'Asia' },
  { value: 'Oceania', label: 'Oceania' },
];

// Status colors
const STATUS_COLORS = {
  open: '#22c55e', // green
  closed: '#ef4444', // red
  holiday: '#f59e0b', // amber
  earlyClose: '#6366f1', // indigo
};

// Chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface MarketData {
  market_type: string;
  region: string;
  primary_exchanges: string;
  local_open: string;
  local_close: string;
  current_status: string;
  notes: string;
}

interface MarketStatusData {
  endpoint: string;
  markets: MarketData[];
}

// Calculate time differences for visualization
const calculateTimeZoneDiff = (localTime: string) => {
  if (!localTime) return 0;
  
  // Parse HH:MM format and convert to minutes since midnight
  const [hours, minutes] = localTime.split(':').map(Number);
  const localMinutesSinceMidnight = hours * 60 + minutes;
  
  // Get current UTC time in minutes since midnight
  const now = new Date();
  const utcMinutesSinceMidnight = now.getUTCHours() * 60 + now.getUTCMinutes();
  
  // Calculate difference in minutes
  let diffMinutes = localMinutesSinceMidnight - utcMinutesSinceMidnight;
  
  // Adjust for day boundaries
  if (diffMinutes < -720) diffMinutes += 1440; // Add 24 hours if too negative
  if (diffMinutes > 720) diffMinutes -= 1440; // Subtract 24 hours if too positive
  
  // Convert to hours
  return diffMinutes / 60;
};

const GlobalMarketStatusSection: React.FC = () => {
  const [marketType, setMarketType] = useState<string>('all');
  const [region, setRegion] = useState<string>('all');
  const [selectedTab, setSelectedTab] = useState<string>('status');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [marketData, setMarketData] = useState<MarketStatusData | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentUtcTime, setCurrentUtcTime] = useState<string>('');

  // Function to fetch market status data
  const fetchMarketData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const url = `https://www.alphavantage.co/query?function=MARKET_STATUS&apikey=${ALPHA_VANTAGE_KEY}`;
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
      
      // Check if expected data structure exists
      if (!data.markets || !Array.isArray(data.markets)) {
        throw new Error('Invalid market data received');
      }
      
      setMarketData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Error fetching market data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update current UTC time
  useEffect(() => {
    const updateUtcTime = () => {
      const now = new Date();
      const hours = now.getUTCHours().toString().padStart(2, '0');
      const minutes = now.getUTCMinutes().toString().padStart(2, '0');
      setCurrentUtcTime(`${hours}:${minutes} UTC`);
    };
    
    updateUtcTime();
    const interval = setInterval(updateUtcTime, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  // Load data when component mounts
  useEffect(() => {
    fetchMarketData();
    
    // Refresh data every 5 minutes
    const refreshInterval = setInterval(fetchMarketData, 300000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  // Filter markets based on selected criteria
  const getFilteredMarkets = () => {
    if (!marketData?.markets) return [];
    
    return marketData.markets.filter(market => {
      // Apply search filter
      const matchesSearch = searchTerm === '' || 
        market.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
        market.primary_exchanges.toLowerCase().includes(searchTerm.toLowerCase()) ||
        market.market_type.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Apply market type filter
      const matchesType = marketType === 'all' || market.market_type === marketType;
      
      // Apply region filter
      const matchesRegion = region === 'all' || market.region.includes(region);
      
      return matchesSearch && matchesType && matchesRegion;
    });
  };

  // Get formatted time from 24h format
  const formatTime = (timeString: string) => {
    if (!timeString) return 'N/A';
    
    const [hours, minutes] = timeString.split(':');
    const hoursNum = parseInt(hours, 10);
    const period = hoursNum >= 12 ? 'PM' : 'AM';
    const displayHours = hoursNum % 12 || 12; // Convert 0 to 12 for 12 AM
    
    return `${displayHours}:${minutes} ${period}`;
  };

  // Calculate current local time for a market based on time difference
  const getCurrentLocalTime = (market: MarketData) => {
    // Use local_open as reference for time zone
    const timeDiff = calculateTimeZoneDiff(market.local_open);
    
    const now = new Date();
    now.setUTCHours(now.getUTCHours() + timeDiff);
    
    const hours = now.getUTCHours().toString().padStart(2, '0');
    const minutes = now.getUTCMinutes().toString().padStart(2, '0');
    
    return `${hours}:${minutes}`;
  };

  // Get badge color based on market status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return STATUS_COLORS.open;
      case 'closed': return STATUS_COLORS.closed;
      case 'holiday': return STATUS_COLORS.holiday;
      case 'early close': return STATUS_COLORS.earlyClose;
      default: return STATUS_COLORS.closed;
    }
  };

  // Prepare data for market type distribution chart
  const getMarketTypeData = () => {
    if (!marketData?.markets) return [];
    
    const marketTypes: Record<string, number> = {};
    
    marketData.markets.forEach(market => {
      marketTypes[market.market_type] = (marketTypes[market.market_type] || 0) + 1;
    });
    
    return Object.entries(marketTypes).map(([name, value]) => ({ name, value }));
  };

  // Prepare data for region distribution chart
  const getRegionData = () => {
    if (!marketData?.markets) return [];
    
    const regions: Record<string, number> = {};
    
    marketData.markets.forEach(market => {
      regions[market.region] = (regions[market.region] || 0) + 1;
    });
    
    return Object.entries(regions).map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10 regions
  };

  // Prepare data for status distribution chart
  const getStatusData = () => {
    if (!marketData?.markets) return [];
    
    const statuses: Record<string, number> = {};
    
    marketData.markets.forEach(market => {
      statuses[market.current_status] = (statuses[market.current_status] || 0) + 1;
    });
    
    return Object.entries(statuses).map(([name, value]) => ({ name, value }));
  };

  // Prepare data for trading hours visualization
  const getTradingHoursData = () => {
    if (!marketData?.markets) return [];
    
    return getFilteredMarkets().map(market => {
      // Convert HH:MM to decimal hours
      const openParts = market.local_open.split(':').map(Number);
      const closeParts = market.local_close.split(':').map(Number);
      
      const openHour = openParts[0] + openParts[1] / 60;
      const closeHour = closeParts[0] + closeParts[1] / 60;
      
      // Handle markets that cross midnight
      const duration = closeHour < openHour ? 
        (24 - openHour) + closeHour : 
        closeHour - openHour;
      
      return {
        name: market.region,
        type: market.market_type,
        start: openHour,
        duration: duration,
        status: market.current_status
      };
    });
  };

  // Custom tooltip for status chart
  const StatusTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded p-2 shadow-md">
          <p className="font-medium capitalize">{payload[0].name}: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for trading hours chart
  const TradingHoursTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const openTime = `${Math.floor(data.start)}:${Math.round((data.start % 1) * 60).toString().padStart(2, '0')}`;
      const closeHour = (data.start + data.duration) % 24;
      const closeTime = `${Math.floor(closeHour)}:${Math.round((closeHour % 1) * 60).toString().padStart(2, '0')}`;
      
      return (
        <div className="bg-background border rounded p-2 shadow-md">
          <p className="font-medium">{data.name} ({data.type})</p>
          <p>Open: {formatTime(openTime)}</p>
          <p>Close: {formatTime(closeTime)}</p>
          <p>Duration: {data.duration.toFixed(1)} hours</p>
          <p className="capitalize mt-1">Status: <span style={{ color: getStatusColor(data.status) }}>{data.status}</span></p>
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
              <Globe size={20} />
              Global Market Status
            </CardTitle>
            <CardDescription>
              Real-time trading status of financial markets worldwide
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground flex items-center">
              <Clock size={14} className="mr-1" />
              {currentUtcTime}
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={fetchMarketData}
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

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search markets..."
              className="pl-8 h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select
            value={marketType}
            onValueChange={setMarketType}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select market type" />
            </SelectTrigger>
            <SelectContent>
              {MARKET_TYPES.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={region}
            onValueChange={setRegion}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent>
              {REGIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Summary */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
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
        ) : marketData ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <Card>
              <CardContent className="p-3">
                <div className="text-xs text-muted-foreground mb-1">Total Markets</div>
                <div className="text-xl font-semibold">{marketData.markets.length}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Tracked globally
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="text-xs text-muted-foreground mb-1">Markets Open</div>
                <div className="text-xl font-semibold">
                  {marketData.markets.filter(m => m.current_status.toLowerCase() === 'open').length}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Currently trading
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="text-xs text-muted-foreground mb-1">Market Types</div>
                <div className="text-xl font-semibold">
                  {new Set(marketData.markets.map(m => m.market_type)).size}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Different categories
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="text-xs text-muted-foreground mb-1">Regions</div>
                <div className="text-xl font-semibold">
                  {new Set(marketData.markets.map(m => m.region)).size}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Worldwide coverage
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {/* Main Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="status">Market Status</TabsTrigger>
            <TabsTrigger value="visualization">Data Visualization</TabsTrigger>
            <TabsTrigger value="hours">Trading Hours</TabsTrigger>
          </TabsList>
          
          {loading ? (
            <div className="w-full h-[400px] flex items-center justify-center">
              <div className="flex flex-col items-center">
                <RefreshCw size={24} className="animate-spin mb-2" />
                <span>Loading market data...</span>
              </div>
            </div>
          ) : !marketData ? (
            <div className="w-full h-[400px] flex items-center justify-center text-muted-foreground">
              No market data available
            </div>
          ) : (
            <>
              {/* Market Status Tab */}
              <TabsContent value="status" className="mt-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-medium">
                    {getFilteredMarkets().length} {getFilteredMarkets().length === 1 ? 'Market' : 'Markets'} 
                    {marketType !== 'all' && ` • Type: ${marketType}`}
                    {region !== 'all' && ` • Region: ${region}`}
                  </div>
                  <div className="flex gap-2">
                    <Badge style={{ backgroundColor: STATUS_COLORS.open }}>Open</Badge>
                    <Badge style={{ backgroundColor: STATUS_COLORS.closed }}>Closed</Badge>
                    {marketData.markets.some(m => m.current_status.toLowerCase() === 'holiday') && (
                      <Badge style={{ backgroundColor: STATUS_COLORS.holiday }}>Holiday</Badge>
                    )}
                    {marketData.markets.some(m => m.current_status.toLowerCase() === 'early close') && (
                      <Badge style={{ backgroundColor: STATUS_COLORS.earlyClose }}>Early Close</Badge>
                    )}
                  </div>
                </div>
                
                <ScrollArea className="h-[400px] rounded-md border">
                  <div className="p-4 space-y-4">
                    {getFilteredMarkets().map((market, index) => (
                      <Card key={index} className="overflow-hidden">
                        <div className="flex flex-col sm:flex-row">
                          <div 
                            className="w-full sm:w-2 h-2 sm:h-auto" 
                            style={{ backgroundColor: getStatusColor(market.current_status) }}
                          ></div>
                          <div className="flex-1 p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <div className="font-medium">{market.region}</div>
                                <div className="text-sm text-muted-foreground">{market.market_type} • {market.primary_exchanges}</div>
                              </div>
                              <Badge 
                                className="text-white capitalize" 
                                style={{ backgroundColor: getStatusColor(market.current_status) }}
                              >
                                {market.current_status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 text-sm">
                              <div>
                                <div className="text-muted-foreground mb-1">Local Time</div>
                                <div className="font-medium">{getCurrentLocalTime(market)}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground mb-1">Opens</div>
                                <div className="font-medium">{formatTime(market.local_open)}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground mb-1">Closes</div>
                                <div className="font-medium">{formatTime(market.local_close)}</div>
                              </div>
                            </div>
                            {market.notes && (
                              <div className="mt-3 text-sm text-muted-foreground">
                                Note: {market.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Data Visualization Tab */}
              <TabsContent value="visualization" className="mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="py-2">
                      <CardTitle className="text-sm">Market Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={getStatusData()}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              fill="#8884d8"
                              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            >
                              {getStatusData().map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={getStatusColor(entry.name)} 
                                />
                              ))}
                            </Pie>
                            <Tooltip content={<StatusTooltip />} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="py-2">
                      <CardTitle className="text-sm">Market Types</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={getMarketTypeData()}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                            <XAxis type="number" />
                            <YAxis 
                              type="category" 
                              dataKey="name" 
                              width={70}
                              tick={{ fontSize: 12 }}
                            />
                            <Tooltip formatter={(value) => [`${value} markets`, 'Count']} />
                            <Bar dataKey="value" fill="#8884d8" name="Markets">
                              {getMarketTypeData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="lg:col-span-2">
                    <CardHeader className="py-2">
                      <CardTitle className="text-sm">Top Regions by Market Count</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={getRegionData()}
                            margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                            <XAxis 
                              dataKey="name" 
                              angle={-45}
                              textAnchor="end"
                              height={80}
                              interval={0}
                            />
                            <YAxis />
                            <Tooltip formatter={(value) => [`${value} markets`, 'Count']} />
                            <Bar dataKey="value" fill="#8884d8" name="Markets">
                              {getRegionData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Trading Hours Tab */}
              <TabsContent value="hours" className="mt-0">
                <Card>
                  <CardHeader className="py-2">
                    <CardTitle className="text-sm">Trading Hours by Market</CardTitle>
                    <CardDescription className="text-xs">
                      Visualizing local trading hours and duration
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={getTradingHoursData().slice(0, 20)} // Limit to 20 for readability
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                          <XAxis 
                            type="number" 
                            domain={[0, 24]} 
                            ticks={[0, 3, 6, 9, 12, 15, 18, 21, 24]}
                            label={{ value: 'Hours (Local Time)', position: 'insideBottom', offset: 0 }}
                          />
                          <YAxis 
                            type="category" 
                            dataKey="name" 
                            width={120}
                            tick={{ fontSize: 11 }}
                          />
                          <Tooltip content={<TradingHoursTooltip />} />
                          <Bar 
                            dataKey="duration" 
                            name="Trading Hours"
                            background={{ fill: '#eee' }}
                            fill="#8884d8"
                            barSize={15}
                            startPointX={0}
                            stackId="stack"
                          >
                            {getTradingHoursData().slice(0, 20).map((entry) => (
                              <Cell 
                                key={`cell-${entry.name}`} 
                                fill={getStatusColor(entry.status)} 
                                x={entry.start * 10} // Adjust position based on start hour
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default GlobalMarketStatusSection; 