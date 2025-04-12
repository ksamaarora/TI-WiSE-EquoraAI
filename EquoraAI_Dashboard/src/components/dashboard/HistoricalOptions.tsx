import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell
} from 'recharts';

// Interface for the options data
interface OptionsData {
  options: OptionContract[];
  metadata: {
    symbol: string;
    expiration: string;
    lastUpdated: string;
  }
}

interface OptionContract {
  strike: string;
  optionType: string;
  lastPrice: string;
  change: string;
  changePercent: string;
  volume: string;
  openInterest: string;
  impliedVolatility: string;
  delta: string;
  gamma: string;
  theta: string;
  vega: string;
  rho: string;
  bid: string;
  ask: string;
  expirationDate: string;
}

interface HistoricalOptionsProps {
  symbol: string;
}

const HistoricalOptions: React.FC<HistoricalOptionsProps> = ({ symbol }) => {
  const [optionsData, setOptionsData] = useState<OptionsData | null>(null);
  const [expiration, setExpiration] = useState<string>('');
  const [expirations, setExpirations] = useState<string[]>([]);
  const [optionType, setOptionType] = useState<string>('call');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("strike-price");

  useEffect(() => {
    const fetchOptionsExpirations = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch available expirations for the symbol
        const API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_KEY || 'ENVZWD4RMWCC6EVQ';
        // This is a placeholder - Alpha Vantage doesn't have a direct API for expirations
        // In a real implementation, we'd need to fetch options data and extract unique expirations
        // For demo purposes, we'll create some mock expirations
        
        const now = new Date();
        const mockExpirations = [
          new Date(now.setDate(now.getDate() + 7)).toISOString().split('T')[0],
          new Date(now.setDate(now.getDate() + 7)).toISOString().split('T')[0],
          new Date(now.setDate(now.getDate() + 14)).toISOString().split('T')[0],
          new Date(now.setDate(now.getDate() + 30)).toISOString().split('T')[0]
        ];
        
        setExpirations(mockExpirations);
        setExpiration(mockExpirations[0]);
        
        // After setting initial expiration, fetch options data
        fetchOptionsData(mockExpirations[0]);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        console.error("Error fetching options expirations:", err);
        setIsLoading(false);
      }
    };
    
    fetchOptionsExpirations();
  }, [symbol]);
  
  const fetchOptionsData = async (expirationDate: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch options data from Alpha Vantage API
      const API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_KEY || 'ENVZWD4RMWCC6EVQ';
      const url = `https://www.alphavantage.co/query?function=OPTIONS&symbol=${symbol}&expiration=${expirationDate}&apikey=${API_KEY}`;
      
      console.log("Fetching options data from:", url);
      
      // In a real implementation, you'd make an actual API call
      // For demo purposes, we'll generate mock data
      // const response = await axios.get(url, {
      //   headers: { 'User-Agent': 'Mozilla/5.0' }
      // });
      
      // Mock data response for development
      const mockData: OptionsData = {
        options: generateMockOptions(20, expirationDate, optionType),
        metadata: {
          symbol: symbol,
          expiration: expirationDate,
          lastUpdated: new Date().toISOString()
        }
      };
      
      console.log("Options data:", mockData);
      
      // Update state with options data
      setOptionsData(mockData);
      setIsLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error("Error fetching options data:", err);
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (expiration) {
      fetchOptionsData(expiration);
    }
  }, [expiration, optionType]);
  
  // Function to generate mock options data for development
  const generateMockOptions = (count: number, expirationDate: string, type: string): OptionContract[] => {
    const basePrice = 100; // Simulated stock price
    const options: OptionContract[] = [];
    
    for (let i = 0; i < count; i++) {
      const strikeDiff = -25 + (i * 2.5); // Strike prices from -25 to +25 of base price
      const strike = basePrice + strikeDiff;
      
      // Calculate implied volatility - higher for options farther from ATM
      const distanceFromATM = Math.abs(strikeDiff);
      const baseIV = 0.30; // 30% base volatility
      const iv = baseIV + (distanceFromATM / 100);
      
      // Greeks calculations (very simplified)
      const delta = type === 'call' 
        ? Math.max(0, Math.min(1, 0.5 + (strikeDiff / 50)))
        : Math.max(0, Math.min(1, 0.5 - (strikeDiff / 50)));
      
      const gamma = 0.05 * Math.exp(-0.5 * Math.pow(strikeDiff / 10, 2));
      const theta = -0.2 * Math.exp(-0.5 * Math.pow(strikeDiff / 15, 2));
      const vega = 0.3 * Math.exp(-0.5 * Math.pow(strikeDiff / 20, 2));
      const rho = type === 'call' ? 0.05 : -0.05;
      
      // Price is calculated based on strike and volatility
      const lastPrice = type === 'call'
        ? Math.max(0.05, basePrice - strike + (iv * 10))
        : Math.max(0.05, strike - basePrice + (iv * 10));
      
      options.push({
        strike: strike.toFixed(2),
        optionType: type,
        lastPrice: lastPrice.toFixed(2),
        change: (Math.random() * 2 - 1).toFixed(2),
        changePercent: (Math.random() * 10 - 5).toFixed(2),
        volume: Math.floor(Math.random() * 1000).toString(),
        openInterest: Math.floor(Math.random() * 5000).toString(),
        impliedVolatility: iv.toFixed(2),
        delta: delta.toFixed(2),
        gamma: gamma.toFixed(4),
        theta: theta.toFixed(4),
        vega: vega.toFixed(4),
        rho: rho.toFixed(4),
        bid: (lastPrice - 0.05).toFixed(2),
        ask: (lastPrice + 0.05).toFixed(2),
        expirationDate: expirationDate
      });
    }
    
    return options;
  };
  
  // Prepare data for strike price vs. implied volatility chart (volatility smile)
  const prepareVolatilitySmileData = () => {
    if (!optionsData || !optionsData.options) return [];
    
    return optionsData.options.map(option => ({
      strike: parseFloat(option.strike),
      iv: parseFloat(option.impliedVolatility) * 100, // Convert to percentage
      price: parseFloat(option.lastPrice)
    }));
  };
  
  // Prepare data for option greek visualizations
  const prepareGreeksData = () => {
    if (!optionsData || !optionsData.options) return [];
    
    return optionsData.options.map(option => ({
      strike: parseFloat(option.strike),
      delta: parseFloat(option.delta),
      gamma: parseFloat(option.gamma) * 100, // Scale for visualization
      theta: parseFloat(option.theta) * 10, // Scale for visualization
      vega: parseFloat(option.vega) * 10 // Scale for visualization
    }));
  };
  
  // Prepare data for open interest and volume
  const prepareVolumeOIData = () => {
    if (!optionsData || !optionsData.options) return [];
    
    return optionsData.options.map(option => ({
      strike: parseFloat(option.strike),
      volume: parseInt(option.volume),
      openInterest: parseInt(option.openInterest)
    }));
  };
  
  // Format percentage for display
  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };
  
  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded shadow-lg">
          <p className="font-medium text-sm">Strike: ${label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.name.includes('IV') ? formatPercentage(entry.value) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    
    return null;
  };
  
  // Custom tooltip for greeks chart
  const GreeksTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded shadow-lg">
          <p className="font-medium text-sm">Strike: ${label}</p>
          {payload.map((entry: any, index: number) => {
            let value = entry.value;
            let name = entry.name;
            
            if (name === 'gamma') {
              value = value / 100;
            } else if (name === 'theta' || name === 'vega') {
              value = value / 10;
            }
            
            return (
              <p key={`item-${index}`} style={{ color: entry.color }} className="text-sm">
                {name.charAt(0).toUpperCase() + name.slice(1)}: {value.toFixed(4)}
              </p>
            );
          })}
        </div>
      );
    }
    
    return null;
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex justify-center items-center p-6 h-48">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Loading options data...</p>
        </CardContent>
      </Card>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load options data: {error}
        </AlertDescription>
      </Alert>
    );
  }
  
  if (!optionsData) {
    return (
      <Alert>
        <AlertTitle>No Data</AlertTitle>
        <AlertDescription>
          No options data available for this symbol.
        </AlertDescription>
      </Alert>
    );
  }
  
  const volatilitySmileData = prepareVolatilitySmileData();
  const greeksData = prepareGreeksData();
  const volumeOIData = prepareVolumeOIData();
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Historical Options Data</CardTitle>
              <CardDescription>
                Options chain for {symbol} with expiration date: {expiration}
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="expiration">Expiration Date</Label>
                <Select value={expiration} onValueChange={setExpiration}>
                  <SelectTrigger id="expiration">
                    <SelectValue placeholder="Select Expiration" />
                  </SelectTrigger>
                  <SelectContent>
                    {expirations.map((date) => (
                      <SelectItem key={date} value={date}>
                        {date}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="option-type">Option Type</Label>
                <Select value={optionType} onValueChange={setOptionType}>
                  <SelectTrigger id="option-type">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="call">Calls</SelectItem>
                    <SelectItem value="put">Puts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="strike-price">Volatility Smile</TabsTrigger>
              <TabsTrigger value="greeks">Greeks</TabsTrigger>
              <TabsTrigger value="volume">Volume & Open Interest</TabsTrigger>
            </TabsList>
            
            <TabsContent value="strike-price" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Implied Volatility vs. Strike Price</CardTitle>
                  <CardDescription>
                    Visualizes the volatility smile for {optionType}s expiring on {expiration}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={volatilitySmileData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="strike" 
                          type="number" 
                          domain={['dataMin', 'dataMax']} 
                          label={{ value: 'Strike Price ($)', position: 'insideBottom', offset: -5 }}
                        />
                        <YAxis 
                          label={{ value: 'Implied Volatility (%)', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip content={CustomTooltip} />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="iv" 
                          name="IV (%)" 
                          stroke="#8884d8" 
                          activeDot={{ r: 8 }} 
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Option Prices vs. Strike Price</CardTitle>
                  <CardDescription>
                    Price curve for {optionType}s expiring on {expiration}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={volatilitySmileData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="strike" 
                          type="number" 
                          domain={['dataMin', 'dataMax']} 
                          label={{ value: 'Strike Price ($)', position: 'insideBottom', offset: -5 }}
                        />
                        <YAxis 
                          label={{ value: 'Option Price ($)', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip content={CustomTooltip} />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="price" 
                          name="Option Price ($)" 
                          stroke="#82ca9d" 
                          activeDot={{ r: 8 }} 
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="greeks" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Option Greeks vs. Strike Price</CardTitle>
                  <CardDescription>
                    Delta, gamma, theta, and vega values for {optionType}s expiring on {expiration}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={greeksData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="strike" 
                          type="number" 
                          domain={['dataMin', 'dataMax']} 
                          label={{ value: 'Strike Price ($)', position: 'insideBottom', offset: -5 }}
                        />
                        <YAxis 
                          label={{ value: 'Greek Value', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip content={GreeksTooltip} />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="delta" 
                          name="delta" 
                          stroke="#8884d8" 
                          activeDot={{ r: 8 }} 
                          strokeWidth={2}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="gamma" 
                          name="gamma" 
                          stroke="#82ca9d" 
                          activeDot={{ r: 4 }} 
                          strokeWidth={2}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="theta" 
                          name="theta" 
                          stroke="#ff7300" 
                          activeDot={{ r: 4 }} 
                          strokeWidth={2}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="vega" 
                          name="vega" 
                          stroke="#0088fe" 
                          activeDot={{ r: 4 }} 
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="volume" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Volume & Open Interest by Strike Price</CardTitle>
                  <CardDescription>
                    Trading activity for {optionType}s expiring on {expiration}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={volumeOIData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="strike" 
                          type="number" 
                          domain={['dataMin', 'dataMax']} 
                          label={{ value: 'Strike Price ($)', position: 'insideBottom', offset: -5 }}
                        />
                        <YAxis 
                          label={{ value: 'Contracts', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip content={CustomTooltip} />
                        <Legend />
                        <Bar dataKey="volume" name="Volume" fill="#8884d8" />
                        <Bar dataKey="openInterest" name="Open Interest" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Options Chain Table</CardTitle>
                  <CardDescription>
                    Detailed options data for {symbol} {optionType}s expiring on {expiration}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left p-2 font-medium">Strike</th>
                          <th className="text-right p-2 font-medium">Last</th>
                          <th className="text-right p-2 font-medium">Change</th>
                          <th className="text-right p-2 font-medium">Bid</th>
                          <th className="text-right p-2 font-medium">Ask</th>
                          <th className="text-right p-2 font-medium">IV</th>
                          <th className="text-right p-2 font-medium">Volume</th>
                          <th className="text-right p-2 font-medium">OI</th>
                          <th className="text-right p-2 font-medium">Delta</th>
                        </tr>
                      </thead>
                      <tbody>
                        {optionsData.options.map((option, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-muted/20' : ''}>
                            <td className="p-2 font-medium">${option.strike}</td>
                            <td className="text-right p-2">${option.lastPrice}</td>
                            <td className={`text-right p-2 ${parseFloat(option.change) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {parseFloat(option.change) >= 0 ? '+' : ''}{option.change} ({parseFloat(option.changePercent) >= 0 ? '+' : ''}{option.changePercent}%)
                            </td>
                            <td className="text-right p-2">${option.bid}</td>
                            <td className="text-right p-2">${option.ask}</td>
                            <td className="text-right p-2">{(parseFloat(option.impliedVolatility) * 100).toFixed(2)}%</td>
                            <td className="text-right p-2">{option.volume}</td>
                            <td className="text-right p-2">{option.openInterest}</td>
                            <td className="text-right p-2">{option.delta}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default HistoricalOptions; 