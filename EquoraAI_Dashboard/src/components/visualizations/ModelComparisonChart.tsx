import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
  ComposedChart,
  Scatter,
  ReferenceArea,
  Label
} from 'recharts';
import { Button } from '@/components/ui/button';
import { PredictionPoint, ModelInsight } from '@/services/predictionService';
import { 
  Brain, 
  TrendingUp, 
  CircleAlert, 
  Info, 
  ArrowUp, 
  ArrowDown,
  BarChart3,
  ChevronRight,
  Activity,
  Eye
} from 'lucide-react';

interface ModelComparisonChartProps {
  historicalData: PredictionPoint[];
  predictions: PredictionPoint[];
  modelInsights: {
    arima: ModelInsight;
    lstm: ModelInsight;
  };
  loading?: boolean;
  ticker: string;
}

const ModelComparisonChart: React.FC<ModelComparisonChartProps> = ({
  historicalData,
  predictions,
  modelInsights,
  loading = false,
  ticker
}) => {
  // Combine historical and prediction data
  const combinedData = [...historicalData.slice(-30), ...predictions];
  
  // Helper to format currency values
  const formatCurrency = (value: number) => {
    if (!isFinite(value) || isNaN(value)) {
      return '$0.00';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };
  
  // Calculate which model performs better
  const betterModel = modelInsights.arima.accuracy > modelInsights.lstm.accuracy ? 'ARIMA' : 'LSTM';
  const accuracyDiff = Math.abs(modelInsights.arima.accuracy - modelInsights.lstm.accuracy).toFixed(2);
  
  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Determine if we're looking at a historical or prediction point
      const isPrediction = !payload[0]?.payload?.actual;
      
      return (
        <div className="bg-background border border-border p-4 rounded-md shadow-md max-w-sm">
          <div className="text-sm font-semibold mb-2">{label}</div>
          
          {!isPrediction && payload[0]?.payload?.actual && isFinite(payload[0].payload.actual) && (
            <div className="mb-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Actual:</span>
                <span className="font-medium">{formatCurrency(payload[0].payload.actual)}</span>
              </div>
            </div>
          )}
          
          {((payload[0]?.payload?.arimaPredict && isFinite(payload[0].payload.arimaPredict)) || isPrediction) && (
            <div className="mb-2">
              <div className="font-medium text-sm text-amber-600 dark:text-amber-400 mb-1">ARIMA Model</div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Prediction:</span>
                <span className="font-medium">{formatCurrency(payload[0]?.payload?.arimaPredict || 0)}</span>
              </div>
              {isPrediction && modelInsights.arima && (
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm text-muted-foreground">Confidence:</span>
                  <span className="font-medium">{modelInsights.arima.confidenceScore}%</span>
                </div>
              )}
            </div>
          )}
          
          {((payload[0]?.payload?.lstmPredict && isFinite(payload[0].payload.lstmPredict)) || isPrediction) && (
            <div className="mb-2">
              <div className="font-medium text-sm text-blue-600 dark:text-blue-400 mb-1">LSTM Model</div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Prediction:</span>
                <span className="font-medium">{formatCurrency(payload[0]?.payload?.lstmPredict || 0)}</span>
              </div>
              {isPrediction && modelInsights.lstm && (
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm text-muted-foreground">Confidence:</span>
                  <span className="font-medium">{modelInsights.lstm.confidenceScore}%</span>
                </div>
              )}
            </div>
          )}
          
          {payload[0]?.payload?.predicted && isFinite(payload[0].payload.predicted) && (
            <div className="pt-2 mt-2 border-t border-border">
              <div className="font-medium text-sm text-emerald-600 dark:text-emerald-400 mb-1">Ensemble Model</div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Prediction:</span>
                <span className="font-medium">{formatCurrency(payload[0].payload.predicted)}</span>
              </div>
              {payload[0]?.payload?.upper && isFinite(payload[0].payload.upper) && 
               payload[0]?.payload?.lower && isFinite(payload[0].payload.lower) && (
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm text-muted-foreground">Range:</span>
                  <span className="font-medium">
                    {formatCurrency(payload[0].payload.lower)} - {formatCurrency(payload[0].payload.upper)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
    return null;
  };
  
  // Get last historical and prediction points to calculate change
  const lastHistorical = historicalData[historicalData.length - 1];
  const lastPrediction = predictions[predictions.length - 1];
  const changePercent = lastHistorical && lastPrediction && lastHistorical.actual !== 0 && isFinite(lastHistorical.actual) && isFinite(lastPrediction.predicted!)
    ? ((lastPrediction.predicted! - lastHistorical.actual) / lastHistorical.actual) * 100
    : 0;
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-xl font-bold">{ticker} Price Prediction</CardTitle>
          <CardDescription className="flex items-center mt-1">
            <Brain className="h-4 w-4 mr-1" /> 
            ARIMA & LSTM ML models with {predictions.length}-day forecast
          </CardDescription>
        </div>
        <div className="flex items-center">
          <Badge className={`${changePercent >= 0 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'} py-1.5 px-2.5 text-xs font-medium flex items-center gap-1`}>
            {changePercent >= 0 ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
            {Math.abs(isFinite(changePercent) ? changePercent : 0).toFixed(2)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="w-full h-[400px]" />
        ) : (
          <div>
            <Tabs defaultValue="comparison">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="comparison" className="text-xs sm:text-sm">
                  <BarChart3 className="h-3.5 w-3.5 mr-1.5" /> Model Comparison
                </TabsTrigger>
                <TabsTrigger value="ensemble" className="text-xs sm:text-sm">
                  <Activity className="h-3.5 w-3.5 mr-1.5" /> Ensemble Forecast
                </TabsTrigger>
                <TabsTrigger value="performance" className="text-xs sm:text-sm">
                  <Eye className="h-3.5 w-3.5 mr-1.5" /> Model Performance
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="comparison">
                <div className="w-full h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={combinedData}
                      margin={{
                        top: 20,
                        right: 20,
                        left: 20,
                        bottom: 20,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.4} />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => {
                          return value.split('-').slice(1).join('/');
                        }}
                      />
                      <YAxis 
                        domain={['auto', 'auto']}
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => {
                          if (value >= 1000) {
                            return `$${Math.round(value / 10) / 100}K`;
                          }
                          return `$${value}`;
                        }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      
                      {/* Prediction divider */}
                      <ReferenceLine 
                        x={historicalData[historicalData.length - 1].date} 
                        stroke="#888" 
                        strokeDasharray="3 3"
                        label={{ value: "Now", position: "insideTopRight", fontSize: 12 }}
                      />
                      
                      {/* Actual historical line */}
                      <Line
                        type="monotone"
                        dataKey="actual"
                        stroke="var(--color-primary)"
                        strokeWidth={2.5}
                        dot={{ r: 2 }}
                        activeDot={{ r: 6 }}
                        name="Actual Price"
                      />
                      
                      {/* ARIMA line */}
                      <Line
                        type="monotone"
                        dataKey="arimaPredict"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ r: 2 }}
                        name="ARIMA Model"
                      />
                      
                      {/* LSTM line */}
                      <Line
                        type="monotone"
                        dataKey="lstmPredict"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        strokeDasharray="3 3"
                        dot={{ r: 2 }}
                        name="LSTM Model"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-4 flex flex-col md:flex-row gap-3 w-full">
                  <div className="basis-1/2 p-3 border rounded-lg">
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                      <h3 className="font-semibold">ARIMA Model</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {modelInsights.arima.strengths[0]}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Accuracy:</span>
                      <Badge variant="outline">{modelInsights.arima.accuracy}%</Badge>
                    </div>
                  </div>
                  
                  <div className="basis-1/2 p-3 border rounded-lg">
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                      <h3 className="font-semibold">LSTM Model</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {modelInsights.lstm.strengths[0]}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Accuracy:</span>
                      <Badge variant="outline">{modelInsights.lstm.accuracy}%</Badge>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="ensemble">
                <div className="w-full h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={combinedData}
                      margin={{
                        top: 20,
                        right: 20,
                        left: 20,
                        bottom: 20,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.4} />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => {
                          return value.split('-').slice(1).join('/');
                        }}
                      />
                      <YAxis 
                        domain={['auto', 'auto']}
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => {
                          if (value >= 1000) {
                            return `$${Math.round(value / 10) / 100}K`;
                          }
                          return `$${value}`;
                        }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      
                      {/* Prediction divider */}
                      <ReferenceLine 
                        x={historicalData[historicalData.length - 1].date} 
                        stroke="#888" 
                        strokeDasharray="3 3"
                        label={{ value: "Now", position: "insideTopRight", fontSize: 12 }}
                      />
                      
                      {/* Confidence interval as area */}
                      <Area
                        type="monotone"
                        dataKey="upper"
                        stroke="transparent"
                        fill="rgba(16, 185, 129, 0.1)"
                        name="Upper Bound"
                      />
                      <Area
                        type="monotone"
                        dataKey="lower"
                        stroke="transparent"
                        fill="rgba(16, 185, 129, 0.1)"
                        name="Lower Bound"
                        fillOpacity={1}
                      />
                      
                      {/* Actual historical line */}
                      <Line
                        type="monotone"
                        dataKey="actual"
                        stroke="var(--color-primary)"
                        strokeWidth={2.5}
                        dot={{ r: 2 }}
                        activeDot={{ r: 6 }}
                        name="Actual Price"
                      />
                      
                      {/* Ensemble prediction */}
                      <Line
                        type="monotone"
                        dataKey="predicted"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        dot={{ r: 3 }}
                        name="Ensemble Forecast"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 border rounded-lg">
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">30-Day Forecast</h3>
                    <div className="text-2xl font-bold">
                      {formatCurrency(lastPrediction?.predicted || 0)}
                    </div>
                    <div className={`text-sm flex items-center mt-1 ${changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {changePercent >= 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                      {Math.abs(isFinite(changePercent) ? changePercent : 0).toFixed(2)}% from current
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Forecast Range</h3>
                    <div className="text-base font-medium">
                      {formatCurrency(isFinite(lastPrediction?.lower!) ? lastPrediction?.lower! : 0)} - {formatCurrency(isFinite(lastPrediction?.upper!) ? lastPrediction?.upper! : 0)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Based on historic volatility
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Confidence</h3>
                    <div className="flex items-center">
                      <div className="h-2 flex-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${(modelInsights.arima.confidenceScore + modelInsights.lstm.confidenceScore) / 2}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 font-medium">{Math.round((modelInsights.arima.confidenceScore + modelInsights.lstm.confidenceScore) / 2)}%</span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Combined model confidence
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="performance">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-4 h-4 rounded-full bg-amber-500 mr-2"></div>
                      <h3 className="font-semibold text-lg">ARIMA Model</h3>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">Accuracy</div>
                        <div className="flex items-center">
                          <div className="h-2 flex-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-amber-500 rounded-full"
                              style={{ width: `${modelInsights.arima.accuracy}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 font-medium">{modelInsights.arima.accuracy}%</span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">MAPE (Error)</div>
                        <div className="flex items-center">
                          <div className="h-2 flex-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-amber-500 rounded-full"
                              style={{ width: `${modelInsights.arima.mape}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 font-medium">{modelInsights.arima.mape}%</span>
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <div className="text-sm font-medium mb-1">Strengths</div>
                        <ul className="text-sm space-y-1">
                          {modelInsights.arima.strengths.map((strength, i) => (
                            <li key={i} className="flex items-start">
                              <ChevronRight className="h-3.5 w-3.5 mt-0.5 text-amber-500 mr-1 shrink-0" />
                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium mb-1">Limitations</div>
                        <ul className="text-sm space-y-1">
                          {modelInsights.arima.weaknesses.map((weakness, i) => (
                            <li key={i} className="flex items-start">
                              <ChevronRight className="h-3.5 w-3.5 mt-0.5 text-amber-500 mr-1 shrink-0" />
                              <span>{weakness}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                      <h3 className="font-semibold text-lg">LSTM Model</h3>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">Accuracy</div>
                        <div className="flex items-center">
                          <div className="h-2 flex-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${modelInsights.lstm.accuracy}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 font-medium">{modelInsights.lstm.accuracy}%</span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">MAPE (Error)</div>
                        <div className="flex items-center">
                          <div className="h-2 flex-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${modelInsights.lstm.mape}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 font-medium">{modelInsights.lstm.mape}%</span>
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <div className="text-sm font-medium mb-1">Strengths</div>
                        <ul className="text-sm space-y-1">
                          {modelInsights.lstm.strengths.map((strength, i) => (
                            <li key={i} className="flex items-start">
                              <ChevronRight className="h-3.5 w-3.5 mt-0.5 text-blue-500 mr-1 shrink-0" />
                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium mb-1">Limitations</div>
                        <ul className="text-sm space-y-1">
                          {modelInsights.lstm.weaknesses.map((weakness, i) => (
                            <li key={i} className="flex items-start">
                              <ChevronRight className="h-3.5 w-3.5 mt-0.5 text-blue-500 mr-1 shrink-0" />
                              <span>{weakness}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <div className="w-4 h-4 rounded-full bg-emerald-500 mr-2"></div>
                    <h3 className="font-semibold">Performance Comparison</h3>
                  </div>
                  
                  <div className="mt-3 text-sm">
                    <div className="mb-2">
                      <p>
                        Our analysis shows that <span className="font-semibold">{betterModel}</span> performs better for {ticker} by {accuracyDiff}% based on backtest results.
                      </p>
                    </div>
                    
                    <div className="mb-2">
                      <p>
                        {betterModel === 'ARIMA' ? (
                          <span>ARIMA is more suitable due to the stock's clear trend patterns and lower volatility.</span>
                        ) : (
                          <span>LSTM is more suitable due to the stock's complex patterns and higher volatility.</span>
                        )}
                      </p>
                    </div>
                    
                    <div>
                      <p>
                        The ensemble model combines both approaches for more robust predictions with slightly higher accuracy.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ModelComparisonChart; 