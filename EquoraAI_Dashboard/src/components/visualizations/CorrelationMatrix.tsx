import React, { useMemo, useState } from 'react';
import { useStockVisualization } from '@/services/visualizationService';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';

// Correlation matrix visualization
const CorrelationMatrix: React.FC = () => {
  const { correlationData, stockList } = useStockVisualization();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStock, setSelectedStock] = useState<string | null>(null);

  // Filter stocks based on search
  const filteredStocks = useMemo(() => {
    if (!searchQuery) return stockList;
    return stockList.filter(stock => 
      stock.ticker.toLowerCase().includes(searchQuery.toLowerCase()) || 
      stock.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [stockList, searchQuery]);

  // Get unique tickers from correlation data
  const uniqueTickers = useMemo(() => {
    const tickers = new Set<string>();
    correlationData.forEach(item => {
      tickers.add(item.stock1);
      tickers.add(item.stock2);
    });
    return Array.from(tickers).sort();
  }, [correlationData]);

  // Create the correlation matrix
  const correlationMatrix = useMemo(() => {
    // Only include filtered stocks or the selected stock's correlations
    const tickersToInclude = selectedStock 
      ? uniqueTickers.filter(t => t === selectedStock || 
          correlationData.some(c => 
            (c.stock1 === selectedStock && c.stock2 === t) || 
            (c.stock2 === selectedStock && c.stock1 === t)
          )
        )
      : filteredStocks.map(s => s.ticker);

    const matrix: Record<string, Record<string, number>> = {};
    
    // Initialize matrix with empty values
    tickersToInclude.forEach(ticker1 => {
      matrix[ticker1] = {};
      tickersToInclude.forEach(ticker2 => {
        matrix[ticker1][ticker2] = ticker1 === ticker2 ? 1.0 : 0;
      });
    });
    
    // Fill the matrix with correlation values
    correlationData.forEach(item => {
      if (tickersToInclude.includes(item.stock1) && tickersToInclude.includes(item.stock2)) {
        matrix[item.stock1][item.stock2] = item.correlation;
        matrix[item.stock2][item.stock1] = item.correlation; // Mirror value
      }
    });
    
    return {
      tickers: tickersToInclude,
      data: matrix
    };
  }, [correlationData, filteredStocks, selectedStock, uniqueTickers]);

  // Get color based on correlation value
  const getCorrelationColor = (value: number) => {
    // Strong positive correlation (deep blue)
    if (value >= 0.8) return 'bg-blue-800 text-white';
    if (value >= 0.6) return 'bg-blue-600 text-white';
    if (value >= 0.4) return 'bg-blue-400 text-white';
    if (value >= 0.2) return 'bg-blue-200 text-black';
    
    // Strong negative correlation (deep red)
    if (value <= -0.8) return 'bg-red-800 text-white';
    if (value <= -0.6) return 'bg-red-600 text-white';
    if (value <= -0.4) return 'bg-red-400 text-white';
    if (value <= -0.2) return 'bg-red-200 text-black';
    
    // Neutral (around zero)
    return 'bg-gray-200 text-black';
  };

  // Function to handle stock selection
  const handleStockClick = (ticker: string) => {
    if (selectedStock === ticker) {
      setSelectedStock(null); // Deselect if already selected
    } else {
      setSelectedStock(ticker);
    }
  };

  // Get stock name by ticker
  const getStockName = (ticker: string) => {
    const stock = stockList.find(s => s.ticker === ticker);
    return stock ? stock.name : ticker;
  };

  // Limit displayed stocks if too many
  const maxDisplayedStocks = 12;
  const shouldLimitDisplay = correlationMatrix.tickers.length > maxDisplayedStocks && !selectedStock;
  const displayedTickers = shouldLimitDisplay 
    ? correlationMatrix.tickers.slice(0, maxDisplayedStocks) 
    : correlationMatrix.tickers;

  return (
    <Card>
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold mb-3">Stock Correlation Matrix</h3>
        
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search stocks..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedStock(null); // Reset selection when searching
              }}
            />
          </div>
          
          {selectedStock && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedStock(null)}
            >
              Clear Selection
            </Button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 mt-3">
          {/* Legend */}
          <div className="flex items-center mr-4">
            <span className="text-xs mr-2">Correlation:</span>
            <div className="flex">
              <div className="w-5 h-5 bg-red-800 flex items-center justify-center text-white text-xs">-1</div>
              <div className="w-5 h-5 bg-red-600"></div>
              <div className="w-5 h-5 bg-red-400"></div>
              <div className="w-5 h-5 bg-red-200"></div>
              <div className="w-5 h-5 bg-gray-200"></div>
              <div className="w-5 h-5 bg-blue-200"></div>
              <div className="w-5 h-5 bg-blue-400"></div>
              <div className="w-5 h-5 bg-blue-600"></div>
              <div className="w-5 h-5 bg-blue-800 flex items-center justify-center text-white text-xs">+1</div>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground">
            {selectedStock 
              ? `Showing correlations for ${selectedStock}` 
              : `Displaying ${displayedTickers.length} of ${correlationMatrix.tickers.length} stocks`}
          </div>
        </div>
      </div>
      
      <CardContent className="p-4 overflow-x-auto">
        {correlationMatrix.tickers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No matching stocks found
          </div>
        ) : (
          <div className="min-w-max">
            <div className="grid grid-flow-col auto-cols-min">
              {/* Empty top-left cell */}
              <div className="w-16 h-16 flex items-end justify-center pb-2 font-medium">
                <span className="transform -rotate-45 origin-bottom-left text-xs text-muted-foreground">Stock</span>
              </div>
              
              {/* Column headers */}
              {displayedTickers.map(ticker => (
                <div 
                  key={`col-${ticker}`}
                  className={cn(
                    "w-14 h-16 flex items-end justify-center pb-1",
                    selectedStock === ticker && "bg-primary/10"
                  )}
                >
                  <button
                    className="transform -rotate-45 origin-bottom-left text-xs font-medium overflow-hidden truncate max-w-[70px]"
                    onClick={() => handleStockClick(ticker)}
                    title={getStockName(ticker)}
                  >
                    {ticker}
                  </button>
                </div>
              ))}
            </div>
            
            {/* Matrix rows */}
            {displayedTickers.map(ticker1 => (
              <div key={`row-${ticker1}`} className="grid grid-flow-col auto-cols-min">
                {/* Row header */}
                <div 
                  className={cn(
                    "w-16 h-14 flex items-center justify-start pl-1 font-medium text-xs",
                    selectedStock === ticker1 && "bg-primary/10"
                  )}
                >
                  <button
                    className="overflow-hidden truncate max-w-[60px]"
                    onClick={() => handleStockClick(ticker1)}
                    title={getStockName(ticker1)}
                  >
                    {ticker1}
                  </button>
                </div>
                
                {/* Correlation cells */}
                {displayedTickers.map(ticker2 => {
                  const value = correlationMatrix.data[ticker1][ticker2];
                  const isSelf = ticker1 === ticker2;
                  
                  return (
                    <div
                      key={`cell-${ticker1}-${ticker2}`}
                      className={cn(
                        "w-14 h-14 flex items-center justify-center text-sm",
                        getCorrelationColor(value),
                        (selectedStock === ticker1 || selectedStock === ticker2) && "border border-primary"
                      )}
                      title={`${ticker1} to ${ticker2}: ${value.toFixed(2)}`}
                    >
                      {isSelf ? '1.00' : value.toFixed(2)}
                    </div>
                  );
                })}
              </div>
            ))}
            
            {shouldLimitDisplay && (
              <div className="text-center mt-4 text-sm text-muted-foreground">
                Showing top {maxDisplayedStocks} stocks. Use search or select a stock to see more.
              </div>
            )}
          </div>
        )}
        
        {/* Selected stock details */}
        {selectedStock && (
          <div className="mt-8 border-t pt-4">
            <h4 className="font-medium mb-3">
              {selectedStock} Correlation Insights
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Highest correlations */}
              <div>
                <h5 className="text-sm font-medium mb-2">Highest Positive Correlations</h5>
                <div className="space-y-1.5">
                  {displayedTickers
                    .filter(ticker => ticker !== selectedStock)
                    .sort((a, b) => correlationMatrix.data[selectedStock][b] - correlationMatrix.data[selectedStock][a])
                    .slice(0, 5)
                    .map(ticker => (
                      <div key={`high-${ticker}`} className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <div 
                            className={cn(
                              "w-3 h-3 rounded-full mr-2",
                              getCorrelationColor(correlationMatrix.data[selectedStock][ticker])
                            )}
                          ></div>
                          <span>{ticker}</span>
                        </div>
                        <span className="font-medium">
                          {correlationMatrix.data[selectedStock][ticker].toFixed(2)}
                        </span>
                      </div>
                    ))
                  }
                </div>
              </div>
              
              {/* Lowest correlations */}
              <div>
                <h5 className="text-sm font-medium mb-2">Highest Negative Correlations</h5>
                <div className="space-y-1.5">
                  {displayedTickers
                    .filter(ticker => ticker !== selectedStock)
                    .sort((a, b) => correlationMatrix.data[selectedStock][a] - correlationMatrix.data[selectedStock][b])
                    .slice(0, 5)
                    .map(ticker => (
                      <div key={`low-${ticker}`} className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <div 
                            className={cn(
                              "w-3 h-3 rounded-full mr-2",
                              getCorrelationColor(correlationMatrix.data[selectedStock][ticker])
                            )}
                          ></div>
                          <span>{ticker}</span>
                        </div>
                        <span className="font-medium">
                          {correlationMatrix.data[selectedStock][ticker].toFixed(2)}
                        </span>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-xs text-muted-foreground">
              <p>
                Correlation coefficient ranges from -1 to +1. A value close to +1 indicates that the stocks tend to move in the same direction, 
                while a value close to -1 indicates they move in opposite directions. A value close to 0 indicates little correlation.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CorrelationMatrix; 