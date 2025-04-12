import { visualizationService } from './visualizationService';
import { StockDataPoint } from './visualizationService';

// Types for prediction models
export interface PredictionModel {
  name: string;
  description: string;
  accuracy: number;
  timespan: string;
}

export interface PredictionPoint {
  date: string;
  actual: number;
  predicted?: number;
  arimaPredict?: number;
  lstmPredict?: number;
  lower?: number;
  upper?: number;
}

export interface ModelInsight {
  model: string;
  accuracy: number;
  mape: number; // Mean Absolute Percentage Error
  rmse: number; // Root Mean Square Error
  strengths: string[];
  weaknesses: string[];
  bestFor: string;
  confidenceScore: number;
}

export interface PredictionResult {
  ticker: string;
  historicalData: PredictionPoint[];
  predictions: PredictionPoint[];
  insights: {
    trend: 'up' | 'down' | 'neutral';
    confidence: number;
    changePercent: number;
    volatility: number;
    support: number;
    resistance: number;
    rsi: number;
    macd: { signal: number; histogram: number };
    nextKeyDate: string;
    anomalies: {
      type: string;
      date: string;
      severity: 'low' | 'medium' | 'high';
      description: string;
    }[];
  };
  modelInsights: {
    arima: ModelInsight;
    lstm: ModelInsight;
  };
}

// Simulated ARIMA model function
const simulateARIMA = (historicalData: number[], periods: number): number[] => {
  // Simple ARIMA(1,1,1) model simulation
  const ar_param = 0.7; // Autoregressive parameter
  const ma_param = 0.3; // Moving average parameter
  
  // Take first difference to make series stationary
  const diff = [];
  for (let i = 1; i < historicalData.length; i++) {
    diff.push(historicalData[i] - historicalData[i-1]);
  }
  
  // Generate predictions
  const predictions = [];
  let lastValue = historicalData[historicalData.length - 1];
  let lastDiff = diff[diff.length - 1];
  let lastError = 0;
  
  for (let i = 0; i < periods; i++) {
    // AR component + MA component + small random error
    const error = (Math.random() - 0.5) * 0.02 * lastValue;
    const nextDiff = ar_param * lastDiff + ma_param * lastError + error;
    const nextValue = lastValue + nextDiff;
    
    predictions.push(nextValue);
    
    lastValue = nextValue;
    lastDiff = nextDiff;
    lastError = error;
  }
  
  return predictions;
};

// Simulated LSTM model function
const simulateLSTM = (historicalData: number[], periods: number): number[] => {
  // LSTM tends to detect longer patterns and non-linear relationships
  const predictions = [];
  let lastValue = historicalData[historicalData.length - 1];
  
  // Calculate trend by looking at multiple timeframes
  const shortTrend = (historicalData.slice(-5).reduce((sum, val) => sum + val, 0) / 5) / 
                     (historicalData.slice(-10, -5).reduce((sum, val) => sum + val, 0) / 5) - 1;
                     
  const longTrend = (historicalData.slice(-20).reduce((sum, val) => sum + val, 0) / 20) / 
                    (historicalData.slice(-40, -20).reduce((sum, val) => sum + val, 0) / 20) - 1;
  
  // LSTM can detect cycles
  const cycle = Math.sin(Math.PI * historicalData.length / 30) * 0.01;
  
  // Recent volatility 
  const volatility = historicalData.slice(-10).map((val, i, arr) => 
    i > 0 ? Math.abs(val - arr[i-1]) / arr[i-1] : 0
  ).reduce((sum, val) => sum + val, 0) / 9;
  
  for (let i = 0; i < periods; i++) {
    // LSTM model combines short and long-term trends with cyclical patterns
    // Short-term trend has more weight initially, long-term trend dominates later
    const shortWeight = Math.max(0, 1 - (i * 0.1));
    const longWeight = Math.min(1, 0.2 + (i * 0.1));
    
    const trendEffect = (shortTrend * shortWeight + longTrend * longWeight) * lastValue;
    const cycleEffect = cycle * lastValue * (1 + i * 0.2);
    const randomEffect = (Math.random() - 0.5) * volatility * lastValue * (1 + i * 0.1);
    
    // Calculate next value
    const nextValue = lastValue * (1 + trendEffect + cycleEffect) + randomEffect;
    predictions.push(nextValue);
    
    lastValue = nextValue;
  }
  
  return predictions;
};

// Helper to calculate confidence interval
const calculateConfidenceInterval = (predictions: number[], volatility: number, forecastHorizon: number): { lower: number[], upper: number[] } => {
  const lower = [];
  const upper = [];
  
  for (let i = 0; i < predictions.length; i++) {
    // Uncertainty grows with the forecast horizon
    const uncertainty = volatility * Math.sqrt(1 + i * 0.5);
    const value = predictions[i];
    
    lower.push(value * (1 - uncertainty));
    upper.push(value * (1 + uncertainty));
  }
  
  return { lower, upper };
};

// Calculate technical indicators with validation
const calculateIndicators = (data: number[]): { rsi: number, macd: { signal: number, histogram: number }, support: number, resistance: number } => {
  // Simplified RSI calculation with validation
  const gains = [];
  const losses = [];
  
  for (let i = 1; i < data.length; i++) {
    if (isFinite(data[i]) && isFinite(data[i-1])) {
      const change = data[i] - data[i-1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }
  }
  
  // Ensure we have enough data points
  if (gains.length < 14) {
    return {
      rsi: 50,
      macd: { signal: 0, histogram: 0 },
      support: data[0] * 0.95,
      resistance: data[0] * 1.05
    };
  }
  
  const avgGain = gains.slice(-14).reduce((sum, val) => sum + val, 0) / 14;
  const avgLoss = losses.slice(-14).reduce((sum, val) => sum + val, 0) / 14;
  
  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss; // Avoid division by zero
  const rsi = 100 - (100 / (1 + rs));
  
  // Simplified MACD calculation with validation
  const validData = data.filter(value => isFinite(value));
  if (validData.length < 26) {
    return {
      rsi: isFinite(rsi) ? rsi : 50,
      macd: { signal: 0, histogram: 0 },
      support: data[0] * 0.95,
      resistance: data[0] * 1.05
    };
  }
  
  const ema12 = validData.slice(-12).reduce((sum, val) => sum + val, 0) / 12;
  const ema26 = validData.slice(-26).reduce((sum, val) => sum + val, 0) / 26;
  const macdLine = ema12 - ema26;
  const signalLine = validData.length >= 9 ? 
    (macdLine + validData.slice(-9).reduce((sum, val) => sum + val, 0) / 9) / 2 : 
    macdLine;
  
  // Find support and resistance with validation
  const recentData = validData.slice(-30);
  if (recentData.length < 5) {
    return {
      rsi: isFinite(rsi) ? rsi : 50,
      macd: { 
        signal: isFinite(signalLine) ? signalLine : 0, 
        histogram: isFinite(macdLine - signalLine) ? macdLine - signalLine : 0 
      },
      support: validData[0] * 0.95,
      resistance: validData[0] * 1.05
    };
  }
  
  const sorted = [...recentData].sort((a, b) => a - b);
  const support = sorted[Math.floor(sorted.length * 0.2)] || sorted[0];
  const resistance = sorted[Math.floor(sorted.length * 0.8)] || sorted[sorted.length - 1];
  
  return {
    rsi: isFinite(rsi) ? rsi : 50,
    macd: { 
      signal: isFinite(signalLine) ? signalLine : 0, 
      histogram: isFinite(macdLine - signalLine) ? macdLine - signalLine : 0 
    },
    support: isFinite(support) ? support : validData[0] * 0.95,
    resistance: isFinite(resistance) ? resistance : validData[0] * 1.05
  };
};

// Calculate model accuracy metrics
const calculateModelAccuracy = (actual: number[], predicted: number[]): { accuracy: number, mape: number, rmse: number } => {
  let sumAbsPercError = 0;
  let sumSquaredError = 0;
  let validComparisons = 0;
  
  const compareLength = Math.min(actual.length, predicted.length);
  
  for (let i = 0; i < compareLength; i++) {
    if (actual[i] === 0 || !isFinite(actual[i]) || !isFinite(predicted[i])) {
      continue; // Skip division by zero or invalid values
    }
    
    const absPercError = Math.abs((actual[i] - predicted[i]) / actual[i]);
    sumAbsPercError += isFinite(absPercError) ? absPercError : 0;
    
    const squaredError = Math.pow(actual[i] - predicted[i], 2);
    sumSquaredError += isFinite(squaredError) ? squaredError : 0;
    
    validComparisons++;
  }
  
  // Prevent division by zero if no valid comparisons
  if (validComparisons === 0) {
    return { accuracy: 80, mape: 20, rmse: 5 }; // Default values
  }
  
  const mape = (sumAbsPercError / validComparisons) * 100;
  const rmse = Math.sqrt(sumSquaredError / validComparisons);
  const accuracy = 100 - Math.min(mape, 99); // Cap at 99% to prevent 100% accuracy claims
  
  return { 
    accuracy: isFinite(accuracy) ? parseFloat(accuracy.toFixed(2)) : 80,
    mape: isFinite(mape) ? parseFloat(mape.toFixed(2)) : 20,
    rmse: isFinite(rmse) ? parseFloat(rmse.toFixed(2)) : 5
  };
};

// Main prediction function
export const generateStockPrediction = (ticker: string, days: number = 90, forecastDays: number = 30): PredictionResult => {
  // Get historical data
  const stockData = visualizationService.getStockData(ticker, days);
  const closePrices = stockData.map(point => point.close);
  const dates = stockData.map(point => point.date);
  
  // Calculate volatility
  const dailyReturns = [];
  for (let i = 1; i < closePrices.length; i++) {
    if (closePrices[i-1] !== 0 && isFinite(closePrices[i-1]) && isFinite(closePrices[i])) {
      dailyReturns.push((closePrices[i] - closePrices[i-1]) / closePrices[i-1]);
    }
  }
  
  // Avoid division by zero if no valid returns
  const volatility = dailyReturns.length > 0 
    ? Math.sqrt(dailyReturns.reduce((sum, val) => sum + Math.pow(val, 2), 0) / dailyReturns.length) * Math.sqrt(252)
    : 0.2; // Default to 20% volatility if calculation fails
  
  // Generate predictions using both models
  const arimaForecasts = simulateARIMA(closePrices, forecastDays);
  const lstmForecasts = simulateLSTM(closePrices, forecastDays);
  
  // Calculate confidence intervals
  const arimaConfidence = calculateConfidenceInterval(arimaForecasts, volatility, forecastDays);
  const lstmConfidence = calculateConfidenceInterval(lstmForecasts, volatility, forecastDays);
  
  // Create combined forecasts (average of both models)
  const combinedForecasts = arimaForecasts.map((val, i) => (val + lstmForecasts[i]) / 2);
  const combinedConfidence = calculateConfidenceInterval(combinedForecasts, volatility * 0.9, forecastDays); // Slightly lower volatility for combined model
  
  // Calculate technical indicators with validation
  const indicators = calculateIndicators(closePrices);
  
  // Create historical data points
  const historicalData: PredictionPoint[] = stockData.map((point, i) => ({
    date: point.date,
    actual: point.close,
    // For the last 10 points, add "predictions" to visualize how the models would have done
    arimaPredict: i >= stockData.length - 10 ? closePrices[i] * (1 + (Math.random() * 0.02 - 0.01)) : undefined,
    lstmPredict: i >= stockData.length - 10 ? closePrices[i] * (1 + (Math.random() * 0.018 - 0.009)) : undefined,
  }));
  
  // Generate future dates
  const lastDate = new Date(dates[dates.length - 1]);
  const futureDates = [];
  
  for (let i = 1; i <= forecastDays; i++) {
    const date = new Date(lastDate);
    date.setDate(date.getDate() + i);
    // Skip weekends
    if (date.getDay() === 0) date.setDate(date.getDate() + 1);
    if (date.getDay() === 6) date.setDate(date.getDate() + 2);
    futureDates.push(date.toISOString().split('T')[0]);
  }
  
  // Create prediction data points
  const predictions: PredictionPoint[] = futureDates.map((date, i) => ({
    date,
    actual: 0, // No actual data for future
    predicted: combinedForecasts[i],
    arimaPredict: arimaForecasts[i],
    lstmPredict: lstmForecasts[i],
    lower: combinedConfidence.lower[i],
    upper: combinedConfidence.upper[i],
  }));
  
  // Calculate model accuracy metrics (using historical data)
  // For simulation, we'll backtest on the last 20 days
  const testActual = closePrices.slice(-20);
  
  // Simulate what models would have predicted 20 days ago
  const backTestPeriod = 20;
  const backTestData = closePrices.slice(0, -backTestPeriod);
  const arimaBacktest = simulateARIMA(backTestData, backTestPeriod);
  const lstmBacktest = simulateLSTM(backTestData, backTestPeriod);
  
  const arimaAccuracy = calculateModelAccuracy(testActual, arimaBacktest);
  const lstmAccuracy = calculateModelAccuracy(testActual, lstmBacktest);
  
  // Determine trend with validation
  const lastClose = closePrices[closePrices.length - 1] || 0;
  const finalPrediction = combinedForecasts[combinedForecasts.length - 1] || 0;
  const changePercent = lastClose > 0 
    ? ((finalPrediction - lastClose) / lastClose) * 100
    : 0;
  
  // Generate insights with validated values
  const insights = {
    trend: changePercent > 1 ? 'up' : changePercent < -1 ? 'down' : 'neutral' as 'up' | 'down' | 'neutral',
    confidence: 85 - (Math.abs(changePercent) > 10 ? 15 : Math.abs(changePercent)),
    changePercent: isFinite(changePercent) ? parseFloat(changePercent.toFixed(2)) : 0,
    volatility: isFinite(volatility) ? parseFloat((volatility * 100).toFixed(2)) : 20,
    support: isFinite(indicators.support) ? parseFloat(indicators.support.toFixed(2)) : parseFloat((lastClose * 0.95).toFixed(2)),
    resistance: isFinite(indicators.resistance) ? parseFloat(indicators.resistance.toFixed(2)) : parseFloat((lastClose * 1.05).toFixed(2)),
    rsi: isFinite(indicators.rsi) ? parseFloat(indicators.rsi.toFixed(2)) : 50,
    macd: {
      signal: isFinite(indicators.macd.signal) ? parseFloat(indicators.macd.signal.toFixed(4)) : 0,
      histogram: isFinite(indicators.macd.histogram) ? parseFloat(indicators.macd.histogram.toFixed(4)) : 0
    },
    nextKeyDate: futureDates[Math.floor(Math.random() * 5) + 5], // Random important date in the near future
    anomalies: []
  };
  
  // Detect anomalies
  if (Math.abs(changePercent) > 15) {
    insights.anomalies.push({
      type: 'Large Price Movement',
      date: futureDates[forecastDays - 1],
      severity: 'high',
      description: `Potential ${changePercent > 0 ? 'surge' : 'drop'} of ${Math.abs(changePercent).toFixed(1)}% predicted`
    });
  }
  
  if (indicators.rsi > 70) {
    insights.anomalies.push({
      type: 'Overbought',
      date: dates[dates.length - 1],
      severity: 'medium',
      description: 'RSI indicates stock may be overbought'
    });
  } else if (indicators.rsi < 30) {
    insights.anomalies.push({
      type: 'Oversold',
      date: dates[dates.length - 1],
      severity: 'medium',
      description: 'RSI indicates stock may be oversold'
    });
  }
  
  // Model insights
  const modelInsights = {
    arima: {
      model: 'ARIMA',
      accuracy: parseFloat(arimaAccuracy.accuracy.toFixed(2)),
      mape: parseFloat(arimaAccuracy.mape.toFixed(2)),
      rmse: parseFloat(arimaAccuracy.rmse.toFixed(2)),
      strengths: [
        'Handles linear time series well',
        'Good for short-term forecasts',
        'Models trend and seasonality'
      ],
      weaknesses: [
        'Limited with non-linear patterns',
        'Less accurate for longer horizons',
        'Assumes stationary data'
      ],
      bestFor: 'Short-term price movements and market regimes with clear trends',
      confidenceScore: parseFloat((85 - (Math.random() * 10)).toFixed(1))
    },
    lstm: {
      model: 'LSTM Neural Network',
      accuracy: parseFloat(lstmAccuracy.accuracy.toFixed(2)),
      mape: parseFloat(lstmAccuracy.mape.toFixed(2)),
      rmse: parseFloat(lstmAccuracy.rmse.toFixed(2)),
      strengths: [
        'Captures complex non-linear patterns',
        'Identifies long-term dependencies',
        'Adapts to changing market conditions'
      ],
      weaknesses: [
        'Requires more data to train effectively',
        'Can overfit in volatile markets',
        'Less interpretable than statistical models'
      ],
      bestFor: 'Complex market behaviors and longer-term forecasts with multiple variables',
      confidenceScore: parseFloat((90 - (Math.random() * 10)).toFixed(1))
    }
  };
  
  return {
    ticker,
    historicalData,
    predictions,
    insights,
    modelInsights
  };
};

// Prediction service class
class PredictionService {
  private predictions = new Map<string, PredictionResult>();
  private models: PredictionModel[] = [
    {
      name: 'ARIMA',
      description: 'AutoRegressive Integrated Moving Average model for time series forecasting',
      accuracy: 78.5,
      timespan: 'Short-term (1-7 days)'
    },
    {
      name: 'LSTM',
      description: 'Long Short-Term Memory neural network for complex pattern recognition',
      accuracy: 81.2,
      timespan: 'Medium-term (1-30 days)'
    },
    {
      name: 'Combined Ensemble',
      description: 'Weighted ensemble of multiple models for balanced predictions',
      accuracy: 83.7,
      timespan: 'Short to medium-term (1-21 days)'
    }
  ];
  
  // Get stock prediction data
  getPrediction(ticker: string, days: number = 90, forecastDays: number = 30): PredictionResult {
    const cacheKey = `${ticker}-${days}-${forecastDays}`;
    
    if (!this.predictions.has(cacheKey)) {
      const prediction = generateStockPrediction(ticker, days, forecastDays);
      this.predictions.set(cacheKey, prediction);
    }
    
    return this.predictions.get(cacheKey)!;
  }
  
  // Get available prediction models
  getModels(): PredictionModel[] {
    return [...this.models];
  }
  
  // Clear cache for a ticker
  clearCache(ticker?: string) {
    if (ticker) {
      for (const key of this.predictions.keys()) {
        if (key.startsWith(ticker)) {
          this.predictions.delete(key);
        }
      }
    } else {
      this.predictions.clear();
    }
  }
}

// Create singleton instance
export const predictionService = new PredictionService(); 