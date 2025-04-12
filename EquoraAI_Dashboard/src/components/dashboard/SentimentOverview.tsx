
import React from 'react';
import { SentimentData } from '@/services/sentimentService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  formatCurrency, 
  formatPercent, 
  formatCompactNumber, 
  getSentimentDescription, 
  getSentimentClass 
} from '@/utils/formatters';
import { ArrowDownRight, ArrowUpRight, TrendingDown, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface SentimentOverviewProps {
  data: SentimentData | null;
  loading?: boolean;
}

const SentimentOverview: React.FC<SentimentOverviewProps> = ({ data, loading = false }) => {
  if (loading || !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-white/80 dark:bg-black/40 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Calculate the sentiment progress value (from -1 to 1, converted to 0-100 scale)
  const sentimentProgress = ((data.overallSentiment + 1) / 2) * 100;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Overall Market Sentiment */}
      <Card className="shadow-sm hover:shadow-md transition-shadow duration-300 glassmorphism">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Market Sentiment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-xl font-semibold ${getSentimentClass(data.overallSentiment)}`}>
              {getSentimentDescription(data.overallSentiment)}
            </span>
            {data.overallSentiment > 0 ? (
              <ArrowUpRight className="text-green-500" size={20} />
            ) : (
              <ArrowDownRight className="text-red-500" size={20} />
            )}
          </div>
          
          <Progress
            value={sentimentProgress}
            className="h-2 mt-1"
          />
          
          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
            <span>Bearish</span>
            <span>Neutral</span>
            <span>Bullish</span>
          </div>
        </CardContent>
      </Card>
      
      {/* Market Index */}
      <Card className="shadow-sm hover:shadow-md transition-shadow duration-300 glassmorphism">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">{data.marketIndex}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-semibold">
              {formatCurrency(data.currentValue, 'USD').replace('$', '')}
            </span>
            <div className={`flex items-center ${data.percentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.percentChange >= 0 ? (
                <TrendingUp size={18} className="mr-1" />
              ) : (
                <TrendingDown size={18} className="mr-1" />
              )}
              <span className="font-medium">
                {formatPercent(data.percentChange)}
              </span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            Previous close: {formatCurrency(data.previousClose, 'USD')}
          </div>
        </CardContent>
      </Card>
      
      {/* Trading Volume */}
      <Card className="shadow-sm hover:shadow-md transition-shadow duration-300 glassmorphism">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Trading Volume</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">
            {formatCompactNumber(data.volume)}
          </div>
          <div className="text-sm text-muted-foreground">
            24h market activity
          </div>
        </CardContent>
      </Card>
      
      {/* News Sentiment */}
      <Card className="shadow-sm hover:shadow-md transition-shadow duration-300 glassmorphism">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">News Sentiment</CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            // Calculate average news sentiment
            const avgNewsSentiment = data.recentNews.reduce(
              (sum, news) => sum + news.sentiment, 
              0
            ) / data.recentNews.length;
            
            return (
              <>
                <div className={`text-xl font-semibold ${getSentimentClass(avgNewsSentiment)}`}>
                  {getSentimentDescription(avgNewsSentiment)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Based on {data.recentNews.length} recent stories
                </div>
              </>
            );
          })()}
        </CardContent>
      </Card>
    </div>
  );
};

export default SentimentOverview;
