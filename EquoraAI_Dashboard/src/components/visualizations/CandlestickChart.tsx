import React, { useState } from 'react';
import { useStockVisualization } from '@/services/visualizationService';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Info, 
  HelpCircle,
  LineChart,
  BarChart2,
  Eye,
  EyeOff 
} from 'lucide-react';
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Advanced chart components
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart,
  Line,
  Brush,
  Area
} from 'recharts';

// Custom candlestick component
const CustomCandlestick = (props: any) => {
  const { x, y, width, height, low, high, open, close, actualOpen, actualClose } = props;
  
  // Determine color based on whether the stock went up or down
  const color = actualOpen > actualClose ? '#ef4444' : '#22c55e';
  const halfWidth = width / 2;
  
  return (
    <g>
      {/* Wick line (high to low) */}
      <line
        x1={x + halfWidth}
        y1={y + (high * height)}
        x2={x + halfWidth}
        y2={y + (low * height)}
        stroke={color}
        strokeWidth={1}
      />
      
      {/* Body rectangle (open to close) */}
      <rect
        x={x}
        y={y + (Math.min(open, close) * height)}
        width={width}
        height={Math.max(0.005, Math.abs(open - close) * height)}
        fill={color}
        stroke={color}
      />
    </g>
  );
};

// Custom tooltip component
const CandlestickTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const priceChange = data.close - data.open;
    const percentChange = (priceChange / data.open) * 100;
    const isPositive = data.close >= data.open;

    return (
      <div className="bg-background p-3 border rounded-md shadow-md max-w-xs">
        <p className="font-medium mb-2 text-sm">{`${new Date(data.date).toLocaleDateString()} (${format(new Date(data.date), 'EEE')})`}</p>
        
        <div className="flex items-center mb-2">
          <div className={`h-3 w-3 rounded-full ${isPositive ? 'bg-green-500' : 'bg-red-500'} mr-2`}></div>
          <span className={`font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? 'Bullish' : 'Bearish'} ({percentChange.toFixed(2)}%)
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm border-t pt-2">
          <div className="font-medium">Open:</div>
          <div className="text-right">${data.open.toFixed(2)}</div>
          
          <div className="font-medium">High:</div>
          <div className="text-right text-green-600">${data.high.toFixed(2)}</div>
          
          <div className="font-medium">Low:</div>
          <div className="text-right text-red-600">${data.low.toFixed(2)}</div>
          
          <div className="font-medium">Close:</div>
          <div className="text-right font-bold">${data.close.toFixed(2)}</div>
          
          <div className="font-medium">Volume:</div>
          <div className="text-right">{(data.volume / 1000000).toFixed(2)}M</div>
        </div>
        
        {data.sma20 && data.sma50 && (
          <div className="grid grid-cols-2 gap-2 text-sm border-t pt-2 mt-2">
            <div className="font-medium text-blue-600">SMA 20:</div>
            <div className="text-right">${data.sma20?.toFixed(2) || 'N/A'}</div>
            
            <div className="font-medium text-purple-600">SMA 50:</div>
            <div className="text-right">${data.sma50?.toFixed(2) || 'N/A'}</div>
          </div>
        )}
      </div>
    );
  }
  return null;
};

// Format volume with appropriate suffix
const formatVolume = (volume: number) => {
  if (volume >= 1000000000) {
    return `${(volume / 1000000000).toFixed(1)}B`;
  }
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(1)}M`;
  }
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}K`;
  }
  return volume.toString();
};

// Format price for y-axis
const formatPrice = (value: number) => {
  return `$${value.toFixed(2)}`;
};

const CandlestickChart: React.FC = () => {
  const { selectedStock, candlestickData, timeRange, comparisonStock } = useStockVisualization();
  const [showVolume, setShowVolume] = useState(true);
  const [showSMA, setShowSMA] = useState(true);
  const [patternGuide, setPatternGuide] = useState(false);
  const [chartType, setChartType] = useState<'candles' | 'ohlc' | 'area'>('candles');
  
  // Prepare data for candlestick chart
  const chartData = candlestickData.map(item => {
    // Normalize values for canvas scale (0-1 range)
    const min = Math.min(item.open, item.close, item.low);
    const max = Math.max(item.open, item.close, item.high);
    const range = max - min || 1; // Avoid division by zero
    
    return {
      ...item,
      open: (item.open - min) / range,
      close: (item.close - min) / range,
      high: (item.high - min) / range,
      low: (item.low - min) / range,
      actualOpen: item.open,
      actualClose: item.close,
      actualHigh: item.high,
      actualLow: item.low
    };
  });
  
  // Calculate min and max prices for y-axis domain
  const actualPrices = candlestickData.flatMap(item => [item.high, item.low, item.open, item.close]);
  const minPrice = Math.min(...actualPrices) * 0.995;
  const maxPrice = Math.max(...actualPrices) * 1.005;
  
  // Calculate min and max volumes for volume y-axis domain
  const volumes = candlestickData.map(item => item.volume);
  const maxVolume = Math.max(...volumes) * 1.1;
  
  // Format date for x-axis
  const formatXAxis = (dateStr: string) => {
    const date = new Date(dateStr);
    if (timeRange <= 7) {
      return format(date, 'EEE');
    } else if (timeRange <= 30) {
      return format(date, 'dd MMM');
    } else {
      return format(date, 'MMM yy');
    }
  };
  
  // Calculate simple moving averages
  const calculateSMA = (period: number) => {
    const prices = candlestickData.map(item => item.close);
    const result = [];
    
    for (let i = 0; i < prices.length; i++) {
      if (i < period - 1) {
        result.push(null); // Not enough data points yet
      } else {
        const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
        result.push(sum / period);
      }
    }
    
    return candlestickData.map((item, index) => ({
      date: item.date,
      sma: result[index]
    }));
  };
  
  const sma20Data = calculateSMA(20);
  const sma50Data = calculateSMA(50);
  
  // Combine SMA data with candlestick data
  const combinedData = candlestickData.map((item, index) => ({
    ...item,
    sma20: sma20Data[index]?.sma,
    sma50: sma50Data[index]?.sma,
    // Color volume bars based on price change
    volumeColor: item.close >= item.open ? '#22c55e' : '#ef4444'
  }));
  
  // Identify some basic patterns
  const identifyPatterns = () => {
    // Find doji patterns (open and close are very close)
    const dojis = combinedData.map((item, index) => {
      const bodySize = Math.abs(item.open - item.close);
      const totalRange = item.high - item.low;
      // Doji has very small body compared to total range
      return bodySize / totalRange < 0.1 && totalRange > 0;
    });
    
    // Find engulfing patterns (current candle's body completely engulfs previous candle's body)
    const engulfing = combinedData.map((item, index) => {
      if (index === 0) return false;
      
      const prev = combinedData[index - 1];
      const currBodySize = Math.abs(item.close - item.open);
      const prevBodySize = Math.abs(prev.close - prev.open);
      const isBullish = item.close > item.open && prev.close < prev.open;
      const isBearish = item.close < item.open && prev.close > prev.open;
      
      return (isBullish || isBearish) && currBodySize > prevBodySize * 1.2;
    });
    
    // Find potential reversal points (three consecutive candles in opposite directions)
    const reversals = combinedData.map((item, index) => {
      if (index < 2) return false;
      
      const prev2 = combinedData[index - 2];
      const prev1 = combinedData[index - 1];
      
      const bullishReversal = 
        prev2.close < prev2.open && 
        prev1.close < prev1.open && 
        item.close > item.open;
        
      const bearishReversal = 
        prev2.close > prev2.open && 
        prev1.close > prev1.open && 
        item.close < item.open;
        
      return bullishReversal || bearishReversal;
    });
    
    return { dojis, engulfing, reversals };
  };
  
  const patterns = identifyPatterns();
  
  return (
    <Card className="overflow-hidden">
      <div className="p-4 border-b">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <h3 className="text-lg font-semibold flex items-center">
            <span>
              {selectedStock} Candlestick Chart
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {timeRange} days
              </span>
            </span>
          </h3>
          
          <div className="flex flex-wrap gap-3 items-center">
            <Tabs value={chartType} onValueChange={(val: any) => setChartType(val)} className="w-auto">
              <TabsList className="h-8 w-auto">
                <TabsTrigger value="candles" className="px-2 h-7 text-xs">
                  <BarChart2 size={12} className="mr-1" /> Candles
                </TabsTrigger>
                <TabsTrigger value="ohlc" className="px-2 h-7 text-xs">
                  <LineChart size={12} className="mr-1" /> OHLC
                </TabsTrigger>
                <TabsTrigger value="area" className="px-2 h-7 text-xs">
                  <TrendingUp size={12} className="mr-1" /> Area
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex items-center space-x-2">
              <Switch id="show-volume" checked={showVolume} onCheckedChange={setShowVolume} />
              <Label htmlFor="show-volume" className="text-xs">Volume</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="show-sma" checked={showSMA} onCheckedChange={setShowSMA} />
              <Label htmlFor="show-sma" className="text-xs">Moving Avg</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="show-patterns" checked={patternGuide} onCheckedChange={setPatternGuide} />
              <Label htmlFor="show-patterns" className="text-xs">Patterns</Label>
            </div>
            
            <TooltipProvider>
              <UITooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <HelpCircle size={14} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left" className="w-80 p-4">
                  <h4 className="font-bold mb-2">How to Read a Candlestick Chart</h4>
                  <ul className="text-xs space-y-2">
                    <li className="flex items-center">
                      <div className="w-4 h-4 bg-green-500 mr-2"></div>
                      <span><strong>Green candle:</strong> Close price higher than open (bullish)</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-4 h-4 bg-red-500 mr-2"></div>
                      <span><strong>Red candle:</strong> Close price lower than open (bearish)</span>
                    </li>
                    <li><strong>Wick/shadow:</strong> Shows price extremes during the period</li>
                    <li><strong>Body:</strong> Difference between open and close prices</li>
                    <li className="pt-1"><strong>SMA (Simple Moving Average):</strong> Average price over a period</li>
                  </ul>
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 mt-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Bullish (Close price above Open)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Bearish (Close price below Open)</span>
          </div>
          {showSMA && (
            <>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>SMA (20)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span>SMA (50)</span>
              </div>
            </>
          )}
        </div>
      </div>
      <CardContent className="p-0">
        <div className={`h-[500px] p-4 ${showVolume ? 'pb-2' : ''}`}>
          <ResponsiveContainer width="100%" height={showVolume ? '80%' : '100%'}>
            <ComposedChart data={chartType === 'candles' ? chartData : combinedData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatXAxis} 
                minTickGap={30}
                tick={{ fontSize: 12 }} 
              />
              <YAxis 
                domain={[minPrice, maxPrice]}
                tickFormatter={formatPrice}
                tick={{ fontSize: 12 }}
                orientation="right"
              />
              <Tooltip content={<CandlestickTooltip />} />
              
              {/* Render different chart types */}
              {chartType === 'candles' && (
                // Candlesticks
                chartData.map((entry, index) => (
                  <CustomCandlestick
                    key={`candle-${index}`}
                    x={index * (chartData.length / timeRange)}
                    width={0.8 * (chartData.length / timeRange)}
                    open={entry.open}
                    close={entry.close}
                    high={entry.high}
                    low={entry.low}
                    actualOpen={entry.actualOpen}
                    actualClose={entry.actualClose}
                  />
                ))
              )}
              
              {chartType === 'ohlc' && (
                // OHLC lines
                <>
                  <Line
                    type="monotone"
                    dataKey="high"
                    stroke="#22c55e"
                    dot={false}
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="low"
                    stroke="#ef4444"
                    dot={false}
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="open"
                    stroke="#3b82f6"
                    dot={false}
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="close"
                    stroke="#8b5cf6"
                    dot={false}
                    isAnimationActive={false}
                  />
                </>
              )}
              
              {chartType === 'area' && (
                <Area 
                  type="monotone" 
                  dataKey="close" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.2}
                />
              )}
              
              {/* Moving Averages */}
              {showSMA && (
                <>
                  <Line 
                    type="monotone" 
                    dataKey="sma20" 
                    name="SMA (20)" 
                    stroke="#3b82f6" 
                    dot={false} 
                    connectNulls={true}
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sma50" 
                    name="SMA (50)" 
                    stroke="#8b5cf6" 
                    dot={false} 
                    connectNulls={true}
                    strokeWidth={2}
                  />
                </>
              )}
              
              {/* Pattern guides */}
              {patternGuide && (
                <>
                  {patterns.dojis.map((isDoji, index) => (
                    isDoji && (
                      <ReferenceLine
                        key={`doji-${index}`}
                        x={combinedData[index].date}
                        stroke="#f59e0b"
                        strokeDasharray="3 3"
                        isFront={true}
                        label={{ value: "Doji", position: "insideTopRight", fill: "#f59e0b", fontSize: 10 }}
                      />
                    )
                  ))}
                  
                  {patterns.engulfing.map((isEngulfing, index) => (
                    isEngulfing && (
                      <ReferenceLine
                        key={`engulfing-${index}`}
                        x={combinedData[index].date}
                        stroke="#10b981"
                        strokeDasharray="3 3"
                        isFront={true}
                        label={{ value: "Engulfing", position: "insideTopRight", fill: "#10b981", fontSize: 10 }}
                      />
                    )
                  ))}
                  
                  {patterns.reversals.map((isReversal, index) => (
                    isReversal && (
                      <ReferenceLine
                        key={`reversal-${index}`}
                        x={combinedData[index].date}
                        stroke="#8b5cf6"
                        strokeDasharray="3 3"
                        isFront={true}
                        label={{ value: "Reversal", position: "insideTopRight", fill: "#8b5cf6", fontSize: 10 }}
                      />
                    )
                  ))}
                </>
              )}
              
              <Brush 
                dataKey="date" 
                height={30} 
                stroke="#8884d8"
                tickFormatter={formatXAxis}
              />
            </ComposedChart>
          </ResponsiveContainer>
          
          {/* Volume bars */}
          {showVolume && (
            <div className="h-[100px] mt-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={combinedData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatXAxis} 
                    axisLine={false} 
                    tick={false}
                  />
                  <YAxis 
                    domain={[0, maxVolume]} 
                    tickFormatter={formatVolume}
                    tick={{ fontSize: 10 }}
                    orientation="right"
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatVolume(value), 'Volume']}
                    labelFormatter={(label) => `Date: ${new Date(label).toLocaleDateString()}`}
                  />
                  <Bar 
                    dataKey="volume"
                    name="Volume"
                    fill="#4b5563"
                    opacity={0.5}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CandlestickChart; 