import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ExternalLink, Newspaper, TrendingUp, TrendingDown, Filter, Search } from 'lucide-react';

// Import crypto service to get news data
import { CryptoNewsItem, useCrypto } from '@/services/cryptoService';

interface NewsyProps {
  maxItems?: number;
  defaultFilter?: string;
  showControls?: boolean;
  showTabs?: boolean;
  compact?: boolean;
}

const Newsy: React.FC<NewsyProps> = ({ 
  maxItems = 10, 
  defaultFilter = 'all',
  showControls = true,
  showTabs = true,
  compact = false
}) => {
  const { news } = useCrypto();
  const [filteredNews, setFilteredNews] = useState<CryptoNewsItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCoin, setSelectedCoin] = useState<string>('all');
  const [selectedSentiment, setSelectedSentiment] = useState<string>('all');

  // Format time ago function (reused from Cryptocurrency component)
  const timeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = Math.floor(seconds / 31536000);
  
    if (interval >= 1) {
      return `${interval} year${interval === 1 ? '' : 's'} ago`;
    }
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
      return `${interval} month${interval === 1 ? '' : 's'} ago`;
    }
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
      return `${interval} day${interval === 1 ? '' : 's'} ago`;
    }
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
      return `${interval} hour${interval === 1 ? '' : 's'} ago`;
    }
    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
      return `${interval} minute${interval === 1 ? '' : 's'} ago`;
    }
    return `${Math.floor(seconds)} second${Math.floor(seconds) === 1 ? '' : 's'} ago`;
  };

  // Get unique coins from all news items
  const getUniqueCoinOptions = () => {
    const coinsSet = new Set<string>();
    news.forEach(item => {
      item.coins.forEach(coin => {
        coinsSet.add(coin);
      });
    });
    return Array.from(coinsSet);
  };

  // Filter news based on active tab, search query, and selected filters
  useEffect(() => {
    let result = [...news];

    // Filter by tab
    if (activeTab === 'positive') {
      result = result.filter(item => item.sentiment === 'positive');
    } else if (activeTab === 'negative') {
      result = result.filter(item => item.sentiment === 'negative');
    } else if (activeTab === 'neutral') {
      result = result.filter(item => item.sentiment === 'neutral');
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.title.toLowerCase().includes(query) || 
        item.source.toLowerCase().includes(query)
      );
    }

    // Filter by selected coin
    if (selectedCoin !== 'all') {
      result = result.filter(item => item.coins.includes(selectedCoin));
    }

    // Filter by sentiment
    if (selectedSentiment !== 'all') {
      result = result.filter(item => item.sentiment === selectedSentiment);
    }

    // Limit number of items
    result = result.slice(0, maxItems);
    
    setFilteredNews(result);
  }, [news, activeTab, searchQuery, selectedCoin, selectedSentiment, maxItems]);

  return (
    <Card className={`${compact ? 'shadow-sm' : 'shadow-md'} transition-all duration-300 hover:shadow-lg`}>
      <CardHeader className={compact ? 'pb-2' : 'pb-4'}>
        <CardTitle className="flex items-center text-xl">
          <Newspaper className="mr-2" size={20} />
          <span>Crypto News Insights</span>
        </CardTitle>
        <CardDescription>Latest news and market impact</CardDescription>
      </CardHeader>

      {showControls && (
        <div className="px-4 sm:px-6 pb-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedCoin} onValueChange={setSelectedCoin}>
                <SelectTrigger className="w-full sm:w-[120px]">
                  <SelectValue placeholder="Coin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Coins</SelectItem>
                  {getUniqueCoinOptions().map(coin => (
                    <SelectItem key={coin} value={coin} className="capitalize">
                      {coin.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedSentiment} onValueChange={setSelectedSentiment}>
                <SelectTrigger className="w-full sm:w-[100px]">
                  <SelectValue placeholder="Sentiment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="negative">Negative</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {showTabs && (
        <div className="px-4 sm:px-6 pb-2">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="positive" className="text-green-600">Positive</TabsTrigger>
              <TabsTrigger value="negative" className="text-red-600">Negative</TabsTrigger>
              <TabsTrigger value="neutral" className="text-blue-600">Neutral</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}

      <CardContent className={`px-0 ${compact ? 'pt-2' : 'pt-4'}`}>
        <ScrollArea className={compact ? 'h-64 px-4' : 'h-96 px-4 sm:px-6'}>
          {filteredNews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No news articles found matching your criteria.</p>
            </div>
          ) : (
            <div className={`${compact ? 'space-y-2' : 'space-y-4'}`}>
              {filteredNews.map((item, index) => (
                <div 
                  key={item.id} 
                  className="border rounded-md p-3 hover:bg-muted/30 transition-colors duration-200"
                >
                  <div className="flex justify-between items-start">
                    <h3 className={`font-medium ${compact ? 'text-sm' : 'text-base'}`}>
                      {item.title}
                    </h3>
                    <Badge variant={
                      item.sentiment === 'positive' ? 'default' : 
                      item.sentiment === 'negative' ? 'destructive' : 'secondary'
                    } className="ml-2 shrink-0">
                      {item.sentiment}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center mt-2 text-sm text-muted-foreground">
                    <span>{item.source}</span>
                    <span className="text-xs">{timeAgo(item.publishedAt)}</span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1">
                    {item.coins.map(coin => (
                      <Badge 
                        key={coin} 
                        variant="outline" 
                        className="capitalize text-xs"
                        onClick={() => setSelectedCoin(coin)}
                      >
                        {coin.toUpperCase()}
                      </Badge>
                    ))}
                    {!compact && (
                      <Badge variant="outline" className="text-xs bg-muted/40 ml-auto">
                        Relevance: {Math.round(item.relevance * 100)}%
                      </Badge>
                    )}
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center text-xs">
                      {item.sentiment === 'positive' ? (
                        <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                      ) : item.sentiment === 'negative' ? (
                        <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                      ) : null}
                      <span className={
                        item.sentiment === 'positive' ? 'text-green-500' : 
                        item.sentiment === 'negative' ? 'text-red-500' : 
                        'text-blue-500'
                      }>
                        {item.sentiment === 'positive' ? 'Bullish impact' : 
                         item.sentiment === 'negative' ? 'Bearish impact' : 
                         'Neutral impact'}
                      </span>
                    </div>
                    <Button 
                      variant="link" 
                      className="px-0 h-auto text-xs flex items-center" 
                      onClick={() => window.open(item.url, '_blank')}
                    >
                      Read more <ExternalLink size={10} className="ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default Newsy; 