
import React, { useEffect, useState } from 'react';
import { 
  Area, 
  AreaChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendPoint } from '@/services/sentimentService';
import { formatDate, getSentimentColor, getSentimentDescription } from '@/utils/formatters';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SentimentChartProps {
  data: TrendPoint[];
  loading?: boolean;
}

// Custom tooltip component for the sentiment chart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const sentiment = payload[0].payload.sentiment;
    const indexValue = payload[1].payload.indexValue;
    const date = payload[0].payload.timestamp;
    
    return (
      <div className="glassmorphism p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-medium">{formatDate(date)}</p>
        <p className="text-sm mt-1">
          <span className="font-medium">Market: </span>
          {indexValue.toFixed(2)}
        </p>
        <p className="text-sm">
          <span className="font-medium">Sentiment: </span>
          <span style={{ color: getSentimentColor(sentiment) }}>
            {getSentimentDescription(sentiment)}
          </span>
        </p>
      </div>
    );
  }

  return null;
};

const SentimentChart: React.FC<SentimentChartProps> = ({ data, loading = false }) => {
  const [timeframe, setTimeframe] = useState('24h');
  const [chartData, setChartData] = useState<TrendPoint[]>([]);
  
  useEffect(() => {
    if (!data.length) return;
    
    // Process data based on selected timeframe
    let filteredData: TrendPoint[];
    const now = new Date();
    
    switch (timeframe) {
      case '1h':
        // Last hour (get last 6 points)
        filteredData = data.slice(-6);
        break;
      case '4h':
        // Last 4 hours (get last 12 points)
        filteredData = data.slice(-12);
        break;
      case '12h':
        // Last 12 hours (get last 12 points)
        filteredData = data.slice(-18);
        break;
      case '24h':
      default:
        // Full 24 hours
        filteredData = data;
        break;
    }
    
    setChartData(filteredData);
  }, [data, timeframe]);
  
  if (loading) {
    return (
      <Card className="mt-6 glassmorphism">
        <CardHeader>
          <CardTitle className="text-xl font-medium">Sentiment Trend</CardTitle>
        </CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center">
          <div className="w-full h-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-md relative overflow-hidden">
            <div className="absolute inset-0 chart-loading-shimmer" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="mt-6 shadow-sm hover:shadow-md transition-shadow duration-300 glassmorphism">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-medium">Sentiment Trend</CardTitle>
        <Tabs defaultValue={timeframe} onValueChange={setTimeframe}>
          <TabsList>
            <TabsTrigger value="1h">1H</TabsTrigger>
            <TabsTrigger value="4h">4H</TabsTrigger>
            <TabsTrigger value="12h">12H</TabsTrigger>
            <TabsTrigger value="24h">24H</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
          >
            <defs>
              <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4ade80" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="indexGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="timestamp" 
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
              }}
              tick={{ fontSize: 12 }}
              tickMargin={10}
            />
            <YAxis 
              yAxisId="left"
              orientation="left"
              domain={[-1, 1]}
              tickCount={5}
              tickFormatter={(value) => value.toFixed(1)}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              domain={['dataMin - 100', 'dataMax + 100']}
              tickCount={5}
              tickFormatter={(value) => value.toFixed(0)}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="sentiment"
              stroke="#4ade80"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#sentimentGradient)"
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="indexValue"
              stroke="#60a5fa"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#indexGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default SentimentChart;
