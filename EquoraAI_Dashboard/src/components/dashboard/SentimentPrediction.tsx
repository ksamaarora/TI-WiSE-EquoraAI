
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CalendarDays, ArrowUp, ArrowDown, HelpCircle } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';

interface PredictionPoint {
  date: string;
  actual: number;
  predicted: number;
  lower: number;
  upper: number;
}

interface SentimentPredictionProps {
  historicalData: PredictionPoint[];
  predictions: PredictionPoint[];
  confidenceLevel: number;
  loading: boolean;
}

const SentimentPrediction: React.FC<SentimentPredictionProps> = ({ 
  historicalData, 
  predictions, 
  confidenceLevel,
  loading 
}) => {
  const combinedData = [...historicalData, ...predictions];
  
  // Determine if prediction is bullish or bearish
  const predictedTrend = predictions.length >= 2 ? 
    predictions[predictions.length-1].predicted > predictions[0].predicted : false;
  
  // Calculate average predicted change percentage
  const firstPrediction = predictions[0]?.predicted || 0;
  const lastPrediction = predictions[predictions.length-1]?.predicted || 0;
  const predictedChangePercent = ((lastPrediction - firstPrediction) / firstPrediction) * 100;
  
  const getDotColor = (isActual: boolean) => {
    return isActual ? "var(--color-primary)" : predictedTrend ? "#22c55e" : "#ef4444";
  };
  
  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const isActual = payload[0].payload.actual !== undefined;
      
      return (
        <div className="bg-background border border-border shadow-md p-3 rounded-md">
          <p className="font-medium">{label}</p>
          {isActual ? (
            <p className="text-sm">Actual: {payload[0].value.toFixed(2)}</p>
          ) : (
            <>
              <p className="text-sm">Predicted: {payload[0].value.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">
                Range: {payload[1].value.toFixed(2)} - {payload[2].value.toFixed(2)}
              </p>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Sentiment Prediction</CardTitle>
            <CardDescription className="flex items-center gap-1">
              <CalendarDays className="h-4 w-4" /> 5-Day Forecast
            </CardDescription>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>About Sentiment Prediction</DialogTitle>
                <DialogDescription>
                  This prediction uses machine learning to forecast market sentiment trends
                  based on historical patterns, news sentiment, and technical indicators.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 mt-2">
                <p className="text-sm">
                  <strong>Methodology:</strong> The prediction model is trained on historical market data, 
                  news sentiment analysis, and technical indicators using a combination of time-series 
                  forecasting and natural language processing techniques.
                </p>
                <p className="text-sm">
                  <strong>Confidence Level:</strong> {confidenceLevel}% - This represents the statistical 
                  confidence interval for the prediction range shown by the shaded area.
                </p>
                <p className="text-sm text-muted-foreground">
                  Note: These predictions are for informational purposes only and should not be 
                  considered as financial advice.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <div className="flex flex-col justify-center items-center p-3 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">Forecast Trend</span>
            <div className="flex items-center mt-1">
              {predictedTrend ? (
                <>
                  <ArrowUp className="h-5 w-5 text-green-500 mr-1" />
                  <span className="font-medium text-green-500">Bullish</span>
                </>
              ) : (
                <>
                  <ArrowDown className="h-5 w-5 text-red-500 mr-1" />
                  <span className="font-medium text-red-500">Bearish</span>
                </>
              )}
            </div>
          </div>
          <div className="flex flex-col justify-center items-center p-3 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">Predicted Change</span>
            <span className={`font-medium ${predictedChangePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {predictedChangePercent >= 0 ? '+' : ''}{predictedChangePercent.toFixed(2)}%
            </span>
          </div>
          <div className="flex flex-col justify-center items-center p-3 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">Confidence Level</span>
            <span className="font-medium">{confidenceLevel}%</span>
          </div>
        </div>
        
        {loading ? (
          <Skeleton className="w-full h-[300px]" />
        ) : (
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={combinedData}
                margin={{
                  top: 10,
                  right: 20,
                  left: 0,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.4} />
                <XAxis dataKey="date" />
                <YAxis domain={['dataMin - 0.1', 'dataMax + 0.1']} />
                <Tooltip content={customTooltip} />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-primary)", r: 4 }}
                  activeDot={{ r: 6 }}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke={predictedTrend ? "#22c55e" : "#ef4444"}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: predictedTrend ? "#22c55e" : "#ef4444", r: 4 }}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="upper"
                  stroke="transparent"
                  fill={predictedTrend ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)"}
                />
                <Line
                  type="monotone"
                  dataKey="lower"
                  stroke="transparent"
                  fill={predictedTrend ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)"}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        <div className="flex justify-center gap-6 mt-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <span className="text-xs text-muted-foreground">Historical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: predictedTrend ? "#22c55e" : "#ef4444" }}></div>
            <span className="text-xs text-muted-foreground">Predicted</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-3 rounded-full" style={{ background: predictedTrend ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)" }}></div>
            <span className="text-xs text-muted-foreground">Confidence Range</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SentimentPrediction;
