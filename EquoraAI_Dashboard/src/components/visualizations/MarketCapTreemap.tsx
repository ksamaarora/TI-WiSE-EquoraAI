import React, { useMemo, useState, useEffect } from 'react';
import { useStockVisualization } from '@/services/visualizationService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  PieChart as PieChartIcon,
  TrendingUp,
  TrendingDown,
  Info,
  HelpCircle
} from 'lucide-react';
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Import recharts components
import {
  Treemap,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

// Type definitions
type GroupingMode = 'sector' | 'none';
type SortingMode = 'marketCap' | 'change';

// Custom tooltip component
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;
    
    return (
      <div className="bg-background p-3 border rounded-md shadow-md max-w-xs">
        <p className="font-medium mb-1">{data.name} ({data.ticker})</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="font-medium">Market Cap:</div>
          <div className="text-right">${data.marketCap.toFixed(1)}B</div>
          
          <div className="font-medium">Sector:</div>
          <div className="text-right">{data.sector}</div>
          
          <div className="font-medium">Change:</div>
          <div className={cn(
            "text-right",
            data.change >= 0 ? 'text-green-600' : 'text-red-600'
          )}>
            {data.change >= 0 ? '+' : ''}{data.change.toFixed(2)}%
          </div>
        </div>
      </div>
    );
  }
  
  return null;
};

// Main component
const MarketCapTreemap: React.FC = () => {
  const { marketCapData, selectedStock } = useStockVisualization();
  const [grouping, setGrouping] = useState<GroupingMode>('sector');
  const [colorBy, setColorBy] = useState<'sector' | 'performance'>('performance');
  const [sortBy, setSortBy] = useState<SortingMode>('marketCap');
  const [highlightSelected, setHighlightSelected] = useState<boolean>(true);
  
  // Prepare data for treemap
  const treemapData = useMemo(() => {
    let processedData = [...marketCapData];
    
    // Highlight the selected stock if enabled
    if (highlightSelected && selectedStock) {
      processedData = processedData.map(stock => ({
        ...stock,
        isSelected: stock.ticker === selectedStock
      }));
    }
    
    if (grouping === 'none') {
      // No grouping, just return sorted data
      return [{
        name: 'Market Cap',
        children: processedData
          .sort((a, b) => (sortBy === 'marketCap' ? b.marketCap - a.marketCap : b.change - a.change))
      }];
    } else {
      // Group by sector
      const sectors = {} as Record<string, any[]>;
      
      // Group stocks by sector
      processedData.forEach(stock => {
        if (!sectors[stock.sector]) {
          sectors[stock.sector] = [];
        }
        sectors[stock.sector].push(stock);
      });
      
      // Create hierarchical structure
      return [{
        name: 'Market Cap',
        children: Object.entries(sectors).map(([sector, stocks]) => ({
          name: sector,
          children: [...stocks]
            .sort((a, b) => (sortBy === 'marketCap' ? b.marketCap - a.marketCap : b.change - a.change))
        }))
      }];
    }
  }, [marketCapData, grouping, sortBy, selectedStock, highlightSelected]);
  
  // Get color based on performance or sector
  const getStockColor = (stock: any) => {
    // Highlight selected stock if enabled
    if (highlightSelected && stock.isSelected) {
      return '#f97316'; // orange-500 for selected stock
    }
    
    if (colorBy === 'performance') {
      // Color by performance
      if (stock.change > 5) return '#15803d'; // green-700
      if (stock.change > 3) return '#16a34a'; // green-600
      if (stock.change > 1) return '#22c55e'; // green-500
      if (stock.change > 0) return '#4ade80'; // green-400
      if (stock.change > -1) return '#f87171'; // red-400
      if (stock.change > -3) return '#ef4444'; // red-500
      if (stock.change > -5) return '#dc2626'; // red-600
      return '#b91c1c'; // red-700
    } else {
      // Color by sector
      const sectorColors: Record<string, string> = {
        'Technology': '#3b82f6', // blue-500
        'Healthcare': '#10b981', // emerald-500
        'Financial Services': '#a855f7', // purple-500
        'Communication Services': '#ec4899', // pink-500
        'Consumer Cyclical': '#f97316', // orange-500
        'Industrials': '#6366f1', // indigo-500
        'Consumer Defensive': '#14b8a6', // teal-500
        'Energy': '#f59e0b', // amber-500
        'Utilities': '#06b6d4', // cyan-500
        'Real Estate': '#8b5cf6', // violet-500
        'Basic Materials': '#84cc16', // lime-500
        'Automotive': '#d946ef' // fuchsia-500
      };
      
      return sectorColors[stock.sector] || '#94a3b8'; // slate-400 as fallback
    }
  };
  
  // Format market cap value
  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1000) {
      return `$${(marketCap / 1000).toFixed(2)}T`;
    }
    return `$${marketCap.toFixed(2)}B`;
  };
  
  // Custom content for treemap
  const CustomizedContent = (props: any) => {
    const { root, depth, x, y, width, height, index, name, ticker, marketCap, sector, change, isSelected } = props;
    
    // Only render if we have enough space
    if (width < 30 || height < 30) {
      return null;
    }
    
    // For sector groups
    if (!ticker) {
      return (
        <g>
          <rect
            x={x}
            y={y}
            width={width}
            height={height}
            style={{
              fill: colorBy === 'sector' ? getStockColor({ sector }) : '#6b7280',
              stroke: '#fff',
              strokeWidth: 2,
              opacity: 0.8
            }}
          />
          {width > 50 && height > 20 && (
            <text
              x={x + width / 2}
              y={y + height / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs font-medium fill-white"
            >
              {name}
            </text>
          )}
        </g>
      );
    }
    
    // For individual stocks
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: getStockColor(props),
            stroke: isSelected ? '#fff' : '#e2e8f0',
            strokeWidth: isSelected ? 2 : 1,
            opacity: isSelected ? 1 : 0.9
          }}
        />
        {width > 40 && height > 40 ? (
          <>
            <text
              x={x + width / 2}
              y={y + height / 2 - 7}
              textAnchor="middle"
              dominantBaseline="middle"
              className={cn(
                "text-xs font-medium fill-white",
                isSelected && "font-bold"
              )}
            >
              {ticker}
            </text>
            <text
              x={x + width / 2}
              y={y + height / 2 + 7}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[10px] fill-white"
            >
              {formatMarketCap(marketCap)}
            </text>
          </>
        ) : width > 30 && height > 30 ? (
          <text
            x={x + width / 2}
            y={y + height / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            className={cn(
              "text-xs font-medium fill-white",
              isSelected && "font-bold"
            )}
          >
            {ticker}
          </text>
        ) : null}
      </g>
    );
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center">
          <PieChartIcon className="mr-2" size={18} />
          Market Capitalization
        </CardTitle>
      </CardHeader>
      <div className="px-4 pb-2 border-b flex flex-wrap gap-2 justify-between items-center">
        <div className="flex flex-wrap gap-2">
          <Select
            value={grouping}
            onValueChange={(value) => setGrouping(value as GroupingMode)}
          >
            <SelectTrigger className="h-8 w-[110px] text-xs">
              <SelectValue placeholder="Grouping" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sector">By Sector</SelectItem>
              <SelectItem value="none">No Grouping</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as SortingMode)}
          >
            <SelectTrigger className="h-8 w-[110px] text-xs">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="marketCap">Market Cap</SelectItem>
              <SelectItem value="change">Performance</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={colorBy}
            onValueChange={(value) => setColorBy(value as 'sector' | 'performance')}
          >
            <SelectTrigger className="h-8 w-[110px] text-xs">
              <SelectValue placeholder="Color By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="performance">Performance</SelectItem>
              <SelectItem value="sector">Sector</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch id="highlight-selected" 
            checked={highlightSelected} 
            onCheckedChange={setHighlightSelected} 
          />
          <Label htmlFor="highlight-selected" className="text-xs">Highlight Selected</Label>
          
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger asChild>
                <HelpCircle size={14} className="text-muted-foreground ml-1" />
              </TooltipTrigger>
              <TooltipContent side="top" className="w-80 p-4">
                <h4 className="font-bold mb-2">Market Cap Treemap</h4>
                <p className="text-xs mb-2">
                  This visualization shows the market capitalization of stocks, with box size proportional to market cap.
                </p>
                <ul className="text-xs space-y-1">
                  <li>• Use <strong>Grouping</strong> to organize by sector or view all stocks together</li>
                  <li>• <strong>Sort By</strong> determines whether companies are ordered by market cap or performance</li>
                  <li>• <strong>Color By</strong> switches between coloring by sector or performance</li>
                  <li>• Hover over any box to see detailed information</li>
                </ul>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </div>
      </div>
      
      <div className="px-4 py-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
        <div className="font-medium">Performance:</div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-600"></div>
          <span>&gt;3% gain</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
          <span>0-3% gain</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <span>0-3% loss</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-red-600"></div>
          <span>&gt;3% loss</span>
        </div>
        {selectedStock && highlightSelected && (
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span>Selected ({selectedStock})</span>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={treemapData}
              dataKey="marketCap"
              stroke="#fff"
              fill="#8884d8"
              content={<CustomizedContent />}
              animationDuration={500}
            >
              <Tooltip content={<CustomTooltip />} />
            </Treemap>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketCapTreemap; 