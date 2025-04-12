import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Search, AlertCircle, Globe, Clock, BarChart2, RefreshCw, DollarSign } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
  Legend,
} from 'recharts';
import { cn } from '@/lib/utils';

const ALPHA_VANTAGE_KEY = 'ENVZWD4RMWCC6EVQ';

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

interface SearchResult {
  symbol: string;
  name: string;
  type: string;
  region: string;
  marketOpen: string;
  marketClose: string;
  timezone: string;
  currency: string;
  matchScore: string;
}

const TickerSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>('results');
  const [selectedTicker, setSelectedTicker] = useState<SearchResult | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    setSearchTerm(inputValue);
    setLoading(true);
    setError(null);
    
    try {
      const url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(inputValue)}&apikey=${ALPHA_VANTAGE_KEY}`;
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
      
      // Map API response to our interface
      if (data.bestMatches && Array.isArray(data.bestMatches)) {
        const mappedResults = data.bestMatches.map((match: any) => ({
          symbol: match['1. symbol'],
          name: match['2. name'],
          type: match['3. type'],
          region: match['4. region'],
          marketOpen: match['5. marketOpen'],
          marketClose: match['6. marketClose'],
          timezone: match['7. timezone'],
          currency: match['8. currency'],
          matchScore: match['9. matchScore'],
        }));
        setSearchResults(mappedResults);
        
        // Automatically select the first result if available
        if (mappedResults.length > 0) {
          setSelectedTicker(mappedResults[0]);
        } else {
          setSelectedTicker(null);
        }
      } else {
        setSearchResults([]);
        setSelectedTicker(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Error searching for ticker:', err);
    } finally {
      setLoading(false);
    }
  };

  // Format time from 24h to 12h
  const formatTime = (timeString: string) => {
    if (!timeString) return 'N/A';
    
    const [hours, minutes] = timeString.split(':');
    const hoursNum = parseInt(hours, 10);
    const period = hoursNum >= 12 ? 'PM' : 'AM';
    const displayHours = hoursNum % 12 || 12; // Convert 0 to 12 for 12 AM
    
    return `${displayHours}:${minutes} ${period}`;
  };

  // Calculate trading hours duration
  const calculateTradingHours = (open: string, close: string) => {
    if (!open || !close) return 'N/A';
    
    const [openHours, openMinutes] = open.split(':').map(Number);
    const [closeHours, closeMinutes] = close.split(':').map(Number);
    
    let durationHours = closeHours - openHours;
    let durationMinutes = closeMinutes - openMinutes;
    
    // Handle overnight markets
    if (durationHours < 0 || (durationHours === 0 && durationMinutes < 0)) {
      durationHours += 24;
    }
    
    if (durationMinutes < 0) {
      durationHours -= 1;
      durationMinutes += 60;
    }
    
    return `${durationHours}h ${durationMinutes}m`;
  };

  // Prepare data for match score chart
  const getMatchScoreData = () => {
    if (!searchResults.length) return [];
    
    return searchResults.map(result => ({
      name: result.symbol,
      value: parseFloat(result.matchScore) * 100,
      fullName: result.name,
    }));
  };

  // Prepare data for market types chart
  const getMarketTypesData = () => {
    if (!searchResults.length) return [];
    
    const typeCounts: Record<string, number> = {};
    searchResults.forEach(result => {
      typeCounts[result.type] = (typeCounts[result.type] || 0) + 1;
    });
    
    return Object.entries(typeCounts).map(([name, value]) => ({ name, value }));
  };

  // Prepare data for regions chart
  const getRegionsData = () => {
    if (!searchResults.length) return [];
    
    const regionCounts: Record<string, number> = {};
    searchResults.forEach(result => {
      regionCounts[result.region] = (regionCounts[result.region] || 0) + 1;
    });
    
    return Object.entries(regionCounts).map(([name, value]) => ({ name, value }));
  };

  // Prepare data for trading hours visualization
  const getTradingHoursData = () => {
    if (!searchResults.length) return [];
    
    return searchResults.map(result => {
      const openParts = result.marketOpen.split(':').map(Number);
      const closeParts = result.marketClose.split(':').map(Number);
      
      const openHour = openParts[0] + openParts[1] / 60;
      const closeHour = closeParts[0] + closeParts[1] / 60;
      
      // Handle markets that cross midnight
      const duration = closeHour < openHour ? 
        (24 - openHour) + closeHour : 
        closeHour - openHour;
      
      return {
        name: result.symbol,
        region: result.region,
        type: result.type,
        start: openHour,
        duration: duration,
        currency: result.currency,
        score: parseFloat(result.matchScore),
      };
    });
  };

  // Get currency distribution
  const getCurrencyData = () => {
    if (!searchResults.length) return [];
    
    const currencyCounts: Record<string, number> = {};
    searchResults.forEach(result => {
      currencyCounts[result.currency] = (currencyCounts[result.currency] || 0) + 1;
    });
    
    return Object.entries(currencyCounts).map(([name, value]) => ({ name, value }));
  };

  // Custom tooltip for match score chart
  const MatchScoreTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded p-2 shadow-md">
          <p className="font-medium">{payload[0].payload.name}</p>
          <p className="text-sm">{payload[0].payload.fullName}</p>
          <p className="text-sm font-medium">Match Score: {payload[0].value.toFixed(1)}%</p>
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
          <p className="font-medium">{data.name}</p>
          <p className="text-sm">{data.region} - {data.type}</p>
          <p className="text-sm">Open: {formatTime(openTime)}</p>
          <p className="text-sm">Close: {formatTime(closeTime)}</p>
          <p className="text-sm">Duration: {data.duration.toFixed(1)} hours</p>
          <p className="text-sm">Currency: {data.currency}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Ticker Search</h1>
          <p className="text-muted-foreground">
            Search for company tickers and explore trading information
          </p>
        </div>
        
        {/* Search Bar */}
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for a company (e.g., Apple, Tesla, Amazon)"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button type="submit" disabled={loading || !inputValue.trim()}>
                {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
                Search
              </Button>
            </form>
          </CardContent>
        </Card>
        
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {/* Results Section */}
        {searchTerm && (
          <Card className="overflow-hidden">
            <CardHeader className="pb-0">
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Results for "{searchTerm}"
              </CardTitle>
              <CardDescription>
                {searchResults.length} {searchResults.length === 1 ? 'match' : 'matches'} found
              </CardDescription>
            </CardHeader>
            
            <Tabs 
              value={selectedTab} 
              onValueChange={setSelectedTab}
              className="p-6 pt-2"
            >
              <TabsList className="mb-4">
                <TabsTrigger value="results">Results</TabsTrigger>
                <TabsTrigger value="visualizations">Visualizations</TabsTrigger>
                <TabsTrigger value="details">Ticker Details</TabsTrigger>
              </TabsList>
              
              {/* Loading State */}
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="flex flex-col items-center">
                    <RefreshCw className="h-8 w-8 animate-spin mb-4" />
                    <p>Searching for tickers...</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Results Tab */}
                  <TabsContent value="results" className="mt-0">
                    {searchResults.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">No results found for "{searchTerm}"</p>
                        <p className="text-sm text-muted-foreground mt-2">Try a different search term</p>
                      </div>
                    ) : (
                      <ScrollArea className="h-[400px]">
                        <div className="space-y-3">
                          {searchResults.map((result, index) => (
                            <Card 
                              key={index} 
                              className={cn(
                                "overflow-hidden cursor-pointer transition-colors hover:bg-accent/50",
                                selectedTicker?.symbol === result.symbol && "border-primary bg-accent/30"
                              )}
                              onClick={() => setSelectedTicker(result)}
                            >
                              <div className="flex flex-col sm:flex-row p-4">
                                <div className="flex-1">
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <div className="font-medium text-lg flex items-center gap-2">
                                        {result.symbol}
                                        <Badge variant="outline" className="font-normal text-xs">
                                          {result.type}
                                        </Badge>
                                      </div>
                                      <div className="text-sm text-muted-foreground">{result.name}</div>
                                    </div>
                                    <Badge 
                                      className="bg-blue-500/80" 
                                      title="Match Score"
                                    >
                                      {(parseFloat(result.matchScore) * 100).toFixed(0)}%
                                    </Badge>
                                  </div>
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-sm">
                                    <div>
                                      <div className="text-muted-foreground mb-1 flex items-center gap-1">
                                        <Globe className="h-3 w-3" /> Region
                                      </div>
                                      <div className="font-medium">{result.region}</div>
                                    </div>
                                    <div>
                                      <div className="text-muted-foreground mb-1 flex items-center gap-1">
                                        <Clock className="h-3 w-3" /> Trading Hours
                                      </div>
                                      <div className="font-medium">
                                        {formatTime(result.marketOpen)} - {formatTime(result.marketClose)}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-muted-foreground mb-1 flex items-center gap-1">
                                        <Clock className="h-3 w-3" /> Time Zone
                                      </div>
                                      <div className="font-medium">{result.timezone}</div>
                                    </div>
                                    <div>
                                      <div className="text-muted-foreground mb-1 flex items-center gap-1">
                                        <DollarSign className="h-3 w-3" /> Currency
                                      </div>
                                      <div className="font-medium">{result.currency}</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </TabsContent>
                  
                  {/* Visualizations Tab */}
                  <TabsContent value="visualizations" className="mt-0">
                    {searchResults.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">No data available for visualization</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Match Score Chart */}
                        <Card>
                          <CardHeader className="pb-1">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <BarChart2 className="h-4 w-4" />
                              Match Score Comparison
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="h-[250px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                  data={getMatchScoreData()}
                                  margin={{ top: 10, right: 10, left: 10, bottom: 40 }}
                                >
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                  <XAxis 
                                    dataKey="name" 
                                    angle={-45} 
                                    textAnchor="end" 
                                    height={60}
                                    interval={0}
                                  />
                                  <YAxis domain={[0, 100]} label={{ value: 'Match %', angle: -90, position: 'insideLeft' }} />
                                  <Tooltip content={<MatchScoreTooltip />} />
                                  <Bar dataKey="value" fill="#0088FE">
                                    {getMatchScoreData().map((entry, index) => (
                                      <Cell 
                                        key={`cell-${index}`} 
                                        fill={COLORS[index % COLORS.length]} 
                                      />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>
                        
                        {/* Market Types Distribution */}
                        <Card>
                          <CardHeader className="pb-1">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <PieChart className="h-4 w-4" />
                              Market Type Distribution
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="h-[250px] flex items-center justify-center">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={getMarketTypesData()}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={true}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    nameKey="name"
                                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                  >
                                    {getMarketTypesData().map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                  </Pie>
                                  <Tooltip />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>
                        
                        {/* Trading Hours Visualization */}
                        <Card className="lg:col-span-2">
                          <CardHeader className="pb-1">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              Trading Hours by Market
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="h-[250px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                  data={getTradingHoursData()}
                                  layout="vertical"
                                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                                >
                                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                  <XAxis 
                                    type="number" 
                                    domain={[0, 24]} 
                                    ticks={[0, 4, 8, 12, 16, 20, 24]}
                                    label={{ value: 'Hours (Local Time)', position: 'insideBottom', offset: 0 }}
                                  />
                                  <YAxis 
                                    type="category" 
                                    dataKey="name" 
                                    width={90}
                                    tick={{ fontSize: 12 }}
                                  />
                                  <Tooltip content={<TradingHoursTooltip />} />
                                  <Bar 
                                    dataKey="duration" 
                                    name="Trading Hours Duration"
                                    barSize={15}
                                  >
                                    {getTradingHoursData().map((entry, index) => (
                                      <Cell 
                                        key={`cell-${index}`} 
                                        fill={COLORS[index % COLORS.length]} 
                                      />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>
                        
                        {/* Regions & Currency Distribution */}
                        <Card>
                          <CardHeader className="pb-1">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <Globe className="h-4 w-4" />
                              Regions Distribution
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="h-[250px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={getRegionsData()}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={true}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    nameKey="name"
                                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                  >
                                    {getRegionsData().map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                  </Pie>
                                  <Tooltip />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader className="pb-1">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />
                              Currency Distribution
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="h-[250px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={getCurrencyData()}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={true}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    nameKey="name"
                                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                  >
                                    {getCurrencyData().map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                  </Pie>
                                  <Tooltip />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </TabsContent>
                  
                  {/* Ticker Details Tab */}
                  <TabsContent value="details" className="mt-0">
                    {!selectedTicker ? (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">
                          {searchResults.length > 0 
                            ? "Select a ticker from the Results tab to view details" 
                            : "No ticker selected"
                          }
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-2xl font-bold">{selectedTicker.symbol}</h3>
                            <p className="text-muted-foreground">{selectedTicker.name}</p>
                          </div>
                          <Badge className="text-lg px-3 py-1">{selectedTicker.type}</Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm flex items-center gap-2">
                                <Globe className="h-4 w-4" />
                                Region
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-2xl font-semibold">{selectedTicker.region}</p>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                Currency
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-2xl font-semibold">{selectedTicker.currency}</p>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Timezone
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-2xl font-semibold">{selectedTicker.timezone}</p>
                            </CardContent>
                          </Card>
                        </div>
                        
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              Trading Hours
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <h4 className="text-sm text-muted-foreground mb-1">Market Open</h4>
                                <p className="text-xl font-semibold">{formatTime(selectedTicker.marketOpen)}</p>
                              </div>
                              <div>
                                <h4 className="text-sm text-muted-foreground mb-1">Market Close</h4>
                                <p className="text-xl font-semibold">{formatTime(selectedTicker.marketClose)}</p>
                              </div>
                              <div>
                                <h4 className="text-sm text-muted-foreground mb-1">Trading Duration</h4>
                                <p className="text-xl font-semibold">
                                  {calculateTradingHours(selectedTicker.marketOpen, selectedTicker.marketClose)}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <BarChart2 className="h-4 w-4" />
                              Match Score
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center gap-4">
                              <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
                                <div 
                                  className="bg-primary h-full" 
                                  style={{ width: `${parseFloat(selectedTicker.matchScore) * 100}%` }}
                                />
                              </div>
                              <span className="text-lg font-semibold whitespace-nowrap">
                                {(parseFloat(selectedTicker.matchScore) * 100).toFixed(1)}%
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </TabsContent>
                </>
              )}
            </Tabs>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TickerSearch; 