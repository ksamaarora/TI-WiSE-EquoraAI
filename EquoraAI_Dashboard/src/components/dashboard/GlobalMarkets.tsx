
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GlobalMarket } from '@/services/sentimentService';
import { formatPercent, getSentimentClass } from '@/utils/formatters';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingDown, TrendingUp } from 'lucide-react';

interface GlobalMarketsProps {
  markets: GlobalMarket[];
  loading?: boolean;
}

const GlobalMarkets: React.FC<GlobalMarketsProps> = ({ markets, loading = false }) => {
  if (loading) {
    return (
      <Card className="mt-6 glassmorphism">
        <CardHeader>
          <CardTitle className="text-xl font-medium">Global Markets</CardTitle>
        </CardHeader>
        <CardContent className="h-[350px]">
          <div className="w-full h-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-md" />
        </CardContent>
      </Card>
    );
  }

  // Transform data for the chart
  const chartData = markets.map(market => ({
    name: market.name,
    change: market.percentChange,
    color: market.percentChange >= 0 ? '#10b981' : '#ef4444',
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glassmorphism p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-medium">{data.name}</p>
          <p className={`${data.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {formatPercent(data.change)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="mt-6 shadow-sm hover:shadow-md transition-shadow duration-300 glassmorphism">
      <CardHeader>
        <CardTitle className="text-xl font-medium">Global Markets</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ccc" strokeOpacity={0.3} />
              <XAxis dataKey="name" />
              <YAxis 
                tickFormatter={(value) => `${value}%`}
                domain={['dataMin - 1', 'dataMax + 1']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="change" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          {markets.map((market, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/60 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700">
              <div>
                <div className="font-medium">{market.name}</div>
                <div className="text-sm text-muted-foreground">{market.index}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{market.value.toLocaleString()}</div>
                <div className={`text-sm flex items-center justify-end ${market.percentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {market.percentChange >= 0 ? (
                    <TrendingUp size={14} className="mr-1" />
                  ) : (
                    <TrendingDown size={14} className="mr-1" />
                  )}
                  {formatPercent(market.percentChange)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default GlobalMarkets;
