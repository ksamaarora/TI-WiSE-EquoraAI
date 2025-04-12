import React from 'react';
import { useStockVisualization } from '@/services/visualizationService';
import { cn } from '@/lib/utils';

// Import recharts components
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList
} from 'recharts';

const StockComparison: React.FC = () => {
  const { 
    selectedStock, 
    comparisonStock,
    comparisonMetrics
  } = useStockVisualization();
  
  if (!selectedStock || !comparisonStock || comparisonMetrics.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No comparison data available</div>;
  }
  
  // Normalize metrics for radar chart (0-100 scale)
  const radarData = comparisonMetrics.map(metric => {
    // Find max value to scale both values to 0-100
    const maxValue = Math.max(metric.stock1Value, metric.stock2Value);
    
    return {
      metric: metric.metric,
      [selectedStock]: (metric.stock1Value / maxValue) * 100,
      [comparisonStock]: (metric.stock2Value / maxValue) * 100,
      // Keep original values for tooltips
      originalStock1: metric.stock1Value,
      originalStock2: metric.stock2Value
    };
  });
  
  // Prepare data for bar comparison
  const barData = comparisonMetrics.map(metric => ({
    name: metric.metric,
    description: metric.description,
    [selectedStock]: metric.stock1Value,
    [comparisonStock]: metric.stock2Value
  }));
  
  // Format tooltip for radar chart
  const formatRadarTooltip = (value: any, name: string, props: any) => {
    const metric = props.payload;
    if (name === selectedStock) {
      return metric.originalStock1.toFixed(2);
    } else {
      return metric.originalStock2.toFixed(2);
    }
  };
  
  return (
    <div className="space-y-8">
      {/* Radar chart comparison */}
      <div>
        <h3 className="text-lg font-medium mb-2">Performance Comparison</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Comparing {selectedStock} vs {comparisonStock} across key financial metrics
        </p>
        
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart outerRadius={150} data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis
                dataKey="metric"
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={false}
                axisLine={false}
                tickCount={4}
              />
              <Radar
                name={selectedStock}
                dataKey={selectedStock}
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.5}
              />
              <Radar
                name={comparisonStock}
                dataKey={comparisonStock}
                stroke="#f97316"
                fill="#f97316"
                fillOpacity={0.5}
              />
              <Tooltip formatter={formatRadarTooltip} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Metric-by-metric bar comparison */}
      <div>
        <h3 className="text-lg font-medium mb-2">Metric-by-Metric Comparison</h3>
        
        <div className="space-y-4">
          {comparisonMetrics.map((metric, index) => {
            const isBetter = (metric.metric === 'Debt to Equity')
              ? metric.stock1Value < metric.stock2Value 
              : metric.stock1Value > metric.stock2Value;
            
            const diff = (metric.metric === 'Debt to Equity')
              ? ((metric.stock2Value - metric.stock1Value) / metric.stock2Value) * 100
              : ((metric.stock1Value - metric.stock2Value) / metric.stock2Value) * 100;
            
            return (
              <div key={metric.metric} className="border rounded-md p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium">{metric.metric}</h4>
                    <p className="text-xs text-muted-foreground">{metric.description}</p>
                  </div>
                  <div className={cn(
                    "text-sm font-medium py-1 px-2 rounded-md",
                    isBetter ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800",
                    Math.abs(diff) < 5 && "bg-blue-100 text-blue-800"
                  )}>
                    {isBetter 
                      ? `${Math.abs(diff).toFixed(1)}% better` 
                      : `${Math.abs(diff).toFixed(1)}% worse`}
                    {Math.abs(diff) < 5 && " (comparable)"}
                  </div>
                </div>
                
                <div className="flex items-center w-full h-8 mt-2">
                  {/* First stock bar */}
                  <div className="flex items-center w-1/2 pr-2">
                    <div className="w-full bg-gray-100 rounded-full h-5 relative">
                      <div 
                        className="bg-blue-600 h-5 rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${Math.min(100, (metric.stock1Value / Math.max(metric.stock1Value, metric.stock2Value)) * 100)}%` }}
                      >
                        <span className="text-xs text-white font-medium">
                          {metric.stock1Value.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Stock names in middle */}
                  <div className="flex flex-col items-center text-xs mx-2">
                    <span className="font-medium text-blue-600">{selectedStock}</span>
                    <span className="text-gray-400">vs</span>
                    <span className="font-medium text-orange-600">{comparisonStock}</span>
                  </div>
                  
                  {/* Second stock bar */}
                  <div className="flex items-center w-1/2 pl-2">
                    <div className="w-full bg-gray-100 rounded-full h-5 relative">
                      <div 
                        className="bg-orange-600 h-5 rounded-full flex items-center justify-start pl-2"
                        style={{ width: `${Math.min(100, (metric.stock2Value / Math.max(metric.stock1Value, metric.stock2Value)) * 100)}%` }}
                      >
                        <span className="text-xs text-white font-medium">
                          {metric.stock2Value.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Bar chart view */}
      <div>
        <h3 className="text-lg font-medium mb-4">Side-by-Side Performance</h3>
        
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barData}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 100, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis type="number" />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={100}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value: any) => [value.toFixed(2), '']}
                labelFormatter={(label) => {
                  const item = barData.find(d => d.name === label);
                  return `${label}: ${item?.description}`;
                }}
              />
              <Legend />
              <Bar dataKey={selectedStock} fill="#3b82f6" name={selectedStock}>
                <LabelList dataKey={selectedStock} position="right" formatter={(v: any) => v.toFixed(1)} />
              </Bar>
              <Bar dataKey={comparisonStock} fill="#f97316" name={comparisonStock}>
                <LabelList dataKey={comparisonStock} position="right" formatter={(v: any) => v.toFixed(1)} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Summary */}
      <div className="mt-6 border-t pt-4">
        <h3 className="text-base font-medium mb-2">Key Takeaways</h3>
        
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>
            <span className="font-medium">{comparisonMetrics[0].stock1Value > comparisonMetrics[0].stock2Value ? selectedStock : comparisonStock}</span>
            &nbsp;has a better P/E ratio, indicating potentially higher valuation efficiency.
          </li>
          <li>
            <span className="font-medium">{comparisonMetrics[2].stock1Value > comparisonMetrics[2].stock2Value ? selectedStock : comparisonStock}</span>
            &nbsp;shows stronger profit margins.
          </li>
          <li>
            <span className="font-medium">{comparisonMetrics[4].stock1Value < comparisonMetrics[4].stock2Value ? selectedStock : comparisonStock}</span>
            &nbsp;has a lower debt-to-equity ratio, suggesting less financial risk.
          </li>
          <li>
            <span className="font-medium">{comparisonMetrics[6].stock1Value < comparisonMetrics[6].stock2Value ? selectedStock : comparisonStock}</span>
            &nbsp;has lower volatility (beta) compared to market swings.
          </li>
        </ul>
        
        <p className="mt-3 text-xs text-muted-foreground">
          Note: This is a simplified comparison based on key metrics. A comprehensive investment decision should consider additional factors such as business model, growth prospects, industry trends, and competitive landscape.
        </p>
      </div>
    </div>
  );
};

export default StockComparison; 