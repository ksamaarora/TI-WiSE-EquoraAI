
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TechnicalIndicators as TechnicalIndicatorsType } from '@/services/sentimentService';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

interface TechnicalIndicatorsProps {
  data: TechnicalIndicatorsType;
  currentValue: number;
  loading?: boolean;
}

const TechnicalIndicators: React.FC<TechnicalIndicatorsProps> = ({ 
  data, 
  currentValue,
  loading = false 
}) => {
  if (loading) {
    return (
      <Card className="mt-6 glassmorphism">
        <CardHeader>
          <CardTitle className="text-xl font-medium">Technical Indicators</CardTitle>
        </CardHeader>
        <CardContent className="animate-pulse">
          <div className="space-y-6">
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare RSI visualization
  const rsiValue = data.rsi;
  const rsiColor = rsiValue > 70 ? 'bg-red-500' : rsiValue < 30 ? 'bg-green-500' : 'bg-blue-500';
  
  // Prepare Bollinger Bands chart data
  const bollingerData = [
    { name: 'Current', upper: data.bollingerBands.upper, middle: data.bollingerBands.middle, lower: data.bollingerBands.lower },
    { name: 'Projection', upper: data.bollingerBands.upper * 1.005, middle: data.bollingerBands.middle * 1.002, lower: data.bollingerBands.lower * 0.998 }
  ];

  return (
    <Card className="mt-6 shadow-sm hover:shadow-md transition-shadow duration-300 glassmorphism">
      <CardHeader>
        <CardTitle className="text-xl font-medium">Technical Indicators</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* RSI and MACD Indicators */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">RSI</span>
                <span className={`text-sm font-medium ${
                  rsiValue > 70 ? 'text-red-500' : rsiValue < 30 ? 'text-green-500' : ''
                }`}>
                  {rsiValue.toFixed(1)}
                </span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${rsiColor}`} 
                  style={{ width: `${rsiValue}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Oversold</span>
                <span>Neutral</span>
                <span>Overbought</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">MACD</span>
                <span className={`text-sm font-medium ${
                  data.macd > 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {data.macd.toFixed(3)}
                </span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${data.macd > 0 ? 'bg-green-500' : 'bg-red-500'}`} 
                  style={{ 
                    width: `${Math.abs(data.macd) * 50 + 50}%`,
                    marginLeft: data.macd < 0 ? '0' : '50%',
                    transform: data.macd < 0 ? 'translateX(100%)' : 'translateX(-100%)'
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Bearish</span>
                <span>Neutral</span>
                <span>Bullish</span>
              </div>
            </div>
          </div>
          
          {/* Moving Averages */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Moving Averages</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">MA(50)</span>
                <span className={`text-sm font-medium ${
                  currentValue > data.movingAverages.ma50 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {data.movingAverages.ma50.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">MA(200)</span>
                <span className={`text-sm font-medium ${
                  currentValue > data.movingAverages.ma200 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {data.movingAverages.ma200.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Bollinger Bands Chart */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Bollinger Bands</h3>
            <div className="h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={bollingerData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ccc" strokeOpacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis 
                    domain={[
                      data.bollingerBands.lower * 0.995, 
                      data.bollingerBands.upper * 1.005
                    ]} 
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="upper" 
                    stroke="#ef4444" 
                    dot={false} 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="middle" 
                    stroke="#3b82f6" 
                    dot={false} 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="lower" 
                    stroke="#10b981" 
                    dot={false} 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex justify-between text-xs mt-1">
              <span className="text-green-500">Lower: {data.bollingerBands.lower.toFixed(2)}</span>
              <span className="text-blue-500">Middle: {data.bollingerBands.middle.toFixed(2)}</span>
              <span className="text-red-500">Upper: {data.bollingerBands.upper.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TechnicalIndicators;
