import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useStockVisualization } from '@/services/visualizationService';
import { cn } from '@/lib/utils';
import { useAccessibility } from '@/lib/accessibility';

// Import chart components
import PriceChart from '@/components/visualizations/PriceChart';
import CandlestickChart from '@/components/visualizations/CandlestickChart';
import SectorHeatmap from '@/components/visualizations/SectorHeatmap';
import CorrelationMatrix from '@/components/visualizations/CorrelationMatrix';
import MarketCapTreemap from '@/components/visualizations/MarketCapTreemap';
import StockComparison from '@/components/visualizations/StockComparison';

// Icons
import { 
  BarChart, 
  LineChart, 
  PieChart, 
  TrendingUp, 
  RefreshCw, 
  Calendar, 
  Grid, 
  Layers,
  Settings,
  Search,
  Plus,
  X
} from 'lucide-react';

// UI Components
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  SelectGroup
} from '@/components/ui/select';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

const Visualizations: React.FC = () => {
  const { 
    selectedStock,
    setSelectedStock,
    timeRange,
    comparisonStock,
    setComparisonStock,
    stockList,
    reloadData
  } = useStockVisualization();

  const { speakText } = useAccessibility();
  const [activeTab, setActiveTab] = useState('candlestick');
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    // Make sure data is loaded for the initial stock
    reloadData(selectedStock, comparisonStock);
  }, []);

  // Handle stock selection change
  const handleStockChange = (value: string) => {
    setSelectedStock(value);
    reloadData(value, comparisonStock);
  };

  // Handle comparison stock selection change
  const handleComparisonChange = (value: string | null) => {
    setComparisonStock(value);
    reloadData(selectedStock, value);
  };

  // Filter stocks based on search query
  const filteredStocks = stockList.filter(stock => 
    stock.ticker.toLowerCase().includes(searchQuery.toLowerCase()) || 
    stock.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">Interactive Stock Visualizations</h1>
            <p className="text-muted-foreground">
              Advanced charts, heatmaps, and performance metrics
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => reloadData(selectedStock, comparisonStock)}
              className="h-10 w-10"
            >
              <RefreshCw size={16} />
            </Button>
          </div>
        </div>

        {/* Stock Selection & Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stock Selector */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">
                Select Stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by ticker or company name..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setDropdownOpen(true)}
                  />
                  {dropdownOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg">
                      <div className="flex justify-between items-center p-2 border-b">
                        <span className="text-sm font-medium">Select a stock</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0" 
                          onClick={() => setDropdownOpen(false)}
                        >
                          <X size={14} />
                        </Button>
                      </div>
                      <ScrollArea className="h-64">
                        {filteredStocks.length > 0 ? (
                          filteredStocks.map(stock => (
                            <button
                              key={stock.ticker}
                              onClick={() => handleStockChange(stock.ticker)}
                              className={cn(
                                "w-full px-3 py-2 text-left flex justify-between hover:bg-muted/50 transition-colors",
                                selectedStock === stock.ticker && "bg-primary/10"
                              )}
                            >
                              <span className="font-medium">{stock.ticker}</span>
                              <span className="text-xs text-muted-foreground truncate ml-2">
                                {stock.name}
                              </span>
                            </button>
                          ))
                        ) : (
                          <div className="p-3 text-center text-muted-foreground">
                            No stocks found
                          </div>
                        )}
                      </ScrollArea>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    className="flex items-center justify-between w-full"
                    onClick={() => setDropdownOpen(true)}
                  >
                    <span>{selectedStock}</span>
                    <TrendingUp size={16} className="ml-2" />
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setDropdownOpen(true)}
                  >
                    <Search size={16} />
                  </Button>
                </div>
                
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground mb-1">Compare with:</p>
                  <div className="flex flex-wrap gap-2">
                    {comparisonStock ? (
                      <Badge 
                        variant="secondary" 
                        className="flex items-center gap-1"
                      >
                        {comparisonStock}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-4 w-4 p-0 ml-1" 
                          onClick={() => handleComparisonChange(null)}
                        >
                          <X size={10} />
                        </Button>
                      </Badge>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="h-7">
                            <Plus size={14} className="mr-1" /> Compare
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-52">
                          <ScrollArea className="h-64">
                            {stockList
                              .filter(stock => stock.ticker !== selectedStock)
                              .map(stock => (
                                <DropdownMenuItem
                                  key={stock.ticker}
                                  onClick={() => handleComparisonChange(stock.ticker)}
                                >
                                  <span className="font-medium mr-2">{stock.ticker}</span>
                                  <span className="text-xs text-muted-foreground truncate">
                                    {stock.name}
                                  </span>
                                </DropdownMenuItem>
                              ))
                            }
                          </ScrollArea>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected Stock */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">
                Selected Stock
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <div className="text-2xl font-bold">{selectedStock}</div>
              <div className="text-sm text-muted-foreground">
                {timeRange} days of data
              </div>
              {comparisonStock && (
                <div className="mt-2">
                  <div className="text-sm">Comparing with:</div>
                  <div className="font-semibold">{comparisonStock}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chart Type Selection */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">
                Chart Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="price" className="flex items-center gap-1">
                    <LineChart size={14} /> Price
                  </TabsTrigger>
                  <TabsTrigger value="candlestick" className="flex items-center gap-1">
                    <BarChart size={14} /> Candlestick
                  </TabsTrigger>
                  <TabsTrigger value="correlation" className="flex items-center gap-1">
                    <Grid size={14} /> Correlation
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="mt-4 text-sm text-muted-foreground">
                {activeTab === 'price' && 'View price history with moving averages'}
                {activeTab === 'candlestick' && 'Analyze price action with OHLC and volume data'}
                {activeTab === 'correlation' && 'See correlations between different stocks'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Chart Display */}
        <div className="grid grid-cols-1 gap-6">
          {activeTab === 'price' && <PriceChart />}
          {activeTab === 'candlestick' && <CandlestickChart />}
          {activeTab === 'correlation' && <CorrelationMatrix />}
        </div>

        {/* Secondary Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectorHeatmap />
          <MarketCapTreemap />
        </div>

        {/* Comparison Card (conditionally shown) */}
        {comparisonStock && (
          <Card>
            <CardHeader>
              <CardTitle>Stock Comparison</CardTitle>
              <CardDescription>
                Comparing key metrics between {selectedStock} and {comparisonStock}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StockComparison />
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Visualizations; 