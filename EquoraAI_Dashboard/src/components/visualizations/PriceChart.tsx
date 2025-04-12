import React from 'react';
import { useStockVisualization } from '@/services/visualizationService';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
  ReferenceLine
} from 'recharts';

import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const PriceChart: React.FC = () => {
  const {
    selectedStock,
    comparisonStock,
    stockData,
    comparisonData,
    timeRange
  } = useStockVisualization();

  const [chartType, setChartType] = React.useState<'line' | 'area'>('line');

  // Format the tooltip display
  const formatTooltip = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

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

  // Calculate the percentage change for the first and last data points
  const calculatePerformance = (data: any[]) => {
    if (!data || data.length < 2) return 0;
    const firstPrice = data[0].close;
    const lastPrice = data[data.length - 1].close;
    return ((lastPrice - firstPrice) / firstPrice) * 100;
  };

  const mainPerformance = calculatePerformance(stockData);
  const comparisonPerformance = comparisonData ? calculatePerformance(comparisonData) : 0;

  // Prepare data for chart - we need to combine the main stock data and comparison data
  const combinedData = stockData.map((item, index) => {
    const result: any = {
      date: item.date,
      [selectedStock]: item.close
    };

    if (comparisonData && index < comparisonData.length) {
      result[comparisonStock as string] = comparisonData[index].close;
    }

    return result;
  });

  // Find min/max values for better chart scaling
  const allValues = [
    ...stockData.map(d => d.close),
    ...(comparisonData ? comparisonData.map(d => d.close) : [])
  ];
  const minValue = Math.min(...allValues) * 0.95;
  const maxValue = Math.max(...allValues) * 1.05;

  return (
    <Card className="overflow-hidden">
      <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold">
            Price History
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              {timeRange} days
            </span>
          </h3>
          <div className="flex items-center gap-4 mt-1">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
              <span className="text-sm font-medium">{selectedStock}</span>
              <span className={cn(
                "ml-2 text-xs",
                mainPerformance >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {mainPerformance >= 0 ? "+" : ""}{mainPerformance.toFixed(2)}%
              </span>
            </div>
            
            {comparisonStock && (
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-orange-500 mr-1"></div>
                <span className="text-sm font-medium">{comparisonStock}</span>
                <span className={cn(
                  "ml-2 text-xs",
                  comparisonPerformance >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {comparisonPerformance >= 0 ? "+" : ""}{comparisonPerformance.toFixed(2)}%
                </span>
              </div>
            )}
          </div>
        </div>
        
        <Tabs value={chartType} onValueChange={(value: string) => setChartType(value as 'line' | 'area')}>
          <TabsList className="grid grid-cols-2 w-[180px]">
            <TabsTrigger value="line">Line</TabsTrigger>
            <TabsTrigger value="area">Area</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <CardContent className="p-0">
        <div className="h-[400px] p-4">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={combinedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatXAxis} 
                  tick={{ fontSize: 12 }} 
                  minTickGap={20}
                />
                <YAxis 
                  domain={[minValue, maxValue]} 
                  tickFormatter={formatTooltip} 
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={formatTooltip}
                  labelFormatter={(label) => `Date: ${new Date(label).toLocaleDateString()}`}
                />
                <Legend />
                <ReferenceLine y={0} stroke="#666" />
                <Line
                  type="monotone"
                  dataKey={selectedStock}
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                  isAnimationActive={true}
                  animationDuration={1000}
                />
                {comparisonStock && (
                  <Line
                    type="monotone"
                    dataKey={comparisonStock}
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                    isAnimationActive={true}
                    animationDuration={1000}
                  />
                )}
                <Brush 
                  dataKey="date" 
                  height={30} 
                  stroke="#8884d8"
                  tickFormatter={formatXAxis}
                />
              </LineChart>
            ) : (
              <AreaChart data={combinedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorComparison" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatXAxis} 
                  tick={{ fontSize: 12 }}
                  minTickGap={20}
                />
                <YAxis 
                  domain={[minValue, maxValue]} 
                  tickFormatter={formatTooltip} 
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={formatTooltip}
                  labelFormatter={(label) => `Date: ${new Date(label).toLocaleDateString()}`}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey={selectedStock}
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorMain)"
                  isAnimationActive={true}
                  animationDuration={1000}
                />
                {comparisonStock && (
                  <Area
                    type="monotone"
                    dataKey={comparisonStock}
                    stroke="#f97316"
                    fillOpacity={1}
                    fill="url(#colorComparison)"
                    isAnimationActive={true}
                    animationDuration={1000}
                  />
                )}
                <Brush 
                  dataKey="date" 
                  height={30} 
                  stroke="#8884d8"
                  tickFormatter={formatXAxis}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceChart; 