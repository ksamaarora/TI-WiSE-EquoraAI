
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ChartContainer, 
  ChartLegendContent 
} from "@/components/ui/chart";
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Badge } from "@/components/ui/badge";

interface StockCluster {
  symbol: string;
  name: string;
  volatility: number;
  momentum: number;
  marketCap: number;
  cluster: 'highGrowth' | 'value' | 'cyclical' | 'defensive';
}

interface ClusterAnalysisProps {
  stocks: StockCluster[];
  loading: boolean;
}

const ClusterAnalysis: React.FC<ClusterAnalysisProps> = ({ stocks, loading }) => {
  const chartConfig = {
    highGrowth: { color: "#3b82f6", label: "High Growth" },
    value: { color: "#ef4444", label: "Value" },
    cyclical: { color: "#f97316", label: "Cyclical" },
    defensive: { color: "#22c55e", label: "Defensive" },
  };
  
  const clusters = Object.keys(chartConfig).map(key => ({
    name: key,
    color: chartConfig[key as keyof typeof chartConfig].color,
    label: chartConfig[key as keyof typeof chartConfig].label,
    count: stocks.filter(stock => stock.cluster === key).length
  }));
  
  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border shadow-md p-3 rounded-md text-sm">
          <p className="font-medium">{payload[0].payload.name} ({payload[0].payload.symbol})</p>
          <p>Volatility: {payload[0].payload.volatility.toFixed(2)}</p>
          <p>Momentum: {payload[0].payload.momentum.toFixed(2)}</p>
          <p className="mt-1">
            <Badge 
              variant="outline" 
              style={{ 
                backgroundColor: chartConfig[payload[0].payload.cluster].color + '20',
                color: chartConfig[payload[0].payload.cluster].color,
                borderColor: chartConfig[payload[0].payload.cluster].color + '40'
              }}
            >
              {chartConfig[payload[0].payload.cluster].label}
            </Badge>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock Cluster Analysis</CardTitle>
        <CardDescription>
          Machine learning clustering by volatility and momentum factors
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {clusters.map(cluster => (
            <Badge 
              key={cluster.name}
              variant="outline" 
              className="flex items-center gap-1.5 px-2 py-1"
              style={{ 
                backgroundColor: cluster.color + '20',
                color: cluster.color,
                borderColor: cluster.color + '40'
              }}
            >
              <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: cluster.color }}></span>
              {cluster.label}: {cluster.count}
            </Badge>
          ))}
        </div>
        
        {loading ? (
          <div className="w-full aspect-[4/3]">
            <Skeleton className="w-full h-full" />
          </div>
        ) : (
          <ChartContainer 
            config={chartConfig} 
            className="w-full aspect-[4/3]"
          >
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                type="number" 
                dataKey="volatility"
                name="Volatility" 
                label={{ value: 'Volatility', position: 'insideBottom', offset: -10 }}
                domain={[0, 'dataMax + 0.2']}
              />
              <YAxis 
                type="number" 
                dataKey="momentum" 
                name="Momentum" 
                label={{ value: 'Momentum', angle: -90, position: 'insideLeft' }}
                domain={[-1, 1]}
              />
              <ZAxis 
                type="number" 
                dataKey="marketCap" 
                range={[50, 400]} 
                name="Market Cap" 
              />
              <Tooltip content={customTooltip} />
              
              {/* Create a scatter plot for each cluster type */}
              {(Object.keys(chartConfig) as Array<keyof typeof chartConfig>).map(clusterKey => (
                <Scatter 
                  key={clusterKey}
                  name={chartConfig[clusterKey].label} 
                  data={stocks.filter(stock => stock.cluster === clusterKey)} 
                  fill={chartConfig[clusterKey].color}
                />
              ))}
            </ScatterChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default ClusterAnalysis;
