import React, { useEffect, useState, useRef } from 'react';
import { ArrowUp, ArrowDown, AlertCircle, LineChart, Briefcase, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import TickerControls from './TickerControls';

interface DataItem {
  id: string;
  type: 'index' | 'stock' | 'currency' | 'news' | 'event';
  label: string;
  value?: string;
  change?: number;
  time?: string;
  priority?: 'normal' | 'high';
}

type TickerSpeed = 'slow' | 'normal' | 'fast';

const LiveDataTicker = () => {
  const [tickerData, setTickerData] = useState<DataItem[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState<TickerSpeed>('normal');
  const tickerRef = useRef<HTMLDivElement>(null);
  
  // Simulate fetching live data
  useEffect(() => {
    // Initial data
    const initialData: DataItem[] = [
      { id: 'idx1', type: 'index', label: 'S&P 500', value: '4,738.25', change: 0.32 },
      { id: 'idx2', type: 'index', label: 'NASDAQ', value: '16,682.93', change: 0.58 },
      { id: 'idx3', type: 'index', label: 'DOW', value: '38,239.77', change: -0.13 },
      { id: 'stk1', type: 'stock', label: 'AAPL', value: '$187.53', change: 1.23 },
      { id: 'stk2', type: 'stock', label: 'TSLA', value: '$235.45', change: -2.76 },
      { id: 'stk3', type: 'stock', label: 'MSFT', value: '$415.32', change: 0.89 },
      { id: 'cur1', type: 'currency', label: 'EUR/USD', value: '1.0832', change: -0.05 },
      { id: 'cur2', type: 'currency', label: 'BTC/USD', value: '$67,452', change: 2.41 },
      { id: 'nws1', type: 'news', label: 'BREAKING: Fed signals potential rate cut in September meeting', priority: 'high' },
      { id: 'nws2', type: 'news', label: 'Earnings: Amazon exceeds Q2 expectations with 15% YoY revenue growth' },
      { id: 'evt1', type: 'event', label: 'US Jobs Report', time: 'Tomorrow 8:30 AM ET' },
      { id: 'evt2', type: 'event', label: 'ECB Rate Decision', time: 'Thu 7:45 AM ET' },
    ];
    
    setTickerData(initialData);
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      setTickerData(prevData => 
        prevData.map(item => {
          if ((item.type === 'index' || item.type === 'stock' || item.type === 'currency') && item.change !== undefined) {
            // Randomly update some values to simulate live data
            if (Math.random() > 0.7) {
              const changeVariation = (Math.random() * 0.2) - 0.1; // -0.1 to +0.1
              const newChange = parseFloat((item.change + changeVariation).toFixed(2));
              
              // Update the value based on change
              const currentValue = parseFloat(item.value!.replace(/[$,]/g, ''));
              const multiplier = item.type === 'stock' ? 1 : (item.type === 'currency' ? 0.001 : 0.01);
              const newValueRaw = currentValue * (1 + (changeVariation * multiplier));
              
              // Format the value appropriately
              let newValue = '';
              if (item.type === 'stock') {
                newValue = `$${newValueRaw.toFixed(2)}`;
              } else if (item.type === 'currency' && item.label.includes('BTC')) {
                newValue = `$${Math.round(newValueRaw).toLocaleString()}`;
              } else if (item.type === 'currency') {
                newValue = newValueRaw.toFixed(4);
              } else {
                newValue = newValueRaw.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
              }
              
              return { ...item, change: newChange, value: newValue };
            }
          }
          return item;
        })
      );
    }, 3000);
    
    // Add new news items occasionally
    const newsInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newsItems: DataItem[] = [
          { id: `nws${Date.now()}1`, type: 'news', label: 'Tech sector rally continues as AI investments surge', priority: Math.random() > 0.8 ? 'high' : 'normal' },
          { id: `nws${Date.now()}2`, type: 'news', label: 'Oil prices stabilize following OPEC production announcement' },
          { id: `nws${Date.now()}3`, type: 'news', label: 'Retail sales data shows stronger than expected consumer spending' },
          { id: `nws${Date.now()}4`, type: 'news', label: 'Housing market cools as mortgage rates reach new highs', priority: Math.random() > 0.8 ? 'high' : 'normal' },
          { id: `nws${Date.now()}5`, type: 'news', label: 'Global supply chain issues show signs of improvement' },
        ];
        
        const randomNews = newsItems[Math.floor(Math.random() * newsItems.length)];
        
        setTickerData(prevData => {
          // Keep the array at a reasonable size
          const filteredData = prevData.filter(item => item.type !== 'news' || Math.random() > 0.3);
          return [...filteredData, randomNews];
        });
      }
    }, 10000);
    
    return () => {
      clearInterval(interval);
      clearInterval(newsInterval);
    };
  }, []);
  
  const getIconForItem = (item: DataItem) => {
    switch (item.type) {
      case 'index':
      case 'stock':
        return item.change && item.change > 0 
          ? <ArrowUp className="h-3 w-3 text-green-500" /> 
          : <ArrowDown className="h-3 w-3 text-red-500" />;
      case 'currency':
        return item.change && item.change > 0 
          ? <ArrowUp className="h-3 w-3 text-green-500" /> 
          : <ArrowDown className="h-3 w-3 text-red-500" />;
      case 'news':
        return <AlertCircle className="h-3 w-3 text-amber-500" />;
      case 'event':
        return <Clock className="h-3 w-3 text-blue-500" />;
      default:
        return <LineChart className="h-3 w-3" />;
    }
  };
  
  const renderTickerItem = (item: DataItem, key: string) => (
    <span 
      key={key}
      className={cn(
        "inline-flex items-center mx-4 text-sm",
        item.priority === 'high' && "font-medium"
      )}
    >
      <span className="mr-1.5">{getIconForItem(item)}</span>
      <span className="font-medium mr-1">{item.label}</span>
      
      {item.value && (
        <span>{item.value}</span>
      )}
      
      {item.change !== undefined && (
        <span 
          className={cn(
            "ml-1",
            item.change > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
          )}
        >
          {item.change > 0 ? '+' : ''}{item.change}%
        </span>
      )}
      
      {item.time && (
        <span className="ml-1 text-muted-foreground">({item.time})</span>
      )}
      
      <span className="mx-4 text-muted-foreground">•</span>
    </span>
  );

  const handlePlayPauseToggle = () => {
    setIsPaused(!isPaused);
  };

  const handleSpeedChange = (newSpeed: TickerSpeed) => {
    setSpeed(newSpeed);
  };

  // Calculate animation class based on current state
  const getAnimationClass = () => {
    if (isPaused) {
      return "animate-none";
    }
    
    switch (speed) {
      case 'slow':
        return "animate-marquee-slow";
      case 'fast':
        return "animate-marquee-fast";
      default:
        return "animate-marquee";
    }
  };
  
  return (
    <div className="w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-md overflow-hidden border-b border-border shadow-sm relative">
      <div className="ticker-wrapper relative h-9 overflow-hidden flex items-center">
        <div 
          ref={tickerRef}
          className={cn("ticker-track flex whitespace-nowrap py-1", getAnimationClass())}
          style={{ minWidth: '100%' }}
        >
          {tickerData.map((item) => renderTickerItem(item, item.id))}
          {/* Duplicate items for continuous loop */}
          {tickerData.map((item) => renderTickerItem(item, `${item.id}-dup1`))}
          {tickerData.map((item) => renderTickerItem(item, `${item.id}-dup2`))}
        </div>

        {/* Gradient fade effect on the right side */}
        <div className="absolute right-[70px] top-0 bottom-0 w-16 bg-gradient-to-r from-transparent to-background/50 dark:to-background/80 pointer-events-none"></div>

        {/* Controls */}
        <TickerControls 
          isPaused={isPaused}
          speed={speed}
          onPlayPauseToggle={handlePlayPauseToggle}
          onSpeedChange={handleSpeedChange}
        />
      </div>
    </div>
  );
};

export default LiveDataTicker; 