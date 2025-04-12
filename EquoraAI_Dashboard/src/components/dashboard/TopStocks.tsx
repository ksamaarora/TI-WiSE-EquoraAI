
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StockSentiment } from '@/services/sentimentService';
import { formatCurrency, formatPercent, getSentimentClass } from '@/utils/formatters';
import { TrendingDown, TrendingUp } from 'lucide-react';

interface TopStocksProps {
  stocks: StockSentiment[];
  loading?: boolean;
}

const TopStocks: React.FC<TopStocksProps> = ({ stocks, loading = false }) => {
  if (loading) {
    return (
      <Card className="mt-6 glassmorphism">
        <CardHeader>
          <CardTitle className="text-xl font-medium">Top Stocks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="p-4 rounded-lg bg-white/60 dark:bg-gray-800/60 flex items-center justify-between"
              >
                <div className="space-y-2">
                  <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort stocks by sentiment (most positive to most negative)
  const sortedStocks = [...stocks].sort((a, b) => b.sentiment - a.sentiment);
  
  return (
    <Card className="mt-6 shadow-sm hover:shadow-md transition-shadow duration-300 glassmorphism">
      <CardHeader>
        <CardTitle className="text-xl font-medium">Top Stocks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3">
          {sortedStocks.slice(0, 5).map((stock, index) => (
            <div 
              key={index}
              className="p-4 rounded-lg bg-white/60 dark:bg-gray-800/60 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-300 flex items-center justify-between border border-gray-100 dark:border-gray-700 hover:shadow-sm animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div>
                <div className="flex items-center">
                  <span className="font-semibold text-lg">{stock.symbol}</span>
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${getSentimentClass(stock.sentiment)}`}>
                    {stock.sentiment > 0.6 ? 'Strong Buy' : 
                      stock.sentiment > 0.2 ? 'Buy' : 
                      stock.sentiment > -0.2 ? 'Hold' : 
                      stock.sentiment > -0.6 ? 'Sell' : 'Strong Sell'
                    }
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">{stock.name}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{formatCurrency(stock.price, 'USD')}</div>
                <div className={`text-sm flex items-center justify-end ${stock.percentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stock.percentChange >= 0 ? (
                    <TrendingUp size={14} className="mr-1" />
                  ) : (
                    <TrendingDown size={14} className="mr-1" />
                  )}
                  {formatPercent(stock.percentChange)}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-center">
          <button className="text-primary hover:text-primary/80 transition-colors text-sm font-medium">
            View All Stocks
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TopStocks;
