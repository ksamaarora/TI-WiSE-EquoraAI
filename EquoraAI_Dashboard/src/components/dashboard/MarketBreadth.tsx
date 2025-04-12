
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MarketBreadth as MarketBreadthType } from '@/services/sentimentService';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface MarketBreadthProps {
  data: MarketBreadthType;
  loading?: boolean;
}

const MarketBreadth: React.FC<MarketBreadthProps> = ({ data, loading = false }) => {
  // Prepare chart data
  const chartData = [
    { name: 'Advancers', value: data?.advancers || 0, color: '#10b981' },
    { name: 'Decliners', value: data?.decliners || 0, color: '#ef4444' },
    { name: 'Unchanged', value: data?.unchanged || 0, color: '#6b7280' },
  ];
  
  const highsLowsData = [
    { name: 'New Highs', value: data?.newHighs || 0, color: '#22c55e' },
    { name: 'New Lows', value: data?.newLows || 0, color: '#f43f5e' },
  ];

  if (loading) {
    return (
      <Card className="mt-6 glassmorphism">
        <CardHeader>
          <CardTitle className="text-xl font-medium">Market Breadth</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <div className="w-full h-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-md" />
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glassmorphism p-2 rounded shadow-md border border-gray-200 dark:border-gray-700">
          <p className="font-medium">{`${payload[0].name}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="mt-6 shadow-sm hover:shadow-md transition-shadow duration-300 glassmorphism">
      <CardHeader>
        <CardTitle className="text-xl font-medium">Market Breadth</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Pie
                data={highsLowsData}
                cx="50%"
                cy="50%"
                innerRadius={85}
                outerRadius={95}
                paddingAngle={2}
                dataKey="value"
              >
                {highsLowsData.map((entry, index) => (
                  <Cell key={`cell-hl-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="p-3 rounded-lg bg-white/80 dark:bg-gray-800/80 text-center">
            <div className="text-lg font-semibold">{data.advancers + data.decliners + data.unchanged}</div>
            <div className="text-sm text-muted-foreground">Total Issues</div>
          </div>
          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-center">
            <div className="text-lg font-semibold text-green-600 dark:text-green-400">{data.advancers}</div>
            <div className="text-sm text-muted-foreground">Advancers</div>
          </div>
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-center">
            <div className="text-lg font-semibold text-red-600 dark:text-red-400">{data.decliners}</div>
            <div className="text-sm text-muted-foreground">Decliners</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketBreadth;
